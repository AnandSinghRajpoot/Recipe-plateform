import React , {useEffect,useState} from  'react';
import { useParams } from 'react-router-dom'
import Categories from './Categories';
import axios from 'axios';
import HorizontalCard from "../../components/Headers/HorizontalCard";

const CategoriesPage = () => {
    const {category} = useParams();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCategoryData = async () => {
            setLoading(true);

            try{
                const response = await axios.get(`http://localhost:8080/api/v1/recipes/category/${category}`)
                const data = response.data.data || response.data;
                setItems(Array.isArray(data) ? data : []);
            }
            catch(error){
                setError(error.message || "Error Loading category")
            }
            finally{
                setLoading(false)
            }
        }
        fetchCategoryData();
    },[category])

    return (
        <div className="bg-surface min-h-screen px-6 lg:px-12 py-24 font-body">
            <div className="max-w-7xl mx-auto">
                {/* Dynamic Category Header */}
                <div className="relative mb-20 text-center">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-primary/10 rounded-full blur-[120px] -z-0"></div>
                    <div className="relative z-10 space-y-6">
                        <span className="text-primary font-black uppercase tracking-widest text-[10px] px-5 py-2 bg-white/60 backdrop-blur-md rounded-full border border-primary/10 shadow-sm inline-block">
                            Category Selection
                        </span>
                        <h1 className="text-5xl md:text-8xl font-headline font-black text-on-surface tracking-tighter leading-tight capitalize">
                            {category} <span className="text-primary italic animate-pulse">Recipes</span>
                        </h1>
                        <p className="text-on-surface-variant font-medium text-lg max-w-xl mx-auto opacity-70">
                            Exploring the unique metabolic profiles and culinary traditions of <span className="text-primary font-black">{category}</span> cuisine.
                        </p>
                    </div>
                </div>
                
                {/* Discovery Navigation */}
                <div className="mb-20 bg-white/30 backdrop-blur-md p-8 rounded-[3rem] botanical-shadow border border-white/40">
                    <Categories/>
                </div>

                {loading ? (
                    <div className="flex flex-col justify-center items-center py-32 space-y-6">
                        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                        <p className="font-black text-primary uppercase tracking-widest text-[10px] animate-pulse">Sorting Harvest...</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-12">
                        {items && items.length > 0 ? (
                            items.map(item => (
                                <HorizontalCard item={item} key={item.id || item._id} />
                            ))
                        ) : (
                            <div className="text-center py-32 bg-white/40 backdrop-blur-xl rounded-[4rem] border border-white/60 space-y-8">
                                <span className="material-symbols-outlined text-7xl text-primary/40" style={{ fontVariationSettings: "'FILL' 0" }}>spa</span>
                                <div className="space-y-3">
                                    <h3 className="text-3xl font-headline font-black text-on-surface">No {category} recipes yet.</h3>
                                    <p className="text-on-surface-variant font-medium opacity-60">This specialized greenhouse plot is currently awaiting its first seeds.</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default CategoriesPage