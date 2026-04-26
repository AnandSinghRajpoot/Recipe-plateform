import React, { useState, useEffect } from 'react';
import { useShopping } from '../../context/ShoppingContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../utils/apiClient';
import toast from 'react-hot-toast';

const ShoppingFloatingAction = () => {
    const { selectedRecipes, clearSelection } = useShopping();
    const navigate = useNavigate();
    const [generating, setGenerating] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [previewData, setPreviewData] = useState(null);
    const [loadingPreview, setLoadingPreview] = useState(false);
    const [userLists, setUserLists] = useState([]);
    const [showNamingModal, setShowNamingModal] = useState(false);
    const [showSelectionModal, setShowSelectionModal] = useState(false);
    const [generatedItems, setGeneratedItems] = useState([]);
    const [generatedName, setGeneratedName] = useState("");

    useEffect(() => {
        if (selectedRecipes.length > 0) {
            fetchUserLists();
        }
    }, [selectedRecipes.length]);

    const fetchUserLists = async () => {
        try {
            const res = await apiClient.get('/shopping-lists');
            setUserLists(res.data.data || []);
        } catch (err) {
            console.error("Failed to fetch lists", err);
        }
    };

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            const res = await apiClient.post('/shopping-lists/generate', { recipeIds: selectedRecipes });
            setGeneratedItems(res.data.data.items);
            setGeneratedName(res.data.data.name); // Default suggestion
            setShowNamingModal(true);
        } catch (err) {
            toast.error("Failed to generate shopping list");
        } finally {
            setGenerating(false);
        }
    };

    const proceedToDecision = () => {
        if (!generatedName.trim()) {
            toast.error("Please provide a name for your list");
            return;
        }
        setShowNamingModal(false);
        if (userLists.length > 0) {
            setShowSelectionModal(true);
        } else {
            createNewList();
        }
    };

    if (selectedRecipes.length === 0) return null;

    const fetchPreview = async () => {
        if (showPreview) {
            setShowPreview(false);
            return;
        }
        
        setLoadingPreview(true);
        setShowPreview(true);
        try {
            const res = await apiClient.post('/shopping-lists/generate', { recipeIds: selectedRecipes });
            setPreviewData(res.data.data);
        } catch (err) {
            toast.error("Failed to load preview");
            setShowPreview(false);
        } finally {
            setLoadingPreview(false);
        }
    };


    const createNewList = async (items = generatedItems, name = generatedName) => {
        try {
            const saveRes = await apiClient.post('/shopping-lists', {
                name: name,
                items: items
            });
            toast.success("New shopping list created!");
            clearSelection();
            navigate(`/shopping-list/${saveRes.data.data.id}`);
        } catch (err) {
            toast.error("Failed to save list");
        } finally {
            setShowSelectionModal(false);
        }
    };

    const mergeIntoExisting = async (listId) => {
        try {
            const res = await apiClient.put(`/shopping-lists/${listId}/merge`, generatedItems);
            toast.success("Added to existing list!");
            clearSelection();
            navigate(`/shopping-list/${listId}`);
        } catch (err) {
            toast.error("Failed to merge into list");
        } finally {
            setShowSelectionModal(false);
        }
    };

    return (
        <AnimatePresence>
            {/* Step 1: Naming Modal */}
            {showNamingModal && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setShowNamingModal(false)}
                        className="absolute inset-0 bg-black/70 backdrop-blur-md"
                    />
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0, y: 30 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 30 }}
                        className="relative bg-white rounded-[4rem] w-full max-w-lg p-12 botanical-shadow border border-white flex flex-col gap-10 overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full -mr-24 -mt-24 blur-3xl"></div>
                        
                        <div className="space-y-4 relative z-10">
                            <div className="w-16 h-16 rounded-[2rem] bg-primary/10 text-primary flex items-center justify-center mb-6">
                                <span className="material-symbols-outlined text-3xl">edit_note</span>
                            </div>
                            <h3 className="text-4xl font-headline font-black text-on-surface tracking-tighter leading-none">Name your trip.</h3>
                            <p className="text-on-surface-variant font-medium opacity-60">Every great meal starts with a clear plan. What should we call this list?</p>
                        </div>

                        <div className="relative z-10">
                            <input 
                                type="text" 
                                value={generatedName}
                                onChange={(e) => setGeneratedName(e.target.value)}
                                placeholder="Enter list name..."
                                className="w-full bg-surface-container-low border-2 border-outline-variant/10 rounded-3xl px-8 py-6 font-headline font-black text-2xl text-on-surface focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all placeholder:opacity-20"
                                autoFocus
                                onKeyDown={(e) => e.key === 'Enter' && proceedToDecision()}
                            />
                        </div>

                        <div className="flex flex-col gap-4 relative z-10">
                            <button 
                                onClick={proceedToDecision}
                                className="w-full py-6 vitality-gradient text-white rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                            >
                                Continue to Options
                                <span className="material-symbols-outlined text-base">arrow_forward</span>
                            </button>
                            <button 
                                onClick={() => setShowNamingModal(false)}
                                className="w-full py-2 text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-30 hover:opacity-100 transition-all"
                            >
                                Cancel Generation
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Step 2: Selection Modal (Only if lists exist) */}
            {showSelectionModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setShowSelectionModal(false)}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative bg-white rounded-[3.5rem] w-full max-w-md p-10 botanical-shadow border border-white overflow-hidden flex flex-col gap-8"
                    >
                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest mb-2">
                                Choice Required
                            </div>
                            <h3 className="text-3xl font-headline font-black text-on-surface tracking-tight leading-none">Save or Merge?</h3>
                            <p className="text-sm text-on-surface-variant opacity-60 font-medium">We found existing lists. Would you like to merge into one or start fresh with <strong>"{generatedName}"</strong>?</p>
                        </div>

                        <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                            <button 
                                onClick={() => createNewList()}
                                className="w-full p-6 rounded-[2.5rem] bg-primary text-white flex items-center gap-5 group hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined">add</span>
                                </div>
                                <div className="text-left">
                                    <p className="font-black text-[10px] uppercase tracking-widest opacity-80">Action</p>
                                    <p className="font-black text-lg leading-tight">Create "{generatedName}"</p>
                                </div>
                            </button>

                            <div className="py-2 flex items-center gap-4">
                                <div className="h-px bg-outline-variant/10 flex-grow"></div>
                                <span className="text-[9px] font-black uppercase tracking-widest opacity-20">Merge Option</span>
                                <div className="h-px bg-outline-variant/10 flex-grow"></div>
                            </div>

                            {userLists.map(list => (
                                <button 
                                    key={list.id}
                                    onClick={() => mergeIntoExisting(list.id)}
                                    className="w-full p-5 rounded-[2.5rem] bg-surface-container-low border border-outline-variant/10 flex items-center justify-between group hover:border-primary/40 transition-all"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-primary border border-outline-variant/10">
                                            <span className="material-symbols-outlined text-base">receipt_long</span>
                                        </div>
                                        <div className="text-left">
                                            <p className="font-bold text-on-surface text-sm truncate max-w-[160px]">{list.name}</p>
                                            <p className="text-[10px] text-on-surface-variant opacity-40">{list.items?.length || 0} items already</p>
                                        </div>
                                    </div>
                                    <span className="material-symbols-outlined text-primary opacity-0 group-hover:opacity-100 transition-opacity">add_circle</span>
                                </button>
                            ))}
                        </div>

                        <button 
                            onClick={() => {
                                setShowSelectionModal(false);
                                setShowNamingModal(true);
                            }}
                            className="w-full py-2 text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-40 hover:opacity-100 transition-all flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-xs">arrow_back</span>
                            Back to Naming
                        </button>
                    </motion.div>
                </div>
            )}

            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-4">
                {/* Preview Drawer */}
                <AnimatePresence>
                    {showPreview && (
                        <motion.div
                            initial={{ y: 20, opacity: 0, scale: 0.95 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            exit={{ y: 20, opacity: 0, scale: 0.95 }}
                            className="w-[90vw] max-w-lg bg-white rounded-[2.5rem] shadow-2xl border border-outline-variant/10 overflow-hidden mb-2"
                        >
                            <div className="p-6 border-b border-outline-variant/5 bg-surface-container-low/30 flex justify-between items-center">
                                <h3 className="font-headline font-black text-lg">Ingredients Preview</h3>
                                <button onClick={() => setShowPreview(false)} className="w-8 h-8 rounded-full hover:bg-surface-container-high flex items-center justify-center">
                                    <span className="material-symbols-outlined text-sm">close</span>
                                </button>
                            </div>
                            
                            <div className="max-h-[40vh] overflow-y-auto p-4 space-y-2">
                                {loadingPreview ? (
                                    <div className="py-12 flex flex-col items-center justify-center gap-4">
                                        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                                        <p className="text-xs font-black uppercase tracking-widest opacity-40">Consolidating Ingredients...</p>
                                    </div>
                                ) : (
                                    previewData?.items?.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center p-3 rounded-2xl bg-surface-container-low/50 border border-outline-variant/5">
                                            <span className="text-sm font-bold capitalize">{item.ingredientName}</span>
                                            <span className="text-xs font-black text-primary bg-primary/10 px-3 py-1 rounded-full">
                                                {item.quantity} {item.unit.toLowerCase()}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Main Floating Bar */}
                <motion.div 
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="bg-white/80 backdrop-blur-2xl px-6 py-4 rounded-[2.5rem] border border-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex items-center gap-6"
                >
                    <div 
                        onClick={fetchPreview}
                        className="flex -space-x-3 cursor-pointer hover:scale-110 transition-transform"
                    >
                        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-xs border-2 border-white shadow-sm">
                            {selectedRecipes.length}
                        </div>
                    </div>
                    
                    <div onClick={fetchPreview} className="cursor-pointer">
                        <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-60 leading-none mb-1">Recipes Selected</p>
                        <p className="text-sm font-black text-on-surface flex items-center gap-2">
                            Ready for shopping?
                            <span className={`material-symbols-outlined text-xs transition-transform ${showPreview ? 'rotate-180' : ''}`}>expand_less</span>
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button 
                            onClick={clearSelection}
                            className="w-12 h-12 rounded-2xl bg-surface-container-low text-on-surface-variant hover:text-error transition-all flex items-center justify-center border border-outline-variant/10 hover:bg-error/5"
                            title="Cancel Selection"
                        >
                            <span className="material-symbols-outlined text-xl">close</span>
                        </button>
                        <button 
                            onClick={handleGenerate}
                            disabled={generating}
                            className="vitality-gradient text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                        >
                            {generating ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-base">receipt_long</span>
                                    Generate List
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ShoppingFloatingAction;
