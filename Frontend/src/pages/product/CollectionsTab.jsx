import React, { useState, useEffect } from 'react';
import apiClient from '../../utils/apiClient';
import toast from 'react-hot-toast';
import { extractErrorMessage } from '../../utils/errorHandler';

const CollectionsTab = () => {
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [dragOverId, setDragOverId] = useState(null);

    useEffect(() => {
        fetchCollections();
    }, []);

    const fetchCollections = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get('/collections');
            setCollections(res.data.data || []);
        } catch (err) {
            toast.error(extractErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newTitle.trim()) return;
        
        try {
            const res = await apiClient.post('/collections', { name: newTitle, description: "Personal Collection" });
            setCollections([...collections, res.data.data]);
            setIsCreating(false);
            setNewTitle("");
            toast.success("Collection created successfully");
        } catch (err) {
            toast.error(extractErrorMessage(err));
        }
    };

    const handleDelete = async (id) => {
        try {
            await apiClient.delete(`/collections/${id}`);
            setCollections(collections.filter(c => c.id !== id));
            toast.success("Collection deleted");
        } catch (err) {
            toast.error("Failed to delete collection");
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDragEnter = (id) => {
        setDragOverId(id);
    };

    const handleDragLeave = () => {
        setDragOverId(null);
    };

    const handleDropOnCollection = async (e, collectionId) => {
        e.preventDefault();
        setDragOverId(null);
        
        const recipeId = e.dataTransfer.getData('recipeId');
        if (!recipeId) return;
        
        try {
            await apiClient.post(`/collections/${collectionId}/recipes/${recipeId}/add`);
            toast.success('Recipe added to collection');
            fetchCollections();
        } catch (err) {
            toast.error(extractErrorMessage(err));
        }
    };

    if (loading) {
        return <div className="py-20 text-center text-primary font-bold animate-pulse">Loading your collections...</div>;
    }

    return (
        <div className="space-y-8 animate-fade-in-up">
            <header className="flex justify-between items-end border-b border-outline-variant/10 pb-6">
                <div>
                    <h2 className="text-3xl font-headline font-black tracking-tighter text-on-surface">Curated Collections</h2>
                    <p className="text-on-surface-variant mt-2 font-medium">Organize recipes matching your exact dietary needs. Drag saved recipes here to add them to collections.</p>
                </div>
                <button 
                    onClick={() => setIsCreating(!isCreating)}
                    className="vitality-gradient text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:scale-[1.02] shadow-md transition-all text-sm"
                >
                    <span className="material-symbols-outlined text-[18px]">create_new_folder</span>
                    New Collection
                </button>
            </header>

            {isCreating && (
                <form onSubmit={handleCreate} className="bg-primary/5 border border-primary/20 rounded-2xl p-6 flex flex-col sm:flex-row gap-4 mb-8">
                    <input 
                        autoFocus
                        type="text" 
                        placeholder="Collection Name (e.g. High Protein Dinners)" 
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="flex-grow bg-white px-4 py-3 rounded-xl border border-outline-variant/10 focus:ring-2 focus:ring-primary/20 font-bold"
                    />
                    <div className="flex gap-2 shrink-0">
                        <button type="button" onClick={() => setIsCreating(false)} className="px-5 py-3 rounded-xl bg-surface-container-high font-bold hover:bg-surface-container-highest transition-colors">Cancel</button>
                        <button type="submit" className="px-5 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark transition-colors shadow-lg">Create</button>
                    </div>
                </form>
            )}

            {collections.length === 0 ? (
                <div className="bg-surface-container-low rounded-[2rem] p-12 text-center border border-outline-variant/5 border-dashed space-y-4">
                    <div className="w-16 h-16 bg-surface-container-highest rounded-full flex items-center justify-center mx-auto text-on-surface-variant opacity-50 mb-6">
                        <span className="material-symbols-outlined text-3xl">folder_off</span>
                    </div>
                    <h3 className="text-xl font-black text-on-surface">No Collections Yet</h3>
                    <p className="text-on-surface-variant opacity-70 max-w-sm mx-auto">Group your recipes thoughtfully to make planning easier.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {collections.map(col => (
                        <div 
                            key={col.id} 
                            onDragOver={handleDragOver}
                            onDragLeave={() => setDragOverId(null)}
                            onDrop={(e) => handleDropOnCollection(e, col.id)}
                            className={`bg-surface-container-low rounded-3xl p-6 border border-outline-variant/10 hover:border-primary/30 transition-all group ${dragOverId === col.id ? 'border-primary bg-primary/5' : ''}`}
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
                                    <span className="material-symbols-outlined font-light text-2xl">folder</span>
                                </div>
                                <button 
                                    onClick={() => handleDelete(col.id)}
                                    className="w-8 h-8 rounded-full bg-error/5 text-error flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-error hover:text-white"
                                >
                                    <span className="material-symbols-outlined text-[16px]">delete</span>
                                </button>
                            </div>
                            <h3 className="text-xl font-extrabold text-on-surface mb-2">{col.name}</h3>
                            <div className="flex items-center gap-2 text-xs font-bold text-on-surface-variant opacity-60">
                                <span className="material-symbols-outlined text-[14px]">restaurant_menu</span>
                                {col.recipes ? col.recipes.length : 0} Compositions
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CollectionsTab;
