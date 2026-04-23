package com.foodapp.service;

import com.foodapp.dto.request.AddCartItemRequest;
import com.foodapp.dto.request.MergeCartRequest;
import com.foodapp.dto.request.UpdateCartItemRequest;
import com.foodapp.dto.response.CartItemResponse;
import com.foodapp.dto.response.CartResponse;
import com.foodapp.exception.ResourceNotFoundException;
import com.foodapp.exception.UnauthorizedException;
import com.foodapp.exception.ValidationException;
import com.foodapp.model.Cart;
import com.foodapp.model.CartItem;
import com.foodapp.model.Favorite;
import com.foodapp.model.MenuItem;
import com.foodapp.model.User;
import com.foodapp.repository.CartItemRepository;
import com.foodapp.repository.CartRepository;
import com.foodapp.repository.FavoriteRepository;
import com.foodapp.repository.MenuItemRepository;
import com.foodapp.repository.UserRepository;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final MenuItemRepository menuItemRepository;
    private final FavoriteRepository favoriteRepository;
    private final UserRepository userRepository;

    @Transactional
    public CartResponse getCart(String userEmail) {
        User user = getUserByEmail(userEmail);
        Cart cart = getOrCreateCart(user);
        return mapToResponse(cart);
    }

    @Transactional
    public CartResponse addItem(String userEmail, AddCartItemRequest request) {
        User user = getUserByEmail(userEmail);
        Cart cart = getOrCreateCart(user);

        MenuItem menuItem = menuItemRepository.findById(request.getMenuItemId())
            .orElseThrow(() -> new ResourceNotFoundException("Menu item not found with id: " + request.getMenuItemId()));

        if (!menuItem.isAvailable()) {
            throw new ValidationException("Menu item is currently unavailable: " + menuItem.getName());
        }

        validateRestaurantConsistency(cart, menuItem);

        CartItem cartItem = cartItemRepository.findByCartIdAndMenuItemId(cart.getId(), menuItem.getId())
            .orElseGet(() -> {
                CartItem newItem = new CartItem();
                newItem.setCart(cart);
                newItem.setMenuItem(menuItem);
                newItem.setQuantity(0);
                newItem.setPrice(menuItem.getPrice());
                return newItem;
            });

        int quantityToAdd = request.getQuantity() == null ? 1 : request.getQuantity();
        cartItem.setQuantity(cartItem.getQuantity() + quantityToAdd);
        cartItem.setPrice(menuItem.getPrice());
        cartItemRepository.save(cartItem);

        return mapToResponse(cartRepository.findById(cart.getId()).orElse(cart));
    }

    @Transactional
    public CartResponse updateQuantity(String userEmail, Long cartItemId, UpdateCartItemRequest request) {
        User user = getUserByEmail(userEmail);
        Cart cart = getOrCreateCart(user);

        CartItem item = cartItemRepository.findById(cartItemId)
            .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with id: " + cartItemId));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new UnauthorizedException("You are not allowed to modify this cart item");
        }

        if (!item.getMenuItem().isAvailable()) {
            throw new ValidationException("Menu item is currently unavailable: " + item.getMenuItem().getName());
        }

        item.setQuantity(request.getQuantity());
        cartItemRepository.save(item);

        return mapToResponse(cartRepository.findById(cart.getId()).orElse(cart));
    }

    @Transactional
    public CartResponse removeItem(String userEmail, Long cartItemId) {
        User user = getUserByEmail(userEmail);
        Cart cart = getOrCreateCart(user);

        CartItem item = cartItemRepository.findById(cartItemId)
            .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with id: " + cartItemId));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new UnauthorizedException("You are not allowed to modify this cart item");
        }

        cartItemRepository.delete(item);
        return mapToResponse(cartRepository.findById(cart.getId()).orElse(cart));
    }

    @Transactional
    public void clearCart(String userEmail) {
        User user = getUserByEmail(userEmail);
        Cart cart = getOrCreateCart(user);
        cart.getItems().clear();
        cartRepository.save(cart);
    }

    @Transactional
    public CartResponse mergeGuestCart(String userEmail, MergeCartRequest request) {
        User user = getUserByEmail(userEmail);
        Cart cart = getOrCreateCart(user);

        for (MergeCartRequest.GuestCartItemRequest guestItem : request.getItems()) {
            MenuItem menuItem = menuItemRepository.findById(guestItem.getMenuItemId())
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found with id: " + guestItem.getMenuItemId()));

            if (!menuItem.isAvailable()) {
                continue;
            }

            validateRestaurantConsistency(cart, menuItem);

            CartItem cartItem = cartItemRepository.findByCartIdAndMenuItemId(cart.getId(), menuItem.getId())
                .orElseGet(() -> {
                    CartItem newItem = new CartItem();
                    newItem.setCart(cart);
                    newItem.setMenuItem(menuItem);
                    newItem.setQuantity(0);
                    newItem.setPrice(menuItem.getPrice());
                    return newItem;
                });

            cartItem.setQuantity(cartItem.getQuantity() + guestItem.getQuantity());
            cartItem.setPrice(menuItem.getPrice());
            cartItemRepository.save(cartItem);
        }

        return mapToResponse(cartRepository.findById(cart.getId()).orElse(cart));
    }

    @Transactional
    public CartResponse populateFromFavorite(String userEmail, Long favoriteId) {
        User user = getUserByEmail(userEmail);
        Cart cart = getOrCreateCart(user);

        Favorite favorite = favoriteRepository.findByIdAndUser(favoriteId, user)
            .orElseThrow(() -> new ResourceNotFoundException("Favorite not found with id: " + favoriteId));

        List<MenuItem> menuItems = menuItemRepository.findByIdInAndRestaurantId(
            favorite.getMenuItemIds(),
            favorite.getRestaurant().getId());

        if (menuItems.size() != favorite.getMenuItemIds().size()) {
            throw new ValidationException("One or more favorite items are no longer available");
        }

        cart.getItems().clear();

        Map<Long, Integer> quantityByItem = new LinkedHashMap<>();
        for (Long menuItemId : favorite.getMenuItemIds()) {
            quantityByItem.merge(menuItemId, 1, Integer::sum);
        }

        for (MenuItem menuItem : menuItems) {
            if (!menuItem.isAvailable()) {
                throw new ValidationException("Menu item is currently unavailable: " + menuItem.getName());
            }

            CartItem cartItem = new CartItem();
            cartItem.setCart(cart);
            cartItem.setMenuItem(menuItem);
            cartItem.setQuantity(quantityByItem.getOrDefault(menuItem.getId(), 1));
            cartItem.setPrice(menuItem.getPrice());
            cart.getItems().add(cartItem);
        }

        cartRepository.save(cart);
        return mapToResponse(cartRepository.findById(cart.getId()).orElse(cart));
    }

    private void validateRestaurantConsistency(Cart cart, MenuItem menuItem) {
        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            return;
        }

        Long incomingRestaurantId = menuItem.getRestaurant().getId();
        boolean hasDifferentRestaurant = cart.getItems().stream()
            .map(item -> item.getMenuItem().getRestaurant().getId())
            .anyMatch(id -> !id.equals(incomingRestaurantId));

        if (hasDifferentRestaurant) {
            throw new ValidationException("Cart contains items from another restaurant. Clear cart before adding this item.");
        }
    }

    private Cart getOrCreateCart(User user) {
        return cartRepository.findByUser(user)
            .orElseGet(() -> {
                Cart newCart = new Cart();
                newCart.setUser(user);
                newCart.setItems(new ArrayList<>());
                return cartRepository.save(newCart);
            });
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new UnauthorizedException("User not found"));
    }

    private CartResponse mapToResponse(Cart cart) {
        List<CartItemResponse> items = cart.getItems() == null
            ? List.of()
            : cart.getItems().stream()
                .map(item -> {
                    BigDecimal lineTotal = item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
                    return new CartItemResponse(
                        item.getId(),
                        item.getMenuItem().getId(),
                        item.getMenuItem().getName(),
                        item.getMenuItem().getRestaurant().getId(),
                        item.getMenuItem().getRestaurant().getName(),
                        item.getQuantity(),
                        item.getPrice(),
                        lineTotal,
                        item.getMenuItem().isAvailable());
                })
                .toList();

        BigDecimal totalAmount = items.stream()
            .map(CartItemResponse::getLineTotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        int totalItems = items.stream().mapToInt(CartItemResponse::getQuantity).sum();

        return new CartResponse(cart.getId(), items, totalAmount, totalItems, cart.getUpdatedAt());
    }
}
