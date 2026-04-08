package com.recipeplatform.service;

import com.recipeplatform.dto.UserRestrictionsDTO;

public interface RestrictionService {

    /**
     * Get all food restrictions for a user (both hard and soft restrictions)
     * Hard restrictions: from allergies (must be completely excluded)
     * Soft restrictions: from diseases (penalized in scoring)
     */
    UserRestrictionsDTO getAllRestrictionsForUser(Long userId);
}
