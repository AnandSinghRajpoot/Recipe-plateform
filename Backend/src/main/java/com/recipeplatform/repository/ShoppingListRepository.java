package com.recipeplatform.repository;

import com.recipeplatform.domain.ShoppingList;
import com.recipeplatform.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShoppingListRepository extends JpaRepository<ShoppingList, Long> {
    List<ShoppingList> findByUserOrderByCreatedAtDesc(User user);
}
