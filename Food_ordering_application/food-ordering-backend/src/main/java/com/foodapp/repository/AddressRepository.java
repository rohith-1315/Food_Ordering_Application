package com.foodapp.repository;

import com.foodapp.model.Address;
import com.foodapp.model.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AddressRepository extends JpaRepository<Address, Long> {

    List<Address> findByUserOrderByIsDefaultDescCreatedAtDesc(User user);

    long countByUser(User user);

    Optional<Address> findByIdAndUser(Long id, User user);

    List<Address> findByUser(User user);
}
