package com.agriverse.weathercrop.controller;

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

import com.agriverse.weathercrop.model.CropRecommendation;
import com.agriverse.weathercrop.service.CropRecommendationService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
public class CropRecommendationController {

    private final CropRecommendationService recommendationService;

    @PostMapping
    @PreAuthorize("hasRole('FARMER')")
    public ResponseEntity<CropRecommendation> createRecommendation(@RequestBody Map<String, String> request) {
        Long userId = Long.valueOf(request.get("userId"));
        String region = request.get("region");
        String soilType = request.get("soilType");

        return ResponseEntity.ok(
            recommendationService.generateRecommendation(userId, region, soilType)
        );
    }


    @GetMapping("/{userId}")
    public ResponseEntity<List<CropRecommendation>> getRecommendations(@PathVariable Long userId) {
        return ResponseEntity.ok(recommendationService.getUserRecommendations(userId));
    }
}
