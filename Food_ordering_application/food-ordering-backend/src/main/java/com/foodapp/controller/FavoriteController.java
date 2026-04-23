package com.foodapp.controller;

import com.foodapp.dto.request.FavoriteCreateRequest;
import com.foodapp.dto.response.ApiResponse;
import com.foodapp.dto.response.FavoriteResponse;
import com.foodapp.service.FavoriteService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteService favoriteService;

    @PostMapping
    public ResponseEntity<ApiResponse<FavoriteResponse>> save(
        @Valid @RequestBody FavoriteCreateRequest request,
        Authentication authentication) {

        return ResponseEntity.status(201)
            .body(ApiResponse.success(favoriteService.saveFavorite(authentication.getName(), request)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<FavoriteResponse>>> list(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(favoriteService.getMyFavorites(authentication.getName())));
    }
}
