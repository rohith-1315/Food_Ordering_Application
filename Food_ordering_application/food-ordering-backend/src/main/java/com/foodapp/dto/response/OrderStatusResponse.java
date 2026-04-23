package com.foodapp.dto.response;

import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrderStatusResponse {

    private Long id;
    private String currentStatus;
    private List<TimelineEntry> timeline;
    private LocalDateTime estimatedDeliveryTime;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class TimelineEntry {
        private String status;
        private LocalDateTime timestamp;
    }
}
