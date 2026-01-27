package com.recipeplatform.dto.auth;

import com.recipeplatform.domain.enums.DietType;
import com.recipeplatform.domain.enums.SkillLevel;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {

    @Size(min = 2, max = 50, message = "Name must be between 2 and 50 characters")
    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;


    @Size(min = 6, message = "Password must be at least 6 characters long")
    @NotBlank(message = "Password is required")
    @Pattern(
            regexp = "^(?=.*[0-9])(?=.*[a-zA-Z]).+$",
            message = "Must contain at least one digit and one letter"
    )
    private String password;
    private DietType dietType;
    private SkillLevel skillLevel;

}
