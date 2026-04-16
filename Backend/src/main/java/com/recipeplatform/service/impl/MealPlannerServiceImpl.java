package com.recipeplatform.service.impl;

import com.recipeplatform.domain.MealPlannerItem;
import com.recipeplatform.domain.MealPlannerPlan;
import com.recipeplatform.domain.Recipe;
import com.recipeplatform.domain.User;
import com.recipeplatform.dto.planner.MealPlanDetailsDTO;
import com.recipeplatform.dto.planner.MealPlannerRequestDTO;
import com.recipeplatform.dto.planner.MealPlannerResponseDTO;
import com.recipeplatform.mapper.RecipeMapper;
import com.recipeplatform.repository.MealPlannerPlanRepository;
import com.recipeplatform.repository.MealPlannerRepository;
import com.recipeplatform.repository.RecipeRepository;
import com.recipeplatform.repository.UserRepository;
import com.recipeplatform.service.MealPlannerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MealPlannerServiceImpl implements MealPlannerService {

    private final MealPlannerRepository mealPlannerRepository;
    private final MealPlannerPlanRepository mealPlannerPlanRepository;
    private final RecipeRepository recipeRepository;
    private final UserRepository userRepository;
    private final RecipeMapper recipeMapper;

    @Override
    @Transactional
    public MealPlannerResponseDTO addMealToPlanner(Long userId, MealPlannerRequestDTO request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        MealPlannerPlan plan = mealPlannerPlanRepository.findById(request.getPlanId())
                .orElseThrow(() -> new RuntimeException("Meal plan not found"));

        if (!plan.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized to add to this meal plan");
        }

        Recipe recipe = recipeRepository.findById(request.getRecipeId())
                .orElseThrow(() -> new RuntimeException("Recipe not found"));

        // Check if a meal already exists for this slot and remove it if so (MVP logic)
        Optional<MealPlannerItem> existing = mealPlannerRepository.findByPlanIdAndDayOfWeekAndMealType(plan.getId(), request.getDayOfWeek(), request.getMealType());
        existing.ifPresent(mealPlannerRepository::delete);

        MealPlannerItem item = MealPlannerItem.builder()
                .user(user)
                .plan(plan)
                .recipe(recipe)
                .dayOfWeek(request.getDayOfWeek())
                .mealType(request.getMealType())
                .build();

        item = mealPlannerRepository.save(item);
        return mapToDTO(item);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MealPlannerResponseDTO> getMealPlanner(Long planId) {
        return mealPlannerRepository.findByPlanId(planId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void removeMealFromPlanner(Long userId, Long mealPlannerItemId) {
        MealPlannerItem item = mealPlannerRepository.findById(mealPlannerItemId)
                .orElseThrow(() -> new RuntimeException("Meal planner item not found"));

        if (!item.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized to remove this meal planner item");
        }

        mealPlannerRepository.delete(item);
    }

    @Override
    @Transactional
    public MealPlanDetailsDTO createPlan(Long userId, String name, String description) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        MealPlannerPlan plan = MealPlannerPlan.builder()
                .name(name)
                .description(description)
                .user(user)
                .build();

        plan = mealPlannerPlanRepository.save(plan);
        return mapPlanToDTO(plan);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MealPlanDetailsDTO> getPlansForUser(Long userId) {
        return mealPlannerPlanRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapPlanToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deletePlan(Long userId, Long planId) {
        MealPlannerPlan plan = mealPlannerPlanRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Meal plan not found"));

        if (!plan.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized to delete this meal plan");
        }

        mealPlannerPlanRepository.delete(plan);
    }

    private MealPlanDetailsDTO mapPlanToDTO(MealPlannerPlan plan) {
        return MealPlanDetailsDTO.builder()
                .id(plan.getId())
                .name(plan.getName())
                .description(plan.getDescription())
                .createdAt(plan.getCreatedAt())
                .build();
    }

    private MealPlannerResponseDTO mapToDTO(MealPlannerItem item) {
        return MealPlannerResponseDTO.builder()
                .id(item.getId())
                .dayOfWeek(item.getDayOfWeek())
                .mealType(item.getMealType())
                .recipe(recipeMapper.toResponseDTO(item.getRecipe()))
                .build();
    }
}
