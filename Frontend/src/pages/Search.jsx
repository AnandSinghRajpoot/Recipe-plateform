import React from 'react'
import {useState,useEffect} from 'react'
import { IoSearchOutline } from "react-icons/io5";
import { useParams } from 'react-router-dom'
import axios from 'axios';
import HorizontalCard from '../components/Headers/HorizontalCard';

const Search = () => {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const queryParam = params.get('query')
        if(queryParam){
            setQuery(queryParam)
        }
    }, [])

    useEffect(() => {
        if (!query) {
            setResults([]);
            return;
        }

        const fetchItems = async () => {
            setLoading(true);
            try{
                const response = await axios.get('http://localhost:8080/api/v1/recipes/search',{
                    params : {q : query}
                })
                setResults(response.data)
            }
            catch(error){
                setError(error.message || 'error fetching data')
            }
            finally{
                setLoading(false)
            }
        }
        fetchItems();
    },[query]);

    const handleSearch = (e) => {
        setQuery(e.target.value);
    }

    return (
        <div className='bg-gray-50 min-h-screen px-6 lg:px-12 py-20'>
            <div className="max-w-6xl mx-auto">
                <h1 className="text-center text-4xl py-10 font-bold text-secondary sm:text-6xl sm:leading-relaxed">
                    Search <span className="text-orange-500">Recipes</span>
                </h1>
                
                <div className='bg-white shadow-lg md:max-w-3xl mx-auto p-4 rounded-2xl relative flex items-center mb-20 border border-gray-100 focus-within:ring-2 focus-within:ring-orange-400 transition-all'>
                    <IoSearchOutline  className="w-6 h-6 mr-3 text-orange-500"/>
                    <input 
                        name="query" 
                        type="search" 
                        placeholder="Search for a recipe (e.g. Pasta, Chicken...)" 
                        id="search" 
                        value={query} 
                        onChange={handleSearch} 
                        className="outline-none w-full text-lg placeholder:text-gray-400" 
                    />
                </div>

                {loading && (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                    </div>
                )}
                
                {error && <div className="text-center text-red-500 py-10 bg-red-50 rounded-xl">Something went wrong. Please try again.</div>}
                
                <div className='flex flex-col gap-10 mt-10'>
                    {results && results.length > 0 ? (
                        results.map((item) => (
                            <HorizontalCard item={item} key={item.id || item._id} />
                        ))
                    ) : !loading && query && (
                        <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
                            <h3 className="text-xl text-gray-400">No recipes found for "{query}".</h3>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Search