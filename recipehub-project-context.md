# RecipeHub Project Complete Context

## 1. Project Overview
* **What is RecipeHub?** A highly personalized, health-oriented recipe platform and meal planning application.
* **Main purpose:** To help users find, organize, and plan meals that strictly adhere to their specific medical conditions, dietary restrictions, lifestyle habits, and allergies.
* **Target users:** Health-conscious individuals, users with specific medical conditions (e.g., Diabetes, Hypertension), individuals with food allergies, and anyone looking for guided meal planning.
* **Main vision:** To be the most intelligent food recommendation platform that bridges the gap between culinary enjoyment and strict medical/nutritional compliance.

## 2. Current Tech Stack
### Frontend
* **Core:** React.js (via Vite)
* **Styling:** Tailwind CSS (Utility-first framework for rapid, responsive UI development).
* **State Management & Routing:** React Router DOM (Navigation).

### Backend
* **Core:** Java 17 + Spring Boot 3.x
* **Data Access:** Spring Data JPA / Hibernate (ORM mapping for complex entity relationships).
* **Security:** Spring Security.
* **Utilities:** Lombok (to reduce boilerplate code for getters/setters/builders).

### Database
* **Relational Database:** MySQL (defined in `.env` as `jdbc:mysql://localhost:3306/recipe`).

### Authentication & Infrastructure
* **Auth System:** JWT (JSON Web Tokens) for stateless authentication.
* **File Storage:** Local file system (`/upload/` directory) for recipe cover images and user avatars.

**Why these technologies?**
Spring Boot + Java provides a highly typed, enterprise-grade, and scalable architecture, perfectly suited for the complex domain logic (disease mappings, nutrition calculations). React + Vite offers lightning-fast HMR (Hot Module Replacement) and a modern, responsive user experience. MySQL is reliable for complex relational mapping (like Many-to-Many between Recipes and Allergens).

## 3. Current System Architecture
The application follows a **Monolithic RESTful API Architecture**.

* **Frontend Architecture (SPA):** Single Page Application talking to the backend via asynchronous REST API calls (likely using Axios or native Fetch).
* **Backend Architecture (N-Tier):**
  * **Controller Layer (`com.recipeplatform.controller`):** Defines HTTP endpoints, receives DTOs, and sends DTO responses.
  * **Service Layer (`com.recipeplatform.service`):** Contains the core business logic (e.g., `RecommendationServiceImpl`, `AdminServiceImpl`).
  * **Repository Layer (`com.recipeplatform.repository`):** Spring Data JPA interfaces interacting directly with MySQL.
  * **Domain Layer (`com.recipeplatform.domain`):** JPA Entities representing database tables.
  * **Mapper Layer (`com.recipeplatform.mapper`):** Converts Entities to DTOs and vice-versa.
* **Request Flow:** User Action (React) -> HTTP Request (JWT in Header) -> Spring Security Filter (Validates Token) -> Controller -> Service (Business Logic) -> Repository (Database Query) -> Return Response.

## 4. Database Design
The schema is highly normalized to support complex health filtering.

### Core Entities:
* **User:** `id`, `email`, `password`, `role` (USER/ADMIN), `status` (ACTIVE/SUSPENDED), `dietType`.
* **UserHealthProfile:** One-to-One with User. Stores `dailyCalorieRequirement`, `activityLevel`, `skillLevel`, `workType`.
* **Disease & UserDisease:** Master list of diseases (Diabetes, etc.) with specific constraints (`maxSugar`, `maxSodium`). Users have a One-to-Many mapping to these.
* **Allergy & UserAllergy:** Master list of allergens. Users have a One-to-Many mapping.
* **Recipe:** `id`, `title`, `instructions`, `prepTime`, `cookTime`, `dietType`, `mealType`, `isModerated`, `isPublished`. 
* **RecipeIngredient:** Joins Recipe and Ingredient (Many-to-Many resolution) with quantity/unit.
* **Nutrition:** One-to-One with Recipe. Stores `calories`, `protein`, `carbs`, `fat`, `fiber`, `sugar`, `sodium`.
* **DiseaseFoodRestriction:** Maps a Disease to specific ingredients with a `RestrictionSeverity` (ELIMINATE, AVOID, LIMIT).

### Engagement Entities:
* **Review:** User rating and text review for a Recipe.
* **SavedRecipe:** Many-to-Many mapping of Users saving Recipes.
* **Report:** Polymorphic (or specific type) entity used for content/user moderation (`ReportType.RECIPE`, `ReportType.USER`).
* **MealPlan:** Weekly or daily configurations of suggested recipes for a user.

## 5. Authentication & Authorization Flow
* **Registration:** User creates an account. Backend hashes the password using BCrypt and saves the entity.
* **Login:** User submits credentials. Spring Security verifies them. `AuthServiceImpl` generates a JWT using the `jwt_secret` from `.env`.
* **Session Handling:** Stateless. The frontend stores the JWT (usually in local storage/cookies) and attaches it as a `Bearer` token in the `Authorization` header for subsequent requests.
* **Role-Based Access Control (RBAC):**
  * `USER`: Standard access (profile, save recipes, post reviews).
  * `ADMIN`: Access to `/api/admin/**`. Can view reports, suspend users, and moderate (hide/delete) recipes.

## 6. User Features (Implemented)
* **Health Personalization (Profile Completion):** Users can define physical traits, diseases, and allergies. The frontend tracks "Profile Completion Percentage" dynamically based on filled fields.
* **Dynamic Recommendation Engine:** The core feature. Suggests recipes based on strict inclusion/exclusion criteria.
* **Meal Planning:** Generates multi-plan schedules adhering strictly to the user's health profile (no allergens, calorie matching).
* **Recipe Interaction:** Saving recipes, leaving reviews, rating out of 5 stars.
* **Recipe Discovery:** Filtering by `MealType` (Breakfast, Lunch, Dinner) and `DietType` (Veg, Vegan, Keto, etc.).
* **Image Uploads:** Dynamic image serving via the backend's `/upload` endpoint, resolving `.jpg` and `.png` formats.

## 7. Admin System
* **Admin Dashboard:** A dedicated frontend UI (`AdminDashboard.jsx`) for managing the platform.
* **Content Moderation:** Admins can flag recipes (`isModerated = true`), which instantly hides them from public feeds and the recommendation engine (`findByIsPublishedTrueAndDeletedAtIsNullAndIsModeratedFalse()`).
* **User Management:** Admins can view user lists and suspend/ban malicious accounts.
* **Reporting System:** Users can report content. Admins review `Report` entities and take action.

## 8. Recommendation System (Deep Dive)
Located in `RecommendationServiceImpl` and `RecommendationEngineImpl`. It operates in a multi-phase funnel:

1. **Hard Medical Filter (Database Level):**
   * Uses `findPublishedRecipesExcludingAllergens(Set<Long> allergenIds)`.
   * Ensures recipes with user-allergic ingredients never even enter application memory.
2. **Keyword Fail-Safe (Application Level):**
   * Scans ingredient names for hidden threats (e.g., if allergic to eggs, it flags "mayo"; if allergic to dairy, it flags "ghee" or "paneer").
3. **Disease Safety Boosting:**
   * Checks if a recipe is explicitly vetted for the user's specific diseases (via `safeForDiseases` mapping) and adds bonus points.
4. **Nutritional & Lifestyle Soft Scoring:**
   * Penalizes recipes if they exceed `maxSugar` or `maxSodium` for the user's specific disease.
   * Matches `DietType` (Strict Veg/Vegan enforcement).
   * Calorie Matching: Targets `dailyCalorieRequirement / 3` per meal. Precision matches get +50 points; deviations lose points.
   * Habit adjustments (e.g., high protein for active users, quick prep times for irregular eating patterns).
5. **Ranking:** Recipes are sorted by final score. Anything scoring `<= -500` is completely discarded.

## 9. Meal Planning System
* Generates scheduled meals (Breakfast, Lunch, Dinner, Snacks).
* Relies entirely on the output of the Recommendation Engine to ensure that no suggested meal plan violates a user's health constraints or allergies.
* Built to handle multi-plan flows.

## 10. API Documentation Summary
* **Auth:** `POST /api/auth/register`, `POST /api/auth/login`
* **Users:** `GET /api/users/profile`, `PUT /api/users/profile/health` (Updates health profile and allergies)
* **Recipes:** `GET /api/recipes`, `GET /api/recipes/{id}`, `POST /api/recipes`
* **Recommendations:** `GET /api/recommendations` (Returns highly customized lists with `matchScore` and `matchReasons`)
* **Admin:** `GET /api/admin/users`, `PUT /api/admin/users/{id}/suspend`, `GET /api/admin/reports`
* **Reviews:** CRUD operations for recipe reviews.

## 11. File/Folder Structure
* `Backend/src/main/java/com/recipeplatform/`
  * `controller/`: REST API endpoints.
  * `domain/`: Database entities (`User`, `Recipe`, `Report`).
  * `repository/`: Spring Data JPA interfaces.
  * `service/impl/`: Business logic. Contains the complex `RecommendationServiceImpl`.
  * `security/`: JWT filters and Auth providers.
* `Frontend/src/`
  * `pages/`: Page-level components (`LoginPage.jsx`, `AdminDashboard.jsx`, `SingleProduct.jsx`).
  * `components/`: Reusable UI.

## 12. Current Completed Features
* [x] User Registration / Login (JWT)
* [x] Complex User Health Profiles
* [x] Base Recipe CRUD & Image Uploads
* [x] Dynamic, Multi-Phase Recommendation Engine
* [x] Strict Allergen Keyword Fail-safes
* [x] Automated Meal Planning 
* [x] Admin Dashboard & Moderation Capabilities
* [x] Review & Rating System

## 13. Pending Features / Future Roadmap
* **Advanced AI Integration:** Introduce an LLM (like OpenAI) to dynamically generate recipes or substitute ingredients based on user allergies.
* **Social/Community Features:** Allow users to follow each other, share meal plans, and comment on reviews.
* **Grocery List Generation:** Automatically compile ingredients from a weekly meal plan into a checklist.
* **Email Notifications:** Send weekly meal plans or moderation alerts to users.
* **Scalability:** Introduce Redis caching for the Recommendation Engine, as it is currently calculating scores dynamically on every request.

## 14. Known Problems / Technical Debt
* **Performance bottleneck in Recommendations:** The system fetches all safe recipes and scores them in-memory (`RecommendationServiceImpl`). As the recipe database grows to thousands, this will cause memory and CPU spikes. Needs caching or database-level heuristic pre-filtering.
* **Hardcoded Keyword Checks:** The allergen fail-safe relies on `name.contains("egg")`, `name.contains("mayo")` strings hardcoded in Java. This should be moved to a master-data database table or rules engine.
* **File Upload limitations:** Images are stored locally in the `/upload` folder. For cloud deployment, this must be migrated to AWS S3 or Cloudinary to prevent file loss on server restarts.

## 15. Important Business Logic
* **Moderation Safety:** Moderated recipes are globally excluded from all public feeds and recommendation results using the JPA query `findByIsPublishedTrueAndDeletedAtIsNullAndIsModeratedFalse()`.
* **Strict Vegan/Veg Enforcement:** The scoring engine immediately assigns a `-2000` score (instant exclusion) if a user is `VEG/VEGAN` and the recipe is `NON_VEG`.
* **Allergen Isolation:** Allergen filtering happens directly at the database layer using `NOT EXISTS`, ensuring unsafe data is never processed in application memory, adding a massive layer of medical safety.

## 16. Development Workflow
* **Backend:** Navigate to `Backend/`, ensure MySQL is running on port 3306 with credentials matching `.env`, and run `mvn spring-boot:run`. Runs on port `8080`.
* **Frontend:** Navigate to `Frontend/`, run `npm install` and then `npm run dev`. Runs on Vite's default port.
* **Data Seeding:** The backend has a `DataSeeder` class that reads from `recipes.json` to populate the initial database state if it detects the recipe count is mismatched.

## 17. Final Project Status Summary
**Current Maturity Level:** Advanced MVP / Production-Ready Beta.
**What is strong:** The backend domain model is incredibly robust. The recommendation engine is highly sophisticated, prioritizing medical safety (allergies/diseases) over simple preferences.
**Biggest missing parts:** Cloud infrastructure readiness (local uploads), caching for the heavy recommendation algorithms, and advanced frontend unit testing.
**Overall Quality:** The architecture is exceptionally clean and follows standard enterprise Java patterns. The recent additions of the Admin Dashboard and Review System make it a fully-featured, safe, and governed platform.
