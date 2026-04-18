package com.recipeplatform.domain.enums;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum SkillLevel {

    BEGINNER, 
    INTERMEDIATE, 
    EXPERT;

    @JsonCreator
    public static SkillLevel fromValue(String value) {
        if (value == null || value.isEmpty()) return BEGINNER;
        for (SkillLevel level : SkillLevel.values()) {
            if (level.name().equalsIgnoreCase(value)) {
                return level;
            }
        }
        // Default to BEGINNER for safety if UNKNOWN is removed
        return BEGINNER;
    }
}
