package com.sanjose.inventory.dto;

public record TrackingLogRequest(
    Long equipmentId,
    String action,
    String performedBy,
    String location,
    String notes
) {}
