import React, {useEffect, useState} from 'react'
import Categories from '../Category/Categories';
import axios from 'axios';
import HorizontalCard from "../../components/Headers/HorizontalCard.jsx";

const Recipes = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() =>{
        const getLatestItems = async () => {
            try {
                const response = await axios.get("http://localhost:8080/api/v1/recipes")
                setItems(response.data.data || []) 
            } catch (error) {
                console.error("Error fetching recipes:", error);
            } finally {
                setLoading(false);
            }
        }
        getLatestItems();
    },[])

  return (
    <div className='bg-surface min-h-screen px-6 lg:px-12 py-24 font-body'>
        <div className="max-w-7xl mx-auto">
            {/* Contextual Header */}
            <div className="relative mb-20 text-center">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -z-0 animate-pulse"></div>
                <div className="relative z-10 space-y-6">
                    <span className="text-primary font-black uppercase tracking-widest text-xs px-4 py-1.5 bg-primary/10 rounded-full">
                        Curated Selection
                    </span>
                    <h2 className='text-5xl md:text-7xl font-headline font-black text-on-surface tracking-tighter leading-tight'>
                        Explore Our <br/><span className="text-primary-fixed italic animate-pulse">Vibrant Recipes</span>
                    </h2>
                    <p className="text-on-surface-variant font-medium text-xl max-w-2xl mx-auto opacity-70 leading-relaxed">
                        Discover a world of metabolic flavors with our curated collection of delicious, scientifically-inspired recipes.
                    </p>
                </div>
            </div>
            
            {/* Discovery Bar */}
            <div className="mb-20 bg-white/40 backdrop-blur-md p-8 rounded-[3rem] botanical-shadow border border-white">
                <Categories/>
            </div>

            {loading ? (
                <div className="flex flex-col justify-center items-center py-32 space-y-6">
                    <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    <p className="font-black text-primary uppercase tracking-widest text-xs animate-pulse">Harvesting Data...</p>
                </div>
            ) : (
                <div className='flex flex-col gap-12'>
                    {items.length > 0 ? (
                        items.map((item) => (
                            <HorizontalCard key={item.id || item._id} item={item} />
                        ))
                    ) : (
                        <div className="text-center py-32 bg-white/40 backdrop-blur-xl rounded-[4rem] border border-white/60 space-y-8">
                            <span className="material-symbols-outlined text-7xl text-primary/40" style={{ fontVariationSettings: "'FILL' 0" }}>inventory_2</span>
                            <div className="space-y-3">
                                <h3 className="text-3xl font-headline font-black text-on-surface">No recipes found yet.</h3>
                                <p className="text-on-surface-variant font-medium opacity-60">The digital greenhouse is currently being replanted.</p>
                            </div>
                            <button className="vitality-gradient text-white px-10 py-4 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                                Add First Recipe
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    </div>
  )
}

export default Recipes
