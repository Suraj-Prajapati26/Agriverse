

package com.agriverse.weathercrop.repository;

import com.agriverse.weathercrop.model.WeatherLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WeatherLogRepository extends JpaRepository<WeatherLog, Long> {
    List<WeatherLog> findByRegionOrderByLogDateDesc(String region);
}

