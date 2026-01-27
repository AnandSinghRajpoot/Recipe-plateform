package com.recipeplatform.dto.auth;

import com.recipeplatform.domain.enums.DietType;
import com.recipeplatform.domain.enums.SkillLevel;
import lombok.Data;

@Data
public class ProfileCompletionRequest {
    private DietType dietType;
    private SkillLevel skillLevel;
}
