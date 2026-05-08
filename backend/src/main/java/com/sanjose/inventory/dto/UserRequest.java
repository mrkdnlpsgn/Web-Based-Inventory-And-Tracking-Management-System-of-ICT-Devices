package com.sanjose.inventory.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record UserRequest(
    @NotBlank String name,
    @Email @NotBlank String email,
    String password,
    @NotBlank String role
) {}
