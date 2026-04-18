package com.recipeplatform.repository;

import com.recipeplatform.domain.MealPlan;
import com.recipeplatform.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MealPlanRepository extends JpaRepository<MealPlan, Long> {
    
    List<MealPlan> findByUser(User user);
    
    Optional<MealPlan> findByUserAndIsActiveTrue(User user);

    @Modifying
    @Query("UPDATE MealPlan m SET m.isActive = false WHERE m.user = :user")
    void deactivateAllPlansForUser(User user);
}
