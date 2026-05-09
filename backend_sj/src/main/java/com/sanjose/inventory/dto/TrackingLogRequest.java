package com.sanjose.inventory.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record TrackingLogRequest(
    @NotNull @Positive Long equipmentId,
    @NotBlank @Size(max = 100) String action,
    @NotBlank @Size(max = 150) String performedBy,
    @Size(max = 150) String location,
    @Size(max = 500) String notes,
    @Size(max = 500) String serialNumbers
) {}
