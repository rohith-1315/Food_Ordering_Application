package com.foodapp.controller;

import com.foodapp.dto.request.PlaceOrderRequest;
import com.foodapp.dto.response.ApiResponse;
import com.foodapp.dto.response.OrderResponse;
import com.foodapp.dto.response.OrderStatusResponse;
import com.foodapp.service.OrderService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponse>> placeOrder(
        @Valid @RequestBody PlaceOrderRequest request,
        Authentication authentication) {
        return ResponseEntity.status(201).body(orderService.placeOrder(request, authentication.getName()));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getMyOrders(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getUserOrders(authentication.getName())));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrder(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getOrderById(id, authentication.getName())));
    }

    @GetMapping("/{id}/status")
    public ResponseEntity<ApiResponse<OrderStatusResponse>> getOrderStatus(
        @PathVariable Long id,
        @RequestParam(defaultValue = "false") boolean includeTimeline,
        Authentication authentication) {

        return ResponseEntity.ok(ApiResponse.success(orderService.getOrderStatus(id, authentication.getName(), includeTimeline)));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<OrderResponse>> cancel(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(orderService.cancelOrder(id, authentication.getName()));
    }
}
