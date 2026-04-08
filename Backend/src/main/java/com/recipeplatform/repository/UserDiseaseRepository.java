package com.recipeplatform.repository;

import com.recipeplatform.domain.UserDisease;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserDiseaseRepository extends JpaRepository<UserDisease, Long> {

    List<UserDisease> findByUserHealthProfileId(Long userHealthProfileId);

    void deleteByUserHealthProfileIdAndDiseaseId(Long userHealthProfileId, Long diseaseId);

    boolean existsByUserHealthProfileIdAndDiseaseId(Long userHealthProfileId, Long diseaseId);
}
