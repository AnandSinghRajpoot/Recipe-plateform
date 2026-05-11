package com.recipeplatform.domain;

import com.recipeplatform.domain.enums.RiskLevel;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "recipe_health_analysis")
public class RecipeHealthAnalysis {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipe_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Recipe recipe;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "disease_id", nullable = false)
    private Disease disease;

    @Column(name = "compatibility_score")
    private Integer compatibilityScore;

    @Enumerated(EnumType.STRING)
    @Column(name = "risk_level")
    private RiskLevel riskLevel;

    @Column(name = "analysis_reason", length = 1000)
    private String analysisReason;

    @ElementCollection
    @CollectionTable(name = "recipe_health_warnings", joinColumns = @JoinColumn(name = "analysis_id"))
    @Column(name = "warning")
    private List<String> warnings = new ArrayList<>();

    @Column(name = "generated_by_system")
    private Boolean generatedBySystem = true;

    @Column(name = "last_updated")
    private LocalDateTime lastUpdated;

    @PrePersist
    @PreUpdate
    public void updateTimestamps() {
        this.lastUpdated = LocalDateTime.now();
    }
}
