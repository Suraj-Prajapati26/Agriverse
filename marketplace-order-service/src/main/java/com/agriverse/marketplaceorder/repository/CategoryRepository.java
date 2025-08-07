package com.agriverse.marketplaceorder.repository;

import com.agriverse.marketplaceorder.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long> {
}
