package com.recipeplatform.service.impl;

import com.recipeplatform.domain.*;
import com.recipeplatform.domain.enums.IngredientCategory;
import com.recipeplatform.dto.shoppinglist.ShoppingListResponseDto;
import com.recipeplatform.repository.RecipeRepository;
import com.recipeplatform.repository.ShoppingListRepository;
import com.recipeplatform.service.ShoppingListService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ShoppingListServiceImpl implements ShoppingListService {

    private final ShoppingListRepository shoppingListRepository;
    private final RecipeRepository recipeRepository;

    @Override
    @Transactional(readOnly = true)
    public ShoppingListResponseDto generateFromRecipes(List<Long> recipeIds, User user) {
        List<Recipe> recipes = recipeRepository.findAllById(recipeIds);
        
        // key: ingredientName|normalizedUnit
        Map<String, AggregatedItem> aggregationMap = new HashMap<>();

        for (Recipe recipe : recipes) {
            for (RecipeIngredient ri : recipe.getIngredients()) {
                String name = ri.getIngredient().getName().toLowerCase().trim();
                String unit = ri.getUnit() != null ? ri.getUnit().name() : "PIECE";
                Double qty = ri.getQuantity();
                
                // Normalization Logic
                NormalizationResult normalized = normalize(qty, unit);
                String key = name + "|" + normalized.unit;

                AggregatedItem item = aggregationMap.getOrDefault(key, new AggregatedItem(name, normalized.unit, ri.getIngredient()));
                item.quantity += normalized.quantity;
                aggregationMap.put(key, item);
            }
        }

        List<ShoppingListResponseDto.ShoppingListItemDto> items = aggregationMap.values().stream()
                .map(this::toDto)
                .collect(Collectors.toList());

        return ShoppingListResponseDto.builder()
                .name("New Shopping List")
                .items(items)
                .groupedItems(items.stream().collect(Collectors.groupingBy(i -> i.getCategory() != null ? i.getCategory() : IngredientCategory.OTHERS)))
                .build();
    }

    @Override
    @Transactional
    public ShoppingListResponseDto saveShoppingList(ShoppingList shoppingList, User user) {
        shoppingList.setUser(user);
        // Ensure bidirectional link
        if (shoppingList.getItems() != null) {
            shoppingList.getItems().forEach(item -> item.setShoppingList(shoppingList));
        }
        ShoppingList saved = shoppingListRepository.save(shoppingList);
        return mapToResponseDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ShoppingListResponseDto> getUserShoppingLists(User user) {
        return shoppingListRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteShoppingList(Long id, User user) {
        ShoppingList list = shoppingListRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("List not found"));
        if (!list.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        shoppingListRepository.delete(list);
    }

    @Override
    @Transactional
    public void toggleItem(Long listId, Long itemId, boolean isChecked, User user) {
        ShoppingList list = shoppingListRepository.findById(listId)
                .orElseThrow(() -> new RuntimeException("List not found"));
        if (!list.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        
        list.getItems().stream()
                .filter(item -> item.getId().equals(itemId))
                .findFirst()
                .ifPresent(item -> item.setIsChecked(isChecked));
        
        shoppingListRepository.save(list);
    }

    private ShoppingListResponseDto mapToResponseDto(ShoppingList list) {
        List<ShoppingListResponseDto.ShoppingListItemDto> items = list.getItems().stream()
                .map(item -> ShoppingListResponseDto.ShoppingListItemDto.builder()
                        .id(item.getId())
                        .ingredientName(item.getIngredientName())
                        .quantity(item.getQuantity())
                        .unit(item.getUnit())
                        .category(item.getCategory())
                        .isChecked(item.getIsChecked())
                        .ingredientId(item.getIngredient() != null ? item.getIngredient().getId() : null)
                        .build())
                .collect(Collectors.toList());

        return ShoppingListResponseDto.builder()
                .id(list.getId())
                .name(list.getName())
                .createdAt(list.getCreatedAt())
                .items(items)
                .groupedItems(items.stream().collect(Collectors.groupingBy(i -> i.getCategory() != null ? i.getCategory() : IngredientCategory.OTHERS)))
                .build();
    }

    private ShoppingListResponseDto.ShoppingListItemDto toDto(AggregatedItem item) {
        return ShoppingListResponseDto.ShoppingListItemDto.builder()
                .ingredientName(item.name)
                .quantity(item.quantity)
                .unit(item.unit)
                .category(item.ingredient != null ? item.ingredient.getCategory() : IngredientCategory.OTHERS)
                .isChecked(false)
                .ingredientId(item.ingredient != null ? item.ingredient.getId() : null)
                .build();
    }

    // --- Helper Classes for aggregation ---
    private static class AggregatedItem {
        String name;
        String unit;
        Double quantity = 0.0;
        Ingredient ingredient;

        AggregatedItem(String name, String unit, Ingredient ingredient) {
            this.name = name;
            this.unit = unit;
            this.ingredient = ingredient;
        }
    }

    private static class NormalizationResult {
        Double quantity;
        String unit;
        NormalizationResult(Double q, String u) { this.quantity = q; this.unit = u; }
    }

    private NormalizationResult normalize(Double qty, String unit) {
        if (unit == null) return new NormalizationResult(qty, "PIECE");
        String u = unit.toUpperCase();
        
        // Weight normalization (to GRAMS)
        if (u.equals("KG") || u.equals("KILOGRAM")) return new NormalizationResult(qty * 1000, "GRAM");
        if (u.equals("G") || u.equals("GRAMS")) return new NormalizationResult(qty, "GRAM");
        
        // Volume normalization (to MILLILITERS)
        if (u.equals("L") || u.equals("LITER")) return new NormalizationResult(qty * 1000, "ML");
        if (u.equals("MILLILITER")) return new NormalizationResult(qty, "ML");
        
        // Count normalization
        if (u.equals("UNITS") || u.equals("EACH")) return new NormalizationResult(qty, "PIECE");
        
        return new NormalizationResult(qty, u);
    }
}
