package com.recipeplatform.domain;

import jakarta.persistence.*;
import lombok.*;
@Entity
@Getter
@Setter
@ToString(exclude = "recipe")
@EqualsAndHashCode(exclude = "recipe")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "nutrition")
public class Nutrition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "calories")
    private Double calories;

    @Column(name = "protein")
    private Double protein;

    @Column(name = "carbs")
    private Double carbs;

    @Column(name = "fat")
    private Double fat;

    @Column(name = "fiber")
    private Double fiber;

    @Column(name = "sugar")
    private Double sugar;

    @Column(name = "sodium")
    private Double sodium;

    @OneToOne(mappedBy = "nutrition")
    private Recipe recipe;
}
