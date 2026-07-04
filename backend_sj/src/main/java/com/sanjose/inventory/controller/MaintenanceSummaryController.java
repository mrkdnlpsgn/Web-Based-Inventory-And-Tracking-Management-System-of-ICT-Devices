package com.sanjose.inventory.controller;

import com.sanjose.inventory.entity.MaintenanceSummary;
import com.sanjose.inventory.exception.ResourceNotFoundException;
import com.sanjose.inventory.service.MaintenanceSummaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/maintenance/{maintenanceId}/summary")
@RequiredArgsConstructor
public class MaintenanceSummaryController {

    private final MaintenanceSummaryService maintenanceSummaryService;

    @GetMapping
    public MaintenanceSummary getLatest(@PathVariable Long maintenanceId) {
        return maintenanceSummaryService.getLatest(maintenanceId)
            .orElseThrow(() -> new ResourceNotFoundException(
                "No AI summary generated yet for maintenance record: " + maintenanceId));
    }

    @PostMapping
    public ResponseEntity<MaintenanceSummary> generate(@PathVariable Long maintenanceId) {
        return ResponseEntity.ok(maintenanceSummaryService.generate(maintenanceId));
    }
}
