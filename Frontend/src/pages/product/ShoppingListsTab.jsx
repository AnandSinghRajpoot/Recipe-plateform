import React, { useEffect, useState } from 'react';
import apiClient from '../../utils/apiClient';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import ConfirmationModal from '../../components/common/ConfirmationModal';

const ShoppingListsTab = () => {
    const [lists, setLists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchLists = async () => {
            try {
                console.log("Fetching shopping lists...");
                const res = await apiClient.get(`/shopping-lists?t=${Date.now()}`);
                console.log("Fetched lists response:", res.data);
                if (res.data && res.data.data) {
                    setLists(res.data.data);
                } else {
                    setLists([]);
                }
            } catch (err) {
                console.error("Failed to load shopping lists:", err);
                toast.error("Failed to load shopping lists");
            } finally {
                setLoading(false);
            }
        };
        fetchLists();
    }, []);

    const requestDelete = (e, id) => {
        e.stopPropagation();
        setDeleteTarget(id);
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        try {
            await apiClient.delete(`/shopping-lists/${deleteTarget}`);
            setLists(prev => prev.filter(l => l.id !== deleteTarget));
            toast.success("List deleted");
        } catch (err) {
            toast.error("Failed to delete list");
        }
        setDeleteTarget(null);
    };

    if (loading) return (
        <div className="py-20 flex justify-center">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
    );

    if (lists.length === 0) return (
        <div className="text-center py-20 bg-white/40 backdrop-blur-xl rounded-[2.5rem] border border-white">
            <span className="material-symbols-outlined text-5xl mb-4 opacity-20">shopping_cart_off</span>
            <h3 className="text-xl font-black text-on-surface">No shopping lists yet</h3>
            <p className="text-on-surface-variant opacity-60">Add recipes and generate a list to see them here.</p>
        </div>
    );

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {lists.map((list) => (
                <motion.div
                    key={list.id}
                    whileHover={{ y: -5 }}
                    onClick={() => navigate(`/shopping-list/${list.id}`)}
                    className="bg-white/60 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white shadow-sm hover:shadow-xl transition-all cursor-pointer group"
                >
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-3xl">receipt_long</span>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <button 
                                onClick={(e) => requestDelete(e, list.id)}
                                className="w-8 h-8 rounded-full bg-error/10 text-error flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-error hover:text-white"
                            >
                                <span className="material-symbols-outlined text-sm">delete</span>
                            </button>
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
                                {list.createdAt ? new Date(list.createdAt).toLocaleDateString() : 'Recently'}
                            </span>
                        </div>
                    </div>

                    <h4 className="text-xl font-black text-on-surface mb-2 group-hover:text-primary transition-colors">
                        {list.name}
                    </h4>
                    
                    <div className="flex items-center gap-4 mt-6 pt-6 border-t border-outline-variant/10">
                        <div className="flex -space-x-1">
                            {[
                                { icon: 'nutrition', color: 'bg-green-100 text-green-600' },
                                { icon: 'category', color: 'bg-blue-100 text-blue-600' },
                                { icon: 'task_alt', color: 'bg-amber-100 text-amber-600' }
                            ].map((item, idx) => (
                                <div key={idx} className={`w-7 h-7 rounded-full ${item.color} border-2 border-white flex items-center justify-center shadow-sm`}>
                                    <span className="material-symbols-outlined text-[12px]">{item.icon}</span>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs font-bold text-on-surface-variant">
                            {list.items.length} items to buy
                        </p>
                        
                        <div className="ml-auto w-8 h-8 rounded-full bg-on-surface flex items-center justify-center text-white scale-0 group-hover:scale-100 transition-transform">
                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </div>
                    </div>
                </motion.div>
                ))}
            </div>

            <ConfirmationModal
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={confirmDelete}
                title="Delete Shopping List"
                message="Are you sure you want to delete this shopping list? This action cannot be undone."
                confirmText="Delete List"
            />
        </>
    );
};

export default ShoppingListsTab;
