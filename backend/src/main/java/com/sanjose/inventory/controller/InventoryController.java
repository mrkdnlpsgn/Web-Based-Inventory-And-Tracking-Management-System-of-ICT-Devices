package com.sanjose.inventory.controller;

import com.sanjose.inventory.entity.InventoryItem;
import com.sanjose.inventory.service.InventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping
    public List<InventoryItem> getAll() {
        return inventoryService.findAll();
    }

    @GetMapping("/low-stock")
    public List<InventoryItem> getLowStock() {
        return inventoryService.findLowStockItems();
    }

    @GetMapping("/product/{productId}")
    public InventoryItem getByProduct(@PathVariable Long productId) {
        return inventoryService.findByProductId(productId);
    }

    @PostMapping("/product/{productId}")
    public ResponseEntity<InventoryItem> create(
            @PathVariable Long productId,
            @Valid @RequestBody InventoryItem item) {
        return ResponseEntity.status(HttpStatus.CREATED).body(inventoryService.create(productId, item));
    }

    @PutMapping("/product/{productId}")
    public InventoryItem update(
            @PathVariable Long productId,
            @Valid @RequestBody InventoryItem item) {
        return inventoryService.update(productId, item);
    }
}
