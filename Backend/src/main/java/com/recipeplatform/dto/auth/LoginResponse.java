package com.recipeplatform.dto.auth;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.recipeplatform.domain.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LoginResponse {

    private String token;
    private long issuedAt;
    private long expireAt;
    private Boolean isProfileCompleted;
    private UserRole role;
}
