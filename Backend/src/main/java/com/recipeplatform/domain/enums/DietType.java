package com.recipeplatform.domain.enums;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum DietType {
    VEGETARIAN,
    VEGAN,
    NO_PREFERENCE;

    @JsonCreator
    public static DietType fromValue(String dietType){
        if (dietType == null || dietType.isEmpty()) return NO_PREFERENCE;
        
        // Handle variations
        if (dietType.equalsIgnoreCase("VEGETARIAN")) return VEGETARIAN;
        if (dietType.equalsIgnoreCase("VEGAN")) return VEGAN;

        for (DietType type : DietType.values()){
            if (type.name().equalsIgnoreCase(dietType)) {
                return type;
            }
        }
        // Fallback
        return NO_PREFERENCE;
    }
}