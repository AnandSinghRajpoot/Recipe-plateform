import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import axios from "axios";

const RecipeDetails = () => {
  const { id } = useParams(); // get recipe ID from URL
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/items/${id}`);
        setRecipe(res.data);
      } catch (err) {
        console.error("Error fetching recipe:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id]);

  if (loading) return <p className="text-center mt-10">Loading recipe...</p>;
  if (!recipe) return <p className="text-center mt-10">Recipe not found.</p>;

  return (
    <div className="min-h-screen bg-[#fffaf5] flex justify-center py-10 px-4">
      <div className="bg-white shadow-md rounded-xl p-6 max-w-3xl w-full">
        <img
          src={recipe.thumbnail_image}
          alt={recipe.name}
          className="w-full h-60 object-cover rounded-lg mb-4"
        />
        <h1 className="text-3xl font-bold mb-2">{recipe.name}</h1>
        <p className="text-gray-600 mb-4">{recipe.description || "No description available."}</p>

        <h2 className="text-xl font-semibold mt-4 mb-2">Ingredients</h2>
        <ul className="list-disc list-inside mb-4">
          {recipe.ingredients && recipe.ingredients.length > 0 ? (
            recipe.ingredients.map((ing, index) => (
              <li key={index}>
                {ing.quantity} {ing.name}
              </li>
            ))
          ) : (
            <li>No ingredients listed.</li>
          )}
        </ul>

        <h2 className="text-xl font-semibold mt-4 mb-2">Preparation</h2>
        <p>{recipe.instructions || "No instructions provided."}</p>
      </div>
    </div>
  );
};

export default RecipeDetails;
