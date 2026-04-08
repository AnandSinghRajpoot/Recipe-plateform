package com.recipeplatform.service;

import com.recipeplatform.dto.DiseaseDTO;
import com.recipeplatform.dto.DiseaseStageDTO;

import java.util.List;

public interface DiseaseService {

    /**
     * Get all diseases
     */
    List<DiseaseDTO> getAllDiseases();

    /**
     * Get disease by ID
     */
    DiseaseDTO getDiseaseById(Long id);

    /**
     * Get all stages for a specific disease
     */
    List<DiseaseStageDTO> getStagesByDiseaseId(Long diseaseId);

    /**
     * Create a new disease (admin function)
     */
    DiseaseDTO createDisease(DiseaseDTO diseaseDTO);

    /**
     * Update an existing disease (admin function)
     */
    DiseaseDTO updateDisease(Long id, DiseaseDTO diseaseDTO);

    /**
     * Delete a disease (admin function)
     */
    void deleteDisease(Long id);

    /**
     * Get diseases that have stages
     */
    List<DiseaseDTO> getDiseasesWithStages();
}
