import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams, Link } from "react-router-dom";

const EditRecipe = () => {
    const { id } = useParams();
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

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        fetchRecipeDetails();
    }, [id]);

    const fetchRecipeDetails = async () => {
        try {
            const res = await axios.get(`http://localhost:8080/api/v1/recipes/${id}`);
            const data = res.data.data || res.data;
            setRecipe({
                title: data.title || "",
                description: data.description || "",
                instructions: data.instructions || "",
                difficulty: data.difficulty || "EASY",
                prepTime: data.prepTime || 0,
                cookTime: data.cookTime || 0,
                ingredients: data.ingredients || [{ name: "", quantity: "", unit: "GRAM" }]
            });
            if (data.coverImageUrl) {
                setImagePreview(data.coverImageUrl.startsWith('http') ? data.coverImageUrl : `http://localhost:8080/images/${data.coverImageUrl}`);
            }
        } catch (err) {
            console.error(err);
            navigate("/my-recipes");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setRecipe({ ...recipe, [name]: value });
        if (errors[name]) setErrors({ ...errors, [name]: "" });
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
        if (errors.ingredients) setErrors({ ...errors, ingredients: "" });
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
        if (!recipe.title || recipe.title.length < 3) newErrors.title = "Title too short";
        if (!recipe.description || recipe.description.length < 20) newErrors.description = "Description too short";
        if (!recipe.instructions || recipe.instructions.length < 30) newErrors.instructions = "Instructions too short";
        
        recipe.ingredients.forEach((ing, index) => {
            if (!ing.name) newErrors.ingredients = "Ingredients must have names";
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        const token = localStorage.getItem("token");
        setSubmitting(true);

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

            await axios.put(`http://localhost:8080/api/v1/recipes/${id}`, formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data" 
                }
            });

            alert("Recipe updated successfully! ✨");
            navigate("/my-recipes");
        } catch (err) {
            alert("Update failed: " + (err.response?.data?.message || err.message));
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-surface flex flex-col items-center justify-center space-y-6">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p className="font-black text-primary uppercase tracking-widest text-[10px] animate-pulse">Retrieving Architecture...</p>
        </div>
    );

    return (
        <div className="bg-surface font-body text-on-surface min-h-screen py-24 px-6 relative overflow-hidden">
            
            {/* Background Ambience */}
            <div className="absolute inset-0 pointer-events-none opacity-30">
                <div className="absolute top-[5%] right-[10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[150px]"></div>
                <div className="absolute bottom-[5%] left-[10%] w-[40%] h-[40%] rounded-full bg-secondary-container/10 blur-[120px]"></div>
            </div>

            <div className="max-w-4xl mx-auto relative z-10 space-y-12">
                
                <div className="text-center space-y-4">
                    <Link to="/my-recipes" className="inline-flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px] hover:bg-primary/5 px-4 py-2 rounded-full transition-all">
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        Back to Harvest
                    </Link>
                    <h1 className="text-5xl md:text-7xl font-headline font-black text-on-surface tracking-tighter leading-tight">
                        Refine Your <span className="text-primary italic animate-pulse">Intelligence</span>
                    </h1>
                    <p className="text-on-surface-variant font-medium text-lg max-w-xl mx-auto opacity-70">
                        Optimizing your culinary creation. Adjust metrics, ingredients, and methodology to perfect the metabolic impact.
                    </p>
                </div>

                <form onSubmit={handleSubmit} noValidate className="space-y-12">
                    
                    {/* Basic Info Section */}
                    <div className="bg-white/60 backdrop-blur-2xl rounded-[3rem] p-8 md:p-12 border border-white botanical-shadow space-y-10">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-1 bg-primary h-8 rounded-full"></div>
                            <h2 className="font-headline text-2xl font-extrabold text-on-surface">Updated Blueprint</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-2">Recipe Identity</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={recipe.title}
                                    onChange={handleChange}
                                    className={`w-full bg-surface-container-low border-2 border-transparent rounded-[2rem] px-8 py-5 focus:border-primary/40 focus:bg-white transition-all outline-none font-black text-lg ${errors.title ? 'border-error/40' : ''}`}
                                />
                                {errors.title && <p className="text-error text-[10px] font-black uppercase tracking-widest ml-4">{errors.title}</p>}
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-2">Complexity Level</label>
                                <div className="relative group">
                                    <select
                                        name="difficulty"
                                        value={recipe.difficulty}
                                        onChange={handleChange}
                                        className="w-full bg-surface-container-low border-2 border-transparent rounded-[2rem] px-8 py-5 focus:border-primary/40 focus:bg-white transition-all outline-none font-black text-lg appearance-none cursor-pointer"
                                    >
                                        <option value="EASY">Easy</option>
                                        <option value="MEDIUM">Medium</option>
                                        <option value="HARD">Hard</option>
                                    </select>
                                    <span className="material-symbols-outlined absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant opacity-60">expand_more</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-2">Visual Compendium Update</label>
                            <div className="flex flex-col md:flex-row gap-8 items-center bg-surface-container-low/50 p-6 rounded-[2.5rem] border border-outline-variant/10">
                                <div className="w-full md:w-64 h-48 rounded-[2rem] border-2 border-dashed border-primary/20 flex items-center justify-center overflow-hidden bg-white/50 relative group">
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-center space-y-2 opacity-30">
                                            <span className="material-symbols-outlined text-4xl">add_a_photo</span>
                                            <p className="text-[10px] font-black uppercase tracking-widest">No Image</p>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                         <span className="text-white text-xs font-black uppercase tracking-widest">Update Photo</span>
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                </div>
                                <div className="flex-grow space-y-4">
                                    <h4 className="font-headline font-black text-on-surface">Botanical Aesthetics</h4>
                                    <p className="text-sm text-on-surface-variant font-medium opacity-60">Refreshing your visual presentation can revitalize community interest in your specialized recipes.</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-2">Evolving Philosophy</label>
                            <textarea
                                name="description"
                                value={recipe.description}
                                onChange={handleChange}
                                className={`w-full bg-surface-container-low border-2 border-transparent rounded-[2rem] px-8 py-5 focus:border-primary/40 focus:bg-white transition-all outline-none font-medium text-lg h-32 ${errors.description ? 'border-error/40' : ''}`}
                            />
                        </div>
                    </div>

                    {/* Timeline Metrics Section */}
                    <div className="bg-white/60 backdrop-blur-2xl rounded-[3rem] p-10 border border-white botanical-shadow space-y-10">
                        <div className="flex items-center gap-4">
                            <div className="w-1 bg-primary h-6 rounded-full"></div>
                            <h2 className="font-headline text-xl font-extrabold text-on-surface">Refined Timeline</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center px-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Preparation</label>
                                    <span className="text-primary font-black text-xs">{recipe.prepTime} Mins</span>
                                </div>
                                <input
                                    type="range"
                                    name="prepTime"
                                    min="0"
                                    max="180"
                                    value={recipe.prepTime}
                                    onChange={handleChange}
                                    className="w-full h-2 bg-surface-container-high rounded-full accent-primary appearance-none cursor-pointer"
                                />
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center px-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Cooking</label>
                                    <span className="text-secondary font-black text-xs">{recipe.cookTime} Mins</span>
                                </div>
                                <input
                                    type="range"
                                    name="cookTime"
                                    min="0"
                                    max="240"
                                    value={recipe.cookTime}
                                    onChange={handleChange}
                                    className="w-full h-2 bg-surface-container-high rounded-full accent-secondary appearance-none cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Ingredients Dynamic Section */}
                    <div className="bg-white/60 backdrop-blur-2xl rounded-[3rem] p-8 md:p-12 border border-white botanical-shadow space-y-10">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="w-1 bg-primary h-8 rounded-full"></div>
                                <h2 className="font-headline text-2xl font-extrabold text-on-surface">The Source List</h2>
                            </div>
                            <button
                                type="button"
                                onClick={addIngredient}
                                className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px] hover:bg-primary/5 px-4 py-2 rounded-full transition-all"
                            >
                                <span className="material-symbols-outlined text-sm">add_circle</span>
                                Add Ingredient
                            </button>
                        </div>

                        <div className="space-y-6">
                            {recipe.ingredients.map((ing, index) => (
                                <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-surface-container-low/30 p-5 rounded-[2rem] border border-outline-variant/10 relative">
                                    <div className="md:col-span-6">
                                        <input
                                            type="text"
                                            name="name"
                                            value={ing.name}
                                            onChange={(e) => handleIngredientChange(index, e)}
                                            placeholder="Ingredient name"
                                            className="w-full bg-white border-2 border-transparent rounded-2xl px-6 py-4 focus:border-primary/30 outline-none font-bold text-sm"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <input
                                            type="number"
                                            name="quantity"
                                            value={ing.quantity}
                                            onChange={(e) => handleIngredientChange(index, e)}
                                            placeholder="1.0"
                                            className="w-full bg-white border-2 border-transparent rounded-2xl px-6 py-4 focus:border-primary/30 outline-none font-bold text-sm"
                                            step="0.1"
                                        />
                                    </div>
                                    <div className="md:col-span-3">
                                        <select
                                            name="unit"
                                            value={ing.unit}
                                            onChange={(e) => handleIngredientChange(index, e)}
                                            className="w-full bg-white border-2 border-transparent rounded-2xl px-6 py-4 focus:border-primary/30 outline-none font-bold text-sm appearance-none"
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
                                    </div>
                                    <div className="md:col-span-1 text-center">
                                        <button
                                            type="button"
                                            onClick={() => removeIngredient(index)}
                                            className="w-10 h-10 rounded-xl bg-error-container/20 text-error flex items-center justify-center hover:bg-error-container/40 transition-all ml-auto"
                                        >
                                            <span className="material-symbols-outlined text-lg">delete</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white/60 backdrop-blur-2xl rounded-[3rem] p-8 md:p-12 border border-white botanical-shadow space-y-10">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-1 bg-primary h-8 rounded-full"></div>
                            <h2 className="font-headline text-2xl font-extrabold text-on-surface">Methodology Optimization</h2>
                        </div>
                        <textarea
                            name="instructions"
                            value={recipe.instructions}
                            onChange={handleChange}
                            className={`w-full bg-surface-container-low border-2 border-transparent rounded-[2rem] px-8 py-5 focus:border-primary/40 focus:bg-white transition-all outline-none font-medium text-lg h-64 lg:h-80 ${errors.instructions ? 'border-error/40' : ''}`}
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-6 pt-6 justify-center">
                        <Link
                            to="/my-recipes"
                            className="px-12 py-6 rounded-[2rem] bg-white border border-outline-variant/10 text-on-surface font-black text-lg hover:bg-surface-container-low transition-all text-center"
                        >
                            Discard Changes
                        </Link>
                        <button
                            type="submit"
                            disabled={submitting}
                            className={`px-16 py-6 rounded-[2rem] vitality-gradient text-white font-black text-xl shadow-[0_24px_48px_rgba(0,110,28,0.2)] hover:scale-[1.03] active:scale-[0.97] transition-all flex items-center justify-center gap-4 ${submitting ? 'opacity-70' : ''}`}
                        >
                            {submitting ? <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div> : "Apply Refinements"}
                            {!submitting && <span className="material-symbols-outlined font-black">save</span>}
                        </button>
                    </div>
                </form>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                input[type=range] { -webkit-appearance: none; }
                input[type=range]::-webkit-slider-thumb {
                  -webkit-appearance: none;
                  height: 24px;
                  width: 24px;
                  border-radius: 50%;
                  background: #006e1c;
                  cursor: pointer;
                  border: 4px solid white;
                  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                  margin-top: -8px;
                }
                input[type=range]::-webkit-slider-runnable-track {
                  width: 100%;
                  height: 8px;
                  background: #e1e9db;
                  border-radius: 4px;
                }
            `}} />
        </div>
    );
};

export default EditRecipe;
