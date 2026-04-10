package com.recipeplatform.exception;

import org.springframework.http.HttpStatus;

public class UserAlreadyExistException extends BaseException {
    public UserAlreadyExistException(String message) {
        super(message, HttpStatus.BAD_REQUEST, "USER_ALREADY_EXISTS");
    }
}
