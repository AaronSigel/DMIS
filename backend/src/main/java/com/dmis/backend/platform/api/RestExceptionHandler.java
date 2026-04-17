package com.dmis.backend.platform.api;

import com.dmis.backend.platform.error.ApiException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestControllerAdvice
public class RestExceptionHandler {
    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ErrorResponse> handleApiException(ApiException exception) {
        return ResponseEntity.status(exception.status())
                .body(new ErrorResponse(exception.errorCode(), exception.getMessage(), exception.details()));
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ErrorResponse> handleStatus(ResponseStatusException exception) {
        return ResponseEntity.status(exception.getStatusCode())
                .body(new ErrorResponse("REQUEST_ERROR", exception.getReason(), Map.of()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException exception) {
        return ResponseEntity.badRequest()
                .body(new ErrorResponse("VALIDATION_FAILED", "Validation failed", Map.of()));
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ErrorResponse> handleMaxUploadSize(MaxUploadSizeExceededException exception) {
        return ResponseEntity.status(413)
                .body(new ErrorResponse("FILE_TOO_LARGE", "File size exceeds upload limit", Map.of()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleUnknown(Exception exception) {
        return ResponseEntity.status(500)
                .body(new ErrorResponse("INTERNAL_ERROR", "Unexpected server error", Map.of()));
    }

    public record ErrorResponse(
            String errorCode,
            String message,
            Map<String, Object> details
    ) {
    }
}
