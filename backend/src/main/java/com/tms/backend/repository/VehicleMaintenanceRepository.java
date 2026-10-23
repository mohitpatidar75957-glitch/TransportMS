package com.tms.backend.repository;

import com.tms.backend.model.VehicleMaintenance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VehicleMaintenanceRepository extends JpaRepository<VehicleMaintenance, Long> {
    List<VehicleMaintenance> findByVehicleIdOrderByServiceDateDesc(Long vehicleId);
    List<VehicleMaintenance> findAllByOrderByServiceDateDesc();
}
