import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import apiClient from '../../utils/apiClient';
import toast from 'react-hot-toast';
import { extractErrorMessage } from '../../utils/errorHandler';
import { motion } from 'framer-motion';

const CollectionDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [collection, setCollection] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCollection();
    }, [id]);

    const fetchCollection = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get(`/collections/${id}`);
            setCollection(res.data.data);
        } catch (err) {
            toast.error(extractErrorMessage(err));
            navigate('/profile');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveRecipe = async (recipeId) => {
        try {
            // Need an endpoint to remove recipe from collection
            // For now, let's assume we can use a DELETE or similar
            // If not, we might need to add it to the backend too
            await apiClient.delete(`/collections/${id}/recipes/${recipeId}`);
            setCollection({
                ...collection,
                recipes: collection.recipes.filter(r => r.id !== recipeId)
            });
            toast.success("Recipe removed from collection");
        } catch (err) {
            toast.error("Failed to remove recipe");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-surface">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!collection) return null;

    return (
        <div className="min-h-screen bg-surface py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-12 animate-fade-in">
                    <button 
                        onClick={() => {
                            const role = localStorage.getItem("role");
                            if (role === "CHEF" || role === "ADMIN") {
                                navigate('/chef-dashboard?tab=collections');
                            } else {
                                navigate('/profile?tab=collections');
                            }
                        }}
                        className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors mb-6 group font-bold"
                    >
                        <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">arrow_back</span>
                        Back to Library
                    </button>
                    
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest">
                                Collection
                            </div>
                            <h1 className="text-5xl font-headline font-black tracking-tight text-on-surface">{collection.name}</h1>
                            <p className="text-xl text-on-surface-variant max-w-2xl font-medium">{collection.description || "A curated selection of your favorite recipes."}</p>
                        </div>
                        
                        <div className="flex items-center gap-4 bg-surface-container-low px-6 py-4 rounded-3xl border border-outline-variant/10 shadow-sm">
                            <div className="text-center border-r border-outline-variant/20 pr-6">
                                <div className="text-2xl font-black text-primary">{collection.recipes?.length || 0}</div>
                                <div className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant opacity-60">Recipes</div>
                            </div>
                            <div className="text-center pl-2">
                                <div className="text-sm font-bold text-on-surface">Created</div>
                                <div className="text-[10px] font-medium text-on-surface-variant">{new Date(collection.createdAt).toLocaleDateString()}</div>
                            </div>
                        </div>
                    </div>
                </header>

                {collection.recipes?.length === 0 ? (
                    <div className="bg-surface-container-low rounded-[3rem] p-20 text-center border border-outline-variant/10 border-dashed animate-fade-in-up">
                        <div className="w-20 h-20 bg-surface-container-highest rounded-3xl flex items-center justify-center mx-auto text-on-surface-variant opacity-50 mb-8 rotate-12">
                            <span className="material-symbols-outlined text-4xl">folder_open</span>
                        </div>
                        <h2 className="text-2xl font-black text-on-surface">This collection is empty</h2>
                        <p className="text-on-surface-variant mt-4 max-w-sm mx-auto font-medium">Add recipes to this collection from your saved library or search results.</p>
                        <Link 
                            to="/recipes"
                            className="inline-flex mt-10 vitality-gradient text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
                        >
                            Browse Recipes
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {collection.recipes.map((recipe, index) => (
                            <motion.div 
                                key={recipe.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="group relative bg-white rounded-[2rem] overflow-hidden border border-outline-variant/5 shadow-sm hover:shadow-xl transition-all"
                            >
                                <Link to={`/items/${recipe.id}`}>
                                    <div className="aspect-[4/3] overflow-hidden bg-surface-container-highest relative">
                                        <img 
                                            src={recipe.coverImageUrl || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?q=80&w=800&auto=format&fit=crop'} 
                                            alt={recipe.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                                            <span className="text-white font-black text-sm">View Recipe</span>
                                        </div>
                                    </div>
                                </Link>
                                
                                <div className="p-6">
                                    <div className="flex justify-between items-start gap-2 mb-3">
                                        <Link to={`/items/${recipe.id}`}>
                                            <h3 className="text-lg font-black text-on-surface line-clamp-1 group-hover:text-primary transition-colors leading-tight">{recipe.title}</h3>
                                        </Link>
                                        <button 
                                            onClick={() => handleRemoveRecipe(recipe.id)}
                                            className="w-8 h-8 shrink-0 rounded-full bg-error/5 text-error flex items-center justify-center hover:bg-error hover:text-white transition-all shadow-sm"
                                            title="Remove from collection"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">close</span>
                                        </button>
                                    </div>
                                    
                                    <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-wider text-on-surface-variant opacity-70">
                                        <div className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[14px]">timer</span>
                                            {recipe.cookTime + recipe.prepTime}m
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[14px]">restaurant</span>
                                            {recipe.difficulty}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CollectionDetail;
