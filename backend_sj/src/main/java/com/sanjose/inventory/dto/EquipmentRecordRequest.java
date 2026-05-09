package com.sanjose.inventory.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record EquipmentRecordRequest(
    @Size(max = 100) String type,
    @Size(max = 100) String equipmentType,
    @NotBlank @Size(max = 100) String itemCode,
    @NotBlank @Size(max = 255) String article,
    @Size(max = 150) String office,
    @Size(max = 150) String location,
    @Size(max = 1000) String description,
    @Size(max = 150) String accountablePerson,
    Integer deviceCount
) {}
