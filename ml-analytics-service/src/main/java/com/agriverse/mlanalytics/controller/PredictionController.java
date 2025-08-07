package com.agriverse.mlanalytics.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.agriverse.mlanalytics.model.PredictionLog;
import com.agriverse.mlanalytics.service.PredictionService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/ml")
@RequiredArgsConstructor
public class PredictionController {

    private final PredictionService predictionService;

    @PostMapping("/predict")
    @PreAuthorize("hasRole('FARMER')")
    public ResponseEntity<PredictionLog> predict(@RequestBody Map<String, Object> request) {
        Long userId = Long.valueOf(request.get("userId").toString());
        String crop = request.get("crop").toString();
        String region = request.get("region").toString();
        Double area = Double.valueOf(request.get("area").toString());
        Double rainfall = Double.valueOf(request.get("rainfall").toString());

        return ResponseEntity.ok(predictionService.predictYield(userId, crop, region, area, rainfall));
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN','FARMER')")
    public ResponseEntity<List<PredictionLog>> getUserPredictions(@PathVariable Long userId) {
        return ResponseEntity.ok(predictionService.getUserPredictions(userId));
    }
}