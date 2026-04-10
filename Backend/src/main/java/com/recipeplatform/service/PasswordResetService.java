package com.recipeplatform.service;

import com.recipeplatform.domain.PasswordResetToken;
import com.recipeplatform.domain.User;
import com.recipeplatform.exception.BadRequestException;
import com.recipeplatform.exception.ResourceNotFoundException;
import com.recipeplatform.repository.PasswordResetTokenRepository;
import com.recipeplatform.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class PasswordResetService {

    @Autowired
    private PasswordResetTokenRepository tokenRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    public void initiatePasswordReset(String identifier) {
        User user = userRepository.findByEmailOrPhoneNumber(identifier, identifier)
            .orElseThrow(() -> new ResourceNotFoundException("User", "email or phone", identifier));

        // Invalidate any existing tokens
        tokenRepository.findByUserAndUsedFalseAndExpiryDateAfter(user, LocalDateTime.now())
            .ifPresent(token -> {
                token.setUsed(true);
                tokenRepository.save(token);
            });

        // Create new token
        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(token);
        resetToken.setUser(user);
        resetToken.setUsed(false);
        tokenRepository.save(resetToken);

        // Send email (exception handled internally)
        emailService.sendPasswordResetEmail(user, token);
    }

    public boolean validateToken(String token) {
        return tokenRepository.findByToken(token)
            .map(t -> !t.isUsed() && !t.isExpired())
            .orElse(false);
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = tokenRepository.findByToken(token)
            .orElseThrow(() -> new BadRequestException("Invalid or expired reset token", "INVALID_TOKEN"));

        if (resetToken.isUsed() || resetToken.isExpired()) {
            throw new BadRequestException("Token has already been used or has expired", "TOKEN_EXPIRED");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        resetToken.setUsed(true);
        tokenRepository.save(resetToken);
    }

    @Transactional
    public void changePassword(User user, String currentPassword, String newPassword) {
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new BadRequestException("The current password you entered is incorrect", "INVALID_CURRENT_PASSWORD");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}