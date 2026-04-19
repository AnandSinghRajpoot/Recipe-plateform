package com.recipeplatform.dto.shoppinglist;

import com.recipeplatform.domain.enums.IngredientCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShoppingListResponseDto {
    private Long id;
    private String name;
    private LocalDateTime createdAt;
    private List<ShoppingListItemDto> items;
    private Map<IngredientCategory, List<ShoppingListItemDto>> groupedItems;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ShoppingListItemDto {
        private Long id;
        private String ingredientName;
        private Double quantity;
        private String unit;
        private IngredientCategory category;
        private Boolean isChecked;
        private Long ingredientId;
    }
}
