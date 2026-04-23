package com.foodapp.controller;

import com.foodapp.dto.request.ReviewCreateRequest;
import com.foodapp.dto.request.ReviewUpdateRequest;
import com.foodapp.dto.response.ApiResponse;
import com.foodapp.dto.response.PaginatedResponse;
import com.foodapp.dto.response.ReviewResponse;
import com.foodapp.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping("/api/reviews")
    public ResponseEntity<ApiResponse<ReviewResponse>> create(
        @Valid @RequestBody ReviewCreateRequest request,
        Authentication authentication) {

        return ResponseEntity.status(201)
            .body(ApiResponse.success(reviewService.createReview(authentication.getName(), request)));
    }

    @GetMapping("/api/restaurants/{restaurantId}/reviews")
    public ResponseEntity<ApiResponse<PaginatedResponse<ReviewResponse>>> getRestaurantReviews(
        @PathVariable Long restaurantId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size) {

        return ResponseEntity.ok(ApiResponse.success(reviewService.getRestaurantReviews(restaurantId, page, size)));
    }

    @GetMapping("/api/reviews/my")
    public ResponseEntity<ApiResponse<PaginatedResponse<ReviewResponse>>> getMyReviews(
        Authentication authentication,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size) {

        return ResponseEntity.ok(ApiResponse.success(reviewService.getMyReviews(authentication.getName(), page, size)));
    }

    @PutMapping("/api/reviews/{id}")
    public ResponseEntity<ApiResponse<ReviewResponse>> update(
        @PathVariable Long id,
        @Valid @RequestBody ReviewUpdateRequest request,
        Authentication authentication) {

        return ResponseEntity.ok(ApiResponse.success(reviewService.updateReview(authentication.getName(), id, request)));
    }
}
