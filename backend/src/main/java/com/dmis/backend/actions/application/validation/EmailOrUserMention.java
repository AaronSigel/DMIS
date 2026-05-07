package com.dmis.backend.actions.application.validation;

import jakarta.mail.internet.AddressException;
import jakarta.mail.internet.InternetAddress;
import jakarta.validation.Constraint;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import jakarta.validation.Payload;

import java.lang.annotation.Documented;
import java.lang.annotation.Retention;
import java.lang.annotation.Target;

import static java.lang.annotation.ElementType.FIELD;
import static java.lang.annotation.ElementType.TYPE_USE;
import static java.lang.annotation.RetentionPolicy.RUNTIME;

/**
 * Корректный email или упоминание вида {@code @localPart}/{@code @полное имя} (до разрешения в backend).
 */
@Documented
@Constraint(validatedBy = EmailOrUserMention.ValidatorImpl.class)
@Target({ FIELD, TYPE_USE })
@Retention(RUNTIME)
public @interface EmailOrUserMention {
    String message() default "Укажите корректный email или @упоминание пользователя";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};

    class ValidatorImpl implements ConstraintValidator<EmailOrUserMention, String> {

        @Override
        public boolean isValid(String value, ConstraintValidatorContext context) {
            if (value == null || value.isBlank()) {
                return true;
            }
            String trimmed = value.trim();
            if (trimmed.startsWith("@")) {
                return trimmed.length() > 1 && !trimmed.substring(1).trim().isBlank();
            }
            try {
                InternetAddress addr = new InternetAddress(trimmed);
                addr.validate();
                return true;
            } catch (AddressException ignored) {
                return false;
            }
        }
    }
}
