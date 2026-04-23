package com.foodapp.controller;

import com.foodapp.dto.request.AddressRequest;
import com.foodapp.dto.response.AddressResponse;
import com.foodapp.dto.response.ApiResponse;
import com.foodapp.service.AddressService;
import jakarta.validation.Valid;
import java.util.List;
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
@RequestMapping("/api/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;

    @PostMapping
    public ResponseEntity<ApiResponse<AddressResponse>> create(
        @Valid @RequestBody AddressRequest request,
        Authentication authentication) {

        return ResponseEntity.status(201)
            .body(ApiResponse.success(addressService.createAddress(authentication.getName(), request)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AddressResponse>>> list(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(addressService.getMyAddresses(authentication.getName())));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AddressResponse>> update(
        @PathVariable Long id,
        @Valid @RequestBody AddressRequest request,
        Authentication authentication) {

        return ResponseEntity.ok(ApiResponse.success(addressService.updateAddress(authentication.getName(), id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
        @PathVariable Long id,
        Authentication authentication) {

        addressService.deleteAddress(authentication.getName(), id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Address deleted", null));
    }

    @PutMapping("/{id}/set-default")
    public ResponseEntity<ApiResponse<AddressResponse>> setDefault(
        @PathVariable Long id,
        Authentication authentication) {

        return ResponseEntity.ok(ApiResponse.success(addressService.setDefaultAddress(authentication.getName(), id)));
    }
}
