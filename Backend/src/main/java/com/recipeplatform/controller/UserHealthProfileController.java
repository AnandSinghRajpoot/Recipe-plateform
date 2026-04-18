package com.recipeplatform.controller;

import com.recipeplatform.dto.ApiResponse;
import com.recipeplatform.dto.UserHealthProfileDTO;
import com.recipeplatform.service.UserHealthProfileService;
import com.recipeplatform.util.CurrentUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/health-profile")
@RequiredArgsConstructor
public class UserHealthProfileController {

        private final UserHealthProfileService userHealthProfileService;
        private final CurrentUser currentUser;

        @GetMapping
        public ResponseEntity<ApiResponse<UserHealthProfileDTO>> getMyHealthProfile() {
                Long userId = currentUser.getCurrentUser().getId();
                UserHealthProfileDTO profile = userHealthProfileService.getProfileByUserId(userId);
                return ResponseEntity.ok(
                                new ApiResponse<>("Health profile retrieved successfully", profile,
                                                HttpStatus.OK.value()));
        }

        @PostMapping
        public ResponseEntity<ApiResponse<UserHealthProfileDTO>> createOrUpdateProfile(
                        @Valid @RequestBody UserHealthProfileDTO profileDTO) {
                Long userId = currentUser.getCurrentUser().getId();
                UserHealthProfileDTO savedProfile = userHealthProfileService.createOrUpdateProfile(userId, profileDTO);
                return ResponseEntity.status(HttpStatus.CREATED).body(
                                new ApiResponse<>("Health profile saved successfully", savedProfile,
                                                HttpStatus.CREATED.value()));
        }

        @PostMapping("/diseases")
        public ResponseEntity<ApiResponse<Void>> addDisease(
                        @RequestParam Long diseaseId,
                        @RequestParam(required = false) Long stageId) {
                Long userId = currentUser.getCurrentUser().getId();
                userHealthProfileService.addUserDisease(userId, diseaseId, stageId);
                return ResponseEntity.ok(
                                new ApiResponse<>("Disease added to profile successfully", null,
                                                HttpStatus.OK.value()));
        }

        @DeleteMapping("/diseases/{diseaseId}")
        public ResponseEntity<ApiResponse<Void>> removeDisease(@PathVariable Long diseaseId) {
                Long userId = currentUser.getCurrentUser().getId();
                userHealthProfileService.removeUserDisease(userId, diseaseId);
                return ResponseEntity.ok(
                                new ApiResponse<>("Disease removed from profile successfully", null,
                                                HttpStatus.OK.value()));
        }

        @PostMapping("/allergies")
        public ResponseEntity<ApiResponse<Void>> addAllergy(@RequestParam Long allergyId) {
                Long userId = currentUser.getCurrentUser().getId();
                userHealthProfileService.addUserAllergy(userId, allergyId);
                return ResponseEntity.ok(
                                new ApiResponse<>("Allergy added to profile successfully", null,
                                                HttpStatus.OK.value()));
        }

        @DeleteMapping("/allergies/{allergyId}")
        public ResponseEntity<ApiResponse<Void>> removeAllergy(@PathVariable Long allergyId) {
                Long userId = currentUser.getCurrentUser().getId();
                userHealthProfileService.removeUserAllergy(userId, allergyId);
                return ResponseEntity.ok(
                                new ApiResponse<>("Allergy removed from profile successfully", null,
                                                HttpStatus.OK.value()));
        }

        @DeleteMapping
        public ResponseEntity<ApiResponse<Void>> deleteProfile() {
                Long userId = currentUser.getCurrentUser().getId();
                userHealthProfileService.deleteProfile(userId);
                return ResponseEntity.ok(
                                new ApiResponse<>("Health profile deleted successfully", null, HttpStatus.OK.value()));
        }
}
