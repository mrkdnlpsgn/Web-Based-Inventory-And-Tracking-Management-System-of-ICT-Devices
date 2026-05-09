package com.sanjose.inventory.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;

public record TrackingLogResponse(
    Long id,
    Long equipmentId,
    String article,
    String itemCode,
    String equipmentType,
    String office,
    String action,
    String performedBy,
    String location,
    String notes,
    String serialNumbers,
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    LocalDateTime createdAt
) {}
