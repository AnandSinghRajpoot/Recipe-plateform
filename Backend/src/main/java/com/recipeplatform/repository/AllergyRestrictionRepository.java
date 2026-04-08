package com.recipeplatform.repository;

import com.recipeplatform.domain.AllergyRestriction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AllergyRestrictionRepository extends JpaRepository<AllergyRestriction, Long> {

    List<AllergyRestriction> findByAllergyId(Long allergyId);

    /**
     * Find all restrictions for a list of allergy IDs.
     * Used to get all forbidden ingredients for a user's allergies.
     */
    @Query("SELECT ar FROM AllergyRestriction ar WHERE ar.allergy.id IN :allergyIds")
    List<AllergyRestriction> findByAllergyIdIn(@Param("allergyIds") List<Long> allergyIds);
}
