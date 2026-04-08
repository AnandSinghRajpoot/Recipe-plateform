package com.recipeplatform.service;

import com.recipeplatform.dto.AllergyDTO;

import java.util.List;

public interface AllergyService {

    /**
     * Get all allergies
     */
    List<AllergyDTO> getAllAllergies();

    /**
     * Get allergy by ID
     */
    AllergyDTO getAllergyById(Long id);

    /**
     * Create a new allergy (admin function)
     */
    AllergyDTO createAllergy(AllergyDTO allergyDTO);

    /**
     * Update an existing allergy (admin function)
     */
    AllergyDTO updateAllergy(Long id, AllergyDTO allergyDTO);

    /**
     * Delete an allergy (admin function)
     */
    void deleteAllergy(Long id);
}
