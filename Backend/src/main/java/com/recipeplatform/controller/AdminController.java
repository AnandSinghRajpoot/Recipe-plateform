package com.recipeplatform.controller;

import com.recipeplatform.domain.User;
import com.recipeplatform.domain.Recipe;
import com.recipeplatform.domain.Report;
import com.recipeplatform.domain.enums.UserStatus;
import com.recipeplatform.dto.ApiResponse;
import com.recipeplatform.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<User>>> getAllUsers() {
        return ResponseEntity.ok(new ApiResponse<>("Users fetched", adminService.getAllUsers(), 200));
    }

    @PatchMapping("/users/{userId}/status")
    public ResponseEntity<ApiResponse<Void>> updateUserStatus(
            @PathVariable Long userId,
            @RequestParam UserStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime suspendedUntil) {
        adminService.updateUserStatus(userId, status, suspendedUntil);
        return ResponseEntity.ok(new ApiResponse<>("User status updated", null, 200));
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long userId) {
        adminService.deleteUser(userId);
        return ResponseEntity.ok(new ApiResponse<>("User deleted", null, 200));
    }

    @GetMapping("/recipes")
    public ResponseEntity<ApiResponse<org.springframework.data.domain.Page<Recipe>>> getAllRecipesForAdmin(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String query) {
        return ResponseEntity.ok(new ApiResponse<>("All recipes fetched", adminService.getAllRecipesForAdmin(page, size, query), 200));
    }

    @GetMapping("/recipes/moderated")
    public ResponseEntity<ApiResponse<List<Recipe>>> getModeratedRecipes() {
        return ResponseEntity.ok(new ApiResponse<>("Moderated recipes fetched", adminService.getModeratedRecipes(), 200));
    }

    @PatchMapping("/recipes/{recipeId}/moderate")
    public ResponseEntity<ApiResponse<Void>> moderateRecipe(
            @PathVariable Long recipeId,
            @RequestParam boolean moderated,
            @RequestParam(required = false) String reason) {
        adminService.moderateRecipe(recipeId, moderated, reason);
        return ResponseEntity.ok(new ApiResponse<>("Recipe moderation updated", null, 200));
    }

    @GetMapping("/reports")
    public ResponseEntity<ApiResponse<List<Report>>> getAllReports() {
        return ResponseEntity.ok(new ApiResponse<>("Reports fetched", adminService.getAllReports(), 200));
    }

    @PatchMapping("/reports/{reportId}/status")
    public ResponseEntity<ApiResponse<Void>> updateReportStatus(
            @PathVariable Long reportId,
            @RequestParam String status,
            @RequestParam(required = false) String adminNote) {
        adminService.updateReportStatus(reportId, status, adminNote);
        return ResponseEntity.ok(new ApiResponse<>("Report status updated", null, 200));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAdminStats() {
        return ResponseEntity.ok(new ApiResponse<>("Stats fetched", adminService.getAdminStats(), 200));
    }
}
