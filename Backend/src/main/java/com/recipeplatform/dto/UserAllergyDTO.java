package com.recipeplatform.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserAllergyDTO {

    private Long id;
    private Long allergyId;
    private String allergyName;
}
