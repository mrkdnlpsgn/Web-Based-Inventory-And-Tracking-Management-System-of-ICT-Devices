package com.sanjose.inventory.dto;

import com.sanjose.inventory.validation.StrongPassword;
import jakarta.validation.constraints.NotBlank;

public record ResetPasswordRequest(
    @NotBlank @StrongPassword String newPassword
) {}
