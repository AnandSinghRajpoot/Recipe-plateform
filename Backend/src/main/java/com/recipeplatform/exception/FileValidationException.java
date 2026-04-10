package com.recipeplatform.exception;

import org.springframework.http.HttpStatus;

public class FileValidationException extends BaseException {
    public FileValidationException(String message) {
        super(message, HttpStatus.BAD_REQUEST, "FILE_VALIDATION_FAILED");
    }
}
