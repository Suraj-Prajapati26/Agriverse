package com.agriverse.weathercrop.service;

import com.agriverse.weathercrop.model.MandiPrice;
import com.agriverse.weathercrop.repository.MandiPriceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
public class MandiPriceService {

    private final RestTemplate restTemplate;
    private final MandiPriceRepository repository;

    @Value("${govt.api.url}")
    private String mandiApiUrl;

    @Value("${govt.api.key}")
    private String apiKey;

    /**
     * Get price from DB or fallback to Govt API if missing
     */
    public Double getLatestPriceWithFallback(String commodity, String state) {
        return repository.findByCommodityIgnoreCaseAndStateIgnoreCase(commodity, state)
                .stream()
                .findFirst()
                .map(MandiPrice::getModalPrice)
                .orElseGet(() -> {
                    List<MandiPrice> fetched = fetchAndStorePrices(commodity, state);
                    return fetched.isEmpty() ? 0.0 : calculateAverageModalPrice(fetched);
                });
    }

    /**
     * Call Govt API to fetch prices and store in DB
     */
    public List<MandiPrice> fetchAndStorePrices(String commodity, String state) {
        String url = mandiApiUrl + "?api-key=" + apiKey + "&format=json"
                + "&filters[commodity]=" + commodity
                + "&filters[state]=" + state;

        Map<String, Object> response = restTemplate.getForObject(url, Map.class);
        List<Map<String, Object>> records = (List<Map<String, Object>>) response.get("records");

        List<MandiPrice> prices = new ArrayList<>();
        if (records != null) {
            for (Map<String, Object> record : records) {
                double modalPrice = Double.parseDouble(record.get("modal_price").toString());
                MandiPrice price = MandiPrice.builder()
                        .commodity(record.get("commodity").toString())
                        .variety(record.get("variety").toString())
                        .state(record.get("state").toString())
                        .district(record.get("district").toString())
                        .market(record.get("market").toString())
                        .minPrice(Double.parseDouble(record.get("min_price").toString()))
                        .maxPrice(Double.parseDouble(record.get("max_price").toString()))
                        .modalPrice(modalPrice)
                        .priceDate(LocalDate.now())
                        .build();
                prices.add(price);
            }
            repository.saveAll(prices);
        }
        return prices;
    }

    /**
     * If multiple markets found, average their modal price
     */
    private Double calculateAverageModalPrice(List<MandiPrice> prices) {
        return prices.stream()
                .mapToDouble(MandiPrice::getModalPrice)
                .average()
                .orElse(0.0);
    }
}
