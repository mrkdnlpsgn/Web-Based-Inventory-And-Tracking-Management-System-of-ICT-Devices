package com.sanjose.inventory.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class DisposalLedgerRequest {
    private Long assetId;
    private String reason;
    private String inspectionFindings;
    private String recommendedMethod; // AUCTION | DESTRUCTION | DONATION | TRANSFER
    private String disposalStatus;    // PENDING | APPROVED | COMPLETED
    private LocalDate inspectionDate;
    private Long approvedById;
}
