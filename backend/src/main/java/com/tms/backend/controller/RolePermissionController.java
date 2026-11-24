package com.tms.backend.controller;

import com.tms.backend.entity.RolePermission;
import com.tms.backend.repository.RolePermissionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/permissions")
public class RolePermissionController {

    @Autowired
    private RolePermissionRepository rolePermissionRepository;

    @GetMapping("/{roleName}")
    public ResponseEntity<?> getPermissions(@PathVariable String roleName) {
        return rolePermissionRepository.findByRoleName(roleName)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/{roleName}")
    public ResponseEntity<?> updatePermissions(@PathVariable String roleName, @RequestBody RolePermission payload) {
        RolePermission permission = rolePermissionRepository.findByRoleName(roleName).orElse(new RolePermission());
        permission.setRoleName(roleName);
        permission.setAllowedPaths(payload.getAllowedPaths());
        rolePermissionRepository.save(permission);
        return ResponseEntity.ok(permission);
    }
}
