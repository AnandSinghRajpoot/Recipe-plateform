package com.recipeplatform.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.recipeplatform.domain.*;
import com.recipeplatform.domain.enums.*;
import com.recipeplatform.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
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
    private final LikeRepository likeRepository;
    private final CommentRepository commentRepository;

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
        userRepository.migrateVegetarianToVeg();
        userRepository.migrateRecipeVegetarianToVeg();

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

        // Load recipe data from JSON
        Map<String, RecipeData> recipeDataMap = loadRecipeData();
        if (recipeDataMap.isEmpty()) {
            log.error("No recipe data found in JSON file!");
            return;
        }

        List<Recipe> bulkRecipes = new ArrayList<>();
        int index = 0;
        
        for (Map.Entry<String, RecipeData> entry : recipeDataMap.entrySet()) {
            RecipeData data = entry.getValue();
            User assignedChef = chefs.get(index % chefs.size());

            DietType diet = determineDietType(entry.getKey());
            CuisineType cuisine = determineCuisineType(entry.getKey());
            MealType meal = determineMealType(entry.getKey());
            Difficulty difficulty = determineDifficulty(data.getPrepTime(), data.getCookTime());

            Recipe r = new Recipe();
            r.setUser(assignedChef);
            r.setTitle(data.getTitle() != null ? data.getTitle() : entry.getKey());
            String desc = data.getDescription();
            r.setDescription(desc != null && desc.length() >= 20 ? desc : "A delicious and authentic recipe prepared with traditional ingredients and spices.");
            r.setInstructions(data.getInstructions() != null ? String.join("\n", data.getInstructions()) : "Prepare and serve");
            r.setDietType(diet);
            r.setMealType(meal);
            r.setCuisineType(cuisine);
            r.setPrepTime(data.getPrepTime() > 0 ? data.getPrepTime() : 15);
            r.setCookTime(data.getCookTime() > 0 ? data.getCookTime() : 15);
            r.setServings(data.getServings() > 0 ? data.getServings() : 4);
            r.setCalories(data.getCalories() > 0 ? data.getCalories() : 200);
            r.setProtein(data.getProtein() > 0 ? data.getProtein() : 10);
            r.setCarbs(data.getCarbs() > 0 ? data.getCarbs() : 20);
            r.setFat(data.getFat() > 0 ? data.getFat() : 10);
            r.setDifficulty(difficulty);
            r.setIsPublished(true);
            r.setCoverImageUrl("http://localhost:8080/images/" + entry.getKey() + ".jpg");

            // Add ingredients from JSON
            List<RecipeIngredient> recipeIngredients = new ArrayList<>();
            for (String ingName : data.getIngredients()) {
                Ingredient ing = ingredientRepository.findByNameIgnoreCase(ingName).orElseGet(() -> {
                    Ingredient newIng = new Ingredient();
                    newIng.setName(ingName);
                    return ingredientRepository.save(newIng);
                });
                RecipeIngredient ri = new RecipeIngredient();
                ri.setRecipe(r);
                ri.setIngredient(ing);
                ri.setQuantity(1.0);
                ri.setUnit(MeasureUnit.PIECE);
                recipeIngredients.add(ri);
            }
            r.setIngredients(recipeIngredients);

            bulkRecipes.add(r);
            index++;
        }

        recipeRepository.saveAll(bulkRecipes);
        log.info("Seeded {} high-quality recipes assigned to {} chefs.", bulkRecipes.size(), chefs.size());
    }

    @SuppressWarnings("unchecked")
    private Map<String, RecipeData> loadRecipeData() {
        Map<String, RecipeData> map = new HashMap<>();
        try {
            ObjectMapper mapper = new ObjectMapper();
            Map<String, Object> rawData = mapper.readValue(new ClassPathResource("recipes.json").getInputStream(), Map.class);
            for (Map.Entry<String, Object> entry : rawData.entrySet()) {
                Map<String, Object> val = (Map<String, Object>) entry.getValue();
                RecipeData rd = new RecipeData();
                rd.setSlug(entry.getKey());
                rd.setTitle((String) val.get("title"));
                rd.setDescription((String) val.get("description"));
                rd.setIngredients((List<String>) val.get("ingredients"));
                rd.setInstructions((List<String>) val.get("instructions"));
                rd.setPrepTime((Integer) val.get("prepTime"));
                rd.setCookTime((Integer) val.get("cookTime"));
                rd.setServings((Integer) val.get("servings"));
                rd.setCalories(((Number) val.get("calories")).doubleValue());
                rd.setProtein(((Number) val.get("protein")).doubleValue());
                rd.setCarbs(((Number) val.get("carbs")).doubleValue());
                rd.setFat(((Number) val.get("fat")).doubleValue());
                map.put(entry.getKey(), rd);
            }
            log.info("Loaded {} recipes from JSON", map.size());
        } catch (IOException e) {
            log.error("Failed to load recipes.json: {}", e.getMessage());
        }
        return map;
    }

    private Difficulty determineDifficulty(int prepTime, int cookTime) {
        int totalTime = prepTime + cookTime;
        if (totalTime <= 20) return Difficulty.EASY;
        if (totalTime <= 40) return Difficulty.MEDIUM;
        if (totalTime <= 60) return Difficulty.HARD;
        return Difficulty.HARD;
    }

    private DietType determineDietType(String slug) {
        if (slug.contains("chicken") || slug.contains("mutton") || slug.contains("fish") || 
            slug.contains("pork") || slug.contains("steak") || slug.contains("salmon") || 
            slug.contains("shrimp") || slug.contains("seafood") || slug.contains("lobster") ||
            slug.contains("burger") || slug.contains("biryani") || slug.contains("curry") ||
            slug.contains("lamb") || slug.contains("bacon") || slug.contains("pepperoni")) return DietType.NON_VEG;
        
        if (slug.contains("salad") || slug.contains("toast") || slug.contains("falafel") || 
            slug.contains("hummus") || slug.contains("dosa") || slug.contains("sorbet") ||
            slug.contains("quinoa")) return DietType.VEGAN;
            
        return DietType.VEG;
    }

    private CuisineType determineCuisineType(String slug) {
        if (slug.contains("gobi") || slug.contains("paneer") || slug.contains("dal") || 
            slug.contains("masala") || slug.contains("biryani") || slug.contains("naan") ||
            slug.contains("chai") || slug.contains("lassi") || slug.contains("pav") ||
            slug.contains("puri") || slug.contains("samosa") || slug.contains("tandoori") ||
            slug.contains("dhokla") || slug.contains("jalebi") || slug.contains("gulab") ||
            slug.contains("rasgulla") || slug.contains("kofta") || slug.contains("bharta") ||
            slug.contains("haleem") || slug.contains("idli") || slug.contains("vada") ||
            slug.contains("thepla") || slug.contains("kulfi")) return CuisineType.INDIAN;
            
        if (slug.contains("pizza") || slug.contains("pasta") || slug.contains("risotto") ||
            slug.contains("gelato") || slug.contains("lasagna") || slug.contains("carbonara") ||
            slug.contains("alfredo")) return CuisineType.ITALIAN;
        if (slug.contains("tacos") || slug.contains("burritos") || slug.contains("nachos") || 
            slug.contains("enchiladas") || slug.contains("quesadillas") ||
            slug.contains("guacamole")) return CuisineType.MEXICAN;
        if (slug.contains("noodles") || slug.contains("fried-rice") || slug.contains("manchurian") ||
            slug.contains("kung-pao") || slug.contains("spring-rolls") || slug.contains("miso") ||
            slug.contains("sushi") || slug.contains("pad-thai") || slug.contains("thai") ||
            slug.contains("ramen")) return CuisineType.ASIAN;
        if (slug.contains("hummus") || slug.contains("falafel") || slug.contains("shawarma") ||
            slug.contains("shakshuka") || slug.contains("greek") || slug.contains("tabbouleh")) return CuisineType.CONTINENTAL; 
            
        return CuisineType.AMERICAN;
    }

    private MealType determineMealType(String slug) {
        if (slug.contains("breakfast") || slug.contains("egg") || slug.contains("pancakes") || 
            slug.contains("waffles") || slug.contains("toast") || slug.contains("oatmeal") ||
            slug.contains("omelette") || slug.contains("french-toast")) return MealType.BREAKFAST;
        if (slug.contains("salad") || slug.contains("sandwich") || slug.contains("dosa") ||
            slug.contains("wrap") || slug.contains("burger") || slug.contains("sub")) return MealType.LUNCH;
        if (slug.contains("samosa") || slug.contains("fries") || slug.contains("snack") || 
            slug.contains("spring-rolls") || slug.contains("nachos") || slug.contains("chips") ||
            slug.contains("chaat")) return MealType.SNACK;
        if (slug.contains("chai") || slug.contains("lassi") || slug.contains("smoothie") ||
            slug.contains("coffee") || slug.contains("tea")) return MealType.BEVERAGE;
        if (slug.contains("pie") || slug.contains("cake") || slug.contains("brownie") || 
            slug.contains("cookie") || slug.contains("gelato") || slug.contains("macarons") ||
            slug.contains("sorbet") || slug.contains("tiramisu") || slug.contains("churros") ||
            slug.contains("gulab") || slug.contains("jalebi") || slug.contains("rasgulla") ||
            slug.contains("cheesecake") || slug.contains("waffle") || slug.contains("muffin")) return MealType.DESSERT;
            
        return MealType.DINNER;
    }

    private void seedChefs() {
        if (userRepository.existsByEmail("chef.sanjeev@recipehub.com")) {
            return;
        }

        log.info("Seeding 10 professional chefs...");
        createChef("Sanjeev", "chef.sanjeev@recipehub.com", "Expert in traditional Indian cuisine.", DietType.NON_VEG, SkillLevel.INTERMEDIATE);
        createChef("Vikas", "chef.vikas@recipehub.com", "Modern Indian culinary artist.", DietType.VEG, SkillLevel.EXPERT);
        createChef("Kunal", "chef.kunal@recipehub.com", "Indian celebrity chef and restaurateur.", DietType.NON_VEG, SkillLevel.EXPERT);
        createChef("Ranveer", "chef.ranveer@recipehub.com", "Culinary storyteller and food explorer.", DietType.VEG, SkillLevel.EXPERT);
        createChef("Anahita", "chef.anahita@recipehub.com", "Parsi cuisine specialist.", DietType.NON_VEG, SkillLevel.INTERMEDIATE);
        createChef("Shipra", "chef.shipra@recipehub.com", "Fusion and modern cooking expert.", DietType.VEGAN, SkillLevel.EXPERT);
        createChef("Ajay", "chef.ajay@recipehub.com", "Master of Indian flavors.", DietType.VEG, SkillLevel.INTERMEDIATE);
        createChef("Garima", "chef.garima@recipehub.com", "First Indian woman with a Michelin star.", DietType.NO_PREFERENCE, SkillLevel.EXPERT);
        createChef("Vineet", "chef.vineet@recipehub.com", "Innovator of global Indian cuisine.", DietType.NON_VEG, SkillLevel.EXPERT);
        createChef("Manish", "chef.manish@recipehub.com", "Pioneer of Indian comfort food.", DietType.VEG, SkillLevel.INTERMEDIATE);
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

    // Inner class for JSON mapping
    static class RecipeData {
        private String slug;
        private String title;
        private String description;
        private List<String> ingredients;
        private List<String> instructions;
        private int prepTime;
        private int cookTime;
        private int servings;
        private double calories;
        private double protein;
        private double carbs;
        private double fat;

        public String getSlug() { return slug; }
        public void setSlug(String slug) { this.slug = slug; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public List<String> getIngredients() { return ingredients; }
        public void setIngredients(List<String> ingredients) { this.ingredients = ingredients; }
        public List<String> getInstructions() { return instructions; }
        public void setInstructions(List<String> instructions) { this.instructions = instructions; }
        public int getPrepTime() { return prepTime; }
        public void setPrepTime(int prepTime) { this.prepTime = prepTime; }
        public int getCookTime() { return cookTime; }
        public void setCookTime(int cookTime) { this.cookTime = cookTime; }
        public int getServings() { return servings; }
        public void setServings(int servings) { this.servings = servings; }
        public double getCalories() { return calories; }
        public void setCalories(double calories) { this.calories = calories; }
        public double getProtein() { return protein; }
        public void setProtein(double protein) { this.protein = protein; }
        public double getCarbs() { return carbs; }
        public void setCarbs(double carbs) { this.carbs = carbs; }
        public double getFat() { return fat; }
        public void setFat(double fat) { this.fat = fat; }
    }
}
