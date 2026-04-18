package com.recipeplatform.repository;

import com.recipeplatform.domain.MealPlanDay;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.DayOfWeek;
import java.util.Optional;

@Repository
public interface MealPlanDayRepository extends JpaRepository<MealPlanDay, Long> {
    Optional<MealPlanDay> findByMealPlanIdAndDayOfWeek(Long mealPlanId, DayOfWeek dayOfWeek);
}
