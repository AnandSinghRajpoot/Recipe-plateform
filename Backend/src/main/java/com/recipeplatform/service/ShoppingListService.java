package com.recipeplatform.service;

import com.recipeplatform.domain.ShoppingList;
import com.recipeplatform.domain.User;
import com.recipeplatform.dto.shoppinglist.ShoppingListResponseDto;

import java.util.List;

public interface ShoppingListService {
    ShoppingListResponseDto generateFromRecipes(List<Long> recipeIds, User user);
    ShoppingListResponseDto saveShoppingList(ShoppingList shoppingList, User user);
    List<ShoppingListResponseDto> getUserShoppingLists(User user);
    void deleteShoppingList(Long id, User user);
    void toggleItem(Long listId, Long itemId, boolean isChecked, User user);
}
