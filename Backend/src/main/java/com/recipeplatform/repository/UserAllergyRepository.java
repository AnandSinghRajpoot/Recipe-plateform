package com.recipeplatform.repository;

import com.recipeplatform.domain.UserAllergy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserAllergyRepository extends JpaRepository<UserAllergy, Long> {

    List<UserAllergy> findByUserHealthProfileId(Long userHealthProfileId);

    void deleteByUserHealthProfileIdAndAllergyId(Long userHealthProfileId, Long allergyId);

    boolean existsByUserHealthProfileIdAndAllergyId(Long userHealthProfileId, Long allergyId);
}
