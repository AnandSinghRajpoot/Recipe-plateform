package com.recipeplatform.domain.enums;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum MeasureUnit {
        GRAM,
        KILOGRAM,
        LITER,
        MILLILITER,
        CUP,
        TABLESPOON,
        TEASPOON,
        PIECE;


        @JsonCreator
        public static MeasureUnit fromValue(String unit){
                for (MeasureUnit measureUnit:MeasureUnit.values()){
                        if (measureUnit.name().equalsIgnoreCase(unit)) {
                                return measureUnit;
                        }
                }
                throw new IllegalArgumentException(
                        "Invalid diet type: " + unit + ". Allowed values: GRAM,KILOGRAM,LITER,MILLILITER,CUP,TABLESPOON,TEASPOON,PIECE."
                );
        }

}
