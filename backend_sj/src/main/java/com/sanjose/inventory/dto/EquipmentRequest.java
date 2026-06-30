package com.sanjose.inventory.dto;

import lombok.Data;

@Data
public class EquipmentRequest {
    private String type;
    private String equipmentType;
    private String itemCode;
    private String article;
    private String office;
    private String location;
    private String description;
    private String accountablePerson;
    private String accountablePersonPhone;
    private String accountablePersonEmail;
    private Integer deviceCount;
}
