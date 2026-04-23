package com.foodapp.service;

import java.math.BigDecimal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendRegistrationEmail(String to, String name) {
        sendEmail(
            to,
            "Welcome to FoodApp!",
            "Dear " + name + ",\n\nYour account has been created successfully.\n\nEnjoy ordering!\n\nTeam FoodApp");
    }

    public void sendOrderConfirmationEmail(String to, String name, Long orderId, BigDecimal total) {
        sendEmail(
            to,
            "Order Confirmed - #" + orderId,
            "Dear " + name + ",\n\nYour order #" + orderId + " has been placed successfully.\nTotal: "
                + total + "\n\nThank you for ordering!\n\nTeam FoodApp");
    }

    public void sendCancellationEmail(String to, String name, Long orderId) {
        sendEmail(
            to,
            "Order Cancelled - #" + orderId,
            "Dear " + name + ",\n\nYour order #" + orderId + " has been cancelled.\n\nTeam FoodApp");
    }

    private void sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("[Email] Sent to {} | {}", to, subject);
        } catch (Exception ex) {
            log.error("[Email] Failed to send to {}: {}", to, ex.getMessage());
        }
    }
}
