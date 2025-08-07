package com.agriverse.mlanalytics.repository;

import com.agriverse.mlanalytics.model.PredictionLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PredictionLogRepository extends JpaRepository<PredictionLog, Long> {
    List<PredictionLog> findByUserId(Long userId);
}
