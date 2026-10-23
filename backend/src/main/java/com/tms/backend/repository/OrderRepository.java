package com.tms.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.tms.backend.model.Order;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    java.util.Optional<Order> findTopByOrderByIdDesc();
}
