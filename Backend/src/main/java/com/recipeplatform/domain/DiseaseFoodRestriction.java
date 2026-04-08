package com.recipeplatform.domain;

import com.recipeplatform.domain.enums.RestrictionSeverity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "disease_food_restriction")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DiseaseFoodRestriction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "disease_id", nullable = false)
    @NotNull(message = "Disease is required")
    private Disease disease;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stage_id")
    private DiseaseStage stage; // Nullable - if null, applies to all stages

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ingredient_id", nullable = false)
    @NotNull(message = "Ingredient is required")
    private Ingredient ingredient;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @NotNull(message = "Severity is required")
    private RestrictionSeverity severity;

    @Column(columnDefinition = "TEXT")
    private String reason; // Optional explanation for the restriction
}
