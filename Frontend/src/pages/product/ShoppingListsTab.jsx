import React, { useEffect, useState } from 'react';
import apiClient from '../../utils/apiClient';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const ShoppingListsTab = () => {
    const [lists, setLists] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchLists = async () => {
            try {
                const res = await apiClient.get('/shopping-lists');
                setLists(res.data.data);
            } catch (err) {
                toast.error("Failed to load shopping lists");
            } finally {
                setLoading(false);
            }
        };
        fetchLists();
    }, []);

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
                            <span className="material-symbols-outlined text-3xl">shopping_basket</span>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
                            {new Date(list.createdAt).toLocaleDateString()}
                        </span>
                    </div>

                    <h4 className="text-xl font-black text-on-surface mb-2 group-hover:text-primary transition-colors">
                        {list.name}
                    </h4>
                    
                    <div className="flex items-center gap-4 mt-6 pt-6 border-t border-outline-variant/10">
                        <div className="flex -space-x-2">
                            {/* Placeholder for recipe avatars if available */}
                            {[1,2,3].map(i => (
                                <div key={i} className="w-6 h-6 rounded-full bg-surface-container-high border-2 border-white"></div>
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
    );
};

export default ShoppingListsTab;
