import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../utils/apiClient';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const ShoppingListPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [list, setList] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchList = async () => {
        try {
            const res = await apiClient.get(`/shopping-lists`);
            // Find the specific list in user's lists
            const found = res.data.data.find(l => l.id.toString() === id);
            if (found) setList(found);
            else toast.error("List not found");
        } catch (err) {
            toast.error("Failed to load shopping list");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchList();
    }, [id]);

    const handleToggle = async (itemId, currentStatus) => {
        try {
            await apiClient.patch(`/shopping-lists/${id}/items/${itemId}?isChecked=${!currentStatus}`);
            // Optimistic update
            setList(prev => ({
                ...prev,
                groupedItems: Object.fromEntries(
                    Object.entries(prev.groupedItems).map(([cat, items]) => [
                        cat,
                        items.map(item => item.id === itemId ? { ...item, isChecked: !currentStatus } : item)
                    ])
                )
            }));
        } catch (err) {
            toast.error("Update failed");
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Delete this shopping list?")) return;
        try {
            await apiClient.delete(`/shopping-lists/${id}`);
            toast.success("List deleted");
            navigate('/profile');
        } catch (err) {
            toast.error("Delete failed");
        }
    };

    const exportToText = () => {
        if (!list) return;
        let text = `🛒 ${list.name}\n\n`;
        Object.entries(list.groupedItems).forEach(([category, items]) => {
            text += `--- ${category.replace(/_/g, ' ')} ---\n`;
            items.forEach(item => {
                text += `[${item.isChecked ? 'x' : ' '}] ${item.quantity} ${item.unit} ${item.ingredientName}\n`;
            });
            text += `\n`;
        });
        
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${list.name.replace(/\s+/g, '_')}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    if (loading) return (
        <div className="min-h-screen bg-surface flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (!list) return <div className="min-h-screen bg-surface flex items-center justify-center font-black">List not found.</div>;

    const totalItems = Object.values(list.groupedItems).flat().length;
    const checkedItems = Object.values(list.groupedItems).flat().filter(i => i.isChecked).length;
    const progress = (checkedItems / totalItems) * 100;

    return (
        <div className="min-h-screen bg-[#F8F9FA] py-12 px-4 md:px-8">
            <div className="max-w-4xl mx-auto space-y-8">
                
                {/* Header Card */}
                <div className="bg-on-surface text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <button 
                                onClick={() => navigate('/profile')}
                                className="text-[10px] font-black uppercase tracking-widest text-primary mb-4 flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-sm">arrow_back</span>
                                Back to Profile
                            </button>
                            <h1 className="text-4xl md:text-5xl font-headline font-black tracking-tighter">
                                {list.name}
                            </h1>
                            <p className="text-white/40 text-sm mt-1 font-medium italic">
                                Scanned and consolidated from your recipe selections.
                            </p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={exportToText}
                                className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-sm">download</span>
                                Export
                            </button>
                            <button 
                                onClick={handleDelete}
                                className="bg-error/20 hover:bg-error/40 text-error-container px-4 py-3 rounded-2xl transition-all"
                            >
                                <span className="material-symbols-outlined">delete</span>
                            </button>
                        </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-12 space-y-3">
                        <div className="flex justify-between items-end">
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Shopping Progress</span>
                            <span className="text-2xl font-black text-primary">{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                className="h-full vitality-gradient shadow-[0_0_20px_rgba(34,197,94,0.4)]"
                            />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40 text-center">
                            {checkedItems} of {totalItems} items collected
                        </p>
                    </div>

                    <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/20 rounded-full blur-[100px]"></div>
                </div>

                {/* List Body */}
                <div className="space-y-12 pb-24">
                    {Object.entries(list.groupedItems).map(([category, items]) => (
                        <div key={category} className="space-y-6">
                            <div className="flex items-center gap-4 px-4">
                                <h3 className="text-lg font-black uppercase tracking-widest text-on-surface-variant opacity-60">
                                    {category.replace(/_/g, ' ')}
                                </h3>
                                <div className="h-px flex-grow bg-outline-variant/10"></div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {items.map((item) => (
                                    <motion.div 
                                        key={item.id}
                                        layout
                                        onClick={() => handleToggle(item.id, item.isChecked)}
                                        className={`group cursor-pointer p-6 rounded-[2rem] border transition-all flex items-center gap-6 ${
                                            item.isChecked 
                                            ? 'bg-surface-container-low/30 border-outline-variant/10 opacity-60 grayscale' 
                                            : 'bg-white border-white shadow-sm hover:shadow-xl hover:scale-[1.02]'
                                        }`}
                                    >
                                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                                            item.isChecked 
                                            ? 'bg-green-600 text-white' 
                                            : 'bg-surface-container-low text-on-surface-variant group-hover:bg-primary/10 group-hover:text-primary'
                                        }`}>
                                            <span className="material-symbols-outlined text-xl">
                                                {item.isChecked ? 'check_circle' : 'circle'}
                                            </span>
                                        </div>
                                        
                                        <div className="flex-grow">
                                            <h4 className={`font-bold transition-all ${item.isChecked ? 'line-through text-on-surface-variant' : 'text-on-surface'}`}>
                                                {item.ingredientName}
                                            </h4>
                                            <p className="text-xs font-black uppercase tracking-widest opacity-40">
                                                {item.quantity} {item.unit}
                                            </p>
                                        </div>
                                        
                                        {!item.isChecked && (
                                            <div className="w-10 h-10 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-surface-container-high">
                                                <span className="material-symbols-outlined text-base">edit</span>
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Sticky Action Info */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
                <div className="bg-on-surface text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-4 border border-white/10 backdrop-blur-md">
                    <span className="material-symbols-outlined text-primary">info</span>
                    <p className="text-xs font-bold whitespace-nowrap">Click any item to toggle its checked status.</p>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .vitality-gradient { background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); }
                .font-headline { font-family: 'Manrope', sans-serif; }
            `}} />
        </div>
    );
};

export default ShoppingListPage;
