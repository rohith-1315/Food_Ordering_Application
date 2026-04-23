package com.foodapp.service;

import com.foodapp.exception.ValidationException;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HashMap;
import java.util.HexFormat;
import java.util.Map;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class PaymentService {

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    public Map<String, Object> createRazorpayOrder(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new ValidationException("Amount must be greater than zero");
        }

        if (keyId == null || keyId.isBlank() || keySecret == null || keySecret.isBlank()
            || keyId.contains("XXXXXXXXXXXXXXXX") || "your_razorpay_secret".equals(keySecret)) {
            throw new ValidationException("Razorpay keys are not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET");
        }

        try {
            RazorpayClient client = new RazorpayClient(keyId, keySecret);

            JSONObject options = new JSONObject();
            options.put("amount", amount.multiply(new BigDecimal("100")).intValue());
            options.put("currency", "INR");
            options.put("receipt", "receipt_" + System.currentTimeMillis());

            Order order = client.orders.create(options);
            String razorpayOrderId = String.valueOf(order.get("id"));

            Map<String, Object> response = new HashMap<>();
            response.put("razorpayOrderId", razorpayOrderId);
            response.put("amount", amount);
            response.put("currency", "INR");
            response.put("keyId", keyId);

            log.info("[Payment] Razorpay order created: {}", razorpayOrderId);
            return response;
        } catch (RazorpayException ex) {
            log.error("[Payment] Razorpay order creation failed: {}", ex.getMessage());
            throw new ValidationException("Payment initiation failed. Check Razorpay API keys and account status");
        }
    }

    public boolean verifyPayment(String razorpayOrderId, String razorpayPaymentId, String razorpaySignature) {
        try {
            String data = razorpayOrderId + "|" + razorpayPaymentId;
            String generatedSignature = generateHmacSha256(data, keySecret);
            boolean valid = MessageDigest.isEqual(
                generatedSignature.getBytes(StandardCharsets.UTF_8),
                razorpaySignature.getBytes(StandardCharsets.UTF_8));

            log.info("[Payment] Signature verification: {}", valid ? "PASSED" : "FAILED");
            return valid;
        } catch (Exception ex) {
            log.error("[Payment] Signature verification error: {}", ex.getMessage());
            return false;
        }
    }

    private String generateHmacSha256(String payload, String secret) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKey = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        mac.init(secretKey);
        byte[] hash = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
        return HexFormat.of().formatHex(hash);
    }
}