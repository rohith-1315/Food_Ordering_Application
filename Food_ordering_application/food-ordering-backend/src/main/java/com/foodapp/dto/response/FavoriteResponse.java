package com.foodapp.dto.response;

import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FavoriteResponse {

    private Long id;
    private Long restaurantId;
    private String restaurantName;
    private String label;
    private List<Long> menuItemIds;
    private LocalDateTime createdAt;
}
