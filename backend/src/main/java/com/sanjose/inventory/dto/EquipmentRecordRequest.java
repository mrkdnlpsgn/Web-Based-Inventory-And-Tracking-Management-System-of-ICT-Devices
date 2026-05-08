package com.sanjose.inventory.dto;

import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;

public record EquipmentRecordRequest(
    String type,
    String equipmentType,
    @NotBlank String itemCode,
    @NotBlank String article,
    String model,
    String serialNumber,
    BigDecimal amountValue,
    String acquisitionDate,
    String office,
    String location,
    String description,
    String accountablePerson,
    Integer deviceCount
) {}
