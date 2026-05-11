package com.recipeplatform.service.impl;

import com.recipeplatform.domain.User;
import com.recipeplatform.domain.Recipe;
import com.recipeplatform.domain.Report;
import com.recipeplatform.domain.enums.UserStatus;
import com.recipeplatform.domain.enums.ReportStatus;
import com.recipeplatform.exception.ResourceNotFoundException;
import com.recipeplatform.repository.UserRepository;
import com.recipeplatform.repository.RecipeRepository;
import com.recipeplatform.repository.ReportRepository;
import com.recipeplatform.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final RecipeRepository recipeRepository;
    private final ReportRepository reportRepository;

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public void updateUserStatus(Long userId, UserStatus status, LocalDateTime suspendedUntil) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        user.setStatus(status);
        user.setSuspendedUntil(suspendedUntil);
        userRepository.save(user);
    }

    @Override
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        user.setStatus(UserStatus.DELETED);
        userRepository.save(user);
    }

    @Override
    public org.springframework.data.domain.Page<Recipe> getAllRecipesForAdmin(int page, int size, String query) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size, org.springframework.data.domain.Sort.by("createdAt").descending());
        if (query != null && !query.isBlank()) {
            return recipeRepository.findByTitleContainingIgnoreCaseAndDeletedAtIsNull(query, pageable);
        }
        return recipeRepository.findByDeletedAtIsNull(pageable);
    }

    @Override
    public List<Recipe> getModeratedRecipes() {
        // This is a placeholder, actual implementation depends on how moderated recipes are stored/queried
        return recipeRepository.findAll().stream().filter(Recipe::getIsModerated).toList();
    }

    @Override
    public void moderateRecipe(Long recipeId, boolean moderated, String reason) {
        Recipe recipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new ResourceNotFoundException("Recipe", "id", recipeId));
        recipe.setIsModerated(moderated);
        recipe.setModerationReason(reason);
        // If moderated (taken down), unpublish it
        if (moderated) {
            recipe.setIsPublished(false);
        }
        recipeRepository.save(recipe);
    }

    @Override
    public List<Report> getAllReports() {
        return reportRepository.findAll();
    }

    @Override
    public void updateReportStatus(Long reportId, String status, String adminNote) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report", "id", reportId));
        report.setStatus(ReportStatus.valueOf(status));
        report.setAdminNote(adminNote);
        reportRepository.save(report);
    }

    @Override
    public Map<String, Object> getAdminStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalRecipes", recipeRepository.count());
        stats.put("pendingReports", reportRepository.findByStatus(ReportStatus.PENDING).size());
        stats.put("moderatedRecipes", recipeRepository.findAll().stream().filter(Recipe::getIsModerated).count());
        return stats;
    }
}
