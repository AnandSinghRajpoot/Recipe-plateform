import React, {useEffect, useState} from 'react';
import axios from 'axios';
import Card from '../../components/Headers/Card';
import {Link} from 'react-router-dom'

const LatestRecipe = () => {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getLatestItems = async ()=> {
            try {
                const response = await axios.get('http://localhost:8080/api/v1/recipes/latest')
                const data = response.data.data || response.data;
                setItems(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Error fetching latest recipes:", error);
            } finally {
                setLoading(false);
            }
        }
        getLatestItems();
    }, [])

  return (
    <div className='px-6 xl:px-12 py-24 bg-surface/30 border-y border-outline-variant/10'>
        <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                <div className="space-y-4 text-center md:text-left">
                    <span className="text-primary font-black uppercase tracking-widest text-[10px] px-4 py-1.5 bg-primary/10 rounded-full inline-block">
                        Fresh from the Greenhouse
                    </span>
                    <h2 className='text-4xl md:text-6xl font-headline font-black text-on-surface tracking-tighter leading-tight'>
                        Latest <span className="text-primary italic animate-pulse">Recipes</span>
                    </h2>
                    <p className="text-on-surface-variant font-medium text-lg max-w-xl opacity-70">
                        The most recent additions to our culinary intelligence platform, optimized for vitality.
                    </p>
                </div>
                <div className='hidden md:block'>
                    <Link to="/recipes">
                        <button className="flex items-center gap-3 text-primary font-black uppercase tracking-[0.2em] text-xs hover:gap-5 transition-all group">
                            View All Collection
                            <span className="material-symbols-outlined font-black group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        </button>
                    </Link>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white/40 h-96 rounded-[2.5rem] animate-pulse"></div>
                    ))}
                </div>
            ) : (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10'>
                    {items.length > 0  ? items.slice(0,4).map((item) => (
                        <Card key={item.id || item._id} item={item}/>
                    )) : (
                        <div className="col-span-full py-20 text-center opacity-40">
                             <span className="material-symbols-outlined text-5xl mb-4">grass</span>
                             <p className="font-bold">No latest recipes found.</p>
                        </div>
                    )}
                </div>
            )}

            <div className='md:hidden mt-16'>
                <Link to="/recipes">
                    <button className="w-full vitality-gradient text-white py-5 rounded-2xl font-black shadow-xl shadow-primary/10">
                        View Compendium
                    </button>
                </Link>
            </div>
        </div>
    </div>
  )
}

export default LatestRecipe
