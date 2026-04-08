package com.recipeplatform.repository;

import com.recipeplatform.domain.Disease;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DiseaseRepository extends JpaRepository<Disease, Long> {

    List<Disease> findByHasStages(Boolean hasStages);

    List<Disease> findByNameContainingIgnoreCase(String name);

    Optional<Disease> findByName(String name);

    boolean existsByName(String name);
}
