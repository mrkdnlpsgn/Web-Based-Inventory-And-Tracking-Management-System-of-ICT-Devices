package com.sanjose.inventory.controller;

import com.sanjose.inventory.dto.DeviceRequest;
import com.sanjose.inventory.dto.EquipmentRequest;
import com.sanjose.inventory.entity.DeviceRecord;
import com.sanjose.inventory.entity.EquipmentRecord;
import com.sanjose.inventory.service.EquipmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/equipment")
@RequiredArgsConstructor
public class EquipmentController {

    private final EquipmentService equipmentService;

    @GetMapping
    public List<EquipmentRecord> getAll() {
        return equipmentService.findAll();
    }

    @GetMapping("/{id}")
    public EquipmentRecord getById(@PathVariable Long id) {
        return equipmentService.findById(id);
    }

    @PostMapping
    public EquipmentRecord create(@RequestBody EquipmentRequest req) {
        return equipmentService.create(req);
    }

    @PutMapping("/{id}")
    public EquipmentRecord update(@PathVariable Long id, @RequestBody EquipmentRequest req) {
        return equipmentService.update(id, req);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        equipmentService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ── Devices ──────────────────────────────────────────────────────────────

    @PostMapping("/{equipmentId}/devices")
    public DeviceRecord addDevice(@PathVariable Long equipmentId,
                                  @RequestBody DeviceRequest req) {
        return equipmentService.addDevice(equipmentId, req);
    }

    @PutMapping("/{equipmentId}/devices/{deviceId}")
    public DeviceRecord updateDevice(@PathVariable Long equipmentId,
                                     @PathVariable Long deviceId,
                                     @RequestBody DeviceRequest req) {
        return equipmentService.updateDevice(equipmentId, deviceId, req);
    }

    @DeleteMapping("/{equipmentId}/devices/{deviceId}")
    public ResponseEntity<Void> deleteDevice(@PathVariable Long equipmentId,
                                             @PathVariable Long deviceId) {
        equipmentService.deleteDevice(equipmentId, deviceId);
        return ResponseEntity.noContent().build();
    }
}
