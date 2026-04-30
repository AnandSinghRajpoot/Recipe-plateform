import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import apiClient from "../../utils/apiClient";
import MagneticWrapper from "../../components/common/MagneticWrapper";
import BackButton from "../../components/common/BackButton";

const CATEGORIES = [
  { id: 'nutrition-health', label: 'Nutrition & Health', icon: 'favorite' },
  { id: 'cooking-basics', label: 'Cooking Basics', icon: 'skillet' },
  { id: 'ingredient-guide', label: 'Ingredient Guide', icon: 'menu_book' },
  { id: 'substitutions', label: 'Substitutions', icon: 'swap_horiz' },
  { id: 'meal-planning', label: 'Meal Planning Tips', icon: 'calendar_month' },
  { id: 'shopping-tips', label: 'Shopping Tips', icon: 'shopping_cart' },
  { id: 'faq', label: 'FAQs', icon: 'help' },
  { id: 'blog', label: 'Blog / Articles', icon: 'article' }
];

const INITIAL_CONTENT = {
  'nutrition-health': [
    { 
      id: 1, 
      title: 'Low Sugar Diet for Diabetes', 
      desc: 'Manage your blood sugar with low-GI foods and smart carb choices.', 
      fullContent: `A low sugar diet for diabetes is not about removing every carbohydrate from the plate. It is about choosing carbohydrates more carefully, limiting added sugars, and building meals that help blood sugar stay steadier through the day. Whole foods such as nonstarchy vegetables, beans, lentils, oats, yogurt, nuts, seeds, and whole fruit usually work better than sugary drinks, desserts, and heavily refined packaged snacks.

A practical approach is to focus on meal balance. Fill half your plate with vegetables, one quarter with lean protein, and one quarter with a higher-fiber carbohydrate such as brown rice, beans, or whole grain bread. Read Nutrition Facts labels, especially the added sugar line, and watch for hidden sugars in sauces, flavored yogurt, cereal bars, sweetened coffee, and bottled drinks. Pairing carbs with protein or healthy fat can also help meals feel more satisfying.`,
      tips: [
        'Choose water, unsweetened tea, or sparkling water instead of sugary drinks.',
        'Pick whole fruit more often than fruit juice.',
        'Keep sweets occasional and portion-aware instead of treating them as everyday staples.',
        'Build meals around vegetables, protein, and fiber-rich carbs.'
      ],
      image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=80', 
      targetDisease: 'Diabetes' 
    },
    { 
      id: 2, 
      title: 'Protein-Rich Foods', 
      desc: 'Discover plant-based and lean meat sources to hit your daily protein goals.', 
      fullContent: `Protein helps support muscle maintenance, fullness, recovery, and stable meals. The best protein-rich diet is not only about eating more meat. It is about variety. Seafood, eggs, poultry, yogurt, cottage cheese, beans, lentils, tofu, tempeh, nuts, seeds, and soy foods all count and each brings different nutrients to the table.

If your goal is better everyday eating, try spreading protein across the day instead of loading it into one meal. Breakfast can include eggs, Greek yogurt, or cottage cheese. Lunch and dinner can include fish, chicken, tofu, beans, or lentils. Snacks can be built around roasted chickpeas, edamame, yogurt, or nut butter with fruit. Leaner choices and plant-forward meals often make protein intake feel lighter and more balanced.`,
      tips: [
        'Eggs, Greek yogurt, Chicken breast',
        'Salmon or tuna',
        'Lentils and beans',
        'Tofu and tempeh',
        'Nuts and seeds',
        'Cottage cheese'
      ],
      image: 'https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?auto=format&fit=crop&w=800&q=80' 
    },
    { 
      id: 3, 
      title: 'Heart Healthy Eating Tips', 
      desc: 'Incorporate Omega-3s and reduce saturated fats for cardiovascular wellness.', 
      fullContent: `Heart-healthy eating is less about one perfect food and more about a repeatable pattern. Meals that support heart health usually include plenty of vegetables and fruit, whole grains, beans, nuts, seeds, fish, and lean proteins. They also rely more on unsaturated fats such as olive oil or canola oil and less on butter, fatty cuts of meat, and heavily processed foods.

Two of the biggest upgrades are reducing sodium and added sugars. Restaurant food, packaged snacks, deli meat, bottled sauces, and sweetened drinks can add up quickly. Cooking at home more often, using herbs and citrus for flavor, and reading labels can make a real difference. A simple rule works well: build plates around whole foods first, then let treats be the smaller part of the pattern.`,
      tips: [
        'Make fruits and vegetables show up at most meals.',
        'Choose whole grains more often than refined grains.',
        'Swap butter and cream-heavy cooking for plant oils and lighter sauces.',
        'Keep processed meat, salty snacks, and sugary drinks limited.'
      ],
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80', 
      targetDisease: 'Heart Disease' 
    },
    { 
      id: 4, 
      title: '1500 Calorie Diet Plan', 
      desc: 'A sustainable approach to weight management without sacrificing flavor.', 
      fullContent: `A 1500 calorie plan can be a useful structure for weight management, but it is not a universal target. For some adults it may create a reasonable calorie deficit, while for others it may be too low or not appropriate at all. The most sustainable version focuses on satisfying meals with protein, fiber, vegetables, and smart portions instead of tiny meals that leave you hungry.

A practical split looks like this:
- Breakfast: 300 to 350 calories
- Lunch: 350 to 450 calories
- Dinner: 450 to 550 calories
- Snacks: 150 to 250 calories total`,
      tips: [
        'Include protein at each meal.',
        'Fill up on vegetables and fruit.',
        'Choose whole grains and high-fiber carbs.',
        'Keep sauces, sugary drinks, and mindless snacking in check.'
      ],
      image: '/resources/1500-cal-diet.png' 
    }
  ],
  'cooking-basics': [
    { 
      id: 5, 
      title: 'Basic Cooking Techniques', 
      desc: 'Master boiling, frying, baking, and roasting to elevate your home meals.', 
      fullContent: `Learning a few core cooking techniques makes almost every recipe easier. You do not need restaurant-level skills to cook well at home. Most home cooks get far by understanding what each technique does and when to use it.

Core methods to know:
- Saute: Quick cooking in a small amount of oil over medium to high heat. Great for onions, greens, shrimp, and bite-size vegetables.
- Roast: Dry heat in the oven, ideal for vegetables, chicken, and potatoes. It builds color and deeper flavor.
- Boil: Fast cooking in bubbling water, best for pasta, potatoes, and some grains.
- Simmer: Gentler than boiling, good for soups, sauces, beans, and curries.
- Steam: A moist, gentle method that keeps vegetables tender and bright.
- Bake: Best for casseroles, fish, breads, and desserts.`,
      tips: [
        'Pick the technique that matches the ingredient.',
        'Tender vegetables do well with sauteing or steaming.',
        'Denser vegetables often improve with roasting.'
      ],
      image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80' 
    },
    { 
      id: 6, 
      title: 'How to Chop Vegetables', 
      desc: 'Learn proper knife skills for faster prep and professional-looking dishes.', 
      fullContent: `Good chopping starts before the knife touches the board. Wash and dry the vegetables, trim away damaged ends, and use a stable cutting board with a damp towel underneath so it does not slide. A sharp chef's knife is safer than a dull one because it cuts cleanly without forcing pressure.

For better control, use the claw grip: curl your fingertips under and guide the knife with your knuckles. Cut vegetables into similar sizes so they cook evenly. Learn a few basic cuts:
- Slice: thin flat pieces for cucumbers, onions, and peppers
- Dice: small cubes for soups, sauces, and stir-fries
- Julienne: thin matchsticks for salads and quick cooking
- Chop: rough, less uniform pieces for rustic dishes`,
      tips: [
        'Take your time at first. Speed comes later.',
        'Accuracy and safety matter more than looking fast.',
        'Keep fingers curled under (claw grip).'
      ],
      image: '/resources/chopping.png' 
    },
    { 
      id: 7, 
      title: 'How to Cook Rice Perfectly', 
      desc: 'The golden ratio and foolproof method for fluffy, non-sticky rice every time.', 
      fullContent: `Perfect rice comes down to four things: the right ratio, controlled heat, enough resting time, and resisting the urge to keep lifting the lid. Start by rinsing most white rice until the water looks clearer. This removes excess surface starch and helps prevent gumminess.

Basic stovetop method:
1. Rinse the rice.
2. Add rice and water to a pot (1 cup rice to 1 3/4 or 2 cups water).
3. Bring to a boil.
4. Reduce to low, cover, and simmer gently.
5. Turn off heat and let rest covered for 10 minutes.
6. Fluff with a fork.`,
      tips: [
        'Rinse the rice.',
        'Resist lifting the lid while cooking.',
        'Let it rest for 10 minutes after heat is off.'
      ],
      image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80' 
    }
  ],
  'ingredient-guide': [
    { 
      id: 8, 
      title: 'What is Quinoa?', 
      desc: 'Everything you need to know about this ancient, protein-packed grain.', 
      fullContent: `Quinoa is a seed that cooks and eats like a grain. It has a light, slightly nutty flavor and works in bowls, salads, soups, breakfast porridge, and side dishes. It is naturally gluten-free and popular because it cooks relatively quickly and adds both texture and nutrition to simple meals.

One reason quinoa stands out is that it is more substantial than many grains. It brings fiber, minerals, and protein. White quinoa tends to be the softest, red quinoa holds its shape better, and black quinoa has a slightly earthier bite.`,
      tips: [
        'Rinse well to remove bitterness.',
        'Simmer 1 cup quinoa with 2 cups water.',
        'Let rest and fluff like rice.'
      ],
      image: '/resources/quinoa.png' 
    },
    { 
      id: 9, 
      title: 'Types of Flour Explained', 
      desc: 'From all-purpose to almond flour: when and how to use them.', 
      fullContent: `Different flours create different textures because they contain different amounts of protein, bran, and starch. Knowing the basic categories helps you choose the right one without guessing.

Common types:
- All-purpose flour: the everyday standard
- Whole wheat flour: more fiber and nuttier flavor
- Bread flour: higher protein for chewier bread
- Cake flour: lower protein for softer cakes
- Self-rising flour: with baking powder and salt mixed in`,
      tips: [
        'Don\'t assume every flour swaps one-for-one.',
        'Whole wheat makes denser texture.',
        'Follow recipes as written first.'
      ],
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80' 
    }
  ],
  'substitutions': [
    { 
      id: 10, 
      title: 'Egg Replacement Options', 
      desc: 'Baking without eggs? Try flaxseed, applesauce, or mashed bananas.', 
      fullContent: `Eggs do different jobs in recipes. They can bind ingredients, add moisture, create lift, and improve structure. That means the best replacement depends on what the egg is doing in the recipe.

Common swaps:
- Flax egg: 1 tbsp flax + 3 tbsp water.
- Applesauce: adds moisture in cakes and muffins.
- Mashed banana: for sweet baked goods.
- Yogurt: adds moisture and tenderness.
- Silken tofu: useful in dense bakes like brownies.`,
      tips: [
        'Flax egg is best for cookies and muffins.',
        'Use applesauce for moisture, not lift.',
        'For meringue, replacements are trickier.'
      ],
      image: 'https://images.unsplash.com/photo-1587486913049-53fc88980cfc?auto=format&fit=crop&w=800&q=80' 
    },
    { 
      id: 11, 
      title: 'Butter Alternatives', 
      desc: 'Swap butter for olive oil, avocado, or Greek yogurt in your recipes.', 
      fullContent: `Butter adds richness, but it is not the only way to get flavor or texture. The best alternative depends on whether you are cooking, baking, spreading, or trying to lighten a dish.

For sauteing and roasting, olive oil or avocado oil are the simplest swaps. For baking, neutral oil, Greek yogurt, or applesauce can work. For spreading, avocado or hummus can bring creaminess without butter.`,
      tips: [
        'Sauteing: olive oil',
        'Roasting: avocado oil',
        'Moist cakes: yogurt or applesauce',
        'Toast spread: avocado or nut butter'
      ],
      image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=800&q=80' 
    },
    { 
      id: 12, 
      title: 'No Cream? No Problem', 
      desc: 'Use a mix of whole milk and butter, or blended cashews for a vegan alternative.', 
      fullContent: `Running out of cream does not mean the recipe is over. Many dishes can be rescued with ingredients you already have.

Useful substitutes:
- Milk plus a little cornstarch for lighter sauces
- Greek yogurt for tangy soups and pasta finishes
- Evaporated milk for a richer option
- Cashew cream for dairy-free soups
- Coconut milk for curries`,
      tips: [
        'Lower the heat when using yogurt to avoid curdling.',
        'Milk + cornstarch works for simple sauces.',
        'Cashew cream is very neutral for dairy-free.'
      ],
      image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=800&q=80' 
    }
  ],
  'meal-planning': [
    { 
      id: 13, 
      title: 'How to Plan Weekly Meals', 
      desc: 'A step-by-step guide to saving time and reducing food waste.', 
      fullContent: `Weekly meal planning works best when it feels simple enough to repeat. Start by checking the fridge, freezer, and pantry so you know what needs to be used first. Then map the week around your real schedule.

A good starter plan is:
- 2 breakfast options
- 2 lunch options
- 3 or 4 dinners
- 1 leftover night
- 1 flexible meal (eggs, soup, freezer backup)`,
      tips: [
        'Theme nights (Tacos, Pasta) make planning easier.',
        'Make one categorized shopping list.',
        'Busy days need easy meals.'
      ],
      image: '/resources/meal-planning.png' 
    },
    { 
      id: 14, 
      title: 'Budget Meal Planning', 
      desc: 'Eat healthy without breaking the bank with these smart strategies.', 
      fullContent: `Budget meal planning is about spending with a plan instead of buying with hope. The strongest budget starts with using what you already have and choosing low-cost staples.

Budget-friendly habits:
- Check sales before deciding meals.
- Buy seasonal produce.
- Use frozen and canned produce to reduce waste.
- Plan one or two meatless dinners each week.
- Cook once and repurpose leftovers.`,
      tips: [
        'Use beans, lentils, and eggs as cheap proteins.',
        'Check unit prices, not just package prices.',
        'Plan meals around what is on sale.'
      ],
      image: '/resources/budget-planning.png' 
    },
    { 
      id: 15, 
      title: 'Healthy Meal Prep Tips', 
      desc: 'Batch cooking secrets to ensure you always have a nutritious option ready.', 
      fullContent: `Meal prep works best when it supports your week instead of turning Sunday into a marathon. You do not need to prep every full meal. Often it is enough to prep building blocks: a protein, a grain, chopped vegetables, and a sauce.

Practical prep wins:
- Roast one tray of vegetables
- Cook one pot of rice or quinoa
- Prep one protein
- Wash fruit for quick snacks
- Make one dressing or sauce`,
      tips: [
        'Use containers that seal well.',
        'Cool food before stacking it away.',
        'Label what you made and the date.'
      ],
      image: 'https://images.unsplash.com/photo-1543362906-acfc16c67564?auto=format&fit=crop&w=800&q=80' 
    }
  ],
  'shopping-tips': [
    { 
      id: 16, 
      title: 'How to Reduce Grocery Costs', 
      desc: 'Smart shopping habits to lower your weekly food bill.', 
      fullContent: `Reducing grocery costs does not always mean buying less food. It often means buying with more intention. Store brands are often a strong value for pantry staples like oats, pasta, and frozen vegetables.

Money-saving habits:
- Compare unit prices.
- Use a base list of low-cost staples.
- Keep a leftovers night each week.
- Freeze extra bread or cooked grains before they go bad.`,
      tips: [
        'Shop with a list to avoid impulse buys.',
        'Choose flexible ingredients like spinach.',
        'Don\'t ignore store brands.'
      ],
      image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=800&q=80' 
    },
    { 
      id: 17, 
      title: 'How to Store Vegetables', 
      desc: 'Keep your produce fresh longer and stop throwing away wilted greens.', 
      fullContent: `Storing vegetables well saves money and reduces waste. Treat vegetables by type:
- Leafy greens: cold, dry, and loosely wrapped.
- Herbs: stand in a little water like flowers.
- Potatoes/Onions: cool, dark, dry place (not the fridge).
- Mushrooms: breathable packaging.

Do not wash everything before storing unless you dry it very well.`,
      tips: [
        'Keep potatoes and onions separate.',
        'Don\'t wash produce until closer to use.',
        'Use perishable vegetables first.'
      ],
      image: 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?auto=format&fit=crop&w=800&q=80' 
    },
    { 
      id: 18, 
      title: 'Weekly Shopping Strategy', 
      desc: 'Navigate the grocery store efficiently and stick to your list.', 
      fullContent: `A good strategy starts before you leave. Check your pantry and write down what you actually plan to cook. Build your list by category (produce, protein, dairy) to make the trip faster.

A simple rhythm:
- Shop once for the core week.
- Do a small midweek refill only if needed.
- Choose a mix of fresh, frozen, and pantry ingredients.`,
      tips: [
        'Shop the perimeter for fresh foods.',
        'Check the freezer aisle for value produce.',
        'Stick to your list to save money.'
      ],
      image: 'https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?auto=format&fit=crop&w=800&q=80' 
    }
  ],
  'faq': [
    { 
      id: 19, 
      title: 'How to create a meal plan?', 
      desc: 'Head over to the Meal Planner section, create a new plan, and use the Auto-Generate feature or add meals manually.', 
      fullContent: `Creating a meal plan is simple: go to the 'Meal Planner' tab, click 'New Plan', and select your dates. You can search recipes and drag them in, or use our smart auto-generator which builds a plan based on your health profile and calorie goals automatically.`,
      tips: ['Use Auto-Generate for speed.', 'Drag and drop recipes.', 'Sync with shopping list.'],
      image: 'https://images.unsplash.com/photo-1543352634-99a5d50ae78e?auto=format&fit=crop&w=800&q=80' 
    },
    { 
      id: 20, 
      title: 'How do recommendations work?', 
      desc: 'Our engine cross-references your dietary profile, allergies, and diseases against recipe ingredients and nutritional data.', 
      fullContent: `Our recommendation engine uses advanced filtering to ensure 100% safety. It scans recipe metadata against your profile's 'Allergies' and 'Diseases' sections. If a recipe contains an allergen you've specified, it is automatically hidden or flagged. We also prioritize recipes that align with your health goals (e.g., low sodium for heart health).`,
      tips: ['Keep profile updated.', 'Set exclusions in settings.', 'Check "Recommended" labels.'],
      image: 'https://images.unsplash.com/photo-1505935428862-770b6f24f629?auto=format&fit=crop&w=800&q=80' 
    }
  ],
  'blog': [
    { 
      id: 21, 
      title: 'Top 10 Quick Recipes', 
      desc: 'Meals ready in under 20 minutes for those busy weeknights.', 
      fullContent: `Quick recipes do not have to feel like compromise meals. The best fast dishes use a small ingredient list and simple methods.

Top 10 quick recipe ideas:
1. Veggie omelet wrap
2. Garlic chili noodles
3. Chickpea salad bowl
4. Sheet pan chicken and vegetables
5. Pesto pasta with peas
6. Tofu stir-fry
7. Tuna yogurt sandwich
8. Black bean quesadilla
9. Tomato lentil soup
10. Yogurt fruit parfait`,
      tips: [
        'Keep pantry staples like canned beans and pasta.',
        'Use frozen vegetables for speed.',
        'Prep sauces ahead of time.'
      ],
      image: 'https://images.unsplash.com/photo-1493770348161-369560ae357d?auto=format&fit=crop&w=800&q=80' 
    },
    { 
      id: 22, 
      title: 'Best Foods for Summer', 
      desc: 'Hydrating and refreshing ingredients to beat the heat.', 
      fullContent: `Summer meals feel best when they are light and colorful. Foods with high water content like watermelon and cucumber feel refreshing without being heavy.

Great summer picks:
- Watermelon, berries, peaches
- Cucumbers, tomatoes, zucchini
- Yogurt, grilled fish, beans
- Chilled lentil salads`,
      tips: [
        'Use quick cooking methods or raw produce.',
        'Stay hydrated with water-rich foods.',
        'Keep food safety in mind for outdoor eating.'
      ],
      image: '/resources/summer-foods.png' 
    },
    { 
      id: 23, 
      title: 'Healthy Breakfast Ideas', 
      desc: 'Start your morning right with these energy-boosting meals.', 
      fullContent: `A healthy breakfast does not need to be large. The formula is protein + fiber + produce.

Healthy breakfast ideas:
- Greek yogurt with berries and nuts
- Oatmeal with banana and peanut butter
- Veggie omelet with toast
- Smoothie with spinach and yogurt
- Overnight oats
- Avocado toast with egg`,
      tips: [
        'Include protein to stay full longer.',
        'Prep options like overnight oats the night before.',
        'Avoid sugary cereals for better energy.'
      ],
      image: 'https://images.unsplash.com/photo-1494390248081-4e521a5940db?auto=format&fit=crop&w=800&q=80' 
    }
  ]
};

const FAQ_ITEMS = [
  { question: "Can people with diabetes eat fruit?", answer: "Yes. Whole fruit usually fits better than juice because it contains fiber and is easier to portion." },
  { question: "Do I need to avoid all carbs for diabetes?", answer: "No. Many people with diabetes do better by choosing higher-fiber carbs and managing portions rather than cutting carbs completely." },
  { question: "Is all fat bad for the heart?", answer: "No. Unsaturated fats from foods like olive oil, nuts, seeds, and fish are generally a better choice than saturated fats." },
  { question: "Can heart-healthy food still be flavorful?", answer: "Absolutely. Herbs, garlic, ginger, chili, lemon, and spices add strong flavor without excess salt or butter." },
  { question: "Is 1500 calories right for everyone?", answer: "No. Calorie needs depend on age, body size, activity level, medical history, and goals." },
  { question: "What are the cheapest protein options?", answer: "Beans, lentils, eggs, canned fish, tofu, and yogurt are usually strong value choices." },
  { question: "Is frozen produce still healthy?", answer: "Yes. It is often picked and frozen at peak quality and can be a great value." },
  { question: "Should I plan every single meal?", answer: "Not necessarily. Many people do better planning main meals and leaving room for leftovers or easy backups." }
];

const Resources = () => {
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].id);
  const [content, setContent] = useState(INITIAL_CONTENT);
  const [userDiseases, setUserDiseases] = useState([]);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [readingItem, setReadingItem] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await apiClient.get("/auth/profile");
        // Get user data directly from response as it's not wrapped in a .data.data object based on AuthController.java
        const user = res.data;
        const healthData = user.healthProfile;
        if (healthData && healthData.diseases) {
          const diseases = healthData.diseases.map(d => d.diseaseName);
          setUserDiseases(diseases);
          
          const nutritionContent = [...INITIAL_CONTENT['nutrition-health']];
          nutritionContent.sort((a, b) => {
            const aMatch = a.targetDisease && diseases.includes(a.targetDisease) ? 1 : 0;
            const bMatch = b.targetDisease && diseases.includes(b.targetDisease) ? 1 : 0;
            return bMatch - aMatch;
          });
          
          setContent(prev => ({
            ...prev,
            'nutrition-health': nutritionContent
          }));
        }
      } catch (err) {
        console.warn("Could not fetch profile for personalization");
      }
    };
    fetchUserProfile();
  }, []);

  const handleReadGuide = (item) => {
    setReadingItem(item);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-surface font-body text-on-surface pb-12 px-6">
      
      {/* Separate Page Header with Back Button */}
      <div className="max-w-7xl mx-auto py-8">
        <div className="flex items-center gap-6 mb-12">
          <BackButton onClick={() => navigate("/")} />
          <div>
            <h1 className="text-4xl font-headline font-black text-on-surface">Resources</h1>
            <p className="text-on-surface-variant text-sm mt-1">Discover guides, tips, and articles curated for your health.</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Sidebar Navigation */}
          {!readingItem && (
            <div className="w-full lg:w-64 shrink-0">
              <div className="bg-white rounded-[2rem] border border-outline-variant/20 p-3 shadow-sm sticky top-8">
                <div className="flex flex-col gap-1">
                  {CATEGORIES.map(category => (
                    <button
                      key={category.id}
                      onClick={() => {
                        setActiveCategory(category.id);
                        setReadingItem(null);
                      }}
                      className={`flex items-center gap-3 px-5 py-3.5 rounded-xl transition-all duration-200 text-left ${
                        activeCategory === category.id 
                          ? 'bg-primary text-white font-black' 
                          : 'hover:bg-surface-container-high text-on-surface-variant font-bold'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">{category.icon}</span>
                      <span className="text-[12px] uppercase tracking-wider">{category.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Main Content Area */}
          <div className="flex-1 min-h-[600px]">
            <AnimatePresence mode="wait">
              {readingItem ? (
                <motion.div
                  key="reading"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border border-outline-variant/20"
                >
                  <BackButton 
                    onClick={() => setReadingItem(null)} 
                    label="Back to List"
                    className="mb-8"
                  />
                  <img 
                    src={readingItem.image} 
                    alt={readingItem.title} 
                    className="w-full h-64 md:h-96 object-cover rounded-[1.5rem] mb-8 shadow-sm"
                  />
                  <h2 className="text-3xl md:text-5xl font-headline font-black text-on-surface mb-8 leading-tight">
                    {readingItem.title}
                  </h2>
                  
                  <div className="prose prose-green max-w-none">
                    {/* Main Content Text */}
                    <div className="text-lg text-on-surface-variant leading-relaxed mb-10 whitespace-pre-wrap font-medium">
                      {readingItem.fullContent}
                    </div>
                    
                    {/* Key Tips Section */}
                    {readingItem.tips && readingItem.tips.length > 0 && (
                      <div className="my-12 p-8 md:p-10 bg-primary/5 rounded-[2.5rem] border border-primary/10 shadow-inner">
                        <h4 className="text-2xl font-headline font-black text-primary mb-6 flex items-center gap-3">
                          <span className="material-symbols-outlined text-3xl">tips_and_updates</span>
                          Key Takeaways & Tips
                        </h4>
                        <ul className="grid sm:grid-cols-2 gap-6">
                          {readingItem.tips.map((tip, idx) => (
                            <li key={idx} className="flex items-start gap-4 text-on-surface-variant text-[15px] font-bold leading-snug">
                              <span className="material-symbols-outlined text-primary text-xl mt-0.5">check_circle</span>
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Disclaimer - Now at the bottom */}
                    <div className="mt-16 p-6 bg-surface-container-low rounded-2xl border border-outline-variant/30 flex gap-4 items-start">
                      <span className="material-symbols-outlined text-outline text-2xl">info</span>
                      <p className="text-on-surface-variant leading-relaxed opacity-80 italic text-sm">
                        <strong>Disclaimer:</strong> Health-related sections are educational and intended for informational purposes only. For specific conditions like diabetes, heart disease, or kidney disease, please consult your healthcare provider or a registered dietitian.
                      </p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key={activeCategory}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h2 className="text-3xl md:text-4xl font-headline font-black text-on-surface">
                      {CATEGORIES.find(c => c.id === activeCategory)?.label}
                    </h2>
                    {activeCategory === 'nutrition-health' && userDiseases.length > 0 && (
                      <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full border border-primary/20 text-[10px] font-black uppercase tracking-widest shrink-0">
                        <span className="material-symbols-outlined text-[14px]">psychology</span>
                        Personalized for you
                      </div>
                    )}
                  </div>

                  <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {content[activeCategory].map((item) => (
                      <div key={item.id} className="group bg-white rounded-[2rem] shadow-sm hover:shadow-xl border border-outline-variant/20 overflow-hidden flex flex-col h-full transition-all duration-300 hover:-translate-y-1">
                        {item.image && (
                          <div className="relative aspect-video overflow-hidden bg-surface-container-high">
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            {item.targetDisease && userDiseases.includes(item.targetDisease) && (
                              <div className="absolute top-3 left-3">
                                <span className="px-3 py-1 rounded-full bg-primary text-white text-[9px] font-black uppercase tracking-widest shadow-md flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[10px]">star</span>
                                  Recommended
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                        <div className="p-6 flex flex-col flex-grow">
                          <h3 className="text-lg font-headline font-black text-on-surface mb-2 leading-snug group-hover:text-primary transition-colors">
                            {item.title}
                          </h3>
                          <p className="text-on-surface-variant text-sm leading-relaxed opacity-80 mb-6 flex-grow">
                            {item.desc}
                          </p>
                          <button 
                            onClick={() => handleReadGuide(item)}
                            className="inline-flex items-center gap-1 text-primary font-black uppercase tracking-widest text-[10px] hover:gap-2 transition-all mt-auto w-fit"
                          >
                            Read Guide
                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-24">
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-primary text-3xl">quiz</span>
            </div>
            <h2 className="text-4xl font-headline font-black text-on-surface mb-2">Frequently Asked Questions</h2>
            <p className="text-on-surface-variant max-w-2xl mx-auto">Quick answers to common questions about our platform and resources.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {FAQ_ITEMS.map((faq, index) => (
              <div 
                key={index} 
                className={`bg-white rounded-2xl border border-outline-variant/30 transition-all duration-300 overflow-hidden ${openFaqIndex === index ? 'shadow-md ring-1 ring-primary/20' : 'hover:shadow-sm'}`}
              >
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  className="w-full p-5 text-left flex items-start justify-between gap-4"
                >
                  <span className="font-bold text-sm text-on-surface">{faq.question}</span>
                  <span className={`material-symbols-outlined text-primary transition-transform duration-300 ${openFaqIndex === index ? 'rotate-180' : ''}`}>
                    expand_more
                  </span>
                </button>
                <AnimatePresence>
                  {openFaqIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="px-5 pb-5 pt-0">
                        <div className="h-px bg-outline-variant/20 mb-4"></div>
                        <p className="text-xs text-on-surface-variant leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Resources;
