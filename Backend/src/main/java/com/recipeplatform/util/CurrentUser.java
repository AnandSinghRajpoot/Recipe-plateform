package com.recipeplatform.util;

import com.recipeplatform.domain.User;
import com.recipeplatform.security.CustomUserDetails;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class CurrentUser {
    public User  getCurrentUser(){
      Authentication authentication=SecurityContextHolder.getContext().getAuthentication();
      CustomUserDetails userDetails=(CustomUserDetails) authentication.getPrincipal();
      return userDetails.getUser();
    }
}
