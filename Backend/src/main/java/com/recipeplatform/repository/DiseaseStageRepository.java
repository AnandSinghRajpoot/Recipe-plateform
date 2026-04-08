package com.recipeplatform.repository;

import com.recipeplatform.domain.DiseaseStage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DiseaseStageRepository extends JpaRepository<DiseaseStage, Long> {

    List<DiseaseStage> findByDiseaseId(Long diseaseId);

    List<DiseaseStage> findByDiseaseIdOrderByStageName(Long diseaseId);
}
