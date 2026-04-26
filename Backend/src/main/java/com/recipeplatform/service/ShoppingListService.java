package com.recipeplatform.service;

import com.recipeplatform.domain.ShoppingList;
import com.recipeplatform.domain.User;
import com.recipeplatform.dto.shoppinglist.ShoppingListRequestDto;
import com.recipeplatform.dto.shoppinglist.ShoppingListResponseDto;

import java.util.List;

public interface ShoppingListService {
    ShoppingListResponseDto generateFromRecipes(List<Long> recipeIds, User user);
    ShoppingListResponseDto saveShoppingList(ShoppingListRequestDto request, User user);
    List<ShoppingListResponseDto> getUserShoppingLists(User user);
    void deleteShoppingList(Long id, User user);
    void toggleItem(Long listId, Long itemId, boolean isChecked, User user);
    ShoppingListResponseDto getShoppingList(Long id, User user);
    ShoppingListResponseDto mergeIntoList(Long id, List<ShoppingListResponseDto.ShoppingListItemDto> items, User user);
}
