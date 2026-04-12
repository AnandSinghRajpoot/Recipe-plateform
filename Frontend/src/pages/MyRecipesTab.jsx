import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const MyRecipesTab = () => {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyRecipes();
  }, []);

  const fetchMyRecipes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:8080/api/v1/recipes/my-recipes", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecipes(res.data.data || res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load recipes");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this recipe?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:8080/api/v1/recipes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecipes(recipes.filter(r => r.id !== id));
      toast.success("Recipe deleted");
    } catch (err) {
      toast.error("Failed to delete recipe");
    }
  };

  const handleTogglePublish = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(`http://localhost:8080/api/v1/recipes/${id}/publish`, null, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setRecipes(recipes.map(r => r.id === id ? { ...r, isPublished: !currentStatus } : r));
      toast.success(currentStatus ? "Recipe unpublished" : "Recipe published");
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-headline font-black text-on-surface">My Recipes</h2>
          <p className="text-on-surface-variant text-sm font-medium opacity-60 mt-1">{recipes.length} recipe{recipes.length !== 1 ? 's' : ''} in library</p>
        </div>
      </div>
      
      {recipes.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-3xl border border-outline-variant/10 shadow-sm">
          <span className="material-symbols-outlined text-6xl text-outline-variant/30 block mb-4">soup_kitchen</span>
          <p className="font-headline font-black text-xl text-on-surface-variant/50">No recipes yet. Start creating!</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl overflow-hidden border border-outline-variant/10 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-[10px] uppercase tracking-widest text-on-surface-variant font-black border-b border-outline-variant/10">
                  <th className="p-4 pl-6">Recipe</th>
                  <th className="p-4">Diet / Meal</th>
                  <th className="p-4">Time</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/5">
                {recipes.map(recipe => (
                  <tr key={recipe.id} className="hover:bg-surface-container-lowest transition-colors group">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-surface-container-high overflow-hidden shrink-0 shadow-sm">
                          {recipe.coverImageUrl ? (
                            <img src={recipe.coverImageUrl} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><span className="material-symbols-outlined text-outline-variant/50 text-xl">restaurant</span></div>
                          )}
                        </div>
                        <div>
                          <p className="font-headline font-black text-on-surface text-base line-clamp-1 group-hover:text-primary transition-colors">{recipe.title}</p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/50 mt-1">{recipe.difficulty || 'Medium'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-black text-on-surface">{recipe.dietType || "General"}</span>
                        <span className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest">{recipe.mealType || "Any"}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="flex items-center gap-1 text-xs font-black text-on-surface-variant">
                        <span className="material-symbols-outlined text-sm">schedule</span>
                        {(recipe.prepTime || 0) + (recipe.cookTime || 0)}m
                      </span>
                    </td>
                    <td className="p-4">
                      <button onClick={() => handleTogglePublish(recipe.id, recipe.isPublished)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${recipe.isPublished ? 'bg-primary/10 text-primary hover:bg-error/10 hover:text-error hover:after:content-["_UNPUBLISH"]' : 'bg-surface-container-high text-on-surface-variant hover:bg-primary/10 hover:text-primary'}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {recipe.isPublished ? "Published" : "Draft"}
                      </button>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => navigate(`/edit-recipe/${recipe.id}`)} title="Edit"
                          className="w-8 h-8 rounded-full bg-surface-container-low hover:bg-primary hover:text-white flex items-center justify-center text-on-surface-variant transition-colors">
                          <span className="material-symbols-outlined text-sm">edit</span>
                        </button>
                        <button onClick={() => handleDelete(recipe.id)} title="Delete"
                          className="w-8 h-8 rounded-full bg-surface-container-low hover:bg-error hover:text-white flex items-center justify-center text-error transition-colors">
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyRecipesTab;
