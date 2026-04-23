package com.foodapp.service;

import com.foodapp.dto.response.RestaurantResponse;
import com.foodapp.dto.response.PaginatedResponse;
import com.foodapp.exception.ResourceNotFoundException;
import com.foodapp.model.Restaurant;
import com.foodapp.repository.RestaurantRepository;
import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RestaurantService {

    private final RestaurantRepository restaurantRepository;

    public List<RestaurantResponse> getAllRestaurants() {
        return restaurantRepository.findAll().stream()
            .map(this::mapToRestaurantResponse)
            .toList();
    }

    public PaginatedResponse<RestaurantResponse> searchRestaurants(
        String query,
        List<String> cuisines,
        BigDecimal minPrice,
        BigDecimal maxPrice,
        String sortBy,
        int page,
        int size) {

        List<String> cuisineFilters = cuisines == null
            ? List.of()
            : cuisines.stream()
                .flatMap(value -> Arrays.stream(value.split(",")))
                .map(String::trim)
                .filter(value -> !value.isBlank())
                .map(value -> value.toLowerCase(Locale.ROOT))
                .toList();

        Pageable pageable = PageRequest.of(page, size);

        String normalizedSort = normalizeSortBy(sortBy);
        String normalizedQuery = query == null || query.isBlank() ? "" : query.trim();

        Page<RestaurantResponse> result = restaurantRepository.searchRestaurants(
                normalizedQuery,
                cuisineFilters.isEmpty() ? List.of("__none__") : cuisineFilters,
                cuisineFilters.isEmpty(),
                minPrice,
                maxPrice,
                normalizedSort,
                pageable)
            .map(this::mapToRestaurantResponse);

        return new PaginatedResponse<>(
            result.getContent(),
            result.getTotalElements(),
            result.getTotalPages(),
            result.getNumber(),
            result.getSize());
    }

    public RestaurantResponse getById(Long id) {
        Restaurant restaurant = restaurantRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found with id: " + id));
        return mapToRestaurantResponse(restaurant);
    }

    private RestaurantResponse mapToRestaurantResponse(Restaurant restaurant) {
        return new RestaurantResponse(
            restaurant.getId(),
            restaurant.getName(),
            restaurant.getAddress(),
            restaurant.getCuisineType(),
            restaurant.getImageUrl(),
            restaurant.getAvgPrice(),
            restaurant.getAvgRating(),
            restaurant.getOrderCount());
    }

    private String normalizeSortBy(String sortBy) {
        if (sortBy == null || sortBy.isBlank()) {
            return "popularity";
        }

        String value = sortBy.trim().toLowerCase(Locale.ROOT);
        if (value.equals("popularity") || value.equals("newest") || value.equals("rating")) {
            return value;
        }

        return "popularity";
    }
}
