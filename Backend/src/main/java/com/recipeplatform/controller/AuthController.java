package com.recipeplatform.controller;

import com.recipeplatform.domain.User;
import com.recipeplatform.dto.auth.LoginRequest;
import com.recipeplatform.dto.auth.LoginResponse;
import com.recipeplatform.dto.auth.RegisterRequest;
import com.recipeplatform.dto.auth.RegisterResponse;
import com.recipeplatform.mapper.UserMapper;
import com.recipeplatform.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(path = "api/v1/auth")
public class AuthController {
    public AuthController(AuthService authService, UserMapper userMapper) {
        this.authService = authService;
        this.userMapper = userMapper;
    }

    private final AuthService authService;
    private final UserMapper userMapper;

    @PostMapping("/login")
    public LoginResponse login(@RequestBody @Valid LoginRequest loginRequest){
        return  authService.login(loginRequest);
    }

    @PostMapping("/register")
    public RegisterResponse register(@RequestBody @Valid RegisterRequest registerRequest){
        User registeredUser=authService.register(registerRequest);
        return userMapper.toDto(registeredUser);
    }

    @GetMapping("/test")
    public String test(){
        return "the endpoint is public and you accessed it by giving token.";
    }


    @PostMapping("/reminder-dismiss")
    public String reminderDismiss(){
        return authService.reminderDismissed();
    }



}
