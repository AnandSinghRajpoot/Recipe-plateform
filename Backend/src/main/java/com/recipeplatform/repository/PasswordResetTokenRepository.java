package com.recipeplatform.repository;

import com.recipeplatform.domain.PasswordResetToken;
import com.recipeplatform.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    Optional<PasswordResetToken> findByToken(String token);

    Optional<PasswordResetToken> findByUserAndUsedFalseAndExpiryDateAfter(User user, LocalDateTime now);

    @Modifying
    @Query("DELETE FROM PasswordResetToken p WHERE p.expiryDate < :now OR p.used = true")
    void deleteExpiredTokens(LocalDateTime now);
}