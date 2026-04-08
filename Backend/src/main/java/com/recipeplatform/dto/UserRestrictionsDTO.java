package com.recipeplatform.dto;

import com.recipeplatform.domain.enums.RestrictionSeverity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserRestrictionsDTO {

    /**
     * Hard restrictions from allergies - recipes containing these must be
     * completely excluded
     */
    @Builder.Default
    private List<Long> hardRestrictedIngredientIds = new ArrayList<>();

    /**
     * Soft restrictions from diseases - recipes containing these get penalized in
     * scoring
     */
    @Builder.Default
    private List<SoftRestriction> softRestrictions = new ArrayList<>();

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SoftRestriction {
        private Long ingredientId;
        private String ingredientName;
        private RestrictionSeverity severity;
        private String reason;
    }
}
