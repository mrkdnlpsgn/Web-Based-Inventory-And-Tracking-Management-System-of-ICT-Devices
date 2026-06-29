package com.sanjose.inventory.controller;

import com.sanjose.inventory.dto.AssetHistoryRequest;
import com.sanjose.inventory.entity.AssetHistory;
import com.sanjose.inventory.service.AssetHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/asset-history")
@RequiredArgsConstructor
public class AssetHistoryController {

    private final AssetHistoryService assetHistoryService;

    @GetMapping
    public List<AssetHistory> getAll() { return assetHistoryService.findAll(); }

    @GetMapping("/asset/{assetId}")
    public List<AssetHistory> getByAsset(@PathVariable Long assetId) {
        return assetHistoryService.findByAsset(assetId);
    }

    @PostMapping
    public AssetHistory create(@RequestBody AssetHistoryRequest req) {
        return assetHistoryService.create(req);
    }
}
