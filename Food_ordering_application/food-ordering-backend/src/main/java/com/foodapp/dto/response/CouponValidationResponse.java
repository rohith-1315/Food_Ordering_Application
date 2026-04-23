package com.foodapp.dto.response;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CouponValidationResponse {

    private boolean valid;
    private BigDecimal discount;
    private BigDecimal finalAmount;
    private String message;
}
