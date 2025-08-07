package com.agriverse.marketplaceorder.controller;

import com.agriverse.marketplaceorder.service.PaymentGatewayService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payment-gateway")
@RequiredArgsConstructor
public class PaymentGatewayController {

    private final PaymentGatewayService paymentGatewayService;

    @PostMapping("/create-order")
    public ResponseEntity<String> createOrder(@RequestParam double amount) {
        try {
            String response = paymentGatewayService.createOrder(amount, "INR", "rcptid_11");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
}
