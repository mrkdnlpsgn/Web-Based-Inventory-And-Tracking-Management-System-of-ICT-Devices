package com.sanjose.inventory.controller;

import com.sanjose.inventory.dto.DeviceRecordRequest;
import com.sanjose.inventory.dto.EquipmentRecordRequest;
import com.sanjose.inventory.entity.DeviceRecord;
import com.sanjose.inventory.entity.EquipmentRecord;
import com.sanjose.inventory.service.EquipmentRecordService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/equipment")
@RequiredArgsConstructor
public class EquipmentRecordController {

    private final EquipmentRecordService service;

    // ── Equipment endpoints ───────────────────────────────────────────────────

    @GetMapping
    public List<EquipmentRecord> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public EquipmentRecord getById(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    public ResponseEntity<EquipmentRecord> create(@Valid @RequestBody EquipmentRecordRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }

    @PutMapping("/{id}")
    public EquipmentRecord update(@PathVariable Long id, @Valid @RequestBody EquipmentRecordRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ── Device endpoints ──────────────────────────────────────────────────────

    @PostMapping("/{id}/devices")
    public ResponseEntity<DeviceRecord> addDevice(
            @PathVariable Long id,
            @RequestBody DeviceRecordRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.addDevice(id, request));
    }

    @PutMapping("/{id}/devices/{deviceId}")
    public DeviceRecord updateDevice(
            @PathVariable Long id,
            @PathVariable Long deviceId,
            @RequestBody DeviceRecordRequest request) {
        return service.updateDevice(id, deviceId, request);
    }

    @DeleteMapping("/{id}/devices/{deviceId}")
    public ResponseEntity<Void> deleteDevice(
            @PathVariable Long id,
            @PathVariable Long deviceId) {
        service.deleteDevice(id, deviceId);
        return ResponseEntity.noContent().build();
    }
}
