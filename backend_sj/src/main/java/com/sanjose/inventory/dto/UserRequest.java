package com.sanjose.inventory.dto;

import lombok.Data;

@Data
public class UserRequest {
    private String username;
    private String fullName;
    private String role;    // ADMIN or STAFF
    private Long officeId;
    private Boolean isActive;
    private String password; // used only on create; if null on update, keep existing
}
