package com.recipeplatform.util;

import com.recipeplatform.domain.User;

public class ProfileCompletionHelper {

    // initialize at first time
    public static void initialize(User user) {
        user.setIsProfileCompleted(false);
    }

    // at profile completion
    public static void completeProfile(User user) {
        user.setIsProfileCompleted(true);
    }
}
