package com.foodapp.controller;

import com.foodapp.dto.request.PlaceOrderRequest;
import com.foodapp.dto.response.ApiResponse;
import com.foodapp.dto.response.OrderResponse;
import com.foodapp.exception.ValidationException;
import com.foodapp.service.OrderService;
import com.foodapp.service.PaymentService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.Map;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final PaymentService paymentService;
    private final OrderService orderService;

    @PostMapping("/create-order")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createPaymentOrder(
        @RequestBody Map<String, Object> body,
        Authentication auth) {

        Object amountObj = body.get("amount");
        if (amountObj == null) {
            throw new ValidationException("Amount is required");
        }

        BigDecimal amount = new BigDecimal(amountObj.toString());
        Map<String, Object> result = paymentService.createRazorpayOrder(amount);
        log.info("[Payment] Payment order requested by {}", auth.getName());
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @PostMapping("/verify-and-place")
    public ResponseEntity<ApiResponse<OrderResponse>> verifyAndPlaceOrder(
        @Valid @RequestBody VerifyAndPlaceRequest request,
        Authentication auth) {

        boolean valid = paymentService.verifyPayment(
            request.getRazorpayOrderId(),
            request.getRazorpayPaymentId(),
            request.getRazorpaySignature());

        if (!valid) {
            return ResponseEntity.status(400)
                .body(new ApiResponse<>(false, "Payment verification failed", null));
        }

        ApiResponse<OrderResponse> orderResponse = orderService.placeOrder(request.getOrderRequest(), auth.getName());
        return ResponseEntity.status(201).body(orderResponse);
    }

    @Data
    public static class VerifyAndPlaceRequest {
        @NotBlank(message = "razorpayOrderId is required")
        private String razorpayOrderId;

        @NotBlank(message = "razorpayPaymentId is required")
        private String razorpayPaymentId;

        @NotBlank(message = "razorpaySignature is required")
        private String razorpaySignature;

        @Valid
        @NotNull(message = "orderRequest is required")
        private PlaceOrderRequest orderRequest;
    }
}