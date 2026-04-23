package com.foodapp.config;

import com.foodapp.model.Coupon;
import com.foodapp.model.enums.CouponType;
import com.foodapp.repository.CouponRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class CouponSeeder implements CommandLineRunner {

    private final CouponRepository couponRepository;

    @Override
    public void run(String... args) {
        seedCoupon(
            "SUMMER20",
            CouponType.PERCENTAGE,
            BigDecimal.valueOf(20),
            BigDecimal.valueOf(300),
            BigDecimal.valueOf(200),
            500,
            LocalDateTime.now().plusMonths(3),
            List.of());

        seedCoupon(
            "DIWALI500",
            CouponType.FLAT,
            BigDecimal.valueOf(500),
            BigDecimal.valueOf(2000),
            BigDecimal.valueOf(500),
            5,
            LocalDateTime.of(LocalDateTime.now().getYear(), 12, 31, 23, 59),
            List.of());
    }

    private void seedCoupon(
        String code,
        CouponType type,
        BigDecimal value,
        BigDecimal minOrderValue,
        BigDecimal maxDiscount,
        int maxUses,
        LocalDateTime expiresAt,
        List<Long> applicableRestaurantIds) {

        if (couponRepository.findByCodeIgnoreCase(code).isPresent()) {
            return;
        }

        Coupon coupon = new Coupon();
        coupon.setCode(code);
        coupon.setType(type);
        coupon.setValue(value);
        coupon.setMinOrderValue(minOrderValue);
        coupon.setMaxDiscountAmount(maxDiscount);
        coupon.setMaxUses(maxUses);
        coupon.setUsedCount(0);
        coupon.setExpiresAt(expiresAt);
        coupon.setApplicableRestaurantIds(applicableRestaurantIds);
        couponRepository.save(coupon);

        log.info("[Seeder] Coupon seeded: {}", code);
    }
}
