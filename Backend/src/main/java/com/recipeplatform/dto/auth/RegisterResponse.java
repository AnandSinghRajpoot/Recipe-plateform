package com.recipeplatform.dto.auth;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.recipeplatform.domain.enums.DietType;
import com.recipeplatform.domain.enums.SkillLevel;
import com.recipeplatform.domain.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class RegisterResponse {

    private Long id;
    private String name;
    private String email;
    private DietType dietType;
    private SkillLevel skillLevel;
    private UserRole role;
}
