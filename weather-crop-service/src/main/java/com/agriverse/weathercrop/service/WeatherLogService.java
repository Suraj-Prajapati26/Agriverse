package com.agriverse.weathercrop.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.agriverse.weathercrop.model.WeatherLog;
import com.agriverse.weathercrop.repository.WeatherLogRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class WeatherLogService {

    private final WeatherLogRepository weatherLogRepository;
    @Autowired
    private WeatherApiClient weatherApiClient;

    public WeatherLog fetchAndSaveWeather(String region) {
        Map<String, Object> apiData = weatherApiClient.getWeather(region);
        System.out.println(apiData);
        Map<String, Object> main = (Map<String, Object>) apiData.get("main");
        if (main == null) throw new RuntimeException("Weather data missing for: " + region);

        double temp = Double.parseDouble(main.getOrDefault("temp", 0).toString());
        double humidity = Double.parseDouble(main.getOrDefault("humidity", 0).toString());

        double rainfall = 0.0;
        if (apiData.containsKey("rain") && apiData.get("rain") != null) {
            Map<String, Object> rain = (Map<String, Object>) apiData.get("rain");
            rainfall = Double.parseDouble(rain.getOrDefault("1h", "0").toString());
        }

        List<Map<String, Object>> weatherList = (List<Map<String, Object>>) apiData.get("weather");
        String forecast = weatherList != null && !weatherList.isEmpty()
                ? weatherList.get(0).get("description").toString()
                : "No forecast";


        WeatherLog log = WeatherLog.builder()
                .region(region)
                .temperature(temp)
                .humidity(humidity)
                .rainfall(rainfall)
                .forecast(forecast)
                .advice("Auto fetched from OpenWeather API")
                .build();

        return weatherLogRepository.save(log);
    }


    public WeatherLog addWeatherLog(WeatherLog log) {
        if (log.getLogDate() == null) log.setLogDate(LocalDate.now());
        return weatherLogRepository.save(log);
    }

    public List<WeatherLog> getWeatherByRegion(String region) {
        return weatherLogRepository.findByRegionOrderByLogDateDesc(region);
    }
}
