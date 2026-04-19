import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import apiClient from "../../utils/apiClient";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { HeroSkeleton } from "../../components/common/LoadingSkeleton";
import { IoCheckmarkCircle } from "react-icons/io5";

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
const MEAL_TYPES = ["BREAKFAST", "LUNCH", "DINNER"];

const MealPlanner = () => {
    const { planId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedSlot, setSelectedSlot] = useState(null); // { day, type }
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [savedRecipes, setSavedRecipes] = useState([]);
    const [modalTab, setModalTab] = useState("recommended"); // "recommended", "search" or "saved"
    const [recommendedRecipes, setRecommendedRecipes] = useState([]);
    const [fetchingRecommended, setFetchingRecommended] = useState(false);
    const [autoFilling, setAutoFilling] = useState(null); // dayName if filling
    const [filters, setFilters] = useState({
        dietType: "",
        mealType: "",
        difficulty: "",
        maxCalories: "",
        minCalories: ""
    });
    const [healthScoreFilter, setHealthScoreFilter] = useState(0);

    const backPath = location.state?.from || '/meal-planner';

    useEffect(() => {
        if (planId) {
            fetchPlan();
            fetchSavedRecipes();
        }
    }, [planId]);

    const fetchSavedRecipes = async () => {
        try {
            const res = await apiClient.get("/saved-recipes");
            setSavedRecipes(res.data.data || []);
        } catch (err) {
            console.error("Failed to fetch saved recipes", err);
        }
    };

    const fetchPlan = async () => {
        try {
            const res = await apiClient.get(`/meal-planner/plans/${planId}`);
            setPlan(res.data.data);
        } catch (err) {
            toast.error("Failed to load plan");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (q, customFilters = filters) => {
        setSearchQuery(q);
        setSearching(true);
        try {
            const params = {
                q: q.trim(),
                ...customFilters,
                size: 20
            };
            // Remove empty strings
            Object.keys(params).forEach(key => params[key] === "" && delete params[key]);
            
            const res = await apiClient.get("/recipes", { params });
            setSearchResults(res.data.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setSearching(false);
        }
    };

    const handleAutoFillDay = async (day) => {
        setAutoFilling(day);
        try {
            await apiClient.post(`/meal-planner/plans/${planId}/days/${day}/auto-fill`);
            toast.success(`${day} auto-filled!`);
            fetchPlan();
        } catch (err) {
            toast.error("Auto-fill failed");
        } finally {
            setAutoFilling(null);
        }
    };

    const fetchRecommendations = async (type) => {
        setFetchingRecommended(true);
        try {
            const res = await apiClient.get("/recipes/recommended", {
                params: {
                    limit: 12,
                    mealType: type || selectedSlot?.type
                }
            });
            setRecommendedRecipes(res.data.data || []);
        } catch (err) {
            console.error("Failed to fetch recommendations", err);
        } finally {
            setFetchingRecommended(false);
        }
    };

    useEffect(() => {
        if (selectedSlot && modalTab === "recommended") {
            fetchRecommendations(selectedSlot.type);
        }
    }, [selectedSlot, modalTab]);

    const addMeal = async (recipeId) => {
        try {
            await apiClient.post(`/meal-planner/plans/${planId}/meals`, {
                dayOfWeek: selectedSlot.day,
                mealType: selectedSlot.type,
                recipeId
            });
            toast.success("Meal added to plan");
            setSelectedSlot(null);
            fetchPlan();
        } catch (err) {
            toast.error("Failed to add meal");
        }
    };

    const removeMeal = async (slotId) => {
        try {
            await apiClient.delete(`/meal-planner/meals/${slotId}`);
            toast.success("Meal removed");
            fetchPlan();
        } catch (err) {
            toast.error("Failed to remove meal");
        }
    };

    const activatePlan = async () => {
        try {
            await apiClient.post(`/meal-planner/plans/${planId}/activate`);
            toast.success("Plan Activated");
            fetchPlan();
        } catch (err) {
            toast.error("Activation failed");
        }
    };

    const generateShoppingList = async () => {
        if (!plan) return;

        // Collect all recipe IDs from the plan
        const recipeIds = [];
        plan.days.forEach(day => {
            day.slots.forEach(slot => {
                if (slot.recipe?.id) {
                    recipeIds.push(slot.recipe.id);
                }
            });
        });

        if (recipeIds.length === 0) {
            toast.error("No recipes in the plan to generate shopping list");
            return;
        }

        try {
            // Generate the list
            const generateRes = await apiClient.post('/shopping-lists/generate', { recipeIds });
            const listData = generateRes.data.data;

            // Save the list
            const saveRes = await apiClient.post('/shopping-lists/save', {
                name: `${plan.name} Shopping List`,
                items: listData.items.map(item => ({
                    ingredientName: item.ingredientName,
                    quantity: item.quantity,
                    unit: item.unit,
                    category: item.category,
                    ingredientId: item.ingredientId
                }))
            });

            toast.success("Shopping list generated!");
            navigate(`/shopping-list/${saveRes.data.data.id}`);
        } catch (err) {
            console.error(err);
            toast.error("Failed to generate shopping list");
        }
    };

    const getSlotAt = (dayName, typeName) => {
        if (!plan) return null;
        const day = plan.days.find(d => d.dayOfWeek === dayName);
        if (!day) return null;
        return day.slots.find(s => s.mealType === typeName);
    };

    const getDayTotalCalories = (dayName) => {
        if (!plan) return 0;
        const day = plan.days.find(d => d.dayOfWeek === dayName);
        if (!day) return 0;
        return day.slots.reduce((sum, slot) => sum + (slot.recipe?.nutrition?.calories || 0), 0);
    };

    const getHealthScore = (recipe) => {
        if (!plan || !recipe) return 0;
        let score = 50; // Start at 50%
        
        // Calorie match (Goal based)
        if (plan.goal === 'WEIGHT_LOSS') {
            if (recipe.nutrition?.calories < 400) score += 30;
            else if (recipe.nutrition?.calories < 600) score += 15;
            else score -= 10;
        } else if (plan.goal === 'MUSCLE_GAIN') {
            if (recipe.nutrition?.protein > 30) score += 30;
            else if (recipe.nutrition?.protein > 20) score += 15;
            else score -= 5;
        }

        // Diet Type match
        if (recipe.dietType && plan.goal?.includes(recipe.dietType)) score += 20;
        
        return Math.min(100, Math.max(0, score));
    };

    const filteredResults = searchResults.filter(r => getHealthScore(r) >= healthScoreFilter);

    if (loading) return <div className="bg-surface min-h-screen py-24 px-8"><HeroSkeleton /></div>;

    return (
        <div className="bg-surface min-h-screen pt-24 px-4 lg:px-12 pb-32 relative overflow-hidden">
             <div className="absolute inset-0 z-0 pointer-events-none opacity-10">
                <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[150px]"></div>
                <div className="absolute top-[40%] -right-[10%] w-[60%] h-[60%] rounded-full bg-tertiary-container/10 blur-[120px]"></div>
            </div>

            <div className="max-w-[1700px] mx-auto relative z-10">
                <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="max-w-3xl">
                        <button 
                            onClick={() => navigate(backPath)}
                            className="group flex items-center gap-3 text-primary hover:text-white hover:bg-primary px-5 py-2.5 rounded-2xl transition-all mb-8 text-[11px] font-black uppercase tracking-widest border border-primary/20 bg-primary/5 shadow-sm hover:shadow-lg hover:shadow-primary/20"
                        >
                            <span className="material-symbols-outlined text-base group-hover:-translate-x-1 transition-transform">arrow_back</span>
                            {backPath === '/profile' ? 'Back to Profile' : 'Back to Library'}
                        </button>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
                                <span className="material-symbols-outlined text-xs">analytics</span>
                                {plan?.goal?.replace('_', ' ') || "Meal Plan"}
                            </div>
                            {plan?.isActive && (
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20">
                                    <IoCheckmarkCircle className="text-sm" />
                                    Active Plan
                                </div>
                            )}
                        </div>
                        <h1 className="text-3xl md:text-5xl font-headline font-black tracking-tighter text-on-surface uppercase leading-none">
                            {plan?.name}
                        </h1>
                        <p className="text-on-surface-variant mt-6 font-medium opacity-70 max-w-2xl text-lg leading-relaxed">{plan?.description || "Organizing your weekly meals..."}</p>
                    </div>

                    <div className="flex gap-4">
                        {!plan?.isActive && (
                            <button
                                onClick={activatePlan}
                                className="px-10 py-5 rounded-[2rem] vitality-gradient text-white font-black uppercase tracking-widest text-xs shadow-xl hover:scale-[1.05] active:scale-[0.95] transition-all flex items-center gap-3"
                            >
                                <IoCheckmarkCircle className="text-lg" />
                                Use this Plan
                            </button>
                        )}
                        {plan?.isActive && (
                            <button
                                onClick={generateShoppingList}
                                className="px-10 py-5 rounded-[2rem] bg-surface-container-low text-on-surface font-black uppercase tracking-widest text-xs shadow-xl hover:bg-surface-container-high hover:scale-[1.05] active:scale-[0.95] transition-all flex items-center gap-3"
                            >
                                <span className="material-symbols-outlined text-base">shopping_cart</span>
                                Generate Shopping List
                            </button>
                        )}
                    </div>
                </header>

                {/* Weekly Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-6">
                    {DAYS.map(day => (
                        <div key={day} className="flex flex-col gap-0 bg-white/40 backdrop-blur-xl rounded-[3rem] border border-white/50 botanical-shadow overflow-hidden transition-all hover:bg-white/50">
                            {/* Day Header */}
                            <div className="text-center py-6 px-4 bg-white/20 border-b border-white/40 flex flex-col items-center relative group/day">
                                <button 
                                    onClick={() => handleAutoFillDay(day)}
                                    disabled={autoFilling === day}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-primary/10 text-primary opacity-0 group-hover/day:opacity-100 transition-all hover:bg-primary hover:text-white flex items-center justify-center shadow-sm"
                                    title="Auto-fill empty slots for today"
                                >
                                    {autoFilling === day ? (
                                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <span className="material-symbols-outlined text-sm">magic_button</span>
                                    )}
                                </button>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1">{day}</h3>
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/5 rounded-full border border-primary/10">
                                    <span className="material-symbols-outlined text-[10px] text-primary">flame</span>
                                    <span className="text-[9px] font-black text-on-surface opacity-60 tracking-tight">
                                        {getDayTotalCalories(day).toFixed(0)} kcal
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col p-4 gap-4">
                                {MEAL_TYPES.map(type => {
                                    const slot = getSlotAt(day, type);
                                    const recipe = slot?.recipe;
                                    
                                    return (
                                        <div key={type} className="relative group">
                                            <div className="flex items-center justify-between mb-2 px-2">
                                                <p className="text-[8px] font-black uppercase tracking-widest text-on-surface-variant opacity-30">{type}</p>
                                                {recipe && (
                                                    <span className="text-[7px] font-black text-primary/40 uppercase tracking-tighter">
                                                        {recipe.nutrition?.calories || 0} kcal
                                                    </span>
                                                )}
                                            </div>

                                            {recipe ? (
                                                <div className="bg-white p-4 rounded-[2.5rem] border border-white botanical-shadow hover:border-primary/20 transition-all group/card relative overflow-hidden h-[240px] flex flex-col">
                                                    <div className="h-32 rounded-[1.8rem] overflow-hidden mb-3 bg-surface-container-high border border-white/20 shrink-0">
                                                        <img 
                                                            src={recipe.coverImageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"} 
                                                            alt={recipe.title} 
                                                            className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110"
                                                        />
                                                    </div>
                                                    <h4 className="text-[11px] font-black text-on-surface line-clamp-2 leading-tight mb-auto group-hover/card:text-primary transition-colors">{recipe.title}</h4>
                                                    
                                                    <div className="flex justify-between items-center bg-surface-container-low/50 p-2 rounded-2xl mt-2 overflow-hidden">
                                                        <div className="flex items-center gap-1 text-[8px] font-black text-on-surface-variant opacity-60 uppercase truncate">
                                                            <span className="material-symbols-outlined text-[10px]">schedule</span>
                                                            {recipe.prepTime + recipe.cookTime}m
                                                        </div>
                                                        <button 
                                                            onClick={() => removeMeal(slot.id)}
                                                            className="w-7 h-7 rounded-full bg-error/10 text-error flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-all hover:bg-error hover:text-white shrink-0"
                                                        >
                                                            <span className="material-symbols-outlined text-[12px]">close</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button 
                                                    onClick={() => setSelectedSlot({ day, type })}
                                                    className="w-full h-[240px] rounded-[2.5rem] border-2 border-dashed border-outline-variant/10 flex flex-col items-center justify-center gap-3 text-on-surface-variant/30 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all bg-white/30 backdrop-blur-sm"
                                                >
                                                    <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-sm">
                                                        <span className="material-symbols-outlined text-base">add</span>
                                                    </div>
                                                    <span className="text-[8px] font-black uppercase tracking-widest">Add {type}</span>
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Selection Modal */}
            <AnimatePresence>
                {selectedSlot && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12">
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }} 
                            onClick={() => setSelectedSlot(null)}
                            className="absolute inset-0 bg-black/50 backdrop-blur-md"
                        ></motion.div>
                        
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 30 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 30 }}
                            className="relative bg-white rounded-[3rem] md:rounded-[4rem] w-full max-w-6xl p-0 botanical-shadow h-[90vh] md:h-[85vh] overflow-hidden flex border border-white"
                        >
                            {/* Left Sidebar: Filters */}
                            <div className="w-80 bg-surface-container-low border-r border-outline-variant/10 p-10 flex flex-col overflow-y-auto hidden lg:flex">
                                <div className="mb-10">
                                    <h3 className="text-xl font-headline font-black text-on-surface mb-6 tracking-tight">Filters</h3>
                                    
                                    <div className="space-y-8">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-40 mb-4">Min. Health Match</p>
                                            <div className="flex flex-col gap-3">
                                                <input 
                                                    type="range" min="0" max="90" step="10"
                                                    value={healthScoreFilter}
                                                    onChange={(e) => setHealthScoreFilter(parseInt(e.target.value))}
                                                    className="w-full accent-primary"
                                                />
                                                <span className="text-lg font-black text-primary">{healthScoreFilter}%+</span>
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-40 mb-4">Dietary Type</p>
                                            <select 
                                                value={filters.dietType}
                                                onChange={(e) => {
                                                    const newFilters = {...filters, dietType: e.target.value};
                                                    setFilters(newFilters);
                                                    handleSearch(searchQuery, newFilters);
                                                }}
                                                className="w-full p-4 rounded-2xl bg-white border border-outline-variant/10 text-xs font-bold uppercase tracking-widest"
                                            >
                                                <option value="">Any Diet</option>
                                                <option value="VEGAN">Vegan</option>
                                                <option value="VEGETARIAN">Vegetarian</option>
                                                <option value="KETO">Keto</option>
                                                <option value="PALEO">Paleo</option>
                                            </select>
                                        </div>

                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-40 mb-4">Max Calories</p>
                                            <input 
                                                type="number" 
                                                min="0"
                                                placeholder="e.g. 800"
                                                value={filters.maxCalories}
                                                onKeyDown={(e) => { if(e.key === '-' || e.key === 'e') e.preventDefault(); }}
                                                onChange={(e) => {
                                                    const val = e.target.value === "" ? "" : Math.max(0, parseInt(e.target.value));
                                                    const newFilters = {...filters, maxCalories: val};
                                                    setFilters(newFilters);
                                                    handleSearch(searchQuery, newFilters);
                                                }}
                                                className="w-full p-4 rounded-2xl bg-white border border-outline-variant/10 text-xs font-bold"
                                            />
                                        </div>

                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-40 mb-4">Cooking Skill</p>
                                            <div className="flex flex-wrap gap-2">
                                                {['EASY', 'MEDIUM', 'HARD'].map(lvl => (
                                                    <button 
                                                        key={lvl}
                                                        onClick={() => {
                                                            const newFilters = {...filters, difficulty: filters.difficulty === lvl ? "" : lvl};
                                                            setFilters(newFilters);
                                                            handleSearch(searchQuery, newFilters);
                                                        }}
                                                        className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-tighter transition-all border ${filters.difficulty === lvl ? 'bg-primary text-white border-primary' : 'bg-white text-on-surface-variant border-outline-variant/10 hover:border-primary/40'}`}
                                                    >
                                                        {lvl}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => {
                                        const reset = { dietType: "", difficulty: "", maxCalories: "", minCalories: "" };
                                        setFilters(reset);
                                        setHealthScoreFilter(0);
                                        handleSearch(searchQuery, reset);
                                    }}
                                    className="mt-auto text-[9px] font-black uppercase tracking-widest text-error opacity-60 hover:opacity-100 transition-all flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-sm">restart_alt</span>
                                    Reset Filters
                                </button>
                            </div>

                            {/* Right Content: Results */}
                            <div className="flex-grow p-6 md:p-12 flex flex-col h-full bg-white">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest mb-4">
                                            Smart Discovery
                                        </div>
                                        <h3 className="text-3xl md:text-4xl font-headline font-black text-on-surface mb-2 tracking-tight">Select Recipe</h3>
                                    </div>
                                    <button 
                                        onClick={() => setSelectedSlot(null)}
                                        className="w-12 h-12 rounded-full border border-outline-variant/10 flex items-center justify-center hover:bg-surface-container-high transition-all"
                                    >
                                        <span className="material-symbols-outlined">close</span>
                                    </button>
                                </div>

                                <div className="flex gap-4 mb-8 p-1.5 bg-surface-container-low rounded-2xl shrink-0">
                                    <button 
                                        onClick={() => setModalTab("recommended")}
                                        className={`flex-grow py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${modalTab === 'recommended' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant opacity-40 hover:opacity-100'}`}
                                    >
                                        ⭐ Recommended
                                    </button>
                                    <button 
                                        onClick={() => setModalTab("search")}
                                        className={`flex-grow py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${modalTab === 'search' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant opacity-40 hover:opacity-100'}`}
                                    >
                                        Search All
                                    </button>
                                    <button 
                                        onClick={() => setModalTab("saved")}
                                        className={`flex-grow py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${modalTab === 'saved' ? 'bg-white text-secondary shadow-sm' : 'text-on-surface-variant opacity-40 hover:opacity-100'}`}
                                    >
                                        Favorites ({savedRecipes.length})
                                    </button>
                                </div>

                                {modalTab === "search" && (
                                    <div className="relative mb-8 shrink-0">
                                        <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-primary">search</span>
                                        <input 
                                            type="text"
                                            placeholder="Ex: Chicken Pasta, Keto Salad..."
                                            className="w-full pl-16 pr-8 py-5 bg-surface-container-low rounded-[2rem] border-none focus:ring-2 focus:ring-primary/20 font-bold text-on-surface placeholder:opacity-30"
                                            value={searchQuery}
                                            onChange={(e) => handleSearch(e.target.value)}
                                            autoFocus
                                        />
                                        {searching && <div className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>}
                                    </div>
                                )}

                                <div className="flex-grow overflow-y-auto space-y-4 pr-2 md:pr-4 custom-scrollbar">
                                    {modalTab === "recommended" && (
                                        <>
                                            {fetchingRecommended ? (
                                                <div className="flex flex-col items-center justify-center py-20 gap-4">
                                                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-primary animate-pulse">Personalizing your menu...</p>
                                                </div>
                                            ) : recommendedRecipes.length > 0 ? (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
                                                    {recommendedRecipes.map(recipe => (
                                                        <button 
                                                            key={recipe.id}
                                                            onClick={() => addMeal(recipe.id)}
                                                            className="w-full p-6 rounded-[3.5rem] bg-surface-container-low hover:bg-primary group transition-all flex flex-col gap-6 text-left border relative shadow-sm hover:shadow-xl hover:shadow-primary/20 h-[320px] border-primary/20 bg-primary/5"
                                                        >
                                                            <div className="flex items-start gap-6 w-full">
                                                                <div className="w-28 h-28 rounded-[2.5rem] overflow-hidden bg-white flex-shrink-0 relative border border-outline-variant/10">
                                                                    <img 
                                                                        src={recipe.coverImageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"} 
                                                                        alt={recipe.title} 
                                                                        className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                                                                    />
                                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                                                                </div>
                                                                <div className="flex-grow pt-2">
                                                                    <p className="font-black text-on-surface group-hover:text-white transition-colors text-xl leading-[1.1] mb-2 line-clamp-2">{recipe.title}</p>
                                                                    <div className="flex flex-wrap items-center gap-2">
                                                                        <span className="px-3 py-1 rounded-full bg-primary text-white text-[9px] font-black uppercase tracking-widest">Recommended</span>
                                                                        {recipe.dietType && <span className="text-[9px] font-black uppercase tracking-widest text-primary-variant group-hover:text-white/80">{recipe.dietType}</span>}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            
                                                            <div className="grid grid-cols-3 gap-2 bg-white/60 group-hover:bg-black/10 p-4 rounded-[2rem] transition-colors mt-auto">
                                                                <div className="text-center">
                                                                    <p className="text-[8px] font-black text-on-surface-variant opacity-40 uppercase group-hover:text-white/40">Calories</p>
                                                                    <p className="text-[12px] font-black text-on-surface group-hover:text-white">{recipe.nutrition?.calories?.toFixed(0) || 0}</p>
                                                                </div>
                                                                <div className="text-center border-x border-outline-variant/10 group-hover:border-white/10">
                                                                    <p className="text-[8px] font-black text-on-surface-variant opacity-40 uppercase group-hover:text-white/40">Protein</p>
                                                                    <p className="text-[12px] font-black text-on-surface group-hover:text-white">{recipe.nutrition?.protein?.toFixed(0) || 0}g</p>
                                                                </div>
                                                                <div className="text-center">
                                                                    <p className="text-[8px] font-black text-on-surface-variant opacity-40 uppercase group-hover:text-white/40">Time</p>
                                                                    <p className="text-[12px] font-black text-on-surface group-hover:text-white">{recipe.prepTime + recipe.cookTime}m</p>
                                                                </div>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-24 opacity-30">
                                                    <span className="material-symbols-outlined text-6xl mb-4">stars</span>
                                                    <p className="font-black uppercase tracking-widest text-sm">Complete your profile for better suggestions</p>
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {modalTab === "search" ? (
                                        <>
                                            {filteredResults.length > 0 ? (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
                                                    {filteredResults.sort((a,b) => getHealthScore(b) - getHealthScore(a)).map(recipe => (
                                                        <button 
                                                            key={recipe.id}
                                                            onClick={() => addMeal(recipe.id)}
                                                            className={`w-full p-6 rounded-[3rem] bg-surface-container-low hover:bg-primary text-white group transition-all flex flex-col gap-6 text-left border shadow-sm hover:shadow-xl hover:shadow-primary/20 h-full ${getHealthScore(recipe) > 75 ? 'border-primary/40 bg-primary/5' : 'border-white'}`}
                                                        >
                                                            <div className="flex items-start gap-5 w-full">
                                                                <div className="w-24 h-24 rounded-[2rem] overflow-hidden bg-white flex-shrink-0 relative border border-outline-variant/10">
                                                                    <img 
                                                                        src={recipe.coverImageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"} 
                                                                        alt={recipe.title} 
                                                                        className="w-full h-full object-cover" 
                                                                    />
                                                                    <div className="absolute right-2 top-2 p-1.5 rounded-full bg-white/90 backdrop-blur shadow-sm flex items-center justify-center border border-primary/5">
                                                                        <span className="text-[9px] font-black text-primary">{getHealthScore(recipe)}%</span>
                                                                    </div>
                                                                </div>
                                                                <div className="flex-grow pt-1">
                                                                    <p className="font-black text-on-surface group-hover:text-white transition-colors text-lg leading-tight mb-2 line-clamp-2">{recipe.title}</p>
                                                                    <div className="flex flex-wrap items-center gap-2">
                                                                        {getHealthScore(recipe) > 80 && (
                                                                            <span className="px-2 py-0.5 rounded-full bg-primary text-white text-[8px] font-black uppercase tracking-tighter">Top Match</span>
                                                                        )}
                                                                        <span className="text-[9px] font-black uppercase tracking-widest text-primary group-hover:text-white/80">{recipe.dietType || "HEALTHY"}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            
                                                            <div className="grid grid-cols-3 gap-2 bg-white/50 group-hover:bg-black/10 p-3 rounded-2xl transition-colors mt-auto">
                                                                <div className="text-center">
                                                                    <p className="text-[7px] font-black text-on-surface-variant opacity-40 uppercase group-hover:text-white/40">Calories</p>
                                                                    <p className="text-[10px] font-black text-on-surface group-hover:text-white">{recipe.nutrition?.calories || 0}</p>
                                                                </div>
                                                                <div className="text-center border-x border-outline-variant/10 group-hover:border-white/10">
                                                                    <p className="text-[7px] font-black text-on-surface-variant opacity-40 uppercase group-hover:text-white/40">Protein</p>
                                                                    <p className="text-[10px] font-black text-on-surface group-hover:text-white">{recipe.nutrition?.protein || 0}g</p>
                                                                </div>
                                                                <div className="text-center">
                                                                    <p className="text-[7px] font-black text-on-surface-variant opacity-40 uppercase group-hover:text-white/40">Time</p>
                                                                    <p className="text-[10px] font-black text-on-surface group-hover:text-white">{recipe.prepTime + recipe.cookTime}m</p>
                                                                </div>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-16 opacity-20">
                                                    <span className="material-symbols-outlined text-6xl mb-4">search_off</span>
                                                    <p className="font-black uppercase tracking-widest text-xs">Try different filters</p>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
                                            {savedRecipes.map(fav => (
                                                <button 
                                                    key={fav.recipeId || fav.id}
                                                    onClick={() => addMeal(fav.recipeId || fav.id)}
                                                    className="w-full p-6 rounded-[3rem] bg-surface-container-low hover:bg-secondary text-white group transition-all flex items-center gap-6 text-left border border-white shadow-sm hover:shadow-xl hover:shadow-secondary/20 h-full"
                                                >
                                                    <div className="w-24 h-24 rounded-[2rem] overflow-hidden bg-white flex-shrink-0 relative border border-outline-variant/10">
                                                        <img 
                                                            src={fav.coverImageUrl || fav.recipe?.coverImageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"} 
                                                            alt={fav.title || fav.recipe?.title} 
                                                            className="w-full h-full object-cover" 
                                                        />
                                                    </div>
                                                    <div className="flex-grow">
                                                        <p className="font-black text-on-surface group-hover:text-white transition-colors text-lg leading-tight mb-2 line-clamp-2">{fav.title || fav.recipe?.title}</p>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant group-hover:text-white/70">SAVED</span>
                                                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                                                <span className="material-symbols-outlined text-sm">bookmark</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="p-8 border-t border-outline-variant/10 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-surface-container-low shrink-0">
                                    <div className="flex items-center gap-4 text-on-surface-variant/40">
                                        <span className="material-symbols-outlined text-xl">info</span>
                                        <p className="text-[10px] leading-relaxed font-medium max-w-xl">
                                            <strong>Safety Disclaimer:</strong> Recommendations are for general guidance and do not constitute medical advice. Please consult a healthcare professional for specific dietary needs.
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">Expert Rule Engine</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MealPlanner;
