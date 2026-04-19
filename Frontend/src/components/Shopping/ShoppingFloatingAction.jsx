import React, { useState } from 'react';
import { useShopping } from '../../context/ShoppingContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../utils/apiClient';
import toast from 'react-hot-toast';

const ShoppingFloatingAction = () => {
    const { selectedRecipes, clearSelection } = useShopping();
    const navigate = useNavigate();
    const [generating, setGenerating] = useState(false);

    if (selectedRecipes.length === 0) return null;

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            const res = await apiClient.post('/shopping-lists/generate', { recipeIds: selectedRecipes });
            // For now, we'll store the generated list in session and navigate to a "Generate" page
            // Or better, we save it immediately and go to the list details
            const saveRes = await apiClient.post('/shopping-lists', {
                name: `Shopping List (${new Date().toLocaleDateString()})`,
                items: res.data.data.items
            });
            
            toast.success("Shopping list created!");
            clearSelection();
            navigate(`/shopping-list/${saveRes.data.data.id}`);
        } catch (err) {
            toast.error("Failed to generate shopping list");
        } finally {
            setGenerating(false);
        }
    };

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100]"
            >
                <div className="bg-white/80 backdrop-blur-2xl px-6 py-4 rounded-[2.5rem] border border-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex items-center gap-6">
                    <div className="flex -space-x-3">
                        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-xs border-2 border-white shadow-sm">
                            {selectedRecipes.length}
                        </div>
                    </div>
                    
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-60 leading-none mb-1">Recipes Selected</p>
                        <p className="text-sm font-black text-on-surface">Ready for shopping?</p>
                    </div>

                    <div className="flex items-center gap-2">
                         <button 
                            onClick={clearSelection}
                            className="w-10 h-10 rounded-2xl bg-surface-container-low text-on-surface-variant hover:text-error transition-colors flex items-center justify-center"
                            title="Clear Selection"
                        >
                            <span className="material-symbols-outlined text-xl">close</span>
                        </button>
                        <button 
                            onClick={handleGenerate}
                            disabled={generating}
                            className="vitality-gradient text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
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
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ShoppingFloatingAction;
