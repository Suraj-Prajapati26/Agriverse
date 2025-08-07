package com.agriverse.weathercrop.model;

import java.time.LocalDate;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CropRecommendation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long recommendationId;

    private Long userId;
    private String region;
    private String soilType;
    private String rainfallForecast;
    private String suggestedCrop;

    // New fields
    private String fertilizerAdvice;
    private String generalAdvice;
    private Double mandiModalPrice;
    private LocalDate recommendationDate;
}
