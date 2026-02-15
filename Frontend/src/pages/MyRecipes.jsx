import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { resolveImageUrl } from "../utils/imageUtils";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { GoClock } from "react-icons/go";

const MyRecipes = () => {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchMyRecipes();
    }, []);

    const fetchMyRecipes = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        try {
            const res = await axios.get("http://localhost:8080/api/v1/recipes/my-recipes", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRecipes(res.data.data || []);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this recipe?")) return;

        const token = localStorage.getItem("token");
        try {
            await axios.delete(`http://localhost:8080/api/v1/recipes/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRecipes(recipes.filter(r => r.id !== id));
            alert("Recipe deleted successfully!");
        } catch (err) {
            alert("Failed to delete recipe: " + (err.response?.data?.message || err.message));
        }
    };

    if (loading) return (
        <div className="min-h-screen flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
    );

    return (
        <div className="bg-[#FFFDF7] min-h-screen py-12 px-6 lg:px-20">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
                    <div>
                        <h1 className="text-4xl font-bold text-secondary mb-2">My <span className="text-orange-500">Recipes</span></h1>
                        <p className="text-gray-500 italic">Manage your culinary creations</p>
                    </div>
                    <Link 
                        to="/addRecipe" 
                        className="flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-600 transition shadow-lg shadow-orange-100"
                    >
                        <FaPlus /> Add New Recipe
                    </Link>
                </div>

                {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center mb-8">{error}</div>}

                {recipes.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm p-20 text-center border border-gray-100">
                        <div className="text-6xl mb-4">🍳</div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">No recipes yet</h3>
                        <p className="text-gray-500 mb-8 text-lg italic">You haven't shared any of your delicious recipes with the world!</p>
                        <Link 
                            to="/addRecipe" 
                            className="inline-block bg-orange-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-600 transition"
                        >
                            Create Your First Recipe
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {recipes.map((recipe) => (
                            <div key={recipe.id} className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col">
                                <div className="relative h-48 overflow-hidden">
                                    <img 
                                        src={resolveImageUrl(recipe.coverImageUrl)} 
                                        alt={recipe.title} 
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-lg shadow-sm">
                                        <span className="text-xs font-bold text-orange-600 uppercase">{recipe.difficulty}</span>
                                    </div>
                                </div>
                                <div className="p-6 flex-grow flex flex-col">
                                    <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1">{recipe.title}</h3>
                                    <p className="text-gray-500 text-sm line-clamp-2 italic mb-4 flex-grow">{recipe.description}</p>
                                    
                                    <div className="flex items-center text-gray-400 text-xs mb-6">
                                        <GoClock className="mr-1" /> {recipe.prepTime + recipe.cookTime} mins total
                                    </div>

                                    <div className="flex border-t border-gray-50 pt-4 gap-3">
                                        <button 
                                            onClick={() => navigate(`/edit-recipe/${recipe.id}`)}
                                            className="flex-grow flex items-center justify-center gap-2 bg-gray-50 text-gray-700 py-2.5 rounded-lg font-bold hover:bg-orange-50 hover:text-orange-600 transition"
                                        >
                                            <FaEdit size={14} /> Edit
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(recipe.id)}
                                            className="w-12 flex items-center justify-center bg-gray-50 text-gray-400 py-2.5 rounded-lg hover:bg-red-50 hover:text-red-500 transition"
                                            title="Delete Recipe"
                                        >
                                            <FaTrash size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyRecipes;
