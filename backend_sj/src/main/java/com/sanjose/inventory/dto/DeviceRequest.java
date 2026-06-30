package com.sanjose.inventory.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class DeviceRequest {
    private String itemCode;
    private String serialNumber;
    private String model;
    private BigDecimal amountValue;
    private LocalDate acquisitionDate;
}
