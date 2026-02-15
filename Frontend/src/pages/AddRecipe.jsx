import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AddRecipe = () => {
    const navigate = useNavigate();
    const [recipe, setRecipe] = useState({
        title: "",
        description: "",
        instructions: "",
        difficulty: "EASY",
        prepTime: 0,
        cookTime: 0,
        ingredients: [{ name: "", quantity: "", unit: "GRAM" }]
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setRecipe({ ...recipe, [name]: value });
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors({ ...errors, [name]: "" });
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleIngredientChange = (index, e) => {
        const { name, value } = e.target;
        const newIngredients = [...recipe.ingredients];
        newIngredients[index][name] = value;
        setRecipe({ ...recipe, ingredients: newIngredients });
        
        if (errors.ingredients) {
            setErrors({ ...errors, ingredients: "" });
        }
    };

    const addIngredient = () => {
        setRecipe({
            ...recipe,
            ingredients: [...recipe.ingredients, { name: "", quantity: "", unit: "GRAM" }]
        });
    };

    const removeIngredient = (index) => {
        const newIngredients = recipe.ingredients.filter((_, i) => i !== index);
        setRecipe({ ...recipe, ingredients: newIngredients });
    };

    const validate = () => {
        const newErrors = {};
        if (!recipe.title || recipe.title.length < 3 || recipe.title.length > 100) {
            newErrors.title = "Recipe title must be between 3 and 100 characters";
        }
        if (!recipe.description || recipe.description.length < 20 || recipe.description.length > 500) {
            newErrors.description = "Description must be between 20 and 500 characters";
        }
        if (!recipe.instructions || recipe.instructions.length < 30 || recipe.instructions.length > 2000) {
            newErrors.instructions = "Instructions must be between 30 and 2000 characters";
        }
        if (recipe.prepTime < 0 || recipe.prepTime > 180) {
            newErrors.prepTime = "Prep time must be between 0 and 180 minutes";
        }
        if (recipe.cookTime < 1 || recipe.cookTime > 240) {
            newErrors.cookTime = "Cook time must be between 1 and 240 minutes";
        }
        
        recipe.ingredients.forEach((ing, index) => {
            if (!ing.name) newErrors.ingredients = "All ingredients must have a name";
            if (ing.quantity < 0.1) newErrors.ingredients = "Ingredient quantity must be at least 0.1";
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validate()) return;

        const token = localStorage.getItem("token");
        if (!token) {
            alert("Please login first to add a recipe!");
            navigate("/login");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...recipe,
                prepTime: parseInt(recipe.prepTime),
                cookTime: parseInt(recipe.cookTime),
                ingredients: recipe.ingredients.map(ing => ({
                    ...ing,
                    quantity: parseFloat(ing.quantity)
                }))
            };

            const formData = new FormData();
            formData.append("recipe", new Blob([JSON.stringify(payload)], { type: "application/json" }));
            
            if (imageFile) {
                formData.append("file", imageFile);
            }

            await axios.post("http://localhost:8080/api/v1/recipes", formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data" 
                }
            });

            alert("Recipe added successfully! 🍲");
            navigate("/"); // Or to recipe detail page
        } catch (err) {
            console.error(err);
            alert("Failed to add recipe: " + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#FFFDF7] min-h-screen py-10 px-5">
            <h1 className="text-3xl font-bold text-center text-orange-500 mb-8">
                Share Your Secret Recipe 🍲
            </h1>

            <form
                onSubmit={handleSubmit}
                noValidate
                className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-xl space-y-6"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block font-semibold mb-2 text-gray-700">Recipe Title</label>
                        <input
                            type="text"
                            name="title"
                            value={recipe.title}
                            onChange={handleChange}
                            placeholder="e.g. Grandma's Pasta"
                            className={`w-full border-2 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none transition ${errors.title ? 'border-red-500' : 'border-gray-200'}`}
                        />
                        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                    </div>

                    <div>
                        <label className="block font-semibold mb-2 text-gray-700">Difficulty</label>
                        <select
                            name="difficulty"
                            value={recipe.difficulty}
                            onChange={handleChange}
                            className="w-full border-gray-200 border-2 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 outline-none transition"
                        >
                            <option value="EASY">Easy</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HARD">Hard</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block font-semibold mb-2 text-gray-700">Cover Image</label>
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        <div className="w-full md:w-48 h-32 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center overflow-hidden bg-gray-50">
                            {imagePreview ? (
                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-gray-400 text-sm italic">No image selected</span>
                            )}
                        </div>
                        <div className="flex-grow">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 transition-all border-2 border-gray-100 p-2 rounded-xl"
                            />
                            <p className="text-xs text-gray-400 mt-2 italic">Select a beautiful cover image for your recipe (Optional)</p>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block font-semibold mb-2 text-gray-700">Description</label>
                    <textarea
                        name="description"
                        value={recipe.description}
                        onChange={handleChange}
                        placeholder="Tell us about your recipe..."
                        className={`w-full border-2 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 outline-none transition h-24 ${errors.description ? 'border-red-500' : 'border-gray-200'}`}
                    />
                    {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block font-semibold mb-2 text-gray-700">Prep Time (mins)</label>
                        <input
                            type="number"
                            name="prepTime"
                            value={recipe.prepTime}
                            onChange={handleChange}
                            className={`w-full border-2 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 outline-none transition ${errors.prepTime ? 'border-red-500' : 'border-gray-200'}`}
                        />
                        {errors.prepTime && <p className="text-red-500 text-xs mt-1">{errors.prepTime}</p>}
                    </div>
                    <div>
                        <label className="block font-semibold mb-2 text-gray-700">Cook Time (mins)</label>
                        <input
                            type="number"
                            name="cookTime"
                            value={recipe.cookTime}
                            onChange={handleChange}
                            className={`w-full border-2 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 outline-none transition ${errors.cookTime ? 'border-red-500' : 'border-gray-200'}`}
                        />
                        {errors.cookTime && <p className="text-red-500 text-xs mt-1">{errors.cookTime}</p>}
                    </div>
                </div>

                <div>
                    <label className="block font-semibold mb-2 text-gray-700">Ingredients</label>
                    <div className="space-y-3">
                        {recipe.ingredients.map((ing, index) => (
                            <div key={index} className="flex gap-2 items-start">
                                <input
                                    type="text"
                                    name="name"
                                    value={ing.name}
                                    onChange={(e) => handleIngredientChange(index, e)}
                                    placeholder="Ingredient name"
                                    className="flex-grow border-gray-200 border-2 rounded-xl p-2 text-sm focus:ring-2 focus:ring-orange-400 outline-none transition"
                                    required
                                />
                                <input
                                    type="number"
                                    name="quantity"
                                    value={ing.quantity}
                                    onChange={(e) => handleIngredientChange(index, e)}
                                    placeholder="Qty"
                                    className="w-20 border-gray-200 border-2 rounded-xl p-2 text-sm focus:ring-2 focus:ring-orange-400 outline-none transition"
                                    required
                                    step="0.1"
                                    min="0.1"
                                />
                                <select
                                    name="unit"
                                    value={ing.unit}
                                    onChange={(e) => handleIngredientChange(index, e)}
                                    className="w-32 border-gray-200 border-2 rounded-xl p-2 text-sm focus:ring-2 focus:ring-orange-400 outline-none transition"
                                    required
                                >
                                    <option value="GRAM">GRAM</option>
                                    <option value="KILOGRAM">KILOGRAM</option>
                                    <option value="LITER">LITER</option>
                                    <option value="MILLILITER">MILLILITER</option>
                                    <option value="CUP">CUP</option>
                                    <option value="TABLESPOON">TABLESPOON</option>
                                    <option value="TEASPOON">TEASPOON</option>
                                    <option value="PIECE">PIECE</option>
                                </select>
                                {recipe.ingredients.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeIngredient(index)}
                                        className="bg-red-50 text-red-500 p-2 rounded-xl hover:bg-red-100 transition"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                    {errors.ingredients && <p className="text-red-500 text-xs mt-1">{errors.ingredients}</p>}
                    <button
                        type="button"
                        onClick={addIngredient}
                        className="mt-3 text-sm font-semibold text-orange-500 hover:text-orange-600 transition"
                    >
                        + Add Another Ingredient
                    </button>
                </div>

                <div>
                    <label className="block font-semibold mb-2 text-gray-700">Instructions</label>
                    <textarea
                        name="instructions"
                        value={recipe.instructions}
                        onChange={handleChange}
                        placeholder="Step-by-step instructions..."
                        className={`w-full border-2 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 outline-none transition h-40 ${errors.instructions ? 'border-red-500' : 'border-gray-200'}`}
                    />
                    {errors.instructions && <p className="text-red-500 text-xs mt-1">{errors.instructions}</p>}
                </div>



                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition transform active:scale-[0.98] ${
                        loading ? "bg-gray-400 cursor-not-allowed" : "bg-orange-500 hover:bg-orange-600 shadow-orange-100"
                    }`}
                >
                    {loading ? "Adding Recipe..." : "Publish Recipe"}
                </button>
            </form>
        </div>
    );
};

export default AddRecipe;
