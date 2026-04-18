package com.recipeplatform.service.impl;

import com.recipeplatform.domain.*;
import com.recipeplatform.domain.enums.MealPlanGoal;
import com.recipeplatform.domain.enums.MealType;
import com.recipeplatform.dto.meal.*;
import com.recipeplatform.dto.recipe.NutritionDTO;
import com.recipeplatform.dto.recipe.RecipeResponseDTO;
import com.recipeplatform.exception.ResourceNotFoundException;
import com.recipeplatform.repository.*;
import com.recipeplatform.service.MealPlanService;
import com.recipeplatform.service.RecommendationEngine;
import com.recipeplatform.dto.RecipeRecommendationDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MealPlanServiceImpl implements MealPlanService {

    private final MealPlanRepository mealPlanRepository;
    private final MealPlanDayRepository mealPlanDayRepository;
    private final MealSlotRepository mealSlotRepository;
    private final UserRepository userRepository;
    private final RecipeRepository recipeRepository;
    private final RecommendationEngine recommendationEngine;

    @Override
    @Transactional
    public MealPlanResponseDTO createPlan(Long userId, String name, String description, String goal) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        MealPlan mealPlan = MealPlan.builder()
                .name(name)
                .description(description)
                .user(user)
                .goal(goal != null ? MealPlanGoal.valueOf(goal) : null)
                .isActive(false)
                .days(new ArrayList<>())
                .build();

        // Auto-generate 7 days
        Arrays.stream(DayOfWeek.values()).forEach(dayOfWeek -> {
            MealPlanDay day = MealPlanDay.builder()
                    .dayOfWeek(dayOfWeek)
                    .mealPlan(mealPlan)
                    .slots(new ArrayList<>())
                    .build();
            mealPlan.getDays().add(day);
        });

        MealPlan savedPlan = mealPlanRepository.save(mealPlan);
        return mapToDTO(savedPlan);
    }

    @Override
    public MealPlanResponseDTO getPlanById(Long planId) {
        MealPlan plan = mealPlanRepository.findById(planId)
                .orElseThrow(() -> new ResourceNotFoundException("Plan not found"));
        return mapToDTO(plan);
    }

    @Override
    public List<MealPlanResponseDTO> getUserPlans(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return mealPlanRepository.findByUser(user).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deletePlan(Long userId, Long planId) {
        MealPlan plan = mealPlanRepository.findById(planId)
                .orElseThrow(() -> new ResourceNotFoundException("Plan not found"));
        
        if (!plan.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized to delete this plan");
        }
        
        mealPlanRepository.delete(plan);
    }

    @Override
    @Transactional
    public void activatePlan(Long userId, Long planId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        MealPlan plan = mealPlanRepository.findById(planId)
                .orElseThrow(() -> new ResourceNotFoundException("Plan not found"));

        if (!plan.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized to activate this plan");
        }

        // Deactivate all others
        mealPlanRepository.deactivateAllPlansForUser(user);
        
        // Activate this one
        plan.setIsActive(true);
        mealPlanRepository.save(plan);
    }

    @Override
    @Transactional
    public MealPlanResponseDTO addMealToSlot(Long userId, Long planId, DayOfWeek dayOfWeek, MealType mealType, Long recipeId) {
        MealPlan plan = mealPlanRepository.findById(planId)
                .orElseThrow(() -> new ResourceNotFoundException("Plan not found"));

        if (!plan.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized to modify this plan");
        }

        MealPlanDay day = mealPlanDayRepository.findByMealPlanIdAndDayOfWeek(planId, dayOfWeek)
                .orElseThrow(() -> new ResourceNotFoundException("Day not found in plan"));

        Recipe recipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new ResourceNotFoundException("Recipe not found"));

        // Check if slot already exists
        MealSlot slot = mealSlotRepository.findByDayIdAndMealType(day.getId(), mealType)
                .orElse(MealSlot.builder().day(day).mealType(mealType).build());

        slot.setRecipe(recipe);
        mealSlotRepository.save(slot);

        return mapToDTO(plan);
    }

    @Override
    @Transactional
    public void removeMealFromSlot(Long userId, Long slotId) {
        MealSlot slot = mealSlotRepository.findById(slotId)
                .orElseThrow(() -> new ResourceNotFoundException("Slot not found"));

        if (!slot.getDay().getMealPlan().getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized to modify this plan");
        }

        mealSlotRepository.delete(slot);
    }

    @Override
    @Transactional
    public MealPlanResponseDTO autoFillDay(Long userId, Long planId, DayOfWeek dayOfWeek) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        MealPlan plan = mealPlanRepository.findById(planId)
                .orElseThrow(() -> new ResourceNotFoundException("Plan not found"));

        if (!plan.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized to modify this plan");
        }

        MealPlanDay day = mealPlanDayRepository.findByMealPlanIdAndDayOfWeek(planId, dayOfWeek)
                .orElseThrow(() -> new ResourceNotFoundException("Day not found in plan"));

        // To avoid duplicates in the same day and prioritize unique ones across the week
        java.util.Set<Long> dayRecipeIds = day.getSlots().stream()
                .map(slot -> slot.getRecipe() != null ? slot.getRecipe().getId() : null)
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.toSet());

        // Get all recipe IDs in the entire plan to avoid week-wide repetition if possible
        java.util.Set<Long> entirePlanRecipeIds = plan.getDays().stream()
                .flatMap(d -> d.getSlots().stream())
                .map(slot -> slot.getRecipe() != null ? slot.getRecipe().getId() : null)
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.toSet());

        for (MealType type : MealType.values()) {
            boolean slotExists = day.getSlots().stream().anyMatch(s -> s.getMealType() == type && s.getRecipe() != null);
            if (!slotExists) {
                // Get a larger pool of recommendations
                List<RecipeRecommendationDTO> recs = recommendationEngine.getByMealType(userId, type, 20);
                
                // Shuffle the pool for variety
                java.util.Collections.shuffle(recs);

                // Priority 1: Not in entire plan
                RecipeRecommendationDTO selected = recs.stream()
                        .filter(r -> !entirePlanRecipeIds.contains(r.getId()))
                        .findFirst()
                        .orElse(null);

                // Priority 2: Fallback to not in current day if no new ones available
                if (selected == null) {
                    selected = recs.stream()
                        .filter(r -> !dayRecipeIds.contains(r.getId()))
                        .findFirst()
                        .orElse(null);
                }

                if (selected != null) {
                    Recipe recipe = recipeRepository.findById(selected.getId()).orElse(null);
                    if (recipe != null) {
                        MealSlot slot = mealSlotRepository.findByDayIdAndMealType(day.getId(), type)
                                .orElse(MealSlot.builder().day(day).mealType(type).build());
                        slot.setRecipe(recipe);
                        mealSlotRepository.save(slot);
                        dayRecipeIds.add(recipe.getId());
                        entirePlanRecipeIds.add(recipe.getId());
                    }
                }
            }
        }

        return mapToDTO(plan);
    }

    private MealPlanResponseDTO mapToDTO(MealPlan plan) {
        return MealPlanResponseDTO.builder()
                .id(plan.getId())
                .name(plan.getName())
                .description(plan.getDescription())
                .goal(plan.getGoal())
                .isActive(plan.getIsActive())
                .createdAt(plan.getCreatedAt())
                .days(plan.getDays().stream().map(this::mapDayToDTO).collect(Collectors.toList()))
                .build();
    }

    private MealPlanDayDTO mapDayToDTO(MealPlanDay day) {
        return MealPlanDayDTO.builder()
                .id(day.getId())
                .dayOfWeek(day.getDayOfWeek())
                .slots(day.getSlots().stream().map(this::mapSlotToDTO).collect(Collectors.toList()))
                .build();
    }

    private MealSlotDTO mapSlotToDTO(MealSlot slot) {
        return MealSlotDTO.builder()
                .id(slot.getId())
                .mealType(slot.getMealType())
                .recipe(mapRecipeToDTO(slot.getRecipe()))
                .build();
    }

    private RecipeResponseDTO mapRecipeToDTO(Recipe recipe) {
        if (recipe == null) return null;
        return RecipeResponseDTO.builder()
                .id(recipe.getId())
                .title(recipe.getTitle())
                .coverImageUrl(recipe.getCoverImageUrl())
                .prepTime(recipe.getPrepTime())
                .cookTime(recipe.getCookTime())
                .difficulty(recipe.getDifficulty())
                .dietType(recipe.getDietType())
                .nutrition(recipe.getNutrition() != null ? NutritionDTO.builder()
                        .calories(recipe.getNutrition().getCalories())
                        .protein(recipe.getNutrition().getProtein())
                        .carbs(recipe.getNutrition().getCarbs())
                        .fat(recipe.getNutrition().getFat())
                        .build() : null)
                .build();
    }
}
