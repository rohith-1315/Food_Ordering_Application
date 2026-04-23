package com.foodapp.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import lombok.Data;

@Data
public class PlaceOrderRequest {

    @NotNull(message = "Restaurant id is required")
    private Long restaurantId;

    @NotEmpty(message = "At least one item is required")
    private List<OrderItemRequest> items;

    private String couponCode;

    private Long addressId;

    @Data
    public static class OrderItemRequest {

        @NotNull(message = "Menu item id is required")
        private Long menuItemId;

        @Min(value = 1, message = "Quantity must be at least 1")
        private Integer quantity;
    }
}
