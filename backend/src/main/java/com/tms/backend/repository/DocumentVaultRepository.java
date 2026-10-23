package com.tms.backend.repository;

import com.tms.backend.model.DocumentVault;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DocumentVaultRepository extends JpaRepository<DocumentVault, Long> {
}
