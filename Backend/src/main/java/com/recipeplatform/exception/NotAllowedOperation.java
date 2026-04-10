package com.recipeplatform.exception;

import org.springframework.http.HttpStatus;

public class NotAllowedOperation extends BaseException {
    public NotAllowedOperation(String message) {
        super(message, HttpStatus.FORBIDDEN, "OPERATION_NOT_ALLOWED");
    }
}
