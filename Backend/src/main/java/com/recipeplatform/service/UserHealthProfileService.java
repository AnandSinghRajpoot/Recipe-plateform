package com.recipeplatform.service;

import com.recipeplatform.dto.UserHealthProfileDTO;

public interface UserHealthProfileService {

    /**
     * Get user health profile by user ID
     */
    UserHealthProfileDTO getProfileByUserId(Long userId);

    /**
     * Create or update user health profile
     */
    UserHealthProfileDTO createOrUpdateProfile(Long userId, UserHealthProfileDTO profileDTO);

    /**
     * Add a disease to user's health profile
     */
    void addUserDisease(Long userId, Long diseaseId, Long stageId);

    /**
     * Remove a disease from user's health profile
     */
    void removeUserDisease(Long userId, Long diseaseId);

    /**
     * Add an allergy to user's health profile
     */
    void addUserAllergy(Long userId, Long allergyId);

    /**
     * Remove an allergy from user's health profile
     */
    void removeUserAllergy(Long userId, Long allergyId);

    /**
     * Delete user health profile
     */
    void deleteProfile(Long userId);
}
