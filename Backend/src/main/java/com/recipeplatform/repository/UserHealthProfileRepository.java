package com.recipeplatform.repository;

import com.recipeplatform.domain.UserHealthProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserHealthProfileRepository extends JpaRepository<UserHealthProfile, Long> {

    Optional<UserHealthProfile> findByUserId(Long userId);

    boolean existsByUserId(Long userId);

    void deleteByUserId(Long userId);
}
