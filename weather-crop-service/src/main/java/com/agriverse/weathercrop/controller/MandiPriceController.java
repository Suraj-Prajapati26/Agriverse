package com.agriverse.weathercrop.controller;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.agriverse.weathercrop.model.MandiPrice;
import com.agriverse.weathercrop.service.MandiPriceService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/mandi")
@RequiredArgsConstructor
public class MandiPriceController {

    private final MandiPriceService mandiPriceService;

    @GetMapping("/fetch/{commodity}/{state}")
    public ResponseEntity<List<MandiPrice>> fetchPrices(@PathVariable String commodity, @PathVariable String state) {
        return ResponseEntity.ok(mandiPriceService.fetchAndStorePrices(commodity, state));
    }
}
