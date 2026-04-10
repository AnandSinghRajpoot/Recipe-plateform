import React, { useEffect, useState } from 'react';
import Categories from '../Category/Categories';
import axios from 'axios';
import HorizontalCard from "../../components/Headers/HorizontalCard.jsx";
import { RecipeListSkeleton } from '../../components/common/LoadingSkeleton';
import LottiePlayer from '../../components/common/LottiePlayer';
import { motion } from 'framer-motion';

const Recipes = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

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

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Contextual Header */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="relative mb-20 text-center"
                >
                    <div className="relative z-10 space-y-6">
                        <span className="text-primary font-black uppercase tracking-widest text-[10px] px-4 py-1.5 bg-primary/10 rounded-full border border-primary/20">
                            Curated Selection
                        </span>
                        <h2 className='text-5xl md:text-7xl font-headline font-black text-on-surface tracking-tighter leading-tight'>
                            Explore Our <br/><span className="text-primary-fixed italic">Vibrant Recipes</span>
                        </h2>
                        <p className="text-on-surface-variant font-medium text-xl max-w-2xl mx-auto opacity-70 leading-relaxed">
                            Discover a world of metabolic flavors with our curated collection of delicious, scientifically-inspired recipes.
                        </p>
                    </div>
                </motion.div>
                
                {/* Discovery Bar */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="mb-20 bg-white/40 backdrop-blur-md p-8 rounded-[3rem] botanical-shadow border border-white"
                >
                    <Categories/>
                </motion.div>

                {loading ? (
                    <RecipeListSkeleton count={4} />
                ) : (
                    <div className='flex flex-col gap-12'>
                        {items.length > 0 ? (
                            items.map((item, index) => (
                                <motion.div
                                    key={item.id || item._id}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                                >
                                    <HorizontalCard item={item} />
                                </motion.div>
                            ))
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
