package com.foodapp.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import lombok.Data;

@Data
public class FavoriteCreateRequest {

    @NotNull(message = "Restaurant id is required")
    private Long restaurantId;

    @NotBlank(message = "Favorite label is required")
    private String label;

    @NotEmpty(message = "At least one menu item is required")
    private List<Long> menuItemIds;
}
