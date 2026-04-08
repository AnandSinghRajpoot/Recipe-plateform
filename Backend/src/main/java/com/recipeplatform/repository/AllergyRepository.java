package com.recipeplatform.repository;

import com.recipeplatform.domain.Allergy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AllergyRepository extends JpaRepository<Allergy, Long> {

    List<Allergy> findByNameContainingIgnoreCase(String name);

    Optional<Allergy> findByName(String name);

    boolean existsByName(String name);
}
