import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { resolveImageUrl } from "../utils/imageUtils";

const MyRecipes = () => {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchMyRecipes();
    }, []);

    const fetchMyRecipes = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        try {
            const res = await axios.get("http://localhost:8080/api/v1/recipes/my-recipes", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRecipes(res.data.data || []);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this recipe from your compendium?")) return;

        const token = localStorage.getItem("token");
        try {
            await axios.delete(`http://localhost:8080/api/v1/recipes/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRecipes(recipes.filter(r => r.id !== id));
            alert("Recipe removed from your greenhouse.");
        } catch (err) {
            alert("Failed to delete recipe: " + (err.response?.data?.message || err.message));
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-surface flex flex-col items-center justify-center space-y-6">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p className="font-black text-primary uppercase tracking-widest text-[10px] animate-pulse">Consulting Compendium...</p>
        </div>
    );

    return (
        <div className="bg-surface min-h-screen py-24 px-6 lg:px-20 font-body text-on-surface relative overflow-hidden">
            
            {/* Background Ambience */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
                <div className="absolute top-[10%] left-[5%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[150px]"></div>
                <div className="absolute bottom-[10%] right-[5%] w-[30%] h-[30%] rounded-full bg-secondary-container/10 blur-[120px]"></div>
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
                    <div className="space-y-4 text-center md:text-left">
                        <span className="text-primary font-black uppercase tracking-widest text-[10px] px-5 py-2 bg-white/60 backdrop-blur-md rounded-full border border-primary/10 shadow-sm inline-block">
                            Personal Compendium
                        </span>
                        <h1 className="text-5xl md:text-7xl font-headline font-black text-on-surface tracking-tighter leading-tight">
                            Your Culinary <span className="text-primary italic animate-pulse">Harvest</span>
                        </h1>
                        <p className="text-on-surface-variant font-medium text-lg max-w-xl opacity-70">
                            Management portal for your shared intelligence. Curate, optimize, and expand your gastronomy portfolio.
                        </p>
                    </div>
                    <Link 
                        to="/addRecipe" 
                        className="vitality-gradient text-white px-10 py-5 rounded-[2rem] font-black text-lg shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-4"
                    >
                        <span className="material-symbols-outlined text-xl">add_circle</span>
                        New Recipe
                    </Link>
                </div>

                {error && (
                    <div className="bg-error-container text-on-error-container p-6 rounded-[2rem] border border-error/10 text-center mb-12 font-black shadow-sm">
                        {error}
                    </div>
                )}

                {recipes.length === 0 ? (
                    <div className="bg-white/40 backdrop-blur-xl rounded-[4rem] p-24 text-center border border-white/60 botanical-shadow group hover:bg-white transition-all duration-700">
                        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-10 group-hover:scale-110 transition-transform">
                             <span className="material-symbols-outlined text-5xl text-primary/40">grass</span>
                        </div>
                        <h3 className="text-4xl font-headline font-black text-on-surface mb-4">The Plot is Bare</h3>
                        <p className="text-on-surface-variant text-xl italic opacity-60 mb-12 max-w-lg mx-auto leading-relaxed">
                            "Innovation begins with the first seed. Your digital garden is waiting for its premiere recipe."
                        </p>
                        <Link 
                            to="/addRecipe" 
                            className="inline-flex items-center gap-4 bg-on-surface text-white px-12 py-5 rounded-[2.5rem] font-black text-xl hover:vitality-gradient transition-all shadow-2xl"
                        >
                            Start Planting
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                        {recipes.map((recipe) => (
                            <div key={recipe.id} className="group bg-white/60 backdrop-blur-xl rounded-[2.5rem] botanical-shadow border border-white overflow-hidden flex flex-col hover:shadow-[0_32px_64px_rgba(0,110,28,0.1)] transition-all duration-700 hover:-translate-y-2">
                                <div className="relative h-64 overflow-hidden">
                                    <img 
                                        src={resolveImageUrl(recipe.coverImageUrl)} 
                                        alt={recipe.title} 
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                                    <div className="absolute top-5 left-5 bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-2xl shadow-lg border border-white/50">
                                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">{recipe.difficulty}</span>
                                    </div>
                                </div>
                                <div className="p-8 flex-grow flex flex-col relative">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 blur-2xl"></div>
                                    
                                    <div className="mb-6 flex-grow">
                                        <h3 className="text-2xl font-headline font-black text-on-surface mb-3 group-hover:text-primary transition-colors line-clamp-1">{recipe.title}</h3>
                                        <p className="text-on-surface-variant text-sm font-medium opacity-60 line-clamp-2 leading-relaxed italic">"{recipe.description}"</p>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 text-on-surface-variant opacity-40 text-xs font-black uppercase tracking-widest mb-8">
                                        <span className="material-symbols-outlined text-sm">schedule</span>
                                        <span>{recipe.prepTime + recipe.cookTime} Mins Synergy</span>
                                    </div>

                                    <div className="flex gap-4 pt-6 border-t border-outline-variant/10">
                                        <button 
                                            onClick={() => navigate(`/edit-recipe/${recipe.id}`)}
                                            className="flex-grow flex items-center justify-center gap-3 bg-surface-container-low text-on-surface-variant py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-white hover:text-primary hover:shadow-lg transition-all border border-outline-variant/5"
                                        >
                                            <span className="material-symbols-outlined text-lg">edit_note</span>
                                            Refine
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(recipe.id)}
                                            className="w-16 flex items-center justify-center bg-surface-container-low text-on-surface-variant/40 py-4 rounded-[1.5rem] hover:bg-error-container/20 hover:text-error transition-all group/delete"
                                            title="Remove Recipe"
                                        >
                                            <span className="material-symbols-outlined text-xl group-hover/delete:rotate-12 transition-transform">delete</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyRecipes;
