package com.recipeplatform.repository;

import com.recipeplatform.domain.DiseaseFoodRestriction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DiseaseFoodRestrictionRepository extends JpaRepository<DiseaseFoodRestriction, Long> {

    List<DiseaseFoodRestriction> findByDiseaseId(Long diseaseId);

    /**
     * Find restrictions for a specific disease and stage.
     * Returns both stage-specific restrictions and general restrictions (where
     * stage_id is NULL).
     */
    @Query("SELECT dfr FROM DiseaseFoodRestriction dfr " +
            "WHERE dfr.disease.id = :diseaseId " +
            "AND (dfr.stage.id = :stageId OR dfr.stage IS NULL)")
    List<DiseaseFoodRestriction> findByDiseaseIdAndStageIdOrStageIsNull(
            @Param("diseaseId") Long diseaseId,
            @Param("stageId") Long stageId);

    /**
     * Find all general restrictions for a disease (where stage_id is NULL).
     */
    @Query("SELECT dfr FROM DiseaseFoodRestriction dfr " +
            "WHERE dfr.disease.id = :diseaseId " +
            "AND dfr.stage IS NULL")
    List<DiseaseFoodRestriction> findGeneralRestrictionsByDiseaseId(@Param("diseaseId") Long diseaseId);
}
