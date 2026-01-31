package com.recipeplatform.exception;

public class NotAllowedOperation extends RuntimeException {
    public NotAllowedOperation(String message) {
        super(message);
    }
}
