package com.recipeplatform.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "allergy_restriction")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AllergyRestriction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "allergy_id", nullable = false)
    @NotNull(message = "Allergy is required")
    private Allergy allergy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ingredient_id", nullable = false)
    @NotNull(message = "Ingredient is required")
    private Ingredient ingredient;

    @Column(columnDefinition = "TEXT")
    private String reason; // Optional explanation for the restriction
}
