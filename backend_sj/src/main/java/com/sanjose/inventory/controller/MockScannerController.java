package com.sanjose.inventory.controller;

import com.sanjose.inventory.dto.ScannerPayload;
import com.sanjose.inventory.dto.ScannerResponse;
import com.sanjose.inventory.service.MockScannerIntegrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/scanner")
@RequiredArgsConstructor
public class MockScannerController {

    private final MockScannerIntegrationService service;

    /**
     * Endpoint that a physical scanner device would POST to.
     * For the demo, the frontend or Postman simulates the hardware call.
     */
    @PostMapping("/receive")
    public ResponseEntity<ScannerResponse> receive(@RequestBody ScannerPayload payload) {
        ScannerResponse response = service.processScan(payload);
        int httpStatus = switch (response.status()) {
            case "OK"        -> 200;
            case "NOT_FOUND" -> 404;
            default          -> 400;
        };
        return ResponseEntity.status(httpStatus).body(response);
    }
}
