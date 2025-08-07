package com.agriverse.weathercrop.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.agriverse.weathercrop.model.WeatherLog;
import com.agriverse.weathercrop.service.WeatherLogService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/weather")
@RequiredArgsConstructor
public class WeatherLogController {

    private final WeatherLogService weatherLogService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<WeatherLog> addWeather(@RequestBody WeatherLog log) {
        return ResponseEntity.ok(weatherLogService.addWeatherLog(log));
    }

    @GetMapping("/{region}")
    public ResponseEntity<List<WeatherLog>> getWeather(@PathVariable String region) {
        return ResponseEntity.ok(weatherLogService.getWeatherByRegion(region));
    }
    
    @GetMapping("/fetch/{region}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<WeatherLog> fetchWeather(@PathVariable String region) {
        return ResponseEntity.ok(weatherLogService.fetchAndSaveWeather(region));
    }

}
