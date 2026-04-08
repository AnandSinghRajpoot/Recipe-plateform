package com.recipeplatform.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_disease")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDisease {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_health_profile_id", nullable = false)
    @NotNull(message = "User health profile is required")
    private UserHealthProfile userHealthProfile;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "disease_id", nullable = false)
    @NotNull(message = "Disease is required")
    private Disease disease;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stage_id")
    private DiseaseStage stage; // Nullable - only set if disease has stages

    @CreationTimestamp
    @Column(name = "added_at", updatable = false, nullable = false)
    private LocalDateTime addedAt;
}
