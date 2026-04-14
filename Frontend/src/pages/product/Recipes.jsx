import React, { useEffect, useState } from 'react';
import axios from 'axios';
import HorizontalCard from "../../components/Headers/HorizontalCard.jsx";
import { HorizontalRecipeListSkeleton } from '../../components/common/LoadingSkeleton';
import LottiePlayer from '../../components/common/LottiePlayer';
import { motion } from 'framer-motion';

const Recipes = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [visibleCount, setVisibleCount] = useState(6);

    useEffect(() => {
        const getLatestItems = async () => {
            try {
                const response = await axios.get("http://localhost:8080/api/v1/recipes");
                setItems(response.data.data || []);
            } catch (error) {
                console.error("Error fetching recipes:", error);
            } finally {
                setLoading(false);
            }
        };
        getLatestItems();
    }, []);

    return (
        <div className='bg-surface min-h-screen px-6 lg:px-12 py-24 font-body relative overflow-hidden'>
            
            {/* Background Ambience */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-30">
                <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[150px]"></div>
                <div className="absolute top-[40%] -right-[10%] w-[60%] h-[60%] rounded-full bg-tertiary-container/10 blur-[120px]"></div>
            </div>

            <div className="max-w-4xl mx-auto relative z-10 px-6 md:px-12">
                {loading ? (
                    <HorizontalRecipeListSkeleton count={4} />
                ) : (
                    <div className='flex flex-col gap-14 pb-32'>
                        {items.length > 0 ? (
                            <>
                                {items.slice(0, visibleCount).map((item) => (
                                    <div key={item.id || item._id}>
                                        <HorizontalCard item={item} />
                                    </div>
                                ))}
                                {visibleCount < items.length && (
                                    <div className="flex justify-center mt-8">
                                        <button 
                                            onClick={() => setVisibleCount(v => v + 6)}
                                            className="px-8 py-4 rounded-3xl bg-surface-container-high border border-outline-variant/20 hover:border-primary/40 text-on-surface font-black transition-all shadow-sm hover:shadow-md"
                                        >
                                            Load More
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-32 bg-white/40 backdrop-blur-xl rounded-[4rem] border border-white/60 space-y-8 overflow-hidden"
                            >
                                <LottiePlayer 
                                   animationUrl="https://assets10.lottiefiles.com/packages/lf20_m6cuL6.json" 
                                   className="w-80 h-80 mx-auto"
                                />
                                <div className="space-y-3 relative z-10">
                                    <h3 className="text-4xl font-headline font-black text-on-surface tracking-tight">The Greenhouse is Empty.</h3>
                                    <p className="text-on-surface-variant font-medium opacity-60 max-w-md mx-auto">Our botanical collection is currently being replanted with fresh seasonal intelligence.</p>
                                </div>
                                <button className="vitality-gradient text-white px-12 py-5 rounded-2xl font-black text-xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                                    Refresh Harvest
                                </button>
                            </motion.div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Recipes;
