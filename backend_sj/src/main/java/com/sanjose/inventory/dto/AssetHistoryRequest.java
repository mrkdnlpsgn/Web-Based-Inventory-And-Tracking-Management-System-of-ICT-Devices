package com.sanjose.inventory.dto;

import lombok.Data;

@Data
public class AssetHistoryRequest {
    private Long assetId;
    private String eventType; // REGISTERED | ASSIGNED | TRANSFERRED | MAINTENANCE | DISPOSAL | ARCHIVED
    private Long fromOfficeId;
    private Long toOfficeId;
    private Long performedById;
    private String notes;
}
