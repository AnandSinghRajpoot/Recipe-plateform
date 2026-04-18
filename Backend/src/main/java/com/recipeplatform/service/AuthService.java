package com.recipeplatform.service;

import com.recipeplatform.domain.User;
import com.recipeplatform.dto.auth.LoginRequest;
import com.recipeplatform.dto.auth.LoginResponse;
import com.recipeplatform.dto.auth.RegisterRequest;

import org.springframework.web.multipart.MultipartFile;

public interface AuthService {

    LoginResponse login(LoginRequest loginRequest);

    User register(RegisterRequest registerRequest, MultipartFile profilePhoto);

    String completeProfile(com.recipeplatform.dto.auth.ProfileCompletionRequest request);

    String updateProfilePhoto(MultipartFile profilePhoto);

    String updateProfile(com.recipeplatform.dto.auth.UserProfileUpdateRequest request);

    User getUserById(Long id);
}
