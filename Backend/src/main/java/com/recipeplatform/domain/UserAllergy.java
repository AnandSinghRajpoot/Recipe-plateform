package com.recipeplatform.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_allergy")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserAllergy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_health_profile_id", nullable = false)
    @NotNull(message = "User health profile is required")
    private UserHealthProfile userHealthProfile;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "allergy_id", nullable = false)
    @NotNull(message = "Allergy is required")
    private Allergy allergy;

    @CreationTimestamp
    @Column(name = "added_at", updatable = false, nullable = false)
    private LocalDateTime addedAt;
}
