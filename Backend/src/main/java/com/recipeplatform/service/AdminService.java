package com.recipeplatform.service;

import com.recipeplatform.domain.User;
import com.recipeplatform.domain.Recipe;
import com.recipeplatform.domain.Report;
import com.recipeplatform.domain.enums.UserStatus;

import java.time.LocalDateTime;
import java.util.List;

public interface AdminService {
    // User Management
    List<User> getAllUsers();
    void updateUserStatus(Long userId, UserStatus status, LocalDateTime suspendedUntil);
    void deleteUser(Long userId);

    // Recipe Moderation
    org.springframework.data.domain.Page<Recipe> getAllRecipesForAdmin(int page, int size, String query);
    List<Recipe> getModeratedRecipes();
    void moderateRecipe(Long recipeId, boolean moderated, String reason);

    // Report Management
    List<Report> getAllReports();
    void updateReportStatus(Long reportId, String status, String adminNote);
    
    // Dashboard Stats
    java.util.Map<String, Object> getAdminStats();
}
