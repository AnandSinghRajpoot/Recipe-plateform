package com.recipeplatform.dto.shoppinglist;

import com.recipeplatform.domain.enums.IngredientCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShoppingListRequestDto {
    private String name;
    private List<ItemRequestDto> items;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ItemRequestDto {
        private String ingredientName;
        private Double quantity;
        private String unit;
        private IngredientCategory category;
        private Long ingredientId;
    }
}
