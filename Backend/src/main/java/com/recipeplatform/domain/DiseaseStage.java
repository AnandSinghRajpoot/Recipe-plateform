package com.recipeplatform.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "disease_stage")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DiseaseStage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Stage name is required")
    @Size(min = 2, max = 100, message = "Stage name must be between 2 and 100 characters")
    @Column(name = "stage_name", nullable = false, length = 100)
    private String stageName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "disease_id", nullable = false)
    private Disease disease;
}
