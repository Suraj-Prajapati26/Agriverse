package com.agriverse.usernotification.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.agriverse.usernotification.exception.ResourceNotFoundException;
import com.agriverse.usernotification.model.Notification;
import com.agriverse.usernotification.repository.NotificationRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public Notification createNotification(Notification notification) {
        return notificationRepository.save(notification);
    }

    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderBySentAtDesc(userId);
    }

    public Notification markAsRead(Long notificationId) {
        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        n.setStatus("READ");
        return notificationRepository.save(n);
    }
    public List<Notification> sendNotificationToAll(String message, String type, List<Long> userIds) {
        List<Notification> notifications = userIds.stream()
                .map(userId -> Notification.builder()
                        .userId(userId)
                        .message(message)
                        .type(type)
                        .build())
                .toList();
        return notificationRepository.saveAll(notifications);
    }
    public List<Notification> getAllNotifications() {
        return notificationRepository.findAll();
    }

    public void deleteNotification(Long id) {
        notificationRepository.deleteById(id);
    }


}
