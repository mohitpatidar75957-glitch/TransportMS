package com.tms.backend.repository;

import com.tms.backend.entity.RateCard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RateCardRepository extends JpaRepository<RateCard, Long> {
    Optional<RateCard> findByOriginIgnoreCaseAndDestinationIgnoreCaseAndVehicleTypeIgnoreCase(
            String origin, String destination, String vehicleType);
}
