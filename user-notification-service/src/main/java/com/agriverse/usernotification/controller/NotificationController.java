package com.agriverse.usernotification.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.agriverse.usernotification.model.Notification;
import com.agriverse.usernotification.model.User;
import com.agriverse.usernotification.repository.UserRepository;
import com.agriverse.usernotification.service.NotificationService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<Notification> createNotification(@RequestBody Notification notification) {
        // Admin/system API – you can control who can call this in future
        return ResponseEntity.ok(notificationService.createNotification(notification));
    }

    @GetMapping
    public ResponseEntity<List<Notification>> getUserNotifications(Authentication auth) {
        String email = auth.getName();  // From JWT
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(notificationService.getUserNotifications(user.getUserId()));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Notification> markAsRead(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.markAsRead(id));
    }
    
    @PostMapping("/broadcast")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> sendToAll(@RequestBody Map<String, String> body) {
        String message = body.get("message");
        String type = body.getOrDefault("type", "INFO");

        List<Long> userIds = userRepository.findAll().stream()
                .map(User::getUserId)
                .toList();

        return ResponseEntity.ok(notificationService.sendNotificationToAll(message, type, userIds));
    }
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Notification>> getAllNotifications() {
        return ResponseEntity.ok(notificationService.getAllNotifications());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.noContent().build();
    }


}
