package com.agriverse.weathercrop.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.agriverse.weathercrop.exception.ResourceNotFoundException;
import com.agriverse.weathercrop.model.CropRecommendation;
import com.agriverse.weathercrop.model.MandiPrice;
import com.agriverse.weathercrop.model.WeatherLog;
import com.agriverse.weathercrop.repository.CropRecommendationRepository;
import com.agriverse.weathercrop.repository.MandiPriceRepository;
import com.agriverse.weathercrop.repository.WeatherLogRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CropRecommendationService {

    private final CropRecommendationRepository recommendationRepository;

    @Autowired
    private WeatherLogRepository weatherLogRepository;
    @Autowired
    private MandiPriceRepository mandiPriceRepository;
    @Autowired
    private MandiPriceService mandiPriceService;

    public CropRecommendation generateRecommendation(Long userId, String region, String soilType) {
        WeatherLog weather = weatherLogRepository.findByRegionOrderByLogDateDesc(region)
                .stream()
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("No weather data available for region: " + region));

        double rainfall = weather.getRainfall();
        double temperature = weather.getTemperature();

        String crop;
        if (rainfall > 100 && soilType.equalsIgnoreCase("clay")) {
            crop = "Rice";
        } else if (rainfall < 50 && temperature > 30 && soilType.equalsIgnoreCase("sandy")) {
            crop = "Millet";
        } else if (rainfall > 75 && temperature < 25) {
            crop = "Wheat";
        } else {
            crop = "Maize";
        }

        String fertilizerAdvice = getFertilizerAdvice(crop);
        String generalAdvice = getGeneralAdvice(crop, rainfall, temperature);

        // Fetch price (with API fallback if DB empty)
        Double mandiPrice = mandiPriceService.getLatestPriceWithFallback(crop, region);

        CropRecommendation recommendation = CropRecommendation.builder()
                .userId(userId)
                .region(region)
                .soilType(soilType)
                .rainfallForecast(rainfall + "mm")
                .suggestedCrop(crop)
                .fertilizerAdvice(fertilizerAdvice)
                .generalAdvice(generalAdvice)
                .mandiModalPrice(mandiPrice)
                .recommendationDate(LocalDate.now())
                .build();

        return recommendationRepository.save(recommendation);
    }


    public List<CropRecommendation> getUserRecommendations(Long userId) {
        return recommendationRepository.findByUserId(userId);
    }
    
    private String getFertilizerAdvice(String crop) {
        switch (crop.toLowerCase()) {
            case "rice": return "Use Urea (100 kg/acre), DAP (50 kg/acre), and Potash as per soil test.";
            case "wheat": return "Use Nitrogen (120 kg/acre) and Phosphorus (60 kg/acre) in split doses.";
            case "millet": return "Use NPK (90:45:45 kg/acre) and organic compost.";
            case "maize": return "Use NPK (120:60:40 kg/acre) and Zinc sulfate.";
            default: return "Apply balanced NPK fertilizer and organic manure based on soil report.";
        }
    }

    private String getGeneralAdvice(String crop, double rainfall, double temperature) {
        if (crop.equalsIgnoreCase("rice")) {
            return "Ensure adequate irrigation and maintain 3-5 cm standing water in fields.";
        } else if (crop.equalsIgnoreCase("wheat")) {
            return "Avoid late sowing; monitor for rust disease at low temperatures.";
        } else if (crop.equalsIgnoreCase("millet")) {
            return "Suitable for dry areas; ensure timely weeding and pest monitoring.";
        } else if (crop.equalsIgnoreCase("maize")) {
            return "Maintain proper spacing and monitor for fall armyworm infestation.";
        } else {
            return "Follow integrated crop management practices.";
        }
    }
    private Double getLatestMandiPrice(String crop, String state) {
        return mandiPriceRepository.findByCommodityIgnoreCaseAndStateIgnoreCase(crop, state)
                .stream()
                .findFirst()
                .map(MandiPrice::getModalPrice)
                .orElse(0.0);
    }

}
