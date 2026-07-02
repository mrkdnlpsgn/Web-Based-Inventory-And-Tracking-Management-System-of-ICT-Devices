package com.sanjose.inventory.controller;

import com.sanjose.inventory.dto.AssetRequest;
import com.sanjose.inventory.entity.Asset;
import com.sanjose.inventory.service.AssetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/assets")
@RequiredArgsConstructor
public class AssetController {

    private final AssetService assetService;

    @GetMapping
    public List<Asset> getAll(@RequestParam(required = false) String search,
                               @RequestParam(defaultValue = "0") int page,
                               @RequestParam(defaultValue = "20") int size) {
        return assetService.findAll(search, page, size);
    }

    @GetMapping("/{id}")
    public Asset getById(@PathVariable Long id) { return assetService.findById(id); }

    @PostMapping
    public Asset create(@RequestBody AssetRequest req) { return assetService.create(req); }

    @PutMapping("/{id}")
    public Asset update(@PathVariable Long id, @RequestBody AssetRequest req) {
        return assetService.update(id, req);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id,
                                       @RequestBody(required = false) Map<String, String> body) {
        String reason = body != null ? body.get("deleteReason") : null;
        assetService.delete(id, reason);
        return ResponseEntity.noContent().build();
    }
}
