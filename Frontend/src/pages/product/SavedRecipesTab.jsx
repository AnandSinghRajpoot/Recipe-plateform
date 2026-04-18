import React, { useState, useEffect } from 'react';
import apiClient from '../../utils/apiClient';
import toast from 'react-hot-toast';
import { extractErrorMessage } from '../../utils/errorHandler';
import { Link } from 'react-router-dom';
import { handleImageError } from '../../utils/imageUtils';

const SavedRecipesTab = () => {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [collections, setCollections] = useState([]);
    const [draggingId, setDraggingId] = useState(null);
    const [newCollectionName, setNewCollectionName] = useState('');
    const [creatingCollection, setCreatingCollection] = useState(false);

    useEffect(() => {
        fetchSavedRecipes();
        fetchCollections();
    }, []);

    const fetchSavedRecipes = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get('/saved-recipes');
            setRecipes(res.data.data || []);
        } catch (err) {
            toast.error(extractErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const fetchCollections = async () => {
        try {
            const res = await apiClient.get('/collections');
            setCollections(res.data.data || []);
        } catch (err) {
            console.error('Failed to load collections');
        }
    };

    const handleCreateCollection = async (e) => {
        e.preventDefault();
        if (!newCollectionName.trim()) return;
        
        try {
            setCreatingCollection(true);
            await apiClient.post('/collections', { name: newCollectionName.trim() });
            setNewCollectionName('');
            toast.success('Collection created successfully');
            fetchCollections();
        } catch (err) {
            toast.error(extractErrorMessage(err));
        } finally {
            setCreatingCollection(false);
        }
    };

    const handleDragStart = (e, recipeId) => {
        e.dataTransfer.setData('recipeId', recipeId);
        setDraggingId(recipeId);
    };

    const handleDragEnd = () => {
        setDraggingId(null);
    };

    const handleDrop = async (e, collectionId) => {
        e.preventDefault();
        const recipeId = e.dataTransfer.getData('recipeId');
        if (!recipeId) return;

        try {
            await apiClient.post(`/collections/${collectionId}/recipes/${recipeId}/add`);
            toast.success('Recipe added to collection');
            fetchSavedRecipes();
        } catch (err) {
            toast.error('Failed to add recipe to collection');
        }
        setDraggingId(null);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleRemove = async (recipeId) => {
        try {
            await apiClient.delete(`/saved-recipes/${recipeId}`);
            setRecipes(recipes.filter(r => r.recipeId !== recipeId));
            toast.success("Removed from saved recipes");
        } catch (err) {
            toast.error("Failed to remove recipe");
        }
    };

    if (loading) {
        return <div className="py-20 text-center text-primary font-bold animate-pulse">Loading your curated library...</div>;
    }

    return (
        <div className="space-y-8 animate-fade-in-up">
            <header className="flex justify-between items-end border-b border-outline-variant/10 pb-6">
                <div>
                    <h2 className="text-3xl font-headline font-black tracking-tighter text-on-surface">Saved Compositions</h2>
                    <p className="text-on-surface-variant mt-2 font-medium">Your personal vault of favorite botanical recipes.</p>
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-4 py-2 rounded-xl border border-primary/20">
                    {recipes.length} Saved • Drag recipes to collections below
                </div>
            </header>

            {/* Collections Section */}
            <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-[2rem] p-6 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h3 className="text-xl font-headline font-black text-on-surface">Your Collections</h3>
                    <form onSubmit={handleCreateCollection} className="flex items-center gap-2 w-full sm:w-auto">
                        <input
                            type="text"
                            placeholder="New Collection Name"
                            value={newCollectionName}
                            onChange={(e) => setNewCollectionName(e.target.value)}
                            className="bg-white border border-outline-variant/30 text-on-surface text-sm rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all w-full sm:w-48"
                            disabled={creatingCollection}
                        />
                        <button 
                            type="submit" 
                            disabled={creatingCollection || !newCollectionName.trim()}
                            className="bg-primary text-white p-2 rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center"
                        >
                            <span className="material-symbols-outlined text-sm">add</span>
                        </button>
                    </form>
                </div>

                {collections.length === 0 ? (
                    <div className="text-center py-6 text-on-surface-variant/60 text-sm font-medium">
                        No collections yet. Create one to organize your recipes!
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {collections.map(collection => (
                            <Link 
                                to={`/collections/${collection.id}`}
                                key={collection.id}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, collection.id)}
                                className="bg-white rounded-2xl p-4 border border-outline-variant/10 shadow-sm hover:border-primary/40 hover:shadow-md transition-all group flex flex-col items-center justify-center gap-2 cursor-pointer h-24"
                            >
                                <span className="material-symbols-outlined text-primary/60 group-hover:text-primary group-hover:scale-110 transition-transform">folder_special</span>
                                <span className="text-xs font-bold text-center text-on-surface line-clamp-2">{collection.name}</span>
                                <span className="text-[10px] text-on-surface-variant font-medium">{collection.recipeCount || 0} items</span>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {recipes.length === 0 ? (
                <div className="bg-surface-container-low rounded-[2rem] p-12 text-center border border-outline-variant/5 border-dashed space-y-4">
                    <div className="w-16 h-16 bg-surface-container-highest rounded-full flex items-center justify-center mx-auto text-on-surface-variant opacity-50 mb-6">
                        <span className="material-symbols-outlined text-3xl">bookmark_border</span>
                    </div>
                    <h3 className="text-xl font-black text-on-surface">Your Vault is Empty</h3>
                    <p className="text-on-surface-variant opacity-70 max-w-md mx-auto">Explore the marketplace and save recipes to build your personal strategy.</p>
                    <Link to="/recipes" className="inline-flex mt-4 items-center gap-2 text-primary font-bold hover:underline">
                        Browse Recipes <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recipes.map(({ id, recipeId, recipe }) => (
                        <div 
                            key={id} 
                            draggable
                            onDragStart={(e) => handleDragStart(e, recipeId)}
                            onDragEnd={handleDragEnd}
                            className={`bg-white rounded-3xl p-4 shadow-sm border border-outline-variant/10 hover:shadow-xl hover:border-primary/30 transition-all group relative cursor-move ${draggingId === recipeId ? 'opacity-50' : ''}`}
                        >
                            <button 
                                onClick={() => handleRemove(recipeId)}
                                className="absolute top-6 right-6 w-8 h-8 bg-white/80 backdrop-blur-md rounded-full text-error flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-error hover:text-white shadow-sm z-10"
                                title="Remove Save"
                            >
                                <span className="material-symbols-outlined text-[16px] font-bold">bookmark_remove</span>
                            </button>
                            
                            <div className="w-full aspect-video rounded-2xl overflow-hidden mb-4 bg-surface-container-high relative">
                                <img src={recipe.coverImageUrl} alt={recipe.title} onError={handleImageError} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                <div className="absolute bottom-3 left-3 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/20">
                                    {recipe.difficulty}
                                </div>
                            </div>
                            
                            <div className="space-y-1 px-2">
                                <h3 className="font-extrabold text-lg text-on-surface truncate pr-8">{recipe.title}</h3>
                                <div className="flex gap-4 text-xs font-bold text-on-surface-variant opacity-70">
                                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">timer</span> {recipe.prepTime + recipe.cookTime}m</span>
                                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">local_fire_department</span> {recipe.nutrition?.calories} kcal</span>
                                </div>
                            </div>
                            
                            <Link to={`/recipes/${recipeId}`} className="absolute inset-0 z-0"></Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SavedRecipesTab;
