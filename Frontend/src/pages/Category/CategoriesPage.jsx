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
        <div className="bg-gray-50 min-h-screen px-6 lg:px-12 py-20">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-center text-4xl py-10 font-bold text-secondary sm:text-6xl sm:leading-relaxed capitalize ">
                    {category} <span className="text-orange-500">Recipes</span>
                </h1>
                
                <div className="mb-16">
                    <Categories/>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-10">
                        {items && items.length > 0 ? (
                            items.map(item => (
                                <HorizontalCard item={item} key={item.id || item._id} />
                            ))
                        ) : (
                            <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
                                <h3 className="text-xl text-gray-400">No recipes found in this category.</h3>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default CategoriesPage