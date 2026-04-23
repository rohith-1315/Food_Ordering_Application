package com.foodapp.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import lombok.Data;

@Data
public class MergeCartRequest {

    @NotEmpty(message = "Guest cart items are required")
    @Valid
    private List<GuestCartItemRequest> items;

    @Data
    public static class GuestCartItemRequest {

        @NotNull(message = "Menu item id is required")
        private Long menuItemId;

        @NotNull(message = "Quantity is required")
        @Min(value = 1, message = "Quantity must be at least 1")
        private Integer quantity;
    }
}
