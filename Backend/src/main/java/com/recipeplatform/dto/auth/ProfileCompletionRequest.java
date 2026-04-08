package com.recipeplatform.dto.auth;

import com.recipeplatform.domain.enums.DietType;
import com.recipeplatform.domain.enums.SkillLevel;
import lombok.Data;

@Data
public class ProfileCompletionRequest {
    private Integer age;
    private com.recipeplatform.domain.enums.Gender gender;
    private Double weight;
    private Double height;
    private com.recipeplatform.domain.enums.ActivityLevel activityLevel;

    private com.recipeplatform.domain.enums.WorkType workType;
    private com.recipeplatform.domain.enums.TravelFrequency travelFrequency;
    private com.recipeplatform.domain.enums.EatingPattern eatingPattern;
    private com.recipeplatform.domain.enums.SleepDuration sleepDuration;
    private Integer waterIntakeGlasses;
    private com.recipeplatform.domain.enums.HabitStatus smokingHabit;
    private com.recipeplatform.domain.enums.HabitStatus alcoholHabit;

    private DietType dietType;
    private SkillLevel skillLevel;
    
    private java.util.List<String> diseaseNames;
    private java.util.List<String> allergyNames;
}
