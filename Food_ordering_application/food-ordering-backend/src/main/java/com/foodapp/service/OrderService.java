package com.foodapp.service;

import com.foodapp.dto.request.PlaceOrderRequest;
import com.foodapp.dto.response.ApiResponse;
import com.foodapp.dto.response.CouponValidationResponse;
import com.foodapp.dto.response.OrderResponse;
import com.foodapp.dto.response.OrderStatusResponse;
import com.foodapp.exception.ResourceNotFoundException;
import com.foodapp.exception.UnauthorizedException;
import com.foodapp.exception.ValidationException;
import com.foodapp.model.MenuItem;
import com.foodapp.model.Order;
import com.foodapp.model.OrderItem;
import com.foodapp.model.OrderStatusHistory;
import com.foodapp.model.Restaurant;
import com.foodapp.model.User;
import com.foodapp.model.enums.OrderStatus;
import com.foodapp.repository.MenuItemRepository;
import com.foodapp.repository.OrderRepository;
import com.foodapp.repository.OrderStatusHistoryRepository;
import com.foodapp.repository.RestaurantRepository;
import com.foodapp.repository.UserRepository;
import java.math.BigDecimal;
import java.time.Clock;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final RestaurantRepository restaurantRepository;
    private final MenuItemRepository menuItemRepository;
    private final CouponService couponService;
    private final OrderStatusHistoryRepository orderStatusHistoryRepository;
    private final EmailService emailService;
    private final Clock clock;

    @Transactional
    public ApiResponse<OrderResponse> placeOrder(PlaceOrderRequest request, String userEmail) {
        User user = getUserByEmail(userEmail);

        Restaurant restaurant = restaurantRepository.findById(request.getRestaurantId())
            .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found with id: " + request.getRestaurantId()));

        Order order = new Order();
        order.setUser(user);
        order.setRestaurant(restaurant);
        order.setStatus(OrderStatus.PENDING);
        order.setEstimatedDeliveryTime(LocalDateTime.now(clock).plusMinutes(45));
        order.setDiscountAmount(BigDecimal.ZERO);

        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;

        for (PlaceOrderRequest.OrderItemRequest itemRequest : request.getItems()) {
            MenuItem menuItem = menuItemRepository.findById(itemRequest.getMenuItemId())
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found with id: " + itemRequest.getMenuItemId()));

            if (!menuItem.getRestaurant().getId().equals(restaurant.getId())) {
                throw new ValidationException("Menu item " + menuItem.getId() + " does not belong to restaurant " + restaurant.getId());
            }

            if (!menuItem.isAvailable()) {
                throw new ValidationException("Menu item is currently unavailable: " + menuItem.getName());
            }

            BigDecimal lineTotal = menuItem.getPrice().multiply(BigDecimal.valueOf(itemRequest.getQuantity()));
            totalAmount = totalAmount.add(lineTotal);

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setMenuItem(menuItem);
            orderItem.setQuantity(itemRequest.getQuantity());
            orderItem.setPrice(menuItem.getPrice());
            orderItems.add(orderItem);
        }

        if (request.getCouponCode() != null && !request.getCouponCode().isBlank()) {
            CouponValidationResponse couponResult = couponService.validateCoupon(
                request.getCouponCode(),
                totalAmount,
                restaurant.getId());

            order.setCouponCode(request.getCouponCode().trim().toUpperCase());
            order.setDiscountAmount(couponResult.getDiscount());
            totalAmount = couponResult.getFinalAmount();
        }

        order.setTotalAmount(totalAmount);
        order.setOrderItems(orderItems);

        Order savedOrder = orderRepository.save(order);
        appendStatusHistory(savedOrder, OrderStatus.PENDING);

        if (savedOrder.getCouponCode() != null) {
            couponService.markCouponUsed(savedOrder.getCouponCode());
        }

        long currentOrderCount = restaurant.getOrderCount() == null ? 0L : restaurant.getOrderCount();
        restaurant.setOrderCount(currentOrderCount + 1);
        restaurantRepository.save(restaurant);

        emailService.sendOrderConfirmationEmail(user.getEmail(), user.getName(), savedOrder.getId(), savedOrder.getTotalAmount());
        log.info("[Order] Order {} placed by {}", savedOrder.getId(), user.getEmail());

        return ApiResponse.success(mapToOrderResponse(savedOrder));
    }

    @Transactional
    public ApiResponse<OrderResponse> cancelOrder(Long orderId, String userEmail) {
        User user = getUserByEmail(userEmail);

        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        validateOrderOwnership(order, user);

        if (order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.CONFIRMED) {
            throw new ValidationException("Only PENDING or CONFIRMED orders can be cancelled");
        }

        order.setStatus(OrderStatus.CANCELLED);
        Order savedOrder = orderRepository.save(order);
        appendStatusHistory(savedOrder, OrderStatus.CANCELLED);

        emailService.sendCancellationEmail(user.getEmail(), user.getName(), savedOrder.getId());
        log.info("[Order] Order {} cancelled by {}", savedOrder.getId(), user.getEmail());

        return new ApiResponse<>(true, "Order cancelled successfully", mapToOrderResponse(savedOrder));
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getUserOrders(String userEmail) {
        User user = getUserByEmail(userEmail);

        return orderRepository.findByUserOrderByCreatedAtDesc(user).stream()
            .map(this::mapToOrderResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long id, String userEmail) {
        User user = getUserByEmail(userEmail);

        Order order = orderRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));

        validateOrderOwnership(order, user);
        return mapToOrderResponse(order);
    }

    @Transactional(readOnly = true)
    public OrderStatusResponse getOrderStatus(Long orderId, String userEmail, boolean includeTimeline) {
        User user = getUserByEmail(userEmail);

        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        validateOrderOwnership(order, user);

        List<OrderStatusResponse.TimelineEntry> timeline = List.of();
        if (includeTimeline) {
            List<OrderStatusHistory> history = orderStatusHistoryRepository.findByOrderOrderByChangedAtAsc(order);
            if (history.isEmpty()) {
                timeline = List.of(new OrderStatusResponse.TimelineEntry(
                    order.getStatus().name(),
                    order.getUpdatedAt() == null ? order.getCreatedAt() : order.getUpdatedAt()));
            } else {
                timeline = history.stream()
                    .map(entry -> new OrderStatusResponse.TimelineEntry(entry.getStatus().name(), entry.getChangedAt()))
                    .toList();
            }
        }

        return new OrderStatusResponse(
            order.getId(),
            order.getStatus().name(),
            timeline,
            getEstimatedDeliveryTime(order));
    }

    private void appendStatusHistory(Order order, OrderStatus status) {
        OrderStatusHistory entry = new OrderStatusHistory();
        entry.setOrder(order);
        entry.setStatus(status);
        orderStatusHistoryRepository.save(entry);
    }

    private LocalDateTime getEstimatedDeliveryTime(Order order) {
        if (order.getEstimatedDeliveryTime() != null) {
            return order.getEstimatedDeliveryTime();
        }

        if (order.getCreatedAt() != null) {
            return order.getCreatedAt().plusMinutes(45);
        }

        return LocalDateTime.now(clock).plusMinutes(45);
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new UnauthorizedException("User not found"));
    }

    private void validateOrderOwnership(Order order, User user) {
        if (!order.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException("You are not authorized to access this order");
        }
    }

    private OrderResponse mapToOrderResponse(Order order) {
        List<OrderResponse.OrderItemDetail> itemDetails = order.getOrderItems() == null
            ? List.of()
            : order.getOrderItems().stream()
                .map(item -> new OrderResponse.OrderItemDetail(
                    item.getMenuItem().getName(),
                    item.getQuantity(),
                    item.getPrice()))
                .toList();

        return new OrderResponse(
            order.getId(),
            order.getRestaurant().getName(),
            order.getStatus().name(),
            order.getTotalAmount(),
            order.getDiscountAmount(),
            order.getCouponCode(),
            getEstimatedDeliveryTime(order),
            order.getCreatedAt(),
            itemDetails);
    }
}
