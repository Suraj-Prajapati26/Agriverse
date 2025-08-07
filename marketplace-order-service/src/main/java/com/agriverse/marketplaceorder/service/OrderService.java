package com.agriverse.marketplaceorder.service;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import com.agriverse.marketplaceorder.exception.ResourceNotFoundException;
import com.agriverse.marketplaceorder.exception.StockException;
import com.agriverse.marketplaceorder.model.OrderItem;
import com.agriverse.marketplaceorder.model.OrderTable;
import com.agriverse.marketplaceorder.model.Product;
import com.agriverse.marketplaceorder.repository.OrderItemRepository;
import com.agriverse.marketplaceorder.repository.OrderRepository;
import com.agriverse.marketplaceorder.repository.ProductRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    @Autowired
    private RestTemplate restTemplate;

    @Value("${notification.service.url:http://localhost:8081}")
    private String notificationServiceUrl;

    /**
     * Creates an order after checking stock availability and calculating total price.
     */
    @Transactional
    public OrderTable createOrder(OrderTable order, List<OrderItem> items) {
        double totalPrice = 0.0;

        // Validate stock & calculate total price in one loop
        for (OrderItem item : items) {
            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + item.getProductId()));

            if (product.getStock() < item.getQuantity()) {
                throw new StockException("Insufficient stock for product: " + product.getName());
            }

            item.setUnitPrice(product.getPrice());
            totalPrice += product.getPrice() * item.getQuantity();
        }

        order.setTotalPrice(totalPrice);
        order.setStatus("PENDING");

        // Save order
        OrderTable savedOrder = orderRepository.save(order);

        // Link items to order and save
        for (OrderItem item : items) {
            item.setOrderId(savedOrder.getOrderId());
        }
        orderItemRepository.saveAll(items);

        // --- Notification Trigger ---
        try {
            String notifyUrl = notificationServiceUrl + "/api/notifications/user/" + order.getUserId();
            Map<String, String> body = Map.of(
                "message", "Order #" + savedOrder.getOrderId() + " placed successfully!",
                "type", "INFO"
            );
            restTemplate.postForObject(notifyUrl, body, Void.class);
        } catch (Exception e) {
            // Log error but don't rollback order
            System.err.println("Failed to send notification: " + e.getMessage());
        }

        return savedOrder;
    }


    /**
     * Updates the status of an order.
     */
    public void updateOrderStatus(Long orderId, String status) {
        OrderTable order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
        order.setStatus(status);
        orderRepository.save(order);
    }

    /**
     * Reduces stock for all items of an order after successful payment.
     */
    @Transactional
    public void reduceStockForOrder(Long orderId) {
        List<OrderItem> items = orderItemRepository.findByOrderId(orderId);
        for (OrderItem item : items) {
            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + item.getProductId()));
            if (product.getStock() < item.getQuantity()) {
                throw new StockException("Insufficient stock for product: " + product.getName());
            }
            product.setStock(product.getStock() - item.getQuantity());
            productRepository.save(product);
        }
    }

    /**
     * Fetch an order by id.
     */
    public OrderTable getOrderById(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() ->new ResourceNotFoundException("Product not found with id: " + orderId));
    }

    /**
     * Fetch all orders by user.
     */
    public List<OrderTable> getOrdersByUser(Long userId) {
        return orderRepository.findByUserId(userId);
    }

    /**
     * Fetch items for a given order.
     */
    public List<OrderItem> getOrderItems(Long orderId) {
        return orderItemRepository.findByOrderId(orderId);
    }

    /**
     * Cancels an order and restores stock (if it was already paid).
     */
    @Transactional
    public void cancelOrder(Long orderId) {
        OrderTable order = getOrderById(orderId);

        if ("PAID".equalsIgnoreCase(order.getStatus())) {
            // Restore stock if already deducted
            List<OrderItem> items = orderItemRepository.findByOrderId(orderId);
            for (OrderItem item : items) {
                Product product = productRepository.findById(item.getProductId())
                        .orElseThrow(() -> new RuntimeException("Product not found with id: " + item.getProductId()));
                product.setStock(product.getStock() + item.getQuantity());
                productRepository.save(product);
            }
        }
        order.setStatus("CANCELLED");
        orderRepository.save(order);
    }
    public List<OrderTable> getAllOrders() {
        return orderRepository.findAll();
    }

}
