package com.agriverse.weathercrop.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.agriverse.weathercrop.model.MandiPrice;

public interface MandiPriceRepository extends JpaRepository<MandiPrice, Long> {
    List<MandiPrice> findByCommodityIgnoreCaseAndStateIgnoreCase(String commodity, String state);
}
