package com.sanjose.inventory.dto;

public record ScannerPayload(
    String deviceId,    // simulated hardware device ID
    String rawCode,     // the scanned code string
    String scannerMode  // "QR" | "BARCODE"
) {}
