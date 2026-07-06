package com.sanjose.inventory.controller;

import com.sanjose.inventory.dto.MaintenanceLedgerRequest;
import com.sanjose.inventory.entity.MaintenanceLedger;
import com.sanjose.inventory.service.MaintenanceLedgerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/maintenance")
@RequiredArgsConstructor
public class MaintenanceLedgerController {

    private final MaintenanceLedgerService maintenanceLedgerService;

    @GetMapping
    public List<MaintenanceLedger> getAll(@RequestParam(required = false) String search,
                                           @RequestParam(defaultValue = "0") int page,
                                           @RequestParam(defaultValue = "20") int size,
                                           @RequestParam(required = false) String maintenanceType,
                                           @RequestParam(required = false) String status) {
        return maintenanceLedgerService.findAll(search, page, size, maintenanceType, status);
    }

    @GetMapping("/{id}")
    public MaintenanceLedger getById(@PathVariable Long id) {
        return maintenanceLedgerService.findById(id);
    }

    @GetMapping("/asset/{assetId}")
    public List<MaintenanceLedger> getByAsset(@PathVariable Long assetId) {
        return maintenanceLedgerService.findByAsset(assetId);
    }

    @PostMapping
    public MaintenanceLedger create(@RequestBody MaintenanceLedgerRequest req) {
        return maintenanceLedgerService.create(req);
    }

    @PutMapping("/{id}")
    public MaintenanceLedger update(@PathVariable Long id, @RequestBody MaintenanceLedgerRequest req) {
        return maintenanceLedgerService.update(id, req);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id,
                                       @RequestBody(required = false) Map<String, String> body) {
        String reason = body != null ? body.get("deleteReason") : null;
        maintenanceLedgerService.delete(id, reason);
        return ResponseEntity.noContent().build();
    }
}
