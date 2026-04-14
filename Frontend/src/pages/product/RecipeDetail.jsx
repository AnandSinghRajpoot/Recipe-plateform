import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../../utils/apiClient";
import { extractErrorMessage } from "../../utils/errorHandler";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { HeroSkeleton } from "../../components/common/LoadingSkeleton";
import { resolveImageUrl } from "../../utils/imageUtils";

const RecipeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const res = await apiClient.get(`/recipes/${id}`);
        setRecipe(res.data);
        setLiked(res.data?.isLiked || false);
        setLikesCount(res.data?.likesCount || 0);
        setSaved(res.data?.isSaved || false);
      } catch (err) {
        const msg = extractErrorMessage(err);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id]);

  const handleLike = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error("Please login to like recipes");
      return;
    }

    try {
      const res = await apiClient.post(`/recipes/${id}/like`);
      setLiked(res.data.data);
      setLikesCount(prev => res.data.data ? prev + 1 : prev - 1);
    } catch (err) {
      toast.error("Failed to like recipe");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return toast.error("Please login to save recipes!");
    
    setSaving(true);
    
    // If already saved, unsave it
    if (saved) {
      try {
        await apiClient.delete(`/saved-recipes/${id}`);
        setSaved(false);
        toast.success("Recipe removed from saved!");
      } catch (err) {
        toast.error("Failed to remove recipe from saved");
      }
    } else {
      // If not saved, save it
      try {
        await apiClient.post(`/saved-recipes/${id}`);
        setSaved(true);
        toast.success("Recipe saved successfully!");
      } catch (err) {
        // Check if it's already saved due to race condition
        if (err.response?.status === 409 || err.response?.status === 400) {
          try {
            await apiClient.delete(`/saved-recipes/${id}`);
            setSaved(false);
            toast.success("Recipe removed from saved!");
          } catch (deleteErr) {
            toast.error("Failed to update save status");
          }
        } else {
          toast.error("Failed to save recipe");
        }
      }
    }
    
    setSaving(false);
  };

  if (loading) return <div className="bg-surface min-h-screen py-20 px-6"><HeroSkeleton /></div>;
  if (!recipe) return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center space-y-6">
        <span className="material-symbols-outlined text-8xl text-outline-variant opacity-30">garden_cart</span>
        <h2 className="text-4xl font-headline font-black text-on-surface">Recipe Missing.</h2>
        <button onClick={() => navigate("/recipes")} className="vitality-gradient text-white px-8 py-4 rounded-xl font-bold">Back to Compendium</button>
    </div>
  );

  const imageUrl = resolveImageUrl(recipe.coverImageUrl || recipe.thumbnail_image);

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen relative overflow-hidden pb-32">
        
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-30">
        <div className="absolute top-0 right-0 w-[60%] h-[60%] rounded-full bg-primary/10 blur-[150px]"></div>
        <div className="absolute bottom-0 left-0 w-[50%] h-[50%] rounded-full bg-secondary-container/10 blur-[120px]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-24 relative z-10">
        
        {/* Header Navigation */}
        <motion.button 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="group flex items-center gap-3 text-on-surface-variant font-black uppercase tracking-widest text-[10px] mb-12 hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
          Return to All Recipes
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            
            {/* Left: Visual Asset */}
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="relative group"
            >
                <div className="absolute inset-0 vitality-gradient rounded-[3.5rem] blur-3xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
                <div className="relative rounded-[3.5rem] overflow-hidden botanical-shadow border-8 border-white bg-white aspect-[5/6] md:aspect-auto md:h-[700px]">
                    <img 
                        src={imageUrl} 
                        alt={recipe.name} 
                        className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                    <div className="absolute bottom-10 left-10 right-10 flex gap-6">
                        <div className="flex-1 bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-white">
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Time Profile</p>
                            <p className="text-xl font-headline font-black">{recipe.prepTime || "30"} min</p>
                        </div>
                        <div className="flex-1 bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-white">
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Complexity</p>
                            <p className="text-xl font-headline font-black">{recipe.difficulty || "Medium"}</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Right: Intelligence Content */}
            <motion.div 
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-12"
            >
                <div className="space-y-6">
                    <span className="text-primary font-black uppercase tracking-widest text-[10px] px-4 py-1.5 bg-primary/10 rounded-full border border-primary/20 inline-block">
                        Metabolic Intelligence
                    </span>
                    <h1 className="text-5xl md:text-7xl font-headline font-black text-on-surface tracking-tighter leading-none">
                        {recipe.name}
                    </h1>
                    <p className="text-xl text-on-surface-variant font-medium leading-relaxed opacity-80">
                        {recipe.description || "A masterfully crafted composition designed for metabolic optimization and nutritional density."}
                    </p>
                </div>

                {/* Specifics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="p-8 rounded-[2.5rem] bg-white border border-white shadow-sm space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                                <span className="material-symbols-outlined text-lg">nutrition</span>
                            </div>
                            <h4 className="font-headline font-black text-xl text-on-surface">Components</h4>
                        </div>
                        <ul className="space-y-4">
                            {recipe.ingredients?.map((ing, idx) => (
                                <li key={idx} className="flex items-center gap-4 group">
                                    <div className="w-2 h-2 rounded-full bg-primary/30 group-hover:bg-primary transition-colors"></div>
                                    <span className="text-on-surface-variant font-bold text-sm">
                                        {ing.quantity} {ing.name}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="p-8 rounded-[2.5rem] bg-white border border-white shadow-sm space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-secondary-container/20 text-on-secondary-container flex items-center justify-center">
                                <span className="material-symbols-outlined text-lg">oven_gen</span>
                            </div>
                            <h4 className="font-headline font-black text-xl text-on-surface">Procedure</h4>
                        </div>
                        <div className="space-y-4">
                            <p className="text-on-surface-variant font-medium leading-relaxed text-sm italic">
                                "{recipe.instructions || "Refer to the culinary protocol for optimal nutrient preservation."}"
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 pt-6">
                    <button 
                        onClick={handleLike}
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all active:scale-90 duration-200 bg-surface-container-low relative ${liked ? 'text-green-600' : 'text-on-surface-variant hover:text-green-600'}`}
                        title={liked ? "Unlike" : "Like"}
                    >
                        <span className={`material-symbols-outlined text-2xl`} style={liked ? { fontVariationSettings: '"FILL" 1' } : {}}>{liked ? 'favorite' : 'favorite_border'}</span>
                        {likesCount > 0 && <span className="absolute -top-1 -right-1 bg-white text-green-600 text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border border-green-600/20 shadow-sm">{likesCount}</span>}
                    </button>
                    <button 
                        onClick={handleSave}
                        disabled={saving}
                        className={`w-14 h-14 rounded-2xl bg-surface-container-low flex items-center justify-center transition-all active:scale-90 duration-200 disabled:opacity-50 ${saved ? 'text-green-600' : 'text-on-surface-variant hover:text-green-600'}`}
                        title={saved ? "Remove from Saved" : "Save Recipe"}
                    >
                        <span className={`material-symbols-outlined text-2xl`} style={saved ? { fontVariationSettings: '"FILL" 1' } : {}}>{saving ? 'hourglass_empty' : (saved ? 'bookmark' : 'bookmark_border')}</span>
                    </button>
                    <button className="vitality-gradient text-white px-10 py-5 rounded-[2rem] font-black text-lg shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-4">
                        Share Insight
                        <span className="material-symbols-outlined">share</span>
                    </button>
                </div>
            </motion.div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetails;
