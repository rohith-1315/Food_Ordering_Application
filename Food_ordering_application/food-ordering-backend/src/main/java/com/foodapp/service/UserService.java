package com.foodapp.service;

import com.foodapp.dto.response.AuthResponse;
import com.foodapp.exception.UnauthorizedException;
import com.foodapp.model.User;
import com.foodapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public AuthResponse getCurrentUser(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new UnauthorizedException("User not found"));

        return new AuthResponse(null, user.getName(), user.getEmail());
    }
}
