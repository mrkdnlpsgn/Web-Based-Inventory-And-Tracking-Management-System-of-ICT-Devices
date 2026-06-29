package com.sanjose.inventory.controller;

import com.sanjose.inventory.entity.AuditLog;
import com.sanjose.inventory.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/audit-logs")
@RequiredArgsConstructor
public class AuditLogController {

    private final AuditLogService auditLogService;

    @GetMapping
    public List<AuditLog> getAll(@RequestParam(required = false) String search) {
        return auditLogService.findAll(search);
    }
}
