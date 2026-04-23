package com.foodapp.repository;

import com.foodapp.model.Order;
import com.foodapp.model.Restaurant;
import com.foodapp.model.User;
import com.foodapp.model.enums.OrderStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByUserOrderByCreatedAtDesc(User user);

    boolean existsByUserAndRestaurantAndStatus(User user, Restaurant restaurant, OrderStatus status);

    Optional<Order> findByIdAndUser(Long id, User user);
}
