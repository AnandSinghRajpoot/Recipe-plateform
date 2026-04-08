package com.recipeplatform.domain.enums;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum Difficulty {
    EASY,MEDIUM,HARD;

    @JsonCreator
    public static Difficulty fromValue(String difficulty){
        for (Difficulty type:Difficulty.values()){
            if (type.name().equalsIgnoreCase(difficulty)) {
                return type;
            }
        }
        throw new IllegalArgumentException(
                "Invalid diet type: " + difficulty + ". Allowed values: EASY,MEDIUM,HARD"
        );
    }
}
