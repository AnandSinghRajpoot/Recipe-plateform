package com.recipeplatform.service.impl;

import com.recipeplatform.domain.User;
import com.recipeplatform.domain.enums.UserRole;
import com.recipeplatform.dto.auth.LoginRequest;
import com.recipeplatform.dto.auth.LoginResponse;
import com.recipeplatform.dto.auth.RegisterRequest;
import com.recipeplatform.mapper.UserMapper;
import com.recipeplatform.repository.UserRepository;
import com.recipeplatform.security.JwtUtill;
import com.recipeplatform.service.AuthService;
import com.recipeplatform.util.CurrentUser;
import com.recipeplatform.util.ProfileCompletionHelper;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {

    private final JwtUtill jwtUtill;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final AuthenticationManager authenticationManager;
    private CurrentUser currentUser;

    public AuthServiceImpl(JwtUtill jwtUtill, PasswordEncoder passwordEncoder, UserRepository userRepository,
            UserMapper userMapper, AuthenticationManager authenticationManager, CurrentUser currentUser) {
        this.jwtUtill = jwtUtill;
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.authenticationManager = authenticationManager;
        this.currentUser = currentUser;
    }

    public LoginResponse login(LoginRequest loginRequest) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String accessToken = jwtUtill.generateToken(authentication.getName());
        com.recipeplatform.security.CustomUserDetails userDetails = (com.recipeplatform.security.CustomUserDetails) authentication
                .getPrincipal();
        User user = userDetails.getUser();
        return new LoginResponse(
                accessToken, jwtUtill.extractClaims(accessToken).getIssuedAt().getTime(),
                jwtUtill.extractClaims(accessToken).getExpiration().getTime(), user.getIsProfileCompleted());

    }

    public User register(RegisterRequest registerRequest) {
        User user = userMapper.toEntity(registerRequest);
        user.setRole(UserRole.USER);
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        ProfileCompletionHelper.initialize(user);
        return userRepository.save(user);
    }

    @Override
    public String completeProfile(com.recipeplatform.dto.auth.ProfileCompletionRequest request) {
        User user = currentUser.getCurrentUser();
        user.setDietType(request.getDietType());
        user.setSkillLevel(request.getSkillLevel());
        ProfileCompletionHelper.completeProfile(user);
        userRepository.save(user);
        return "profile completed successfully";
    }
}
