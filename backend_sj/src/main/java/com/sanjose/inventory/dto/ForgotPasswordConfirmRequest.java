package com.sanjose.inventory.dto;

import com.sanjose.inventory.validation.StrongPassword;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

// Step 2: prove receipt of the emailed OTP and set a new password in one call.
public record ForgotPasswordConfirmRequest(
    @NotBlank String username,
    @NotBlank @Pattern(regexp = "\\d{6}", message = "Code must be 6 digits") String otp,
    @NotBlank @StrongPassword String newPassword
) {}
