package com.sanjose.inventory.service;

import com.sanjose.inventory.entity.AuditLog;
import com.sanjose.inventory.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository repo;

    public void log(String action, String module, String description) {
        String performedBy = "System";
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
                performedBy = auth.getName();
            }
        } catch (Exception ignored) {}

        repo.save(AuditLog.builder()
                .action(action)
                .module(module)
                .description(description)
                .performedBy(performedBy)
                .build());
    }

    public List<AuditLog> findAll() {
        return repo.findAllByOrderByCreatedAtDesc();
    }
}
