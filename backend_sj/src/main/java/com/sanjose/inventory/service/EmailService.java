package com.sanjose.inventory.service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${mail.from:}")
    private String from;

    @Value("${mail.from-name:SJMH ICT Inventory System}")
    private String fromName;

    @Value("${notifications.enabled:false}")
    private boolean notificationsEnabled;

    @Async
    public void send(String to, String subject, String htmlBody) {
        if (!notificationsEnabled) {
            log.debug("Email notifications disabled (notifications.enabled=false) — skipping.");
            return;
        }
        if (from == null || from.isBlank()) {
            log.warn("Gmail not configured (mail.from is empty) — email not sent.");
            return;
        }
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(from, fromName);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
            log.info("Email sent to {}", to);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }
}
