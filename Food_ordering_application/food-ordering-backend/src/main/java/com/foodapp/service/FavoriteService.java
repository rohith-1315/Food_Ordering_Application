package com.foodapp.service;

import com.foodapp.dto.request.FavoriteCreateRequest;
import com.foodapp.dto.response.FavoriteResponse;
import com.foodapp.exception.ResourceNotFoundException;
import com.foodapp.exception.UnauthorizedException;
import com.foodapp.exception.ValidationException;
import com.foodapp.model.Favorite;
import com.foodapp.model.MenuItem;
import com.foodapp.model.Restaurant;
import com.foodapp.model.User;
import com.foodapp.repository.FavoriteRepository;
import com.foodapp.repository.MenuItemRepository;
import com.foodapp.repository.RestaurantRepository;
import com.foodapp.repository.UserRepository;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final UserRepository userRepository;
    private final RestaurantRepository restaurantRepository;
    private final MenuItemRepository menuItemRepository;

    @Transactional
    public FavoriteResponse saveFavorite(String userEmail, FavoriteCreateRequest request) {
        User user = getUserByEmail(userEmail);

        Restaurant restaurant = restaurantRepository.findById(request.getRestaurantId())
            .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found with id: " + request.getRestaurantId()));

        Set<Long> uniqueMenuItemIds = new HashSet<>(request.getMenuItemIds());
        List<MenuItem> menuItems = menuItemRepository.findByIdInAndRestaurantId(new ArrayList<>(uniqueMenuItemIds), restaurant.getId());
        if (menuItems.size() != uniqueMenuItemIds.size()) {
            throw new ValidationException("Favorite items must belong to the selected restaurant");
        }

        Favorite favorite = new Favorite();
        favorite.setUser(user);
        favorite.setRestaurant(restaurant);
        favorite.setLabel(request.getLabel().trim());
        favorite.setMenuItemIds(request.getMenuItemIds());

        return mapToResponse(favoriteRepository.save(favorite));
    }

    @Transactional(readOnly = true)
    public List<FavoriteResponse> getMyFavorites(String userEmail) {
        User user = getUserByEmail(userEmail);
        return favoriteRepository.findByUserOrderByCreatedAtDesc(user).stream()
            .map(this::mapToResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public Favorite getFavoriteForUser(String userEmail, Long favoriteId) {
        User user = getUserByEmail(userEmail);
        return favoriteRepository.findByIdAndUser(favoriteId, user)
            .orElseThrow(() -> new ResourceNotFoundException("Favorite not found with id: " + favoriteId));
    }

    private FavoriteResponse mapToResponse(Favorite favorite) {
        return new FavoriteResponse(
            favorite.getId(),
            favorite.getRestaurant().getId(),
            favorite.getRestaurant().getName(),
            favorite.getLabel(),
            favorite.getMenuItemIds(),
            favorite.getCreatedAt());
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new UnauthorizedException("User not found"));
    }
}
