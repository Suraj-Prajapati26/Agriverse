package com.agriverse.marketplaceorder.controller;

import com.agriverse.marketplaceorder.model.Payment;
import com.agriverse.marketplaceorder.service.OrderService;
import com.agriverse.marketplaceorder.service.PaymentGatewayService;
import com.agriverse.marketplaceorder.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final PaymentGatewayService paymentGatewayService;
    private final OrderService orderService;

    // ---- Existing endpoint: manual payment (still usable) ----
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','FARMER')")
    public ResponseEntity<Payment> makePayment(@RequestBody Payment payment) {
        return ResponseEntity.ok(paymentService.makePayment(payment));
    }

    // ---- New: initiate Razorpay order ----
    @PostMapping("/initiate")
    @PreAuthorize("hasAnyRole('ADMIN','FARMER')")
    public ResponseEntity<String> initiatePayment(@RequestBody Map<String, Object> request) throws Exception {
        Long orderId = Long.valueOf(request.get("orderId").toString());
        Double amount = Double.valueOf(request.get("amount").toString());

        var order = orderService.getOrderById(orderId);
        if (!amount.equals(order.getTotalPrice())) {
            throw new IllegalArgumentException("Payment amount mismatch");
        }

        String razorpayOrder = paymentGatewayService.createOrder(amount, "INR", "order_rcpt_" + orderId);
        return ResponseEntity.ok(razorpayOrder);
    }

    // ---- New: capture Razorpay payment success ----
    @PostMapping("/capture")
    @PreAuthorize("hasAnyRole('ADMIN','FARMER')")
    public ResponseEntity<Payment> capturePayment(@RequestBody Map<String, String> request) throws Exception {
        String razorpayOrderId = request.get("razorpayOrderId");
        String razorpayPaymentId = request.get("razorpayPaymentId");
        String signature = request.get("razorpaySignature");
        Long orderId = Long.valueOf(request.get("orderId"));
        Long userId = Long.valueOf(request.get("userId"));
        Double amount = Double.valueOf(request.get("amount"));

        // verify signature
        boolean valid = paymentGatewayService.verifySignature(razorpayOrderId, razorpayPaymentId, signature);
        if (!valid) {
            throw new IllegalArgumentException("Invalid Razorpay signature");
        }

        Payment payment = Payment.builder()
                .orderId(orderId)
                .userId(userId)
                .amount(amount)
                .method("RAZORPAY")
                .status("SUCCESS")
                .gatewayOrderId(razorpayOrderId)
                .gatewayPaymentId(razorpayPaymentId)
                .gatewaySignature(signature)
                .build();

        Payment saved = paymentService.savePayment(payment);

        orderService.updateOrderStatus(orderId, "PAID");
        orderService.reduceStockForOrder(orderId);

        return ResponseEntity.ok(saved);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Payment>> getAllPayments() {
        return ResponseEntity.ok(paymentService.getPayments());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Payment> getPaymentById(@PathVariable Long id) {
        return ResponseEntity.ok(paymentService.getPaymentById(id));
    }
}
