package com.sanjose.inventory.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class MaintenanceLedgerRequest {
    private Long assetId;
    private String maintenanceType; // PREVENTIVE | CORRECTIVE | REPAIR
    private String findings;
    private String actionsTaken;
    private Long assignedToId;
    private LocalDate maintenanceDate;
    private BigDecimal cost;
    private String status; // COMPLETED | ONGOING | SCHEDULED
}
