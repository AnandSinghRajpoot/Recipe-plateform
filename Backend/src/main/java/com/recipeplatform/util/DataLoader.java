package com.recipeplatform.util;

import com.recipeplatform.domain.Ingredient;
import com.recipeplatform.domain.User;
import com.recipeplatform.domain.enums.UserRole;
import com.recipeplatform.repository.IngredientRepository;
import com.recipeplatform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class DataLoader implements CommandLineRunner {

    private final UserRepository userRepository;
    private final IngredientRepository ingredientRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        createAdminUsers();
        loadIngredients();
    }

    private void createAdminUsers() {

        if (userRepository.existsByEmail(("admin1@recipe.com"))) {
            return;
        }

        User admin1 = new User();
        admin1.setName("Admin One");
        admin1.setEmail("admin1@recipe.com");
        admin1.setPassword(passwordEncoder.encode("Admin@123"));
        admin1.setRole(UserRole.ADMIN);


        User admin2 = new User();
        admin2.setName("Admin Two");
        admin2.setEmail("admin2@recipe.com");
        admin2.setPassword(passwordEncoder.encode("Admin@123"));
        admin2.setRole(UserRole.ADMIN);

        userRepository.saveAll(List.of(admin1, admin2));
    }

    private void loadIngredients() {

        List<String> ingredients = List.of(
                "Onion", "Tomato", "Garlic", "Ginger",
                "Salt", "Sugar", "Oil", "Butter", "Paneer"
        );

        for (String name : ingredients) {
            if (!ingredientRepository.existsByNameIgnoreCase(name)) {
                Ingredient ingredient = new Ingredient();
                ingredient.setName(name);
                ingredientRepository.save(ingredient);
            }
        }
    }
}
