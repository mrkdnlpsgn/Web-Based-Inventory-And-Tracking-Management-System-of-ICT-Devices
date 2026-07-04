package com.sanjose.inventory.controller;

import com.sanjose.inventory.entity.AuditLog;
import com.sanjose.inventory.entity.AuditLogDigest;
import com.sanjose.inventory.exception.ResourceNotFoundException;
import com.sanjose.inventory.service.AuditLogDigestService;
import com.sanjose.inventory.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/audit-logs")
@RequiredArgsConstructor
public class AuditLogController {

    private final AuditLogService auditLogService;
    private final AuditLogDigestService auditLogDigestService;

    @GetMapping
    public List<AuditLog> getAll(@RequestParam(required = false) String search) {
        return auditLogService.findAll(search);
    }

    @GetMapping("/digest")
    public AuditLogDigest getLatestDigest() {
        return auditLogDigestService.getLatest()
            .orElseThrow(() -> new ResourceNotFoundException("No AI digest generated yet."));
    }

    @PostMapping("/digest")
    public ResponseEntity<AuditLogDigest> generateDigest() {
        return ResponseEntity.ok(auditLogDigestService.generate());
    }
}
