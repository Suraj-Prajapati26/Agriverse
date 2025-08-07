package com.agriverse.marketplaceorder.repository;

import com.agriverse.marketplaceorder.model.OrderTable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderRepository extends JpaRepository<OrderTable, Long> {
    List<OrderTable> findByUserId(Long userId);
}
