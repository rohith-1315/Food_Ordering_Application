package com.foodapp.service;

import com.foodapp.dto.response.CouponValidationResponse;
import com.foodapp.exception.ResourceNotFoundException;
import com.foodapp.exception.ValidationException;
import com.foodapp.model.Coupon;
import com.foodapp.model.enums.CouponType;
import com.foodapp.repository.CouponRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Clock;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CouponService {

    private final CouponRepository couponRepository;
    private final Clock clock;

    @Transactional(readOnly = true)
    public CouponValidationResponse validateCoupon(String code, BigDecimal orderAmount, Long restaurantId) {
        if (orderAmount == null || orderAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new ValidationException("Order amount must be greater than zero");
        }

        Coupon coupon = couponRepository.findByCodeIgnoreCase(code)
            .orElseThrow(() -> new ResourceNotFoundException("Invalid coupon code"));

        LocalDateTime now = LocalDateTime.now(clock);

        if (coupon.getExpiresAt().isBefore(now)) {
            throw new ValidationException("Coupon expired");
        }

        if (coupon.getUsedCount() >= coupon.getMaxUses()) {
            throw new ValidationException("Coupon usage limit reached");
        }

        if (orderAmount.compareTo(coupon.getMinOrderValue()) < 0) {
            throw new ValidationException("Minimum order amount not met for this coupon");
        }

        List<Long> applicableRestaurantIds = coupon.getApplicableRestaurantIds();
        if (restaurantId != null && applicableRestaurantIds != null && !applicableRestaurantIds.isEmpty()
            && !applicableRestaurantIds.contains(restaurantId)) {
            throw new ValidationException("Coupon is not applicable for this restaurant");
        }

        BigDecimal discount = calculateDiscount(coupon, orderAmount);
        BigDecimal finalAmount = orderAmount.subtract(discount).max(BigDecimal.ZERO);

        return new CouponValidationResponse(true, discount, finalAmount, "Coupon applied successfully");
    }

    @Transactional
    public void markCouponUsed(String code) {
        Coupon coupon = couponRepository.findByCodeIgnoreCase(code)
            .orElseThrow(() -> new ResourceNotFoundException("Invalid coupon code"));

        if (coupon.getUsedCount() >= coupon.getMaxUses()) {
            throw new ValidationException("Coupon usage limit reached");
        }

        coupon.setUsedCount(coupon.getUsedCount() + 1);
        couponRepository.save(coupon);
    }

    public BigDecimal calculateDiscount(Coupon coupon, BigDecimal orderAmount) {
        BigDecimal discount;

        if (coupon.getType() == CouponType.PERCENTAGE) {
            discount = orderAmount
                .multiply(coupon.getValue())
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        } else {
            discount = coupon.getValue();
        }

        if (coupon.getMaxDiscountAmount() != null) {
            discount = discount.min(coupon.getMaxDiscountAmount());
        }

        return discount.min(orderAmount);
    }
}
