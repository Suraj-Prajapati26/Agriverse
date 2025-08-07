package com.agriverse.weathercrop.repository;

import com.agriverse.weathercrop.model.CropRecommendation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CropRecommendationRepository extends JpaRepository<CropRecommendation, Long> {
    List<CropRecommendation> findByUserId(Long userId);
}
