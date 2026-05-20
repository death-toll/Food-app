package com.example.FoodApplication.Exception;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.Map;

@Data
@Builder
public class ApiError {
    // Server-side timestamp when the error payload was generated.
    private Instant timestamp;
    // HTTP status code (e.g. 400, 401, 404).
    private int status;
    // HTTP reason phrase (e.g. "Bad Request", "Unauthorized").
    private String error;
    // Human-readable message safe to show to clients.
    private String message;
    // Request path that caused the error (useful for debugging on frontend).
    private String path;
    // Optional validation errors: { fieldName -> validationMessage }.
    private Map<String, String> validationErrors;
}

