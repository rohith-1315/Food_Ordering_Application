package com.foodapp.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrderResponse {

    private Long id;
    private String restaurantName;
    private String status;
    private BigDecimal totalAmount;
    private BigDecimal discountAmount;
    private String couponCode;
    private LocalDateTime estimatedDeliveryTime;
    private LocalDateTime createdAt;
    private List<OrderItemDetail> items;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class OrderItemDetail {
        private String menuItemName;
        private Integer quantity;
        private BigDecimal price;
    }
}
