package com.agriverse.mlanalytics.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PredictionLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long predictionId;

    private Long userId;
    private String crop;
    private String region;
    private Double predictedYield;
    private Double confidence;
    private LocalDateTime predictionDate;

    @PrePersist
    public void onCreate() {
        predictionDate = LocalDateTime.now();
    }
}
