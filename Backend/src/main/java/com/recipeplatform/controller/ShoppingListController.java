package com.recipeplatform.controller;

import com.recipeplatform.domain.ShoppingList;
import com.recipeplatform.domain.User;
import com.recipeplatform.dto.ApiResponse;
import com.recipeplatform.dto.shoppinglist.ShoppingListRequestDto;
import com.recipeplatform.dto.shoppinglist.ShoppingListResponseDto;
import com.recipeplatform.repository.UserRepository;
import com.recipeplatform.service.ShoppingListService;
import jakarta.annotation.Nonnull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/shopping-lists")
@RequiredArgsConstructor
@Slf4j
public class ShoppingListController {

    private final ShoppingListService shoppingListService;
    private final UserRepository userRepository;

    @PostMapping("/generate")
    public ResponseEntity<ApiResponse<ShoppingListResponseDto>> generateList(@RequestBody Map<String, List<Long>> request, Authentication auth) {
        User user = userRepository.findByEmail(auth.getName()).orElseThrow();
        List<Long> recipeIds = request.get("recipeIds");
        if (recipeIds == null || recipeIds.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Recipe IDs are required", null));
        }
        return ResponseEntity.ok(ApiResponse.success("List generated", shoppingListService.generateFromRecipes(recipeIds, user)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ShoppingListResponseDto>> saveList(@RequestBody ShoppingListRequestDto request, @Nonnull Authentication auth) {
        User user = userRepository.findByEmail(auth.getName()).orElseThrow();
        return ResponseEntity.ok(ApiResponse.success("List saved", shoppingListService.saveShoppingList(request, user)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ShoppingListResponseDto>>> getUserLists(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName()).orElseThrow();
        return ResponseEntity.ok(ApiResponse.success("User lists", shoppingListService.getUserShoppingLists(user)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ShoppingListResponseDto>> getListById(@PathVariable Long id, Authentication auth) {
        User user = userRepository.findByEmail(auth.getName()).orElseThrow();
        return ResponseEntity.ok(ApiResponse.success("Shopping list retrieved", shoppingListService.getShoppingList(id, user)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteList(@PathVariable Long id, Authentication auth) {
        User user = userRepository.findByEmail(auth.getName()).orElseThrow();
        shoppingListService.deleteShoppingList(id, user);
        return ResponseEntity.ok(ApiResponse.success("List deleted", null));
    }

    @PatchMapping("/{listId}/items/{itemId}")
    public ResponseEntity<ApiResponse<Void>> toggleItem(@PathVariable Long listId, @PathVariable Long itemId, @RequestParam boolean isChecked, Authentication auth) {
        User user = userRepository.findByEmail(auth.getName()).orElseThrow();
        shoppingListService.toggleItem(listId, itemId, isChecked, user);
        return ResponseEntity.ok(ApiResponse.success("Item updated", null));
    }

    @PutMapping("/{id}/merge")
    public ResponseEntity<ApiResponse<ShoppingListResponseDto>> mergeIntoList(@PathVariable Long id, @RequestBody List<ShoppingListResponseDto.ShoppingListItemDto> items, Authentication auth) {
        User user = userRepository.findByEmail(auth.getName()).orElseThrow();
        return ResponseEntity.ok(ApiResponse.success("Items merged into list", shoppingListService.mergeIntoList(id, items, user)));
    }
}
