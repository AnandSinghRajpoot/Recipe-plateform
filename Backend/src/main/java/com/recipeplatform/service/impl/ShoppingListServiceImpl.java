package com.recipeplatform.service.impl;

import com.recipeplatform.domain.*;
import com.recipeplatform.domain.enums.IngredientCategory;
import com.recipeplatform.dto.shoppinglist.ShoppingListRequestDto;
import com.recipeplatform.dto.shoppinglist.ShoppingListResponseDto;
import com.recipeplatform.repository.IngredientRepository;
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
    private final IngredientRepository ingredientRepository;

    @Override
    @Transactional(readOnly = true)
    public ShoppingListResponseDto generateFromRecipes(List<Long> recipeIds, User user) {
        List<Recipe> recipes = recipeRepository.findAllById(recipeIds);
        
        // key: ingredientName|normalizedUnit
        Map<String, AggregatedItem> aggregationMap = new HashMap<>();

        for (Recipe recipe : recipes) {
            if (recipe.getIngredients() == null) continue;
            
            for (RecipeIngredient ri : recipe.getIngredients()) {
                if (ri.getIngredient() == null) continue;
                
                String name = ri.getIngredient().getName() != null ? ri.getIngredient().getName().toLowerCase().trim() : "Unknown Ingredient";
                String unit = ri.getUnit() != null ? ri.getUnit().name() : "PIECE";
                double qty = ri.getQuantity();
                
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

        String listName = recipes.isEmpty() ? "New Shopping List" : 
                recipes.get(0).getTitle() + (recipes.size() > 1 ? " & " + (recipes.size() - 1) + " more" : "");

        return ShoppingListResponseDto.builder()
                .name(listName)
                .items(items)
                .groupedItems(items.stream().collect(Collectors.groupingBy(i -> i.getCategory() != null ? i.getCategory() : IngredientCategory.OTHERS)))
                .build();
    }

    @Override
    @Transactional
    public ShoppingListResponseDto saveShoppingList(ShoppingListRequestDto request, User user) {
        ShoppingList shoppingList = ShoppingList.builder()
                .name(request.getName())
                .user(user)
                .createdAt(java.time.LocalDateTime.now()) // Explicitly set
                .build();
        
        if (request.getItems() != null) {
            List<ShoppingListItem> items = request.getItems().stream()
                    .map(itemDto -> {
                        ShoppingListItem item = ShoppingListItem.builder()
                            .shoppingList(shoppingList)
                            .ingredientName(itemDto.getIngredientName())
                            .quantity(itemDto.getQuantity())
                            .unit(itemDto.getUnit())
                            .category(itemDto.getCategory())
                            .isChecked(false)
                            .build();
                        
                        if (itemDto.getIngredientId() != null) {
                            ingredientRepository.findById(itemDto.getIngredientId()).ifPresent(item::setIngredient);
                        }
                        return item;
                    })
                    .collect(Collectors.toList());
            shoppingList.setItems(items);
        }
        
        ShoppingList saved = shoppingListRepository.save(shoppingList);
        shoppingListRepository.flush();
        return mapToResponseDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ShoppingListResponseDto> getUserShoppingLists(User user) {
        List<ShoppingList> lists = shoppingListRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        System.out.println("DEBUG: Found " + lists.size() + " shopping lists for user ID: " + user.getId());
        return lists.stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ShoppingListResponseDto getShoppingList(Long id, User user) {
        ShoppingList list = shoppingListRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("List not found"));
        if (!list.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        return mapToResponseDto(list);
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

    @Override
    @Transactional
    public ShoppingListResponseDto mergeIntoList(Long id, List<ShoppingListResponseDto.ShoppingListItemDto> items, User user) {
        ShoppingList list = shoppingListRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("List not found"));
        if (!list.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        // We build a map of existing items, but we normalize their units for matching
        Map<String, ShoppingListItem> existingMap = new HashMap<>();
        for (ShoppingListItem existing : list.getItems()) {
            NormalizationResult norm = normalize(existing.getQuantity(), existing.getUnit());
            String key = existing.getIngredientName().toLowerCase().trim() + "|" + norm.unit;
            
            if (existingMap.containsKey(key)) {
                ShoppingListItem inMap = existingMap.get(key);
                NormalizationResult inMapNorm = normalize(inMap.getQuantity(), inMap.getUnit());
                inMap.setQuantity(inMapNorm.quantity + norm.quantity);
                inMap.setUnit(inMapNorm.unit);
            } else {
                existing.setQuantity(norm.quantity);
                existing.setUnit(norm.unit);
                existingMap.put(key, existing);
            }
        }

        for (ShoppingListResponseDto.ShoppingListItemDto newItem : items) {
            NormalizationResult normNew = normalize(newItem.getQuantity(), newItem.getUnit());
            String key = newItem.getIngredientName().toLowerCase().trim() + "|" + normNew.unit;
            
            if (existingMap.containsKey(key)) {
                ShoppingListItem existing = existingMap.get(key);
                existing.setQuantity(existing.getQuantity() + normNew.quantity);
                existing.setIsChecked(false);
            } else {
                ShoppingListItem item = ShoppingListItem.builder()
                        .shoppingList(list)
                        .ingredientName(newItem.getIngredientName())
                        .quantity(normNew.quantity)
                        .unit(normNew.unit)
                        .category(newItem.getCategory())
                        .isChecked(false)
                        .build();
                if (newItem.getIngredientId() != null) {
                    ingredientRepository.findById(newItem.getIngredientId()).ifPresent(item::setIngredient);
                }
                list.getItems().add(item);
                existingMap.put(key, item);
            }
        }

        // Final pass: make units readable
        for (ShoppingListItem item : list.getItems()) {
            NormalizationResult readable = denormalize(item.getQuantity(), item.getUnit());
            item.setQuantity(readable.quantity);
            item.setUnit(readable.unit);
        }

        ShoppingList saved = shoppingListRepository.save(list);
        shoppingListRepository.flush();
        return mapToResponseDto(saved);
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
        NormalizationResult readable = denormalize(item.quantity, item.unit);
        return ShoppingListResponseDto.ShoppingListItemDto.builder()
                .ingredientName(item.name)
                .quantity(readable.quantity)
                .unit(readable.unit)
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

    private NormalizationResult normalize(double q, String unit) {
        if (unit == null) return new NormalizationResult(q, "PIECE");
        String u = unit.toUpperCase().trim();
        
        switch (u) {
            case "KG":
            case "KILOGRAM":
            case "KILOGRAMS":
                return new NormalizationResult(q * 1000, "GRAM");
            case "G":
            case "GRAMS":
                return new NormalizationResult(q, "GRAM");
            case "L":
            case "LITER":
            case "LITERS":
                return new NormalizationResult(q * 1000, "ML");
            case "MILLILITER":
            case "ML":
                return new NormalizationResult(q, "ML");
            case "UNITS":
            case "EACH":
            case "PIECE":
            case "PIECES":
                return new NormalizationResult(q, "PIECE");
            default:
                return new NormalizationResult(q, u);
        }
    }

    private NormalizationResult denormalize(double q, String unit) {
        if (unit == null) return new NormalizationResult(q, "PIECE");
        String u = unit.toUpperCase().trim();

        if ("GRAM".equals(u) && q >= 1000) {
            return new NormalizationResult(q / 1000, "KG");
        }
        if ("ML".equals(u) && q >= 1000) {
            return new NormalizationResult(q / 1000, "L");
        }
        return new NormalizationResult(q, unit);
    }
}
