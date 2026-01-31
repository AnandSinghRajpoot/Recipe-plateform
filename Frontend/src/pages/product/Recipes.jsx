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
    <div className='bg-gray-50 min-h-screen px-6 lg:px-12 py-20'>
        <div className="max-w-6xl mx-auto">
            <h2 className='text-4xl md:text-5xl mb-4 font-bold text-secondary text-center'>
                Explore Our <span className="text-orange-500">Recipes</span>
            </h2>
            <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto text-lg italic">
                Discover a world of flavors with our curated collection of delicious, easy-to-follow recipes.
            </p>
            
            <div className="mb-16">
                <Categories/>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                </div>
            ) : (
                <div className='flex flex-col gap-10'>
                    {items.length > 0 ? (
                        items.map((item) => (
                            <HorizontalCard key={item.id || item._id} item={item} />
                        ))
                    ) : (
                        <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
                            <h3 className="text-xl text-gray-400">No recipes found yet.</h3>
                            <p className="text-gray-500 mt-2">Why not add the first one?</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    </div>
  )
}

export default Recipes
