package com.foodapp.service;

import com.foodapp.dto.request.ReviewCreateRequest;
import com.foodapp.dto.request.ReviewUpdateRequest;
import com.foodapp.dto.response.PaginatedResponse;
import com.foodapp.dto.response.ReviewResponse;
import com.foodapp.exception.ResourceNotFoundException;
import com.foodapp.exception.UnauthorizedException;
import com.foodapp.exception.ValidationException;
import com.foodapp.model.Order;
import com.foodapp.model.Restaurant;
import com.foodapp.model.Review;
import com.foodapp.model.User;
import com.foodapp.model.enums.OrderStatus;
import com.foodapp.repository.OrderRepository;
import com.foodapp.repository.RestaurantRepository;
import com.foodapp.repository.ReviewRepository;
import com.foodapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final RestaurantRepository restaurantRepository;
    private final OrderRepository orderRepository;

    @Transactional
    @CacheEvict(value = "restaurant-ratings", key = "#request.restaurantId")
    public ReviewResponse createReview(String userEmail, ReviewCreateRequest request) {
        User user = getUserByEmail(userEmail);

        Restaurant restaurant = restaurantRepository.findById(request.getRestaurantId())
            .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found with id: " + request.getRestaurantId()));

        reviewRepository.findByUserAndRestaurant(user, restaurant).ifPresent(existing -> {
            throw new ValidationException("You have already reviewed this restaurant");
        });

        boolean hasDeliveredOrder = orderRepository.existsByUserAndRestaurantAndStatus(user, restaurant, OrderStatus.DELIVERED);
        if (!hasDeliveredOrder) {
            throw new ValidationException("You can review a restaurant only after a delivered order");
        }

        Review review = new Review();
        review.setUser(user);
        review.setRestaurant(restaurant);
        review.setRating(request.getRating());
        review.setComment(request.getComment());

        Review saved = reviewRepository.save(review);
        updateRestaurantAverageRating(restaurant);

        return mapToResponse(saved);
    }

    @Transactional
    @CacheEvict(value = "restaurant-ratings", key = "#result.restaurantId")
    public ReviewResponse updateReview(String userEmail, Long reviewId, ReviewUpdateRequest request) {
        User user = getUserByEmail(userEmail);

        Review review = reviewRepository.findById(reviewId)
            .orElseThrow(() -> new ResourceNotFoundException("Review not found with id: " + reviewId));

        if (!review.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException("You are not allowed to edit this review");
        }

        review.setRating(request.getRating());
        review.setComment(request.getComment());

        Review saved = reviewRepository.save(review);
        updateRestaurantAverageRating(saved.getRestaurant());

        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public PaginatedResponse<ReviewResponse> getRestaurantReviews(Long restaurantId, int page, int size) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
            .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found with id: " + restaurantId));

        Pageable pageable = PageRequest.of(page, size);
        Page<ReviewResponse> reviewPage = reviewRepository.findByRestaurantOrderByCreatedAtDesc(restaurant, pageable)
            .map(this::mapToResponse);

        return new PaginatedResponse<>(
            reviewPage.getContent(),
            reviewPage.getTotalElements(),
            reviewPage.getTotalPages(),
            reviewPage.getNumber(),
            reviewPage.getSize());
    }

    @Transactional(readOnly = true)
    public PaginatedResponse<ReviewResponse> getMyReviews(String userEmail, int page, int size) {
        User user = getUserByEmail(userEmail);
        Pageable pageable = PageRequest.of(page, size);

        Page<ReviewResponse> reviewPage = reviewRepository.findByUserOrderByCreatedAtDesc(user, pageable)
            .map(this::mapToResponse);

        return new PaginatedResponse<>(
            reviewPage.getContent(),
            reviewPage.getTotalElements(),
            reviewPage.getTotalPages(),
            reviewPage.getNumber(),
            reviewPage.getSize());
    }

    @Cacheable(value = "restaurant-ratings", key = "#restaurantId")
    public Double getAverageRating(Long restaurantId) {
        return reviewRepository.findAverageRatingByRestaurantId(restaurantId);
    }

    private void updateRestaurantAverageRating(Restaurant restaurant) {
        Double average = reviewRepository.findAverageRatingByRestaurantId(restaurant.getId());
        restaurant.setAvgRating(average == null ? 0.0 : average);
        restaurantRepository.save(restaurant);
    }

    private ReviewResponse mapToResponse(Review review) {
        return new ReviewResponse(
            review.getId(),
            review.getRestaurant().getId(),
            review.getRestaurant().getName(),
            review.getUser().getName(),
            review.getRating(),
            review.getComment(),
            review.getCreatedAt(),
            review.getUpdatedAt());
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new UnauthorizedException("User not found"));
    }
}
