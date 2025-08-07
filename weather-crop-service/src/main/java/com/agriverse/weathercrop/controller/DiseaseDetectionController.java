package com.agriverse.weathercrop.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/disease")
@RequiredArgsConstructor
public class DiseaseDetectionController {

    @PostMapping("/detect")
    @PreAuthorize("hasRole('FARMER')")
    public ResponseEntity<Map<String, String>> detectDisease(@RequestParam("image") MultipartFile image) {
        // Placeholder logic
        Map<String, String> response = new HashMap<>();
        response.put("fileName", image.getOriginalFilename());
        response.put("detectedDisease", "Leaf Blight"); // Mock response
        response.put("recommendation", "Use recommended pesticide X and ensure proper irrigation.");

        return ResponseEntity.ok(response);
    }
}
