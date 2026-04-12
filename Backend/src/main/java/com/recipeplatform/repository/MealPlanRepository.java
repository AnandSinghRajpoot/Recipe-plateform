package com.recipeplatform.repository;

import com.recipeplatform.domain.MealPlan;
import com.recipeplatform.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface MealPlanRepository extends JpaRepository<MealPlan, Long> {
    List<MealPlan> findByUserAndMealDateBetween(User user, LocalDate startDate, LocalDate endDate);
    List<MealPlan> findByUserAndMealDate(User user, LocalDate date);
}
