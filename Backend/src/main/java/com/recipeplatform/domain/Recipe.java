package com.recipeplatform.domain;

import com.recipeplatform.domain.enums.CuisineType;
import com.recipeplatform.domain.enums.Difficulty;
import com.recipeplatform.domain.enums.DietType;
import com.recipeplatform.domain.enums.MealType;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Recipe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Recipe title is required")
    @Size(min = 3, max = 120, message = "Recipe title must be between 3 and 120 characters")
    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    @NotBlank(message = "description is required.")
    @Size(min = 20, max = 500, message = "Description must be between 20 and 500 characters")
    private String description;

    @Enumerated(EnumType.STRING)
    private Difficulty difficulty;

    @Column(columnDefinition = "TEXT")
    @Size(min = 30, max = 2000, message = "instructions must be between 30 and 2000 characters")
    private String instructions;

    @Min(value = 0, message = "Prep time cannot be negative")
    @Max(value = 180, message = "Prep time cannot exceed 180 minutes")
    @NotNull(message = "Prep time is required")
    @Column(name = "prep_time", nullable = false)
    private Integer prepTime;

    @Min(value = 0, message = "Cook time cannot be negative")
    @Max(value = 240, message = "Cook time cannot exceed 240 minutes")
    @NotNull(message = "Cook time is required")
    @Column(name = "cook_time", nullable = false)
    private Integer cookTime;

    @Column(name = "servings", nullable = false)
    private Integer servings = 2;

    private String coverImageUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @OneToMany(mappedBy = "recipe", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RecipeIngredient> ingredients = new ArrayList<>();

    // === Dietary Classification ===
    @Enumerated(EnumType.STRING)
    @Column(name = "diet_type")
    private DietType dietType;

    @Enumerated(EnumType.STRING)
    @Column(name = "meal_type")
    private MealType mealType;

    @Enumerated(EnumType.STRING)
    @Column(name = "cuisine_type")
    private CuisineType cuisineType;

    // === Health Tagging (ManyToMany) ===
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "recipe_allergens",
        joinColumns = @JoinColumn(name = "recipe_id"),
        inverseJoinColumns = @JoinColumn(name = "allergy_id")
    )
    private Set<Allergy> containsAllergens = new HashSet<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "recipe_safe_diseases",
        joinColumns = @JoinColumn(name = "recipe_id"),
        inverseJoinColumns = @JoinColumn(name = "disease_id")
    )
    private Set<Disease> safeForDiseases = new HashSet<>();

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "nutrition_id", referencedColumnName = "id")
    private Nutrition nutrition;

    // === Rating Information ===
    @Column(name = "average_rating")
    private Double averageRating = 0.0;

    @Column(name = "review_count")
    private Long reviewCount = 0L;

    // === Publication Status ===
    @Column(name = "is_published", nullable = false)
    private Boolean isPublished = false;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false, nullable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
