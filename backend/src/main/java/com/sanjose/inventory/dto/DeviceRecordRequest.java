package com.sanjose.inventory.dto;

import java.math.BigDecimal;

public record DeviceRecordRequest(
    String model,
    String serialNumber,
    BigDecimal amountValue,
    String acquisitionDate
) {}
