package com.recipeplatform.repository;

import com.recipeplatform.domain.MealPlannerItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.DayOfWeek;
import java.util.List;
import java.util.Optional;

@Repository
public interface MealPlannerRepository extends JpaRepository<MealPlannerItem, Long> {

    List<MealPlannerItem> findByPlanId(Long planId);

    Optional<MealPlannerItem> findByPlanIdAndDayOfWeekAndMealType(
        Long planId, 
        java.time.DayOfWeek dayOfWeek, 
        com.recipeplatform.domain.enums.MealType mealType
    );

    void deleteByPlanIdAndDayOfWeekAndMealType(
        Long planId, 
        java.time.DayOfWeek dayOfWeek, 
        com.recipeplatform.domain.enums.MealType mealType
    );
}
