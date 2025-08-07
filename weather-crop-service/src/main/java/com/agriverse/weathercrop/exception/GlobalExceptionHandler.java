package com.agriverse.weathercrop.exception;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.context.request.WebRequest;

import java.time.LocalDateTime;
import java.util.*;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<?> handleResourceNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                "timestamp", LocalDateTime.now(),
                "message", ex.getMessage()
        ));
    }

    @ExceptionHandler(InvalidRequestException.class)
    public ResponseEntity<?> handleInvalidRequest(InvalidRequestException ex) {
        return ResponseEntity.badRequest().body(Map.of(
                "timestamp", LocalDateTime.now(),
                "message", ex.getMessage()
        ));
    }

  

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleGeneral(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "timestamp", LocalDateTime.now(),
                "message", "Internal server error"
        ));
    }
    
    @ExceptionHandler(org.springframework.web.client.HttpClientErrorException.class)
    public ResponseEntity<?> handleHttpClientError(org.springframework.web.client.HttpClientErrorException ex) {
        return ResponseEntity.status(ex.getStatusCode()).body(Map.of(
                "timestamp", java.time.LocalDateTime.now(),
                "message", "External API error: " + ex.getResponseBodyAsString()
        ));
    }

    @ExceptionHandler(org.springframework.web.client.HttpServerErrorException.class)
    public ResponseEntity<?> handleHttpServerError(org.springframework.web.client.HttpServerErrorException ex) {
        return ResponseEntity.status(ex.getStatusCode()).body(Map.of(
                "timestamp", java.time.LocalDateTime.now(),
                "message", "External API server error"
        ));
    }

}
