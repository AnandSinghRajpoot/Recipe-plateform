package com.recipeplatform.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LoginRequest {

    @Email(message = "should be valid email format.")
    @NotBlank(message = "email is required.")
    private String email;

    @NotBlank(message = "password is required.")
    private String password;
}
