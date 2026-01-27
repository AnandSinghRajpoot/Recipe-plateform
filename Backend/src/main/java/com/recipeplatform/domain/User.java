package com.recipeplatform.domain;

import com.recipeplatform.domain.enums.DietType;
import com.recipeplatform.domain.enums.SkillLevel;
import com.recipeplatform.domain.enums.UserRole;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    @Size(min = 2, max = 50, message = "Name must be between 2 and 50 characters")
    @NotBlank(message = "Name is required")
    private String name;

    @Column(nullable = false, unique = true)
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;


    @Column(nullable = false)
    @Size(min = 6, message = "Password must be at least 6 characters long")
    @NotBlank(message = "Password is required")
    @Pattern(
            regexp = "^(?=.*[0-9])(?=.*[a-zA-Z]).+$",
            message = "Must contain at least one digit and one letter"
    )
    private String password;

    @Enumerated(EnumType.STRING)
    private DietType dietType;


    @Enumerated(EnumType.STRING)
    private SkillLevel skillLevel;

    @Enumerated(EnumType.STRING)
    private UserRole role;

    private Boolean isProfileCompleted;

    private Boolean showReminder;

    private Boolean isReminderDismissed;

    private LocalDateTime createdAt;


    @PrePersist
    void setCreatedAt() {
        this.createdAt = LocalDateTime.now();
    }

}