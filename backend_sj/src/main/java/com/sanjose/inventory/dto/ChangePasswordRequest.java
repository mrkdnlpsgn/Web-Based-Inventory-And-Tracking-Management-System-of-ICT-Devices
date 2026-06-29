package com.sanjose.inventory.dto;

import com.sanjose.inventory.validation.StrongPassword;
import jakarta.validation.constraints.NotBlank;

public record ChangePasswordRequest(
    @NotBlank String currentPassword,
    @NotBlank @StrongPassword String newPassword
) {}
