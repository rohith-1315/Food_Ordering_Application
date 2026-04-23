package com.foodapp.repository;

import com.foodapp.model.MenuItem;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {

    List<MenuItem> findByRestaurantId(Long restaurantId);

    List<MenuItem> findByIdInAndRestaurantId(List<Long> ids, Long restaurantId);
}
