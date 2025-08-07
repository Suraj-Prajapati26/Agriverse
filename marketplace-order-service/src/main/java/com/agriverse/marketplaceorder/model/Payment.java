package com.agriverse.marketplaceorder.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long paymentId;

    private Long orderId;
    private Long userId;
    private Double amount;
    private String method; // CARD/UPI/WALLET
    private String status; // PENDING, SUCCESS, FAILED

    // Razorpay specific fields
    private String gatewayOrderId;
    private String gatewayPaymentId;
    private String gatewaySignature;

    private LocalDateTime paidAt;

    @PrePersist
    public void prePersist() {
        if (paidAt == null) paidAt = LocalDateTime.now();
        if (status == null) status = "PENDING";
    }
}
