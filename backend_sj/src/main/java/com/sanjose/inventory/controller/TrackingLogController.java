package com.sanjose.inventory.controller;

import com.sanjose.inventory.dto.TrackingLogRequest;
import com.sanjose.inventory.dto.TrackingLogResponse;
import com.sanjose.inventory.service.TrackingLogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/tracking")
@RequiredArgsConstructor
public class TrackingLogController {

    private final TrackingLogService service;

    @GetMapping
    public List<TrackingLogResponse> getAll() {
        return service.findAll();
    }

    @GetMapping("/equipment/{equipmentId}")
    public List<TrackingLogResponse> getByEquipment(@PathVariable Long equipmentId) {
        return service.findByEquipmentId(equipmentId);
    }

    @PostMapping
    public ResponseEntity<TrackingLogResponse> create(@Valid @RequestBody TrackingLogRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }
}
