package com.agriverse.marketplaceorder.repository;

import com.agriverse.marketplaceorder.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
}
