package com.tms.backend.repository;

import com.tms.backend.model.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    Optional<Invoice> findFirstByTripIdOrderByIdDesc(Long tripId);
    List<Invoice> findByTripId(Long tripId);
    List<Invoice> findByStatusNotIgnoreCase(String status);
    List<Invoice> findByDueDateAndStatusNotIgnoreCase(java.time.LocalDate dueDate, String status);
}

