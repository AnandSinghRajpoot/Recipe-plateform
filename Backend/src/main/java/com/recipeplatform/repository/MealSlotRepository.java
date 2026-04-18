package com.recipeplatform.repository;

import com.recipeplatform.domain.MealSlot;
import com.recipeplatform.domain.enums.MealType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MealSlotRepository extends JpaRepository<MealSlot, Long> {
    Optional<MealSlot> findByDayIdAndMealType(Long dayId, MealType mealType);
}
