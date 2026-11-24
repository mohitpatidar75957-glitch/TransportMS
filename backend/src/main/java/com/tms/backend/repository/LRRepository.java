package com.tms.backend.repository;

import com.tms.backend.model.LR;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LRRepository extends JpaRepository<LR, Long> {
    Optional<LR> findByTripId(Long tripId);
}
