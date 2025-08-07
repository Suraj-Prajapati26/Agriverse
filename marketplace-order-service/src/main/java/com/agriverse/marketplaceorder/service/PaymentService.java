package com.agriverse.marketplaceorder.service;

import com.agriverse.marketplaceorder.model.OrderTable;
import com.agriverse.marketplaceorder.model.Payment;
import com.agriverse.marketplaceorder.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderService orderService;

    @Transactional
    public Payment makePayment(Payment payment) {
        OrderTable order = orderService.getOrderById(payment.getOrderId());
        if (!payment.getAmount().equals(order.getTotalPrice())) {
            throw new IllegalArgumentException("Payment amount does not match order amount");
        }

        payment.setStatus("SUCCESS");
        Payment savedPayment = paymentRepository.save(payment);

        orderService.updateOrderStatus(payment.getOrderId(), "PAID");
        orderService.reduceStockForOrder(payment.getOrderId());

        return savedPayment;
    }

    public Payment savePayment(Payment payment) {
        return paymentRepository.save(payment);
    }

    public List<Payment> getPayments() {
        return paymentRepository.findAll();
    }

    public Payment getPaymentById(Long id) {
        return paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
    }
}
