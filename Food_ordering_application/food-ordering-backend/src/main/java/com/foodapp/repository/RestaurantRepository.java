package com.foodapp.repository;

import com.foodapp.model.Restaurant;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {

	Optional<Restaurant> findByNameIgnoreCase(String name);

	@Query("""
		SELECT r FROM Restaurant r
		WHERE (
			:query = ''
			OR LOWER(r.name) LIKE LOWER(CONCAT('%', :query, '%'))
			OR LOWER(COALESCE(r.cuisineType, '')) LIKE LOWER(CONCAT('%', :query, '%'))
			OR LOWER(COALESCE(r.address, '')) LIKE LOWER(CONCAT('%', :query, '%'))
		)
		AND (:cuisinesEmpty = true OR LOWER(COALESCE(r.cuisineType, '')) IN :cuisines)
		AND (:minPrice IS NULL OR r.avgPrice >= :minPrice)
		AND (:maxPrice IS NULL OR r.avgPrice <= :maxPrice)
		ORDER BY
			CASE WHEN :sortBy = 'popularity' THEN r.orderCount END DESC,
			CASE WHEN :sortBy = 'newest' THEN r.createdAt END DESC,
			CASE WHEN :sortBy = 'rating' THEN r.avgRating END DESC,
			r.name ASC
		""")
	Page<Restaurant> searchRestaurants(
		@Param("query") String query,
		@Param("cuisines") List<String> cuisines,
		@Param("cuisinesEmpty") boolean cuisinesEmpty,
		@Param("minPrice") BigDecimal minPrice,
		@Param("maxPrice") BigDecimal maxPrice,
		@Param("sortBy") String sortBy,
		Pageable pageable);
}
