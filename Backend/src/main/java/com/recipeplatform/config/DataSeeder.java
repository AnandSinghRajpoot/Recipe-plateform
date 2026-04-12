package com.recipeplatform.config;

import com.recipeplatform.domain.Allergy;
import com.recipeplatform.domain.Disease;
import com.recipeplatform.domain.Recipe;
import com.recipeplatform.domain.User;
import com.recipeplatform.domain.enums.*;
import com.recipeplatform.repository.AllergyRepository;
import com.recipeplatform.repository.DiseaseRepository;
import com.recipeplatform.repository.RecipeRepository;
import com.recipeplatform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

/**
 * Seeds the database with standard reference data (diseases, allergies, sample recipes).
 * Runs on application startup; checks if data already exists before inserting.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements ApplicationRunner {

    private final DiseaseRepository diseaseRepository;
    private final AllergyRepository allergyRepository;
    private final RecipeRepository recipeRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        seedDiseases();
        seedAllergies();
        seedIndianRecipes();
    }

    // ==============================
    // 20 Standard Diseases
    // ==============================
    private void seedDiseases() {
        if (diseaseRepository.count() > 0) {
            log.info("Diseases already seeded — skipping.");
            return;
        }

        List<String[]> diseases = List.of(
            new String[]{"Type 1 Diabetes", "Autoimmune condition where the pancreas produces little to no insulin."},
            new String[]{"Type 2 Diabetes", "Metabolic disorder characterized by high blood sugar and insulin resistance."},
            new String[]{"Hypertension", "Chronically elevated blood pressure that increases the risk of heart disease and stroke."},
            new String[]{"Hyperlipidemia", "Elevated levels of lipids such as cholesterol and triglycerides in the blood."},
            new String[]{"Celiac Disease", "Autoimmune disorder triggered by gluten consumption causing intestinal damage."},
            new String[]{"Irritable Bowel Syndrome", "Functional GI disorder causing abdominal pain and altered bowel habits."},
            new String[]{"Crohn's Disease", "Inflammatory bowel disease causing inflammation of the digestive tract."},
            new String[]{"Gastroesophageal Reflux (GERD)", "Chronic condition where stomach acid frequently flows back into the esophagus."},
            new String[]{"Kidney Disease (CKD)", "Progressive loss of kidney function requiring dietary restriction of potassium and phosphorus."},
            new String[]{"Gout", "Form of arthritis caused by elevated uric acid levels, triggering painful joint inflammation."},
            new String[]{"Polycystic Ovary Syndrome (PCOS)", "Hormonal disorder causing enlarged ovaries and metabolic challenges."},
            new String[]{"Hypothyroidism", "Underactive thyroid gland resulting in reduced metabolic rate."},
            new String[]{"Iron Deficiency Anemia", "Low red blood cell production due to inadequate iron levels."},
            new String[]{"Lactose Intolerance", "Inability to digest lactose sugars found in dairy products."},
            new String[]{"Non-Alcoholic Fatty Liver Disease (NAFLD)", "Accumulation of fat in the liver not caused by alcohol consumption."},
            new String[]{"Osteoporosis", "Bone disease characterized by decreased bone density and increased fracture risk."},
            new String[]{"Heart Disease (CAD)", "Narrowing of coronary arteries due to plaque buildup, restricting blood flow."},
            new String[]{"Obesity / Metabolic Syndrome", "Cluster of conditions including excess body fat and increased risk of heart disease."},
            new String[]{"Ulcerative Colitis", "Inflammatory bowel disease causing ulcers in the inner lining of the large intestine."},
            new String[]{"Phenylketonuria (PKU)", "Inherited disorder causing buildup of phenylalanine; requires strict low-protein diet."}
        );

        diseases.forEach(d -> {
            if (!diseaseRepository.existsByName(d[0])) {
                Disease disease = new Disease();
                disease.setName(d[0]);
                disease.setDescription(d[1]);
                disease.setHasStages(false);
                diseaseRepository.save(disease);
            }
        });

        log.info("Seeded {} diseases.", diseaseRepository.count());
    }

    // ==============================
    // 15 Standard Allergies
    // ==============================
    private void seedAllergies() {
        if (allergyRepository.count() > 0) {
            log.info("Allergies already seeded — skipping.");
            return;
        }

        List<String[]> allergies = List.of(
            new String[]{"Peanuts", "Common legume allergy; can cause severe anaphylaxis."},
            new String[]{"Tree Nuts", "Includes walnuts, almonds, cashews; often cross-reactive."},
            new String[]{"Milk / Dairy", "Allergy to proteins in cow's milk; distinct from lactose intolerance."},
            new String[]{"Eggs", "Allergy to proteins found in egg whites or yolks."},
            new String[]{"Wheat / Gluten", "Allergy to wheat proteins; overlaps with Celiac disease sensitivity."},
            new String[]{"Soy", "Allergy to soy proteins commonly found in processed foods."},
            new String[]{"Fish", "Allergy to finned fish such as salmon, tuna, and tilapia."},
            new String[]{"Shellfish", "Allergy to shrimp, crab, lobster, and similar crustaceans."},
            new String[]{"Sesame", "Sesame seed allergy; legally required labeling in the US since 2023."},
            new String[]{"Mustard", "Allergy to mustard seeds or mustard-based condiments."},
            new String[]{"Sulfites / Sulphur Dioxide", "Sensitivity to preservatives used in wine, dried fruit, and processed foods."},
            new String[]{"Lupin", "Allergy to lupin flour/seeds; common in European baked goods."},
            new String[]{"Celery", "Allergy to celery stalks, seeds, or celeriac."},
            new String[]{"Molluscs", "Allergy to squid, octopus, scallops, oysters, mussels, and clams."},
            new String[]{"Latex-Fruit Syndrome", "Cross-reactivity between latex and fruits like banana, avocado, and kiwi."}
        );

        allergies.forEach(a -> {
            if (!allergyRepository.existsByName(a[0])) {
                Allergy allergy = new Allergy();
                allergy.setName(a[0]);
                allergy.setDescription(a[1]);
                allergyRepository.save(allergy);
            }
        });

        log.info("Seeded {} allergies.", allergyRepository.count());
    }

    // ==============================
    // 5 Indian Recipes with Chefs
    // ==============================
    private void seedIndianRecipes() {
        if (userRepository.existsByEmail("chef.sanjeev@recipehub.com")) {
            log.info("Indian recipes and chefs already seeded — skipping.");
            return;
        }

        // Create 2 Chef Accounts
        User chef1 = new User();
        chef1.setName("Chef Sanjeev");
        chef1.setEmail("chef.sanjeev@recipehub.com");
        chef1.setPassword(passwordEncoder.encode("password123"));
        chef1.setRole(UserRole.CHEF);
        chef1.setIsProfileCompleted(true);
        chef1.setBio("Expert in traditional Indian cuisine.");
        chef1.setDietType(DietType.NON_VEG);
        chef1.setSkillLevel(SkillLevel.INTERMEDIATE);
        chef1 = userRepository.save(chef1);

        User chef2 = new User();
        chef2.setName("Chef Vikas");
        chef2.setEmail("chef.vikas@recipehub.com");
        chef2.setPassword(passwordEncoder.encode("password123"));
        chef2.setRole(UserRole.CHEF);
        chef2.setIsProfileCompleted(true);
        chef2.setBio("Modern Indian culinary artist.");
        chef2.setDietType(DietType.VEGETARIAN);
        chef2.setSkillLevel(SkillLevel.EXPERT);
        chef2 = userRepository.save(chef2);

        // Fetch needed references
        Optional<Allergy> dairy = allergyRepository.findByName("Milk / Dairy");
        Optional<Allergy> gluten = allergyRepository.findByName("Wheat / Gluten");
        Optional<Disease> t2d = diseaseRepository.findByName("Type 2 Diabetes");
        Optional<Disease> htn = diseaseRepository.findByName("Hypertension");

        List<Recipe> indianRecipes = new ArrayList<>();

        // 1. Butter Chicken
        Recipe r1 = build(chef1, "Authentic Butter Chicken",
                "Tender chicken in a rich, creamy tomato gravy.",
                "1. Marinate chicken. 2. Grill. 3. Simmer in tomato and butter sauce.",
                DietType.NON_VEG, MealType.DINNER, CuisineType.INDIAN,
                20, 40, 4, 650.0, 30.0, 15.0, 45.0,
                allergenSet(dairy), diseaseSet());
        r1.setCoverImageUrl("http://localhost:8080/images/butter-chicken.jpg");
        indianRecipes.add(r1);

        // 2. Chicken Tikka Masala
        Recipe r2 = build(chef2, "Chicken Tikka Masala",
                "Classic roasted chicken chunks in a spicy sauce.",
                "1. Skewer and roast chicken. 2. Prepare onion-tomato gravy. 3. Mix and simmer.",
                DietType.NON_VEG, MealType.DINNER, CuisineType.INDIAN,
                20, 35, 4, 550.0, 35.0, 20.0, 35.0,
                allergenSet(dairy), diseaseSet());
        r2.setCoverImageUrl("http://localhost:8080/images/chicken-tikka-masala.jpg");
        indianRecipes.add(r2);

        // 3. Dal Khichdi
        Recipe r3 = build(chef1, "Dal Khichdi",
                "Comforting one-pot dish made with rice and lentils.",
                "1. Wash rice and dal. 2. Pressure cook with turmeric and salt. 3. Temper with ghee and cumin.",
                DietType.VEGETARIAN, MealType.LUNCH, CuisineType.INDIAN,
                10, 20, 3, 300.0, 12.0, 50.0, 8.0,
                allergenSet(dairy), diseaseSet(htn, t2d));
        r3.setCoverImageUrl("http://localhost:8080/images/dal-khichdi.jpg");
        indianRecipes.add(r3);

        // 4. Masala Dosa
        Recipe r4 = build(chef2, "Crispy Masala Dosa",
                "Thin savory crepe made from fermented rice and lentil batter, filled with potato curry.",
                "1. Ferment batter. 2. Prepare potato filling. 3. Spread batter on hot griddle. 4. Add filling and fold.",
                DietType.VEGAN, MealType.BREAKFAST, CuisineType.INDIAN,
                30, 15, 2, 250.0, 6.0, 40.0, 8.0,
                allergenSet(), diseaseSet());
        r4.setCoverImageUrl("http://localhost:8080/images/masala-dosa.jpg");
        indianRecipes.add(r4);

        // 5. Veg Samosa
        Recipe r5 = build(chef1, "Punjabi Veg Samosa",
                "Crispy pastry crust filled with spiced potatoes and peas.",
                "1. Prepare dough. 2. Make potato filling. 3. Stuff and shape. 4. Deep fry until golden.",
                DietType.VEGETARIAN, MealType.SNACK, CuisineType.INDIAN,
                30, 20, 6, 200.0, 3.0, 25.0, 10.0,
                allergenSet(gluten), diseaseSet());
        r5.setCoverImageUrl("http://localhost:8080/images/veg-samosa.jpg");
        indianRecipes.add(r5);

        recipeRepository.saveAll(indianRecipes);
        log.info("Seeded 2 Indian Chefs and 5 image-based recipes.");
    }

    // ---- Builder helpers ----

    private Recipe build(User chef, String title, String description, String instructions,
            DietType dietType, MealType mealType, CuisineType cuisineType,
            int prepTime, int cookTime, int servings, double calories,
            double protein, double carbs, double fat,
            Set<Allergy> allergens, Set<Disease> diseases) {
        Recipe r = new Recipe();
        r.setUser(chef);
        r.setTitle(title);
        r.setDescription(description);
        r.setInstructions(instructions);
        r.setDietType(dietType);
        r.setMealType(mealType);
        r.setCuisineType(cuisineType);
        r.setPrepTime(prepTime);
        r.setCookTime(cookTime);
        r.setServings(servings);
        r.setCalories(calories);
        r.setProtein(protein);
        r.setCarbs(carbs);
        r.setFat(fat);
        r.setContainsAllergens(new HashSet<>(allergens));
        r.setSafeForDiseases(new HashSet<>(diseases));
        r.setIsPublished(true);
        return r;
    }

    @SafeVarargs
    private Set<Allergy> allergenSet(Optional<Allergy>... opts) {
        Set<Allergy> set = new HashSet<>();
        for (Optional<Allergy> opt : opts) opt.ifPresent(set::add);
        return set;
    }

    @SafeVarargs
    private Set<Disease> diseaseSet(Optional<Disease>... opts) {
        Set<Disease> set = new HashSet<>();
        for (Optional<Disease> opt : opts) opt.ifPresent(set::add);
        return set;
    }
}
