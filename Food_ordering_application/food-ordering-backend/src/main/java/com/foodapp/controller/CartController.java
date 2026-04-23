package com.foodapp.controller;

import com.foodapp.dto.request.AddCartItemRequest;
import com.foodapp.dto.request.MergeCartRequest;
import com.foodapp.dto.request.UpdateCartItemRequest;
import com.foodapp.dto.response.ApiResponse;
import com.foodapp.dto.response.CartResponse;
import com.foodapp.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @PostMapping("/items")
    public ResponseEntity<ApiResponse<CartResponse>> addItem(
        @Valid @RequestBody AddCartItemRequest request,
        Authentication authentication) {

        return ResponseEntity.status(201)
            .body(ApiResponse.success(cartService.addItem(authentication.getName(), request)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<CartResponse>> getCart(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(cartService.getCart(authentication.getName())));
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<ApiResponse<CartResponse>> updateQuantity(
        @PathVariable Long itemId,
        @Valid @RequestBody UpdateCartItemRequest request,
        Authentication authentication) {

        return ResponseEntity.ok(ApiResponse.success(cartService.updateQuantity(authentication.getName(), itemId, request)));
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<ApiResponse<CartResponse>> removeItem(
        @PathVariable Long itemId,
        Authentication authentication) {

        return ResponseEntity.ok(ApiResponse.success(cartService.removeItem(authentication.getName(), itemId)));
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> clearCart(Authentication authentication) {
        cartService.clearCart(authentication.getName());
        return ResponseEntity.ok(new ApiResponse<>(true, "Cart cleared", null));
    }

    @PostMapping("/merge")
    public ResponseEntity<ApiResponse<CartResponse>> mergeGuestCart(
        @Valid @RequestBody MergeCartRequest request,
        Authentication authentication) {

        return ResponseEntity.ok(ApiResponse.success(cartService.mergeGuestCart(authentication.getName(), request)));
    }

    @PostMapping("/populate-favorite/{favoriteId}")
    public ResponseEntity<ApiResponse<CartResponse>> populateFromFavorite(
        @PathVariable Long favoriteId,
        Authentication authentication) {

        return ResponseEntity.ok(ApiResponse.success(cartService.populateFromFavorite(authentication.getName(), favoriteId)));
    }
}
