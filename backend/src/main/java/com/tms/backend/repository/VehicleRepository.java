package com.tms.backend.repository;

import com.tms.backend.model.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    Vehicle findByRegistrationNumber(String registrationNumber);
    Vehicle findByTenantIdAndRegistrationNumber(Long tenantId, String registrationNumber);
    List<Vehicle> findAllByOrderByIdAsc();
}
