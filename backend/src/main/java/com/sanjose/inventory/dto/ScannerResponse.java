package com.sanjose.inventory.dto;

public record ScannerResponse(
    String status,      // "OK" | "NOT_FOUND" | "INVALID"
    String message,
    Object equipment    // the matched EquipmentRecord, or null
) {}
