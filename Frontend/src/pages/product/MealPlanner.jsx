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

    let backPath = location.state?.from || '/profile?tab=planner';
    if (backPath === '/profile') {
        backPath = '/profile?tab=planner';
    }

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
            const listName = window.prompt("Enter a name for your shopping list:", `${plan.name} List`);
            if (listName === null) return; // User cancelled

            // Generate the list
            const generateRes = await apiClient.post('/shopping-lists/generate', { recipeIds });
            const listData = generateRes.data.data;

            // Save the list
            const saveRes = await apiClient.post('/shopping-lists', {
                name: listName.trim() || `${plan.name} List`,
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
                            Back
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
                            <div className="text-center py-5 px-3 bg-white/20 border-b border-white/40 flex flex-col items-center">
                                <div className="flex items-center justify-center gap-2 mb-3 w-full">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{day}</h3>
                                    <button 
                                        onClick={() => handleAutoFillDay(day)}
                                        disabled={autoFilling === day}
                                        className="w-6 h-6 rounded-full bg-primary/10 text-primary transition-all hover:bg-primary hover:text-white flex items-center justify-center shadow-sm shrink-0"
                                        title="Auto-fill empty slots for today"
                                    >
                                        {autoFilling === day ? (
                                            <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <span className="material-symbols-outlined text-[14px]">magic_button</span>
                                        )}
                                    </button>
                                </div>
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/5 rounded-full border border-primary/10">
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
                                                <div 
                                                    onClick={() => navigate(`/items/${recipe.id}`)}
                                                    className="bg-white p-4 rounded-[2.5rem] border border-white botanical-shadow hover:border-primary/20 transition-all group/card relative overflow-hidden h-[240px] flex flex-col cursor-pointer"
                                                >
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
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                removeMeal(slot.id);
                                                            }}
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
                            className="relative bg-white rounded-[2rem] w-full max-w-4xl botanical-shadow flex flex-col border border-white overflow-hidden"
                            style={{ height: '95vh', maxHeight: '960px' }}
                        >
                            {/* ── HEADER ── */}
                            <div className="px-8 pt-5 pb-3 border-b border-outline-variant/10 flex-shrink-0">
                                {/* Title row */}
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-xl font-headline font-black text-on-surface tracking-tight">
                                        Select a Recipe
                                    </h3>
                                    <button
                                        onClick={() => setSelectedSlot(null)}
                                        className="w-9 h-9 rounded-xl bg-surface-container-low hover:bg-surface-container-high flex items-center justify-center transition-all flex-shrink-0"
                                    >
                                        <span className="material-symbols-outlined text-base">close</span>
                                    </button>
                                </div>

                                {/* Tabs */}
                                <div className="flex gap-1.5 p-1 bg-surface-container-low rounded-xl">
                                    {[
                                        { id: 'recommended', label: 'Recommended' },
                                        { id: 'search', label: 'Search All' },
                                        { id: 'saved', label: `Favorites (${savedRecipes.length})` }
                                    ].map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setModalTab(tab.id)}
                                            className={`flex-1 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all ${
                                                modalTab === tab.id
                                                    ? 'bg-white text-primary shadow-sm'
                                                    : 'text-on-surface-variant/50 hover:text-on-surface-variant'
                                            }`}
                                        >
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* ── SEARCH & FILTERS (only for search tab) ── */}
                            {modalTab === 'search' && (
                                <div className="px-8 py-3 border-b border-outline-variant/10 flex-shrink-0 space-y-2 bg-surface-container-lowest/40">
                                    {/* Search Input */}
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary text-lg">search</span>
                                        <input
                                            type="text"
                                            placeholder="Try: Chicken Pasta, Keto Salad..."
                                            className="w-full pl-12 pr-4 py-3.5 bg-surface-container-low rounded-2xl border border-outline-variant/10 focus:ring-2 focus:ring-primary/20 font-bold text-sm text-on-surface placeholder:opacity-40 outline-none transition-all"
                                            value={searchQuery}
                                            onChange={(e) => handleSearch(e.target.value)}
                                            autoFocus
                                        />
                                        {searching && (
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                        )}
                                    </div>

                                    {/* Filters Row */}
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/40 mr-1">Filters:</span>

                                        {/* Diet Type */}
                                        <select
                                            value={filters.dietType}
                                            onChange={(e) => {
                                                const f = { ...filters, dietType: e.target.value };
                                                setFilters(f);
                                                handleSearch(searchQuery, f);
                                            }}
                                            className="px-3 py-1.5 rounded-xl bg-white border border-outline-variant/10 text-[10px] font-black uppercase tracking-widest text-on-surface-variant outline-none cursor-pointer hover:border-primary/30 transition-all"
                                        >
                                            <option value="">No Preference</option>
                                            <option value="VEG">Vegetarian</option>
                                            <option value="NON_VEG">Non-Vegetarian</option>
                                            <option value="VEGAN">Vegan</option>
                                        </select>

                                        {/* Difficulty pills */}
                                        {['EASY', 'MEDIUM', 'HARD'].map(lvl => (
                                            <button
                                                key={lvl}
                                                onClick={() => {
                                                    const f = { ...filters, difficulty: filters.difficulty === lvl ? '' : lvl };
                                                    setFilters(f);
                                                    handleSearch(searchQuery, f);
                                                }}
                                                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                                                    filters.difficulty === lvl
                                                        ? 'bg-primary text-white border-primary'
                                                        : 'bg-white text-on-surface-variant border-outline-variant/10 hover:border-primary/30'
                                                }`}
                                            >
                                                {lvl}
                                            </button>
                                        ))}

                                        {/* Max Calories */}
                                        <input
                                            type="number"
                                            min="0"
                                            placeholder="Max kcal"
                                            value={filters.maxCalories}
                                            onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }}
                                            onChange={(e) => {
                                                const val = e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value));
                                                const f = { ...filters, maxCalories: val };
                                                setFilters(f);
                                                handleSearch(searchQuery, f);
                                            }}
                                            className="w-24 px-3 py-1.5 rounded-xl bg-white border border-outline-variant/10 text-[10px] font-bold outline-none hover:border-primary/30 transition-all"
                                        />

                                        {/* Health Score */}
                                        <div className="flex items-center gap-2 bg-white border border-outline-variant/10 rounded-xl px-3 py-1.5">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/60 whitespace-nowrap">Health {healthScoreFilter}%+</span>
                                            <input
                                                type="range" min="0" max="90" step="10"
                                                value={healthScoreFilter}
                                                onChange={(e) => setHealthScoreFilter(parseInt(e.target.value))}
                                                className="w-20 accent-primary"
                                            />
                                        </div>

                                        {/* Reset */}
                                        {(filters.dietType || filters.difficulty || filters.maxCalories || healthScoreFilter > 0) && (
                                            <button
                                                onClick={() => {
                                                    const reset = { dietType: '', difficulty: '', maxCalories: '', minCalories: '' };
                                                    setFilters(reset);
                                                    setHealthScoreFilter(0);
                                                    handleSearch(searchQuery, reset);
                                                }}
                                                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-error/70 hover:text-error hover:bg-error/5 border border-transparent hover:border-error/20 transition-all"
                                            >
                                                <span className="material-symbols-outlined text-sm">restart_alt</span>
                                                Reset
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* ── SCROLLABLE RECIPE LIST ── */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar px-8 py-4">
                                {/* RECOMMENDED TAB */}
                                {modalTab === 'recommended' && (
                                    fetchingRecommended ? (
                                        <div className="flex flex-col items-center justify-center h-full gap-4">
                                            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-primary animate-pulse">Personalizing your menu...</p>
                                        </div>
                                    ) : recommendedRecipes.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {recommendedRecipes.map(recipe => (
                                                <button
                                                    key={recipe.id}
                                                    onClick={() => addMeal(recipe.id)}
                                                    className="w-full text-left group rounded-2xl border border-outline-variant/10 bg-surface-container-low hover:bg-primary hover:border-primary hover:shadow-xl hover:shadow-primary/20 transition-all overflow-hidden flex flex-col"
                                                >
                                                    <div className="relative w-full h-36 overflow-hidden">
                                                        <img
                                                            src={recipe.coverImageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'}
                                                            alt={recipe.title}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                                                        <span className="absolute top-3 left-3 px-2 py-1 rounded-full bg-primary text-white text-[8px] font-black uppercase tracking-widest">Recommended</span>
                                                    </div>
                                                    <div className="p-4 flex flex-col gap-3 flex-1">
                                                        <p className="font-black text-on-surface group-hover:text-white text-base leading-tight line-clamp-2 transition-colors">{recipe.title}</p>
                                                        <div className="flex items-center gap-3 mt-auto pt-3 border-t border-outline-variant/10 group-hover:border-white/10">
                                                            <span className="text-[9px] font-black uppercase text-on-surface-variant group-hover:text-white/60">{recipe.dietType || 'Healthy'}</span>
                                                            <div className="ml-auto flex items-center gap-3 text-[10px] font-black text-on-surface group-hover:text-white">
                                                                <span>{recipe.nutrition?.calories?.toFixed(0) || 0} kcal</span>
                                                                <span>·</span>
                                                                <span>{recipe.nutrition?.protein?.toFixed(0) || 0}g protein</span>
                                                                <span>·</span>
                                                                <span>{recipe.prepTime + recipe.cookTime}m</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full gap-3 opacity-30">
                                            <span className="material-symbols-outlined text-6xl">stars</span>
                                            <p className="font-black uppercase tracking-widest text-sm text-center">Complete your health profile<br/>for personalised suggestions</p>
                                        </div>
                                    )
                                )}

                                {/* SEARCH TAB */}
                                {modalTab === 'search' && (
                                    filteredResults.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {filteredResults.sort((a, b) => getHealthScore(b) - getHealthScore(a)).map(recipe => (
                                                <button
                                                    key={recipe.id}
                                                    onClick={() => addMeal(recipe.id)}
                                                    className={`w-full text-left group rounded-2xl border bg-surface-container-low hover:bg-primary hover:border-primary hover:shadow-xl hover:shadow-primary/20 transition-all overflow-hidden flex flex-col ${
                                                        getHealthScore(recipe) > 75 ? 'border-primary/30' : 'border-outline-variant/10'
                                                    }`}
                                                >
                                                    <div className="relative w-full h-32 overflow-hidden">
                                                        <img
                                                            src={recipe.coverImageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'}
                                                            alt={recipe.title}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                                                        <span className="absolute top-2 right-2 px-2 py-1 rounded-full bg-white/90 backdrop-blur text-[9px] font-black text-primary shadow-sm">
                                                            {getHealthScore(recipe)}% match
                                                        </span>
                                                        {getHealthScore(recipe) > 80 && (
                                                            <span className="absolute top-2 left-2 px-2 py-1 rounded-full bg-primary text-white text-[8px] font-black uppercase">Top Match</span>
                                                        )}
                                                    </div>
                                                    <div className="p-4 flex flex-col gap-3 flex-1">
                                                        <p className="font-black text-on-surface group-hover:text-white text-sm leading-tight line-clamp-2 transition-colors">{recipe.title}</p>
                                                        <div className="flex items-center gap-2 mt-auto pt-3 border-t border-outline-variant/10 group-hover:border-white/10">
                                                            <span className="text-[9px] font-black uppercase text-on-surface-variant group-hover:text-white/60">{recipe.dietType || 'General'}</span>
                                                            <div className="ml-auto flex items-center gap-2 text-[10px] font-black text-on-surface group-hover:text-white">
                                                                <span>{recipe.nutrition?.calories || 0} kcal</span>
                                                                <span>·</span>
                                                                <span>{recipe.nutrition?.protein || 0}g protein</span>
                                                                <span>·</span>
                                                                <span>{recipe.prepTime + recipe.cookTime}m</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full gap-3 opacity-30">
                                            <span className="material-symbols-outlined text-6xl">search_off</span>
                                            <p className="font-black uppercase tracking-widest text-sm text-center">No results found.<br/>Try different keywords or filters.</p>
                                        </div>
                                    )
                                )}

                                {/* FAVORITES TAB */}
                                {modalTab === 'saved' && (
                                    savedRecipes.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {savedRecipes.map(fav => (
                                                <button
                                                    key={fav.recipeId || fav.id}
                                                    onClick={() => addMeal(fav.recipeId || fav.id)}
                                                    className="w-full text-left group rounded-2xl border border-outline-variant/10 bg-surface-container-low hover:bg-secondary hover:border-secondary hover:shadow-xl hover:shadow-secondary/20 transition-all overflow-hidden flex items-center gap-4 p-4"
                                                >
                                                    <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-outline-variant/10">
                                                        <img
                                                            src={fav.coverImageUrl || fav.recipe?.coverImageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'}
                                                            alt={fav.title || fav.recipe?.title}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-black text-on-surface group-hover:text-white text-sm leading-tight line-clamp-2 transition-colors mb-1">
                                                            {fav.title || fav.recipe?.title}
                                                        </p>
                                                        <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-on-surface-variant group-hover:text-white/60">
                                                            <span className="material-symbols-outlined text-xs">bookmark</span>
                                                            Saved Recipe
                                                        </span>
                                                    </div>
                                                    <span className="material-symbols-outlined text-outline-variant/30 group-hover:text-white/40 flex-shrink-0">chevron_right</span>
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full gap-3 opacity-30">
                                            <span className="material-symbols-outlined text-6xl">bookmark_border</span>
                                            <p className="font-black uppercase tracking-widest text-sm text-center">No saved recipes yet.<br/>Bookmark recipes to see them here.</p>
                                        </div>
                                    )
                                )}
                            </div>

                            {/* ── FOOTER ── */}
                            <div className="px-8 py-4 border-t border-outline-variant/10 flex-shrink-0 bg-surface-container-lowest flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2 text-on-surface-variant/40">
                                    <span className="material-symbols-outlined text-base">info</span>
                                    <p className="text-[9px] font-medium leading-relaxed">
                                        Recommendations are for guidance only. Consult a healthcare professional for specific dietary needs.
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                                    <span className="text-[9px] font-black uppercase tracking-widest opacity-40">Expert Engine</span>
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
