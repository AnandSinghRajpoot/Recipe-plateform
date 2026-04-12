import React, { useState, useEffect } from "react";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import apiClient from "../../utils/apiClient";
import { extractErrorMessage } from "../../utils/errorHandler";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { HeroSkeleton } from "../../components/common/LoadingSkeleton";

const MEAL_TYPES = ["BREAKFAST", "LUNCH", "DINNER", "SNACK"];

const MealPlanner = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [weeklyPlan, setWeeklyPlan] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState(null); // { date, type }
  const [recipes, setRecipes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const days = [...Array(7)].map((_, i) => addDays(weekStart, i));

  useEffect(() => {
    fetchWeeklyPlan();
  }, [currentDate]);

  const fetchWeeklyPlan = async () => {
    try {
      setLoading(true);
      const formattedDate = format(weekStart, "yyyy-MM-dd");
      const res = await apiClient.get(`/meal-plans/weekly?startDate=${formattedDate}`);
      setWeeklyPlan(res.data);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleAddMeal = async (recipe) => {
    try {
      await apiClient.post("/meal-plans", {
        recipeId: recipe.id,
        mealDate: format(selectedSlot.date, "yyyy-MM-dd"),
        mealType: selectedSlot.type
      });
      toast.success(`Added ${recipe.title} to ${selectedSlot.type}`);
      setSelectedSlot(null);
      fetchWeeklyPlan();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const handleRemoveMeal = async (mealId) => {
    try {
      await apiClient.delete(`/meal-plans/${mealId}`);
      toast.success("Meal removed");
      fetchWeeklyPlan();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const loadRecommendations = async (type) => {
    try {
      const res = await apiClient.get(`/recommendations/by-meal-type/${type.toUpperCase()}?limit=5`);
      setRecipes(res.data.data || res.data || []);
    } catch (err) {
      console.error("Failed to load recommendations", err);
    }
  };

  const handleOpenSlot = (day, type) => {
    setSelectedSlot({ date: day, type });
    setSearchQuery("");
    setRecipes([]);
    loadRecommendations(type);
  };

  const searchRecipes = async (q) => {
    if (!q) {
      setRecipes([]);
      return;
    }
    try {
      const res = await apiClient.get(`/recipes/search?q=${q}`);
      setRecipes(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading && Object.keys(weeklyPlan).length === 0) return <div className="bg-surface min-h-screen py-24 px-8"><HeroSkeleton /></div>;

    return (
        <div className="w-full relative">
            <div className="max-w-7xl mx-auto pt-6 relative z-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
              <span className="material-symbols-outlined text-xs">calendar_month</span>
              Weekly Nutrition Protocol
            </div>
            <h1 className="text-5xl md:text-6xl font-headline font-black tracking-tighter">
              Integrated <span className="text-primary-fixed">Meal Planner</span>
            </h1>
          </div>

          <div className="flex items-center gap-4 bg-white/40 backdrop-blur-md p-2 rounded-2xl border border-white">
            <button 
              onClick={() => setCurrentDate(addDays(currentDate, -7))}
              className="p-3 rounded-xl hover:bg-white transition-all text-on-surface-variant"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <span className="font-headline font-black px-6">
              {format(weekStart, "MMM dd")} - {format(addDays(weekStart, 6), "MMM dd, yyyy")}
            </span>
            <button 
              onClick={() => setCurrentDate(addDays(currentDate, 7))}
              className="p-3 rounded-xl hover:bg-white transition-all text-on-surface-variant"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </header>

        {/* Weekly Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
          {days.map((day) => {
            const dateStr = format(day, "yyyy-MM-dd");
            const dayData = weeklyPlan[dateStr] || { plannedCalories: 0, targetCalories: 2000, meals: [] };
            
            return (
              <motion.div 
                key={dateStr}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white/60 backdrop-blur-xl rounded-[2.5rem] border p-6 flex flex-col gap-6 ${isSameDay(day, new Date()) ? 'border-primary ring-1 ring-primary/20 shadow-2xl' : 'border-white'}`}
              >
                <div className="text-center space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{format(day, "EEEE")}</p>
                  <p className="text-2xl font-headline font-black">{format(day, "dd")}</p>
                </div>

                <div className="space-y-4 flex-grow">
                  {MEAL_TYPES.map((type) => {
                    const meal = dayData.meals?.find(m => m.mealType === type);
                    return (
                      <div key={type} className="group relative">
                        <p className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant mb-2 opacity-50">{type}</p>
                        {meal ? (
                          <div className="bg-white p-3 rounded-2xl border border-outline-variant/5 shadow-sm space-y-2 group">
                            <p className="text-xs font-bold truncate pr-6">{meal.recipeTitle}</p>
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-black text-primary">{meal.calories || 0} kcal</span>
                              <button 
                                onClick={() => handleRemoveMeal(meal.id)}
                                className="w-6 h-6 rounded-lg bg-error/10 text-error flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-90"
                              >
                                <span className="material-symbols-outlined text-xs">close</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button 
                            onClick={() => handleOpenSlot(day, type)}
                            className="w-full h-12 dashed-border rounded-2xl flex items-center justify-center text-outline-variant hover:text-primary hover:border-primary transition-all group"
                          >
                            <span className="material-symbols-outlined text-sm">add</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Daily Status */}
                <div className="pt-4 border-t border-outline-variant/10 space-y-3">
                  <div className="flex justify-between items-end">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Status</p>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      dayData.status === 'Over' ? 'bg-error/10 text-error' : 
                      dayData.status === 'Under' ? 'bg-secondary-container/20 text-secondary' : 
                      'bg-primary/10 text-primary'
                    }`}>
                      {dayData.status || "Balanced"}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${dayData.status === 'Over' ? 'bg-error' : 'bg-primary'}`} 
                      style={{ width: `${Math.min((dayData.plannedCalories / dayData.targetCalories) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-center text-[10px] font-black opacity-40">
                    {Math.round(dayData.plannedCalories)} / {Math.round(dayData.targetCalories)} kcal
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Recipe Selector Modal */}
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
                <h3 className="text-3xl font-headline font-black text-on-surface mb-2">Select Nutrient Payload</h3>
                <p className="text-on-surface-variant font-medium">Adding {selectedSlot.type} for {format(selectedSlot.date, "EEEE, MMM dd")}</p>
              </div>

              <div className="relative mb-6">
                <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-outline-variant">search</span>
                <input 
                  type="text"
                  placeholder="Identify recipe by title..."
                  className="w-full pl-14 pr-6 py-4 bg-surface-container-low rounded-2xl border-none focus:ring-2 focus:ring-primary/20 font-bold"
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    searchRecipes(e.target.value);
                  }}
                />
              </div>

              <div className="flex-grow overflow-y-auto space-y-4 px-2">
                {recipes.length > 0 ? (
                  recipes.map(recipe => (
                    <button 
                      key={recipe.id}
                      onClick={() => handleAddMeal(recipe)}
                      className="w-full p-4 rounded-2xl bg-surface-container-low hover:bg-primary/5 border border-transparent hover:border-primary/20 transition-all flex items-center gap-4 text-left group"
                    >
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-surface-container-high flex-shrink-0">
                         <img src={recipe.coverImageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"} alt={recipe.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-grow">
                        <p className="font-black text-on-surface group-hover:text-primary transition-colors">{recipe.title}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                           {recipe.matchReason && <span className="text-[8px] font-black uppercase tracking-widest bg-primary/10 text-primary px-1.5 py-0.5 rounded-sm">{recipe.matchReason}</span>}
                           {recipe.safetyScore && recipe.safetyScore === 100 && <span className="text-[8px] font-black uppercase tracking-widest bg-tertiary-container/30 text-tertiary px-1.5 py-0.5 rounded-sm">Vetted Safe</span>}
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mt-1.5">{recipe.calories || 0} kcal • {recipe.difficulty || "EASY"}</p>
                      </div>
                      <span className="material-symbols-outlined text-primary opacity-0 group-hover:opacity-100 transition-opacity">add_circle</span>
                    </button>
                  ))
                ) : searchQuery ? (
                  <p className="text-center py-10 text-on-surface-variant font-bold opacity-40">No matching compositions found.</p>
                ) : (
                  <div className="text-center py-10 space-y-4 opacity-40">
                    <span className="material-symbols-outlined text-4xl animate-pulse">auto_awesome</span>
                    <p className="font-bold">Analyzing your profile for the best {selectedSlot.type.toLowerCase()}...</p>
                  </div>
                )}
              </div>

              <button 
                onClick={() => setSelectedSlot(null)}
                className="mt-8 text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant hover:text-on-surface transition-colors"
              >
                Close Portal
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .dashed-border {
          background-image: url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='24' ry='24' stroke='%23C7CAD1' stroke-width='3' stroke-dasharray='8%2c 12' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e");
        }
        .dashed-border:hover {
          background-image: url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='24' ry='24' stroke='%2338634F' stroke-width='3' stroke-dasharray='8%2c 12' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e");
        }
      `}} />
    </div>
  );
};

export default MealPlanner;
