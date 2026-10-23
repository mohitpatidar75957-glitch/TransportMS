package com.tms.backend.repository;

import com.tms.backend.entity.GstInvoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GstInvoiceRepository extends JpaRepository<GstInvoice, Long> {
    List<GstInvoice> findByType(String type);
    List<GstInvoice> findByStatus(String status);
}
