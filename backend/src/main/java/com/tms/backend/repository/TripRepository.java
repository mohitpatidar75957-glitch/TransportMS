package com.tms.backend.repository;

import com.tms.backend.model.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TripRepository extends JpaRepository<Trip, Long> {
    List<Trip> findByVehicleIdOrderByIdDesc(Long vehicleId);
    List<Trip> findByVehicleAndStatus(com.tms.backend.model.Vehicle vehicle, String status);
}
