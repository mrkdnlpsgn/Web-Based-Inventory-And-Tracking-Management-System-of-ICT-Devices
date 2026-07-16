package com.sanjose.inventory.dto;

import jakarta.validation.constraints.NotBlank;

// Step 1: request an OTP be emailed to the account's registered address.
public record ForgotPasswordRequest(
    @NotBlank String username
) {}
