package com.recipeplatform.domain;

import com.recipeplatform.domain.enums.Difficulty;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Recipe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Recipe title is required")
    @Size(min = 3, max = 100, message = "Recipe title must be between 3 and 100 characters")
    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    @NotBlank(message = "description is required.")
    @Size(min = 20, max = 500, message = "Description must be between 20 and 500 characters")
    private String description;

    @Enumerated(EnumType.STRING)
    private Difficulty difficulty;

    //TO:DO handle cover image for recipe
    private String coverImageUrl;

    @Column(columnDefinition = "TEXT")
    @Size(min = 30, max = 2000, message = "instructions must be between 30 and 2000 characters")
    private String instructions;


    @Min(value = 0, message = "Prep time cannot be negative")
    @Max(value = 180, message = "Prep time cannot exceed 180 minutes")
    @NotNull(message = "Prep time is required")
    @Column(name = "prep_time", nullable = false)
    private Integer prepTime;


    @Min(value = 1, message = "Cook time must be at least 1 minute")
    @Max(value = 240, message = "Cook time cannot exceed 240 minutes")
    @NotNull(message = "Cook time is required")
    @Column(name = "cook_time", nullable = false)
    private Integer cookTime;


    @ManyToOne(fetch =FetchType.LAZY)
    @JoinColumn(name = "user_id",nullable = false)
    private User user;


    @OneToMany(
            mappedBy = "recipe",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<RecipeIngredient> ingredients = new ArrayList<>();


    @CreationTimestamp
    @Column(name = "created_at", updatable = false,nullable = false)
    private LocalDateTime createdAt;


    @UpdateTimestamp
    @Column(name = "updated_at",nullable = false)
    private LocalDateTime updatedAt;
}
