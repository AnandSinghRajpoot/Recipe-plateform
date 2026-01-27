package com.recipeplatform.service.impl;

import com.recipeplatform.dto.LoginRequest;
import com.recipeplatform.dto.LoginResponse;
import com.recipeplatform.dto.RegisterRequest;
import com.recipeplatform.security.JwtUtill;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
public class AuthService {

    private final JwtUtill jwtUtill;

    public AuthService(JwtUtill jwtUtill) {
        this.jwtUtill = jwtUtill;
    }

    public LoginResponse login(LoginRequest loginRequest) {
        //TO Do:authenticate cred

        Authentication authToken = new UsernamePasswordAuthenticationToken(
                loginRequest.getEmail(), loginRequest.getPassword()
        );

        SecurityContextHolder.getContext().setAuthentication(authToken);

        String accessToken = jwtUtill.generateToken(authToken.getName());
        return new LoginResponse(
                accessToken
                , jwtUtill.extractClaims(accessToken).getIssuedAt().getTime()
                , jwtUtill.extractClaims(accessToken).getExpiration().getTime()
        );
    }

    public RegisterResponse register(RegisterRequest registerRequest) {

    }


}
