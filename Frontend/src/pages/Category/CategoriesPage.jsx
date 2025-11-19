import React , {useEffect,useState} from  'react';
import { useParams } from 'react-router-dom'
import Categories from './Categories';
import axios from 'axios';
import Card from "../../components/Headers/Card";


const CategoriesPage = () => {
    const {category} = useParams();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCategoryData = async () => {
            setLoading(true);

            try{
                const response = await axios.get(`http://localhost:5000/api/categories/${category}`)
                setItems(response.data)
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
        <div className="px-6 lg:px-12 py-20">
            <h1 className="text-center text-3xl py-10 font-semibold text-secondary sm:text-6xl sm:leading-relaxed capitalize ">{category}</h1>
            <Categories/>

            <ul className="mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 px-4 sm:px-8 lg:px-12">
                { 
                items && items?.map(item => (
                        <Card item={item} key={item._id} />
                ))
            }
            </ul>
            </div>
            
    )
}

export default CategoriesPage