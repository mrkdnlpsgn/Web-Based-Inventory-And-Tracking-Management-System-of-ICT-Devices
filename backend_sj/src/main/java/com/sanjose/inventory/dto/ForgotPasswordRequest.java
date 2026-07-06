package com.sanjose.inventory.dto;

import com.sanjose.inventory.validation.StrongPassword;
import jakarta.validation.constraints.NotBlank;

public record ForgotPasswordRequest(
    @NotBlank String username,
    @NotBlank @StrongPassword String newPassword
) {}
