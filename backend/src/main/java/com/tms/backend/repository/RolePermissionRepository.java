package com.tms.backend.repository;

import com.tms.backend.entity.RolePermission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RolePermissionRepository extends JpaRepository<RolePermission, Long> {
    Optional<RolePermission> findByRoleName(String roleName);
}
