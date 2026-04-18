package com.recipeplatform.controller;

import com.recipeplatform.domain.User;
import com.recipeplatform.dto.auth.LoginRequest;
import com.recipeplatform.dto.auth.LoginResponse;
import com.recipeplatform.dto.auth.RegisterRequest;
import com.recipeplatform.dto.auth.RegisterResponse;
import com.recipeplatform.mapper.UserMapper;
import com.recipeplatform.service.AuthService;
import com.recipeplatform.service.PasswordResetService;
import com.recipeplatform.util.CurrentUser;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(path = "api/v1/auth")
public class AuthController {
    public AuthController(AuthService authService, UserMapper userMapper, CurrentUser currentUser, PasswordResetService passwordResetService) {
        this.authService = authService;
        this.userMapper = userMapper;
        this.currentUser = currentUser;
        this.passwordResetService = passwordResetService;
    }

    private final AuthService authService;
    private final UserMapper userMapper;
    private final CurrentUser currentUser;
    private final PasswordResetService passwordResetService;

    @PostMapping("/login")
    public LoginResponse login(@RequestBody @Valid LoginRequest loginRequest) {
        return authService.login(loginRequest);
    }

    @PostMapping(value = "/register", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public RegisterResponse register(
            @RequestPart("request") @Valid RegisterRequest registerRequest,
            @RequestPart(value = "profilePhoto", required = false) org.springframework.web.multipart.MultipartFile profilePhoto) {
        User registeredUser = authService.register(registerRequest, profilePhoto);
        return userMapper.toDto(registeredUser);
    }

    @GetMapping("/test")
    public String test() {
        return "the endpoint is public and you accessed it by giving token.";
    }

    @PostMapping("/complete-profile")
    public String completeProfile(@RequestBody com.recipeplatform.dto.auth.ProfileCompletionRequest request) {
        return authService.completeProfile(request);
    }

    @GetMapping("/profile")
    public com.recipeplatform.dto.auth.RegisterResponse getProfile() {
        User user = currentUser.getCurrentUser();
        return userMapper.toDto(user);
    }

    @PutMapping("/profile")
    public String updateProfile(@RequestBody com.recipeplatform.dto.auth.UserProfileUpdateRequest request) {
        return authService.updateProfile(request);
    }

    @GetMapping("/profile/{id}")
    public RegisterResponse getUserProfile(@PathVariable Long id) {
        User user = authService.getUserById(id);
        return userMapper.toDto(user);
    }

    @PostMapping(value = "/profile/photo", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public String updateProfilePhoto(@RequestPart("profilePhoto") org.springframework.web.multipart.MultipartFile profilePhoto) {
        return authService.updateProfilePhoto(profilePhoto);
    }

    @PostMapping("/forgot-password")
    public String forgotPassword(@RequestBody java.util.Map<String, String> request) {
        String identifier = request.get("identifier");
        passwordResetService.initiatePasswordReset(identifier);
        return "Reset link sent to your email";
    }

    @GetMapping("/validate-token")
    public boolean validateToken(@RequestParam String token) {
        return passwordResetService.validateToken(token);
    }

    @PostMapping("/reset-password")
    public String resetPassword(@RequestBody java.util.Map<String, String> request) {
        String token = request.get("token");
        String newPassword = request.get("newPassword");
        passwordResetService.resetPassword(token, newPassword);
        return "Password reset successfully";
    }

    @PostMapping("/change-password")
    public String changePassword(@RequestBody java.util.Map<String, String> request) {
        String currentPassword = request.get("currentPassword");
        String newPassword = request.get("newPassword");
        User user = currentUser.getCurrentUser();
        passwordResetService.changePassword(user, currentPassword, newPassword);
        return "Password changed successfully";
    }

}
