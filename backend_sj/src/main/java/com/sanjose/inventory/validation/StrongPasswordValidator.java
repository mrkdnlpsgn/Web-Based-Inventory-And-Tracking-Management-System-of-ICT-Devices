package com.sanjose.inventory.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.util.regex.Pattern;

public class StrongPasswordValidator implements ConstraintValidator<StrongPassword, String> {

    private static final Pattern UPPERCASE    = Pattern.compile("[A-Z]");
    private static final Pattern LOWERCASE    = Pattern.compile("[a-z]");
    private static final Pattern DIGIT        = Pattern.compile("[0-9]");
    private static final Pattern SPECIAL      = Pattern.compile("[@$!%*?&_#^\\-]");
    private static final int     MIN_LENGTH   = 8;
    private static final int     MAX_LENGTH   = 128;

    @Override
    public boolean isValid(String password, ConstraintValidatorContext context) {
        if (password == null || password.isBlank()) return true; // @NotBlank handles null/blank separately

        if (password.length() < MIN_LENGTH || password.length() > MAX_LENGTH) return false;
        if (!UPPERCASE.matcher(password).find()) return false;
        if (!LOWERCASE.matcher(password).find()) return false;
        if (!DIGIT.matcher(password).find())     return false;
        if (!SPECIAL.matcher(password).find())   return false;

        return true;
    }
}
