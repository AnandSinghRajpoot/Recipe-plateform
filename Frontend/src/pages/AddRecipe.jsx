import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

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
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isChef, setIsChef] = useState(false);
    const [checkDone, setCheckDone] = useState(false);

    useEffect(() => {
        const role = localStorage.getItem("role");
        if (role === "CHEF" || role === "ADMIN") {
            setIsChef(true);
        }
        setCheckDone(true);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setRecipe({ ...recipe, [name]: value });
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const newErrors = {};
        if (!recipe.title.trim()) newErrors.title = "Title is required";
        if (!recipe.description.trim()) newErrors.description = "Description is required";
        if (!recipe.instructions.trim()) newErrors.instructions = "Instructions are required";
        if (recipe.ingredients.some(i => !i.name.trim())) newErrors.ingredients = "All ingredients must have names";
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setSubmitting(true);

        try {
            const formData = new FormData();
            formData.append("recipe", JSON.stringify(recipe));
            if (imageFile) {
                formData.append("file", imageFile);
            }

            const token = localStorage.getItem("token");
            await axios.post("http://localhost:8080/api/v1/recipes", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`
                }
            });

            alert("Recipe published successfully!");
            navigate("/my-recipes");
        } catch (err) {
            setErrors({ form: err.response?.data?.message || "Failed to publish recipe" });
        } finally {
            setSubmitting(false);
        }
    };

    // Loading state
    if (!checkDone) {
        return (
            <div className="min-h-screen bg-surface flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    // Not a chef
    if (!isChef) {
        return (
            <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center">
                <div className="w-24 h-24 rounded-full bg-error/10 flex items-center justify-center text-error mb-6">
                    <span className="material-symbols-outlined text-5xl">block</span>
                </div>
                <h1 className="text-3xl font-headline font-black text-on-surface mb-4">Access Restricted</h1>
                <p className="text-on-surface-variant font-medium mb-8 max-w-md">
                    Only verified chefs can post recipes. Upgrade your account to a Chef to start sharing your culinary creations.
                </p>
                <Link to="/signup?role=chef" className="vitality-gradient text-white px-8 py-4 rounded-2xl font-black shadow-xl">
                    Upgrade to Chef
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-surface font-body text-on-surface p-6 lg:p-12">
            <div className="max-w-4xl mx-auto">
                <h1 className="font-headline text-4xl md:text-5xl font-black text-on-surface mb-3">Add Recipe</h1>
                <p className="text-on-surface-variant font-medium mb-12">Share your culinary creation with the community</p>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {errors.form && (
                        <div className="p-4 bg-error-container text-on-error-container rounded-2xl font-bold">
                            {errors.form}
                        </div>
                    )}

                    <div>
                        <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant ml-2">Recipe Title</label>
                        <input 
                            name="title"
                            value={recipe.title}
                            onChange={handleChange}
                            className={`w-full px-6 py-4 bg-surface-container-low border-2 border-transparent rounded-2xl focus:border-primary/30 text-on-surface font-bold text-xl ${errors.title ? 'border-error' : ''}`}
                            placeholder="Enter recipe name"
                        />
                        {errors.title && <p className="text-xs text-error mt-1 ml-2">{errors.title}</p>}
                    </div>

                    <div>
                        <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant ml-2">Description</label>
                        <textarea 
                            name="description"
                            value={recipe.description}
                            onChange={handleChange}
                            className={`w-full px-6 py-4 bg-surface-container-low border-2 border-transparent rounded-2xl focus:border-primary/30 text-on-surface font-bold min-h-[120px] ${errors.description ? 'border-error' : ''}`}
                            placeholder="Brief description of your recipe"
                        />
                        {errors.description && <p className="text-xs text-error mt-1 ml-2">{errors.description}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant ml-2">Difficulty</label>
                            <select 
                                name="difficulty"
                                value={recipe.difficulty}
                                onChange={handleChange}
                                className="w-full px-4 py-4 bg-surface-container-low rounded-2xl font-bold"
                            >
                                <option value="EASY">Easy</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HARD">Hard</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant ml-2">Prep Time (min)</label>
                            <input 
                                type="number"
                                name="prepTime"
                                value={recipe.prepTime}
                                onChange={handleChange}
                                className="w-full px-4 py-4 bg-surface-container-low rounded-2xl font-bold"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant ml-2">Cook Time (min)</label>
                            <input 
                                type="number"
                                name="cookTime"
                                value={recipe.cookTime}
                                onChange={handleChange}
                                className="w-full px-4 py-4 bg-surface-container-low rounded-2xl font-bold"
                            />
                        </div>
                    </div>

                    <div>
                        <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant ml-2 mb-3">Ingredients</p>
                        {recipe.ingredients.map((ingredient, index) => (
                            <div key={index} className="flex gap-3 mb-3">
                                <input 
                                    name="name"
                                    value={ingredient.name}
                                    onChange={(e) => handleIngredientChange(index, e)}
                                    className="flex-1 px-4 py-3 bg-surface-container-low rounded-xl font-bold"
                                    placeholder="Ingredient name"
                                />
                                <input 
                                    name="quantity"
                                    value={ingredient.quantity}
                                    onChange={(e) => handleIngredientChange(index, e)}
                                    className="w-24 px-4 py-3 bg-surface-container-low rounded-xl font-bold"
                                    placeholder="Qty"
                                />
                                <select 
                                    name="unit"
                                    value={ingredient.unit}
                                    onChange={(e) => handleIngredientChange(index, e)}
                                    className="w-28 px-4 py-3 bg-surface-container-low rounded-xl font-bold"
                                >
                                    <option value="GRAM">g</option>
                                    <option value="ML">ml</option>
                                    <option value="PCS">pcs</option>
                                    <option value="TSP">tsp</option>
                                    <option value="TBSP">tbsp</option>
                                    <option value="CUP">cup</option>
                                </select>
                                {recipe.ingredients.length > 1 && (
                                    <button type="button" onClick={() => removeIngredient(index)} className="px-3 text-error">
                                        <span className="material-symbols-outlined">delete</span>
                                    </button>
                                )}
                            </div>
                        ))}
                        <button type="button" onClick={addIngredient} className="text-primary font-bold text-sm">
                            + Add Ingredient
                        </button>
                        {errors.ingredients && <p className="text-xs text-error ml-2">{errors.ingredients}</p>}
                    </div>

                    <div>
                        <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant ml-2">Instructions</label>
                        <textarea 
                            name="instructions"
                            value={recipe.instructions}
                            onChange={handleChange}
                            className={`w-full px-6 py-4 bg-surface-container-low border-2 border-transparent rounded-2xl focus:border-primary/30 text-on-surface font-bold min-h-[200px] ${errors.instructions ? 'border-error' : ''}`}
                            placeholder="Step by step instructions..."
                        />
                        {errors.instructions && <p className="text-xs text-error mt-1 ml-2">{errors.instructions}</p>}
                    </div>

                    <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant ml-2">Cover Image (Optional)</label>
                        <div className="relative border-2 border-dashed border-outline-variant/30 rounded-2xl p-8 text-center">
                            {imagePreview ? (
                                <img src={imagePreview} alt="Preview" className="max-h-64 mx-auto rounded-xl" />
                            ) : (
                                <div className="py-8">
                                    <span className="material-symbols-outlined text-4xl text-on-surface-variant">add_photo_alternate</span>
                                    <p className="text-on-surface-variant font-bold mt-2">Click to upload image</p>
                                </div>
                            )}
                            <input 
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                        </div>
                    </div>

                    <button 
                        type="submit"
                        disabled={submitting}
                        className={`w-full py-6 rounded-[2rem] vitality-gradient text-white font-black text-xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4 ${submitting ? 'opacity-70' : ''}`}
                    >
                        {submitting ? (
                            <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : "Publish Compendium"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddRecipe;