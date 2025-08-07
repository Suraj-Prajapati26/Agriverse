package com.agriverse.mlanalytics.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.agriverse.mlanalytics.exception.InvalidRequestException;
import com.agriverse.mlanalytics.model.PredictionLog;
import com.agriverse.mlanalytics.repository.PredictionLogRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PredictionService {

    private final PredictionLogRepository repository;

    @Autowired
    private RestTemplate restTemplate;

    @Value("${notification.service.url:http://localhost:8081}")
    private String notificationServiceUrl;

    @Value("${python.api.url:http://localhost:5001}")
    private String pythonApiUrl;

    public PredictionLog predictYield(Long userId, String crop, String region, Double area, Double rainfall) {
        if (area == null || area <= 0 || rainfall == null || rainfall < 0) {
            throw new InvalidRequestException("Invalid area or rainfall values provided");
        }

        // Prepare request for Python ML API
        Map<String, Object> request = new HashMap<>();
        request.put("area", area);
        request.put("rainfall", rainfall);

        double predictedYield;
        double confidence;

        try {
            Map response = restTemplate.postForObject(pythonApiUrl + "/predict", request, Map.class);
            if (response == null || !response.containsKey("predictedYield") || !response.containsKey("confidence")) {
                throw new RuntimeException("Invalid response from ML service");
            }

            predictedYield = Double.parseDouble(response.get("predictedYield").toString());
            confidence = Double.parseDouble(response.get("confidence").toString());
        } catch (Exception e) {
            throw new RuntimeException("Failed to get prediction from ML service: " + e.getMessage());
        }

        // Save log
        PredictionLog log = PredictionLog.builder()
                .userId(userId)
                .crop(crop)
                .region(region)
                .predictedYield(predictedYield)
                .confidence(confidence)
                .build();

        PredictionLog savedLog = repository.save(log);

        // Trigger Notification
        try {
            String notifyUrl = notificationServiceUrl + "/api/notifications/user/" + userId;
            Map<String, String> body = Map.of(
                    "message", "Yield prediction complete for crop: " + crop,
                    "type", "ML_RESULT"
            );
            restTemplate.postForObject(notifyUrl, body, Void.class);
        } catch (Exception e) {
            // Log but don't block main workflow
            System.err.println("Notification service failed: " + e.getMessage());
        }

        return savedLog;
    }



    public List<PredictionLog> getUserPredictions(Long userId) {
        return repository.findByUserId(userId);
    }
}