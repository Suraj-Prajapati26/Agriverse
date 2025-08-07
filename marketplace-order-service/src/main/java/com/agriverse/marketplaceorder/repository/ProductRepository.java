package com.agriverse.marketplaceorder.repository;

import com.agriverse.marketplaceorder.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByCategoryId(Long categoryId);
    List<Product> findByOwnerId(Long ownerId);
}
