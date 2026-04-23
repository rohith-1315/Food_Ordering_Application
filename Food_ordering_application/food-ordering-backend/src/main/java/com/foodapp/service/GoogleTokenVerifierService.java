package com.foodapp.service;

import com.foodapp.exception.UnauthorizedException;
import com.foodapp.exception.ValidationException;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Service
@Slf4j
public class GoogleTokenVerifierService {

    private final RestClient restClient = RestClient.builder()
        .baseUrl("https://oauth2.googleapis.com")
        .build();

    @Value("${app.google.client-id:}")
    private String googleClientId;

    public GoogleUserProfile verify(String idToken) {
        if (!StringUtils.hasText(googleClientId)) {
            throw new ValidationException("Google OAuth is not configured on server");
        }

        if (!StringUtils.hasText(idToken)) {
            throw new ValidationException("Google id token is required");
        }

        Map<String, Object> tokenInfo;
        try {
            tokenInfo = restClient.get()
                .uri(uriBuilder -> uriBuilder.path("/tokeninfo").queryParam("id_token", idToken).build())
                .retrieve()
                .body(new ParameterizedTypeReference<Map<String, Object>>() {
                });
        } catch (RestClientException ex) {
            log.warn("[Google OAuth] Token verification call failed: {}", ex.getMessage());
            throw new UnauthorizedException("Invalid Google token");
        }

        if (tokenInfo == null || tokenInfo.isEmpty()) {
            throw new UnauthorizedException("Invalid Google token");
        }

        String audience = asString(tokenInfo.get("aud"));
        String issuer = asString(tokenInfo.get("iss"));
        String email = asString(tokenInfo.get("email"));
        String name = asString(tokenInfo.get("name"));
        String emailVerified = asString(tokenInfo.get("email_verified"));

        if (!googleClientId.equals(audience)) {
            throw new UnauthorizedException("Google token audience mismatch");
        }

        if (!"accounts.google.com".equals(issuer) && !"https://accounts.google.com".equals(issuer)) {
            throw new UnauthorizedException("Invalid Google token issuer");
        }

        if (!"true".equalsIgnoreCase(emailVerified)) {
            throw new UnauthorizedException("Google email is not verified");
        }

        if (!StringUtils.hasText(email)) {
            throw new UnauthorizedException("Google account email not found");
        }

        int atIndex = email.indexOf('@');
        String fallbackName = atIndex > 0 ? email.substring(0, atIndex) : email;
        String resolvedName = StringUtils.hasText(name) ? name : fallbackName;
        return new GoogleUserProfile(email, resolvedName);
    }

    private String asString(Object value) {
        return value == null ? "" : String.valueOf(value);
    }

    public record GoogleUserProfile(String email, String name) {
    }
}
