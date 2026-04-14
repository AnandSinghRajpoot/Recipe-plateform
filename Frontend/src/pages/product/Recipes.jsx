import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import HorizontalCard from "../../components/Headers/HorizontalCard.jsx";
import { HorizontalRecipeListSkeleton } from '../../components/common/LoadingSkeleton';
import LottiePlayer from '../../components/common/LottiePlayer';
import { motion, AnimatePresence } from 'framer-motion';

const Recipes = () => {
    const [searchParams] = useSearchParams();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [visibleCount, setVisibleCount] = useState(6);
    const [cache, setCache] = useState(new Map());
    
    
    const fetchRecipes = useCallback(async () => {
        try {
            setLoading(true);
            const query = searchParams.get('q') || "";
            const params = new URLSearchParams();
            if (query) params.append('q', query);

            const cacheKey = params.toString();
            
            // Check cache first
            if (cache.has(cacheKey)) {
                setItems(cache.get(cacheKey));
                setLoading(false);
                return;
            }

            const response = await axios.get(`http://localhost:8080/api/v1/recipes?${params.toString()}`, {
                timeout: 8000 // Add timeout
            });
            const data = response.data.data || [];
            
            // Update cache
            setCache(prev => new Map(prev).set(cacheKey, data));
            setItems(data);
        } catch (error) {
            console.error("Error fetching recipes:", error);
            // Set empty state on error to prevent infinite loading
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, [searchParams, cache]);

    useEffect(() => {
        fetchRecipes();
    }, [fetchRecipes]);

    
    return (
        <div className='bg-surface min-h-screen px-4 lg:px-12 py-24 font-body relative overflow-hidden'>
            
            {/* Background Ambience */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-30">
                <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[150px]"></div>
                <div className="absolute top-[40%] -right-[10%] w-[60%] h-[60%] rounded-full bg-tertiary-container/10 blur-[120px]"></div>
            </div>

            <div className="max-w-6xl mx-auto relative z-10">
                
                {/* Header */}
                <div className="mb-12">
                    <div className="text-2xl font-headline font-black text-on-surface">
                        Recipes
                    </div>
                </div>

                {/* Content Section */}
                <div>
                        {loading ? (
                            <HorizontalRecipeListSkeleton count={4} />
                        ) : (
                            <div className='flex flex-col items-center gap-10 pb-32'>
                                {items.length > 0 ? (
                                    <>
                                        {items.slice(0, visibleCount).map((item) => (
                                            <div key={item.id || item._id} className="w-full max-w-4xl">
                                                <HorizontalCard item={item} />
                                            </div>
                                        ))}
                                        {visibleCount < items.length && (
                                            <div className="flex justify-center mt-8">
                                                <button 
                                                    onClick={() => setVisibleCount(v => v + 6)}
                                                    className="px-8 py-4 rounded-3xl bg-white/60 backdrop-blur-md border border-white/40 hover:border-primary/40 text-on-surface font-black transition-all shadow-sm hover:shadow-md uppercase text-[10px] tracking-widest"
                                                >
                                                    Reveal More
                                                </button>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="text-center py-24 bg-white/40 backdrop-blur-xl rounded-[4rem] border border-white/60 space-y-8 overflow-hidden"
                                    >
                                        <LottiePlayer 
                                           animationUrl="https://assets10.lottiefiles.com/packages/lf20_m6cuL6.json" 
                                           className="w-80 h-80 mx-auto"
                                        />
                                        <div className="space-y-3 relative z-10">
                                            <h3 className="text-4xl font-headline font-black text-on-surface tracking-tight">No Recipes Found.</h3>
                                            <p className="text-on-surface-variant font-medium opacity-60 max-w-md mx-auto">No recipes were found in our greenhouse.</p>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        )}
                </div>
            </div>
        </div>
    );
};

export default Recipes;
