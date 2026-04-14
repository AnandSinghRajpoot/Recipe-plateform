package com.recipeplatform.repository;

import com.recipeplatform.domain.User;
import com.recipeplatform.domain.enums.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User,Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByEmailOrPhoneNumber(String email, String phoneNumber);

    boolean existsByEmail(String email);

    List<User> findAllByRole(UserRole role);

    @Modifying
    @Transactional
    @Query(value = "UPDATE user SET diet_type = 'VEG' WHERE diet_type = 'VEGETARIAN'", nativeQuery = true)
    int migrateVegetarianToVeg();

    @Modifying
    @Transactional
    @Query(value = "UPDATE recipe SET diet_type = 'VEG' WHERE diet_type = 'VEGETARIAN'", nativeQuery = true)
    int migrateRecipeVegetarianToVeg();
}
