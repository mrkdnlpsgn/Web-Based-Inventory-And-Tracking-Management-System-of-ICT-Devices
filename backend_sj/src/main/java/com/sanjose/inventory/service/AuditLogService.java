package com.sanjose.inventory.service;

import com.sanjose.inventory.entity.AuditLog;
import com.sanjose.inventory.entity.User;
import com.sanjose.inventory.repository.AuditLogRepository;
import com.sanjose.inventory.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    public void log(String action, String module, Long targetId, String targetType, String details) {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            User user = userRepository.findByUsernameIgnoreCase(username).orElse(null);
            if (user == null) return;
            AuditLog entry = AuditLog.builder()
                    .user(user)
                    .action(action)
                    .module(module)
                    .targetId(targetId)
                    .targetType(targetType)
                    .details(details)
                    .build();
            auditLogRepository.save(entry);
        } catch (Exception e) {
            log.warn("Audit log failed: {}", e.getMessage());
        }
    }

    public List<AuditLog> findAll() {
        return auditLogRepository.findAllByOrderByLoggedAtDesc();
    }
}
