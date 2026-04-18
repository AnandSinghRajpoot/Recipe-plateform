package com.recipeplatform.dto.auth;

import lombok.Data;

@Data
public class UserProfileUpdateRequest {
    private String name;
    private String bio;
    private com.recipeplatform.domain.enums.DietType dietType;
    private com.recipeplatform.domain.enums.SkillLevel skillLevel;
}
