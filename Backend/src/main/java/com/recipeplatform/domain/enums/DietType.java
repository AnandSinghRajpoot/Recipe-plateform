
package com.recipeplatform.domain.enums;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum DietType {
    VEG, NON_VEG, VEGAN, NO_PREFERENCE,
    VEGETARIAN, NON_VEGETARIAN, KETO, PALEO,
    GLUTEN_FREE, DIABETIC_FRIENDLY, LOW_SODIUM, HIGH_PROTEIN;

    @JsonCreator
    public static DietType fromValue(String dietType){
        for (DietType type:DietType.values()){
            if (type.name().equalsIgnoreCase(dietType)) {
                return type;
            }
        }
        throw new IllegalArgumentException(
                "Invalid diet type: " + dietType + ". Allowed values: " + java.util.Arrays.toString(DietType.values())
        );
    }
}