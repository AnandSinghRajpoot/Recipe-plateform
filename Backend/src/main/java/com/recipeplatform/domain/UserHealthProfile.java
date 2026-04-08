package com.recipeplatform.domain;

import com.recipeplatform.domain.enums.ActivityLevel;
import com.recipeplatform.domain.enums.Gender;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "user_health_profile")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserHealthProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    @NotNull(message = "User is required")
    private User user;

    @Min(value = 1, message = "Age must be at least 1")
    @Max(value = 150, message = "Age cannot exceed 150")
    @Column(name = "age")
    private Integer age;

    @Enumerated(EnumType.STRING)
    @Column(name = "gender", length = 20)
    private Gender gender;

    @Min(value = 1, message = "Weight must be at least 1 kg")
    @Max(value = 500, message = "Weight cannot exceed 500 kg")
    @Column(name = "weight")
    private Double weight; // in kg

    @Min(value = 30, message = "Height must be at least 30 cm")
    @Max(value = 300, message = "Height cannot exceed 300 cm")
    @Column(name = "height")
    private Double height; // in cm

    @Enumerated(EnumType.STRING)
    @Column(name = "activity_level", length = 30)
    private ActivityLevel activityLevel;

    @Column(name = "bmi")
    private Double bmi;

    @Column(name = "daily_calorie_requirement")
    private Double dailyCalorieRequirement;

    @Enumerated(EnumType.STRING)
    @Column(name = "work_type", length = 30)
    private com.recipeplatform.domain.enums.WorkType workType;

    @Enumerated(EnumType.STRING)
    @Column(name = "travel_frequency", length = 30)
    private com.recipeplatform.domain.enums.TravelFrequency travelFrequency;

    @Enumerated(EnumType.STRING)
    @Column(name = "eating_pattern", length = 30)
    private com.recipeplatform.domain.enums.EatingPattern eatingPattern;

    @Enumerated(EnumType.STRING)
    @Column(name = "sleep_duration", length = 30)
    private com.recipeplatform.domain.enums.SleepDuration sleepDuration;

    @Column(name = "water_intake_glasses")
    private Integer waterIntakeGlasses;

    @Enumerated(EnumType.STRING)
    @Column(name = "smoking_habit", length = 30)
    private com.recipeplatform.domain.enums.HabitStatus smokingHabit;

    @Enumerated(EnumType.STRING)
    @Column(name = "alcohol_habit", length = 30)
    private com.recipeplatform.domain.enums.HabitStatus alcoholHabit;

    @OneToMany(mappedBy = "userHealthProfile", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<UserDisease> diseases = new ArrayList<>();

    @OneToMany(mappedBy = "userHealthProfile", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<UserAllergy> allergies = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false, nullable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
