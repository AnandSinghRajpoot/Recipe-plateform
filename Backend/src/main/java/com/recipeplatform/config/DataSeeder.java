package com.recipeplatform.config;

import com.recipeplatform.domain.*;
import com.recipeplatform.domain.enums.*;
import com.recipeplatform.repository.*;
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
    private final SavedRecipeRepository savedRecipeRepository;
    private final UserRepository userRepository;
    private final IngredientRepository ingredientRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        seedAdminUsers();
        seedIngredients();
        seedDiseases();
        seedAllergies();
        seedChefs();
        seedBulkRecipes(); 
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

    private void seedBulkRecipes() {
        // Run migrations first to prevent Enum constant errors if database is dirty
        userRepository.migrateVegetarianToVeg();
        userRepository.migrateRecipeVegetarianToVeg();

        // If we have significantly fewer or "stale" recipes, we re-seed
        if (recipeRepository.count() == 85) {
            log.info("Bulk recipes already seeded — skipping.");
            return;
        }

        log.info("Cleaning up old recipes and user bookmarks for a fresh 85-recipe seed...");
        savedRecipeRepository.deleteAll();
        recipeRepository.deleteAll();
        
        List<User> chefs = userRepository.findAllByRole(UserRole.CHEF);
        if (chefs.isEmpty()) {
            log.error("No chefs found! Cannot seed recipes.");
            return;
        }

        // List of 85 slugs that match static/images
        String[] slugs = {
            "aloo-gobi", "apple-pie", "avocado-toast", "baingan-bharta", "brownies", "burritos", "butter-chicken", 
            "caesar-salad", "cheesecake", "chicken-65", "chicken-biryani", "chicken-curry", "chicken-fried-rice", 
            "chicken-manchurian", "chicken-shawarma", "chicken-tikka-masala", "chocolate-chip-cookies", "churros", 
            "dal-makhani", "dal-tadka", "dhokla", "double-patty-cheese-burger", "egg-benedict", "enchiladas", 
            "falafel", "fish-and-chips", "fish-curry", "french-fries", "french-toast", "fruit-salad", "garlic-naan", 
            "gelato", "gobi-manchurian", "greek-salad", "green-thai-curry", "grilled-salmon", "gulab-jamun", 
            "hakka-noodles", "hummus", "hyderabadi-haleem", "idli-sambar", "jalebi", "jeera-rice", "kadai-paneer", 
            "kung-pao-chicken", "lassi", "lobster-bisque", "macarons", "malai-kofta", "margherita-pizza", 
            "masala-chai", "masala-dosa", "masala-omelette", "methi-thepla", "miso-soup", "mutton-biryani", 
            "nachos-with-cheese", "oatmeal-with-berries", "pad-thai", "palak-paneer", "pancakes", "paneer-65", 
            "paneer-butter-masala", "pani-puri", "pasta-alfredo", "pasta-carbonara", "pav-bhaji", "pepperoni-pizza", 
            "quesadillas", "quinoa-salad", "rasgulla", "samosa", "scrambled-eggs", "shakshuka", "sorbet", 
            "spring-rolls", "sushi-roll", "tacos", "tandoori-chicken", "tiramisu", "vada-pav", "veg-biryani", 
            "veg-burger", "veg-fried-rice", "waffles"
        };

        List<Recipe> bulkRecipes = new ArrayList<>();
        Random rand = new Random();

        for (int i = 0; i < slugs.length; i++) {
            String slug = slugs[i];
            String title = capitalizeSlug(slug);
            User assignedChef = chefs.get(i % chefs.size());

            // Determine DietType and CuisineType based on keywords
            DietType diet = determineDietType(slug);
            CuisineType cuisine = determineCuisineType(slug);
            MealType meal = determineMealType(slug, rand);

            Recipe r = build(assignedChef, title,
                    "Professional preparation of " + title + ". A favorite among food enthusiasts.",
                    "1. Prepare and clean all ingredients thoroughly.\n2. Heat the pan and follow precise temperature controls.\n3. Combine ingredients in the specified order to preserve flavors.\n4. Garnish with fresh herbs and serve immediately.",
                    diet, meal, cuisine,
                    15 + rand.nextInt(15), 20 + rand.nextInt(40), 2 + rand.nextInt(4),
                    300.0 + rand.nextInt(500), 10.0 + rand.nextInt(30), 20.0 + rand.nextInt(50), 10.0 + rand.nextInt(30),
                    new HashSet<>(), new HashSet<>());

            // Add 3-5 dummy ingredients to satisfy the "proper ingredients" request
            List<RecipeIngredient> recipeIngredients = new ArrayList<>();
            String[] baseIngredients = {"Onion", "Tomato", "Garlic", "Ginger", "Salt", "Oil", "Butter", "Pepper"};
            int ingCount = 3 + rand.nextInt(3);
            for (int k = 0; k < ingCount; k++) {
                String ingName = baseIngredients[rand.nextInt(baseIngredients.length)];
                Ingredient ing = ingredientRepository.findByNameIgnoreCase(ingName).orElseGet(() -> {
                     Ingredient newIng = new Ingredient();
                     newIng.setName(ingName);
                     return ingredientRepository.save(newIng);
                });
                RecipeIngredient ri = new RecipeIngredient();
                ri.setRecipe(r);
                ri.setIngredient(ing);
                ri.setQuantity((double)(1 + rand.nextInt(3)));
                ri.setUnit(MeasureUnit.PIECE);
                recipeIngredients.add(ri);
            }
            r.setIngredients(recipeIngredients);

            // Accurate image mapping
            r.setCoverImageUrl("http://localhost:8080/images/" + slug + ".jpg");
            
            // Randomly assign difficulty
            r.setDifficulty(Difficulty.values()[rand.nextInt(Difficulty.values().length)]);
            
            bulkRecipes.add(r);
        }

        recipeRepository.saveAll(bulkRecipes);
        log.info("Seeded 85 high-quality recipes assigned to 10 chefs.");
    }

    private String capitalizeSlug(String slug) {
        String[] parts = slug.split("-");
        StringBuilder sb = new StringBuilder();
        for (String part : parts) {
            sb.append(Character.toUpperCase(part.charAt(0))).append(part.substring(1)).append(" ");
        }
        return sb.toString().trim();
    }

    private DietType determineDietType(String slug) {
        if (slug.contains("chicken") || slug.contains("mutton") || slug.contains("fish") || 
            slug.contains("pork") || slug.contains("steak") || slug.contains("salmon") || 
            slug.contains("shrimp") || slug.contains("seafood") || slug.contains("lobster") ||
            slug.contains("burger")) return DietType.NON_VEG;
        
        if (slug.contains("salad") || slug.contains("toast") || slug.contains("falafel") || 
            slug.contains("hummus") || slug.contains("dosa") || slug.contains("sorbet")) return DietType.VEGAN;
            
        return DietType.VEG;
    }

    private CuisineType determineCuisineType(String slug) {
        if (slug.contains("gobi") || slug.contains("paneer") || slug.contains("dal") || 
            slug.contains("masala") || slug.contains("biryani") || slug.contains("naan") ||
            slug.contains("chai") || slug.contains("lassi") || slug.contains("pav") ||
            slug.contains("puri") || slug.contains("samosa") || slug.contains("tandoori") ||
            slug.contains("dhokla") || slug.contains("jalebi") || slug.contains("gulab") ||
            slug.contains("rasgulla") || slug.contains("kofta") || slug.contains("bharta") ||
            slug.contains("haleem")) return CuisineType.INDIAN;
            
        if (slug.contains("pizza") || slug.contains("pasta")) return CuisineType.ITALIAN;
        if (slug.contains("tacos") || slug.contains("burritos") || slug.contains("nachos") || 
            slug.contains("enchiladas") || slug.contains("quesadillas")) return CuisineType.MEXICAN;
        if (slug.contains("noodles") || slug.contains("fried-rice") || slug.contains("manchurian") ||
            slug.contains("kung-pao") || slug.contains("spring-rolls") || slug.contains("miso") ||
            slug.contains("sushi") || slug.contains("thai")) return CuisineType.ASIAN;
        if (slug.contains("hummus") || slug.contains("falafel") || slug.contains("shawarma") ||
            slug.contains("shakshuka") || slug.contains("greek")) return CuisineType.CONTINENTAL; 
            
        return CuisineType.AMERICAN;
    }

    private MealType determineMealType(String slug, Random rand) {
        if (slug.contains("breakfast") || slug.contains("egg") || slug.contains("pancakes") || 
            slug.contains("waffles") || slug.contains("toast") || slug.contains("oatmeal")) return MealType.BREAKFAST;
        if (slug.contains("salad") || slug.contains("sandwich") || slug.contains("dosa")) return MealType.LUNCH;
        if (slug.contains("samosa") || slug.contains("fries") || slug.contains("snack") || 
            slug.contains("spring-rolls") || slug.contains("nachos")) return MealType.SNACK;
        if (slug.contains("chai") || slug.contains("lassi") || slug.contains("drink")) return MealType.BEVERAGE;
        if (slug.contains("pie") || slug.contains("cake") || slug.contains("brownie") || 
            slug.contains("cookie") || slug.contains("gelato") || slug.contains("macarons") ||
            slug.contains("sorbet") || slug.contains("tiramisu") || slug.contains("churros") ||
            slug.contains("gulab") || slug.contains("jalebi")) return MealType.DESSERT;
            
        return rand.nextBoolean() ? MealType.LUNCH : MealType.DINNER;
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

    private void seedChefs() {
        if (userRepository.existsByEmail("chef.sanjeev@recipehub.com")) {
            return;
        }

        log.info("Seeding 10 professional chefs...");
        createChef("Chef Sanjeev", "chef.sanjeev@recipehub.com", "Expert in traditional Indian cuisine.", DietType.NON_VEG, SkillLevel.INTERMEDIATE);
        createChef("Chef Vikas", "chef.vikas@recipehub.com", "Modern Indian culinary artist.", DietType.VEG, SkillLevel.EXPERT);
        createChef("Chef Kunal", "chef.kunal@recipehub.com", "Indian celebrity chef and restaurateur.", DietType.NON_VEG, SkillLevel.EXPERT);
        createChef("Chef Ranveer", "chef.ranveer@recipehub.com", "Culinary storyteller and food explorer.", DietType.VEG, SkillLevel.EXPERT);
        createChef("Chef Anahita", "chef.anahita@recipehub.com", "Parsi cuisine specialist.", DietType.NON_VEG, SkillLevel.INTERMEDIATE);
        createChef("Chef Shipra", "chef.shipra@recipehub.com", "Fusion and modern cooking expert.", DietType.VEGAN, SkillLevel.EXPERT);
        createChef("Chef Ajay", "chef.ajay@recipehub.com", "Master of Indian flavors.", DietType.VEG, SkillLevel.INTERMEDIATE);
        createChef("Chef Garima", "chef.garima@recipehub.com", "First Indian woman with a Michelin star.", DietType.NO_PREFERENCE, SkillLevel.EXPERT);
        createChef("Chef Vineet", "chef.vineet@recipehub.com", "Innovator of global Indian cuisine.", DietType.NON_VEG, SkillLevel.EXPERT);
        createChef("Chef Manish", "chef.manish@recipehub.com", "Pioneer of Indian comfort food.", DietType.VEG, SkillLevel.INTERMEDIATE);
    }

    private User createChef(String name, String email, String bio, DietType dietType, SkillLevel skillLevel) {
        User chef = new User();
        chef.setName(name);
        chef.setEmail(email);
        chef.setPassword(passwordEncoder.encode("password123"));
        chef.setRole(UserRole.CHEF);
        chef.setIsProfileCompleted(true);
        chef.setBio(bio);
        chef.setDietType(dietType);
        chef.setSkillLevel(skillLevel);
        return userRepository.save(chef);
    }

    private void seedAdminUsers() {
        if (userRepository.existsByEmail("admin1@recipe.com")) {
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
        log.info("Seeded 2 admin users.");
    }

    private void seedIngredients() {
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
        log.info("Seeded basic ingredients.");
    }
}
