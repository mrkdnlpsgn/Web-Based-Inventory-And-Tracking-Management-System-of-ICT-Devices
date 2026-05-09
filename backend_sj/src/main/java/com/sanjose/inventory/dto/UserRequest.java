package com.sanjose.inventory.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UserRequest(
    @NotBlank @Size(max = 150) String name,
    @Email @NotBlank @Size(max = 150) String email,
    @Size(min = 8, max = 128, message = "Password must be between 8 and 128 characters") String password,
    @NotBlank String role
) {}
