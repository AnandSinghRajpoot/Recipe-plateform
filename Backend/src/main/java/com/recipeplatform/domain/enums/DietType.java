

package com.recipeplatform.domain.enums;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum DietType {
    VEG, NON_VEG, VEGAN,NO_PREFERENCE;

    @JsonCreator
    public DietType fromValue(String dietType){
        for (DietType type:DietType.values()){
            if (type.name().equalsIgnoreCase(dietType)) {
                return type;
            }
        }
        throw new IllegalArgumentException(
                "Invalid diet type: " + dietType + ". Allowed values: VEG, NON_VEG, VEGAN,NO_PREFERENCE"
        );
    }
}