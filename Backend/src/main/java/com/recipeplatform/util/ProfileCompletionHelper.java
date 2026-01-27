package com.recipeplatform.util;

import com.recipeplatform.domain.User;

public class ProfileCompletionHelper {

    //initialize at first time
    public static void initialize(User user) {
        user.setIsProfileCompleted(false);
        user.setIsReminderDismissed(false);
    }

    //at profile completion
    public static void completeProfile(User user) {
        user.setIsProfileCompleted(true);
        user.setShowReminder(false);
    }

    //at reminder dismissed
    public static void reminderDismissed(User user) {
        user.setIsReminderDismissed(true);
        user.setShowReminder(false);
    }

    public static boolean shouldShowReminder(User user) {
        return !user.getIsProfileCompleted() && !user.getIsReminderDismissed();
    }
}
