package com.agriverse.weathercrop.service;

import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class WeatherApiClient {

    private final RestTemplate restTemplate;

    @Value("${openweather.api.key}")
    private String apiKey;

    @Value("${openweather.api.url}")
    private String apiUrl;

    public Map<String, Object> getWeather(String city) {
        String url = apiUrl + "?q=" + city + "&appid=" + apiKey + "&units=metric";
        try {
            return restTemplate.getForObject(url, Map.class);
        } catch (HttpClientErrorException.Unauthorized ex) {
            throw new RuntimeException("Invalid OpenWeather API key or unauthorized access");
        } catch (HttpClientErrorException.NotFound ex) {
            throw new RuntimeException("City not found: " + city);
        }
    }

}
