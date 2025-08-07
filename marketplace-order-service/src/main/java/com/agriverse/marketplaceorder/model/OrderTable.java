package com.agriverse.marketplaceorder.model;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class OrderTable {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long orderId;

    private Long userId; // From User service
    private Double totalPrice;
    private String status;  // PENDING, PAID, CANCELLED
    private LocalDateTime orderedAt;

    @PrePersist
    public void prePersist() {
        orderedAt = LocalDateTime.now();
        status = "PENDING";
    }
}

