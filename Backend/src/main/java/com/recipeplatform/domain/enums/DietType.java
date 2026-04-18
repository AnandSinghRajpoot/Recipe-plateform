package com.recipeplatform.domain.enums;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum DietType {
    VEG, 
    NON_VEG, 
    VEGAN, 
    NO_PREFERENCE;

    @JsonCreator
    public static DietType fromValue(String dietType){
        if (dietType == null || dietType.isEmpty()) return NO_PREFERENCE;
        
        // Handle variations
        if (dietType.equalsIgnoreCase("OMNIVORE")) return NON_VEG;
        if (dietType.equalsIgnoreCase("VEGETARIAN")) return VEG;

        for (DietType type : DietType.values()){
            if (type.name().equalsIgnoreCase(dietType)) {
                return type;
            }
        }
        // Fallback or throw error. Keeping NON_VEG/NO_PREFERENCE as default might be safer for legacy data if any.
        return NO_PREFERENCE;
    }
}