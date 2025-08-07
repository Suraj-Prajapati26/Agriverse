package com.agriverse.marketplaceorder.dto;

import com.agriverse.marketplaceorder.model.OrderItem;
import com.agriverse.marketplaceorder.model.OrderTable;
import lombok.Data;

import java.util.List;

@Data
public class OrderRequest {
    private OrderTable order;
    private List<OrderItem> items;
}
