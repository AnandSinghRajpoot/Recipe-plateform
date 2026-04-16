import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../../utils/apiClient";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { HeroSkeleton } from "../../components/common/LoadingSkeleton";

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
const MEAL_TYPES = ["BREAKFAST", "LUNCH", "DINNER", "SNACK"];

const MealPlanner = () => {
    const { planId } = useParams();
    const navigate = useNavigate();
    const [plannerItems, setPlannerItems] = useState([]);
    const [planDetails, setPlanDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedSlot, setSelectedSlot] = useState(null); // { day, type }
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);

    useEffect(() => {
        if (planId) {
            fetchPlanner();
        }
    }, [planId]);

    const fetchPlanner = async () => {
        try {
            const res = await apiClient.get(`/meal-planner/plan/${planId}`);
            setPlannerItems(res.data.data || []);
            // For MVP, we can pick some info from common headers or another endpoint if we had it
            // But let's assume we can fetch plans and find ours to get the name
            const plansRes = await apiClient.get("/meal-planner/plans");
            const currentPlan = (plansRes.data.data || []).find(p => String(p.id) === String(planId));
            setPlanDetails(currentPlan);
        } catch (err) {
            toast.error("Failed to load planner");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (q) => {
        setSearchQuery(q);
        if (q.trim().length < 2) {
            setSearchResults([]);
            return;
        }
        setSearching(true);
        try {
            const res = await apiClient.get(`/recipes/search?q=${q}`);
            setSearchResults(res.data.data || res.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setSearching(false);
        }
    };

    const addMeal = async (recipeId) => {
        try {
            await apiClient.post("/meal-planner", {
                planId: planId,
                recipeId,
                dayOfWeek: selectedSlot.day,
                mealType: selectedSlot.type
            });
            toast.success("Meal added to plan");
            setSelectedSlot(null);
            fetchPlanner();
        } catch (err) {
            toast.error("Failed to add meal");
        }
    };

    const removeMeal = async (id) => {
        try {
            await apiClient.delete(`/meal-planner/${id}`);
            toast.success("Meal removed");
            fetchPlanner();
        } catch (err) {
            toast.error("Failed to remove meal");
        }
    };

    const getMealAt = (day, type) => {
        return plannerItems.find(item => item.dayOfWeek === day && item.mealType === type);
    };

    if (loading) return <div className="bg-surface min-h-screen py-24 px-8"><HeroSkeleton /></div>;

    return (
        <div className="bg-surface min-h-screen pt-24 px-4 lg:px-12 pb-32">
            <div className="max-w-[1600px] mx-auto">
                <header className="mb-12">
                    <button 
                        onClick={() => navigate('/meal-planner')}
                        className="group flex items-center gap-2 text-primary hover:opacity-80 transition-all mb-8 text-[10px] font-black uppercase tracking-widest"
                    >
                        <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
                        Back to Library
                    </button>
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest mb-4">
                        <span className="material-symbols-outlined text-xs">restaurant_menu</span>
                        Active Protocol
                    </div>
                    <h1 className="text-4xl md:text-6xl font-headline font-black tracking-tighter text-on-surface uppercase">
                        {planDetails?.name || "Loading Protocol..."}
                    </h1>
                    <p className="text-on-surface-variant mt-4 font-medium opacity-70 max-w-2xl">{planDetails?.description || "Synchronizing with your metabolic objectives..."}</p>
                </header>

                {/* Weekly Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-6">
                    {DAYS.map(day => (
                        <div key={day} className="flex flex-col gap-4">
                            <div className="text-center py-4 bg-white/40 backdrop-blur-md rounded-2xl border border-white/60">
                                <h3 className="text-xs font-black uppercase tracking-widest text-primary">{day}</h3>
                            </div>

                            <div className="space-y-4">
                                {MEAL_TYPES.map(type => {
                                    const meal = getMealAt(day, type);
                                    return (
                                        <div key={type} className="relative group">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant mb-1.5 opacity-50 px-2">{type}</p>
                                            {meal ? (
                                                <div className="bg-white p-4 rounded-3xl border border-white shadow-sm hover:shadow-md transition-all group">
                                                    <div className="aspect-video rounded-xl overflow-hidden mb-3 bg-surface-container-high">
                                                        <img 
                                                            src={meal.recipe?.coverImageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"} 
                                                            alt={meal.recipe?.title} 
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <h4 className="text-sm font-black text-on-surface line-clamp-1">{meal.recipe?.title}</h4>
                                                    <div className="flex justify-between items-center mt-3">
                                                        <span className="text-[10px] font-black text-primary uppercase tracking-tighter">{meal.recipe?.prepTime + meal.recipe?.cookTime} mins</span>
                                                        <button 
                                                            onClick={() => removeMeal(meal.id)}
                                                            className="w-8 h-8 rounded-full bg-error/10 text-error flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-90"
                                                        >
                                                            <span className="material-symbols-outlined text-xs">delete</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button 
                                                    onClick={() => setSelectedSlot({ day, type })}
                                                    className="w-full h-24 rounded-3xl border-2 border-dashed border-outline-variant/20 flex flex-col items-center justify-center gap-2 text-on-surface-variant/40 hover:text-primary hover:border-primary/40 transition-all bg-white/20"
                                                >
                                                    <span className="material-symbols-outlined text-xl">add_circle</span>
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Plan Meal</span>
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
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }} 
                            onClick={() => setSelectedSlot(null)}
                            className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm"
                        ></motion.div>
                        
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative bg-white rounded-[3rem] w-full max-w-xl p-10 botanical-shadow max-h-[80vh] overflow-hidden flex flex-col"
                        >
                            <div className="mb-8">
                                <h3 className="text-3xl font-headline font-black text-on-surface mb-2">Assign Recipe</h3>
                                <p className="text-on-surface-variant font-medium">Choosing {selectedSlot.type} for {selectedSlot.day}</p>
                            </div>

                            <div className="relative mb-6">
                                <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-outline-variant">search</span>
                                <input 
                                    type="text"
                                    placeholder="Search recipes..."
                                    className="w-full pl-14 pr-6 py-4 bg-surface-container-low rounded-2xl border-none focus:ring-2 focus:ring-primary/20 font-bold"
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                />
                                {searching && <div className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>}
                            </div>

                            <div className="flex-grow overflow-y-auto space-y-4 px-2">
                                {searchResults.length > 0 ? (
                                    searchResults.map(recipe => (
                                        <button 
                                            key={recipe.id}
                                            onClick={() => addMeal(recipe.id)}
                                            className="w-full p-4 rounded-2xl bg-surface-container-low hover:bg-primary/5 border border-transparent hover:border-primary/20 transition-all flex items-center gap-4 text-left group"
                                        >
                                            <div className="w-16 h-16 rounded-xl overflow-hidden bg-surface-container-high flex-shrink-0">
                                                <img 
                                                    src={recipe.coverImageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"} 
                                                    alt={recipe.title} 
                                                    className="w-full h-full object-cover" 
                                                />
                                            </div>
                                            <div className="flex-grow">
                                                <p className="font-black text-on-surface group-hover:text-primary transition-colors">{recipe.title}</p>
                                                <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mt-1">{recipe.difficulty || "MEDIUM"} • {recipe.dietType || "GENERAL"}</p>
                                            </div>
                                            <span className="material-symbols-outlined text-primary opacity-0 group-hover:opacity-100 transition-opacity">add_circle</span>
                                        </button>
                                    ))
                                ) : (
                                    <div className="text-center py-12 opacity-40">
                                        <span className="material-symbols-outlined text-4xl mb-4">search_off</span>
                                        <p className="font-bold">No recipes found.</p>
                                    </div>
                                )}
                            </div>

                            <button 
                                onClick={() => setSelectedSlot(null)}
                                className="mt-8 text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant hover:text-on-surface transition-colors"
                            >
                                Cancel Selection
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MealPlanner;
