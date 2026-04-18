package com.recipeplatform.dto;

import com.recipeplatform.domain.enums.ActivityLevel;
import com.recipeplatform.domain.enums.Gender;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserHealthProfileDTO {

    private Long id;

    @Min(value = 1, message = "Age must be at least 1")
    @Max(value = 150, message = "Age cannot exceed 150")
    private Integer age;

    private Gender gender;

    @Min(value = 1, message = "Weight must be at least 1 kg")
    @Max(value = 500, message = "Weight cannot exceed 500 kg")
    private Double weight; // in kg

    @Min(value = 30, message = "Height must be at least 30 cm")
    @Max(value = 300, message = "Height cannot exceed 300 cm")
    private Double height; // in cm

    private ActivityLevel activityLevel;

    private Double bmi;
    private Double dailyCalorieRequirement;

    private com.recipeplatform.domain.enums.WorkType workType;
    private com.recipeplatform.domain.enums.TravelFrequency travelFrequency;
    private com.recipeplatform.domain.enums.EatingPattern eatingPattern;
    private com.recipeplatform.domain.enums.SleepDuration sleepDuration;
    private Integer waterIntakeGlasses;
    private com.recipeplatform.domain.enums.HabitStatus smokingHabit;
    private com.recipeplatform.domain.enums.HabitStatus alcoholHabit;

    @Builder.Default
    private List<UserDiseaseDTO> diseases = new ArrayList<>();

    @Builder.Default
    private List<UserAllergyDTO> allergies = new ArrayList<>();

    private Integer completionPercentage;
}
