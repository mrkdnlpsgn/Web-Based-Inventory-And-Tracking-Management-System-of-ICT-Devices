package com.sanjose.inventory.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Documented
@Constraint(validatedBy = StrongPasswordValidator.class)
@Target({ ElementType.FIELD, ElementType.PARAMETER })
@Retention(RetentionPolicy.RUNTIME)
public @interface StrongPassword {

    String message() default
        "Password must be 8–128 characters and include at least one uppercase letter, " +
        "one lowercase letter, one digit, and one special character (@$!%*?&_#^-).";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
