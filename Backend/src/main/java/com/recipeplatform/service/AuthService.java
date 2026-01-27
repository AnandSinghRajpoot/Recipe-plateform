package com.recipeplatform.service;


import com.recipeplatform.domain.User;
import com.recipeplatform.dto.auth.LoginRequest;
import com.recipeplatform.dto.auth.LoginResponse;
import com.recipeplatform.dto.auth.RegisterRequest;

public interface AuthService {

    LoginResponse login(LoginRequest loginRequest);

    User register(RegisterRequest registerRequest);
    String reminderDismissed();
}
