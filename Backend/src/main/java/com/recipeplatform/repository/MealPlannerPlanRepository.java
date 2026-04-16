package com.recipeplatform.repository;

import com.recipeplatform.domain.MealPlannerPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MealPlannerPlanRepository extends JpaRepository<MealPlannerPlan, Long> {
    List<MealPlannerPlan> findByUserIdOrderByCreatedAtDesc(Long userId);
}
