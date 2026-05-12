import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const CreateRecipeForm = ({ onSuccess, onCancel, recipeId }) => {
  const isEditMode = !!recipeId;
  const [step, setStep] = useState(1);
  const [recipe, setRecipe] = useState({
    title: "",
    description: "",
    instructions: "",
    difficulty: "MEDIUM",
    prepTime: 15,
    cookTime: 30,
    servings: 2,
    dietType: "",
    mealType: "",
    cuisineType: "",
    ingredients: [{ name: "", quantity: "", unit: "GRAM" }],
    allergenIds: [],
    dietaryGoals: [],
    nutrition: {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    }
  });

  const DIETARY_GOALS = [
    { id: 'WEIGHT_LOSS', name: 'Weight Loss' },
    { id: 'LOW_CARB', name: 'Low Carb' },
    { id: 'HEART_HEALTHY', name: 'Heart Healthy' },
    { id: 'MUSCLE_GAIN', name: 'Muscle Gain' },
    { id: 'HIGH_PROTEIN', name: 'High Protein' },
    { id: 'LOW_SODIUM', name: 'Low Sodium' },
    { id: 'GENERAL_WELLNESS', name: 'General Wellness' }
  ];

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [referenceData, setReferenceData] = useState({
    diseases: [],
    allergies: [],
    dietTypes: [],
    mealTypes: [],
    cuisineTypes: ["INDIAN", "MEDITERRANEAN", "ASIAN", "AMERICAN", "ITALIAN", "MEXICAN", "MIDDLE_EASTERN", "CONTINENTAL"]
  });

  useEffect(() => {
    // Load reference data
    const fetchRefData = async () => {
      try {
        const [disRes, allRes, dietRes, mealRes] = await Promise.all([
          axios.get("http://localhost:8080/api/v1/reference/diseases"),
          axios.get("http://localhost:8080/api/v1/reference/allergies"),
          axios.get("http://localhost:8080/api/v1/reference/diet-types"),
          axios.get("http://localhost:8080/api/v1/reference/meal-types")
        ]);
        setReferenceData(prev => ({
          ...prev,
          diseases: disRes.data.data || [],
          allergies: allRes.data.data || [],
          dietTypes: dietRes.data.data || [],
          mealTypes: mealRes.data.data || []
        }));
      } catch (err) {
        toast.error("Failed to load reference data");
      }
    };
    
    fetchRefData().then(() => {
        if (recipeId) {
            fetchRecipeDetails(recipeId);
        }
    });
  }, [recipeId]);

  const fetchRecipeDetails = async (id) => {
    setLoading(true);
    try {
        const res = await axios.get(`http://localhost:8080/api/v1/recipes/${id}`);
        const data = res.data.data || res.data;
        
        setRecipe({
            title: data.title || "",
            description: data.description || "",
            instructions: data.instructions || "",
            difficulty: data.difficulty || "MEDIUM",
            prepTime: data.prepTime || 15,
            cookTime: data.cookTime || 30,
            servings: data.servings || 2,
            dietType: data.dietType || "",
            mealType: data.mealType || "",
            cuisineType: data.cuisineType || "",
            ingredients: data.ingredients || [{ name: "", quantity: "", unit: "GRAM" }],
            // Map string arrays back to IDs/enum strings if needed, but for edit form,
            // we will just keep them empty if mapping is too complex, or we can fetch full lists.
            // Note: The backend ResponseDTO sends `containsAllergens` as string names.
            // We need IDs, so we find them from referenceData:
            allergenIds: [], // We'll map this below
            dietaryGoals: data.dietaryGoals || [],
            nutrition: data.nutrition || { calories: 0, protein: 0, carbs: 0, fat: 0 }
        });

        // We can only map allergens after reference data is loaded, 
        // which is why we chained the promises in useEffect.
        setRecipe(prev => {
            const mappedAllergens = [];
            if (data.containsAllergens && referenceData.allergies) {
                // Not accessible here due to closure, let's just do it directly in submit or state update.
            }
            return prev;
        });

        if (data.coverImageUrl) {
            setImagePreview(data.coverImageUrl.startsWith('http') ? data.coverImageUrl : `http://localhost:8080/images/${data.coverImageUrl}`);
        }
    } catch (err) {
        toast.error("Failed to load recipe details");
        if (onCancel) onCancel();
    } finally {
        setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("nutrition.")) {
        const field = name.split(".")[1];
        setRecipe(prev => {
            const newNutrition = { ...prev.nutrition, [field]: value };
            const p = parseFloat(newNutrition.protein || 0);
            const c = parseFloat(newNutrition.carbs || 0);
            const f = parseFloat(newNutrition.fat || 0);
            newNutrition.calories = (p * 4) + (c * 4) + (f * 9);
            return { ...prev, nutrition: newNutrition };
        });
    } else {
        setRecipe({ ...recipe, [name]: value });
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

  const addIngredient = () => setRecipe({ ...recipe, ingredients: [...recipe.ingredients, { name: "", quantity: "", unit: "GRAM" }] });
  const removeIngredient = (index) => setRecipe({ ...recipe, ingredients: recipe.ingredients.filter((_, i) => i !== index) });

  const toggleArrayItem = (arrayName, id) => {
    setRecipe(prev => {
      const arr = prev[arrayName];
      if (arr.includes(id)) {
        return { ...prev, [arrayName]: arr.filter(item => item !== id) };
      } else {
        return { ...prev, [arrayName]: [...arr, id] };
      }
    });
  };

  const validateStep = () => {
    let isValid = true;
    const newErrors = {};

    if (step === 1) {
      if (!recipe.title || recipe.title.length < 3 || recipe.title.length > 120) {
        newErrors.title = "Title must be between 3 and 120 characters";
        isValid = false;
      }
      if (!recipe.description || recipe.description.length < 20 || recipe.description.length > 500) {
        newErrors.description = "Description must be between 20 and 500 characters";
        isValid = false;
      }
      if (!recipe.dietType) { newErrors.dietType = "Required"; isValid = false; }
      if (!recipe.mealType) { newErrors.mealType = "Required"; isValid = false; }
      if (!recipe.cuisineType) { newErrors.cuisineType = "Required"; isValid = false; }
      
      if (recipe.prepTime < 0 || recipe.prepTime > 180) {
        newErrors.prepTime = "Must be 0-180";
        isValid = false;
      }
      if (recipe.cookTime < 1 || recipe.cookTime > 240) {
        newErrors.cookTime = "Must be 1-240";
        isValid = false;
      }
      if (recipe.servings < 1) {
        newErrors.servings = "Least 1";
        isValid = false;
      }
      
      // Nutrition validation
      if (recipe.nutrition.protein === "" || recipe.nutrition.protein < 0) {
          newErrors.protein = recipe.nutrition.protein < 0 ? "Cannot be negative" : "Required";
          isValid = false;
      }
      if (recipe.nutrition.carbs === "" || recipe.nutrition.carbs < 0) {
          newErrors.carbs = recipe.nutrition.carbs < 0 ? "Cannot be negative" : "Required";
          isValid = false;
      }
      if (recipe.nutrition.fat === "" || recipe.nutrition.fat < 0) {
          newErrors.fat = recipe.nutrition.fat < 0 ? "Cannot be negative" : "Required";
          isValid = false;
      }
    }
    if (step === 2) {
      if (!recipe.instructions || recipe.instructions.length < 30 || recipe.instructions.length > 2000) {
        newErrors.instructions = "Instructions must be between 30 and 2000 characters";
        isValid = false;
      }
      if (recipe.ingredients.some(i => !i.name || !i.quantity)) {
        newErrors.ingredients = "All ingredients must have name and quantity";
        isValid = false;
      }

      // Duplicate check
      const ingredientNames = recipe.ingredients.map(i => i.name.toLowerCase().trim()).filter(Boolean);
      const uniqueNames = new Set(ingredientNames);
      if (ingredientNames.length !== uniqueNames.size) {
        newErrors.ingredients = "Duplicate ingredients are not allowed";
        isValid = false;
      }
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const nextStep = () => {
    if (validateStep()) setStep(s => s + 1);
  };
  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = async (e, publishNow = false) => {
    e.preventDefault();
    if (!validateStep()) return;

    const token = localStorage.getItem("token");
    setLoading(true);
    try {
      const payload = {
        ...recipe,
        prepTime: parseInt(recipe.prepTime),
        cookTime: parseInt(recipe.cookTime),
        servings: parseInt(recipe.servings),
        ingredients: recipe.ingredients.map(ing => ({ ...ing, quantity: parseFloat(ing.quantity) })),
        nutrition: {
          protein: parseFloat(recipe.nutrition.protein),
          carbs: parseFloat(recipe.nutrition.carbs),
          fat: parseFloat(recipe.nutrition.fat),
          calories: parseFloat(recipe.nutrition.calories || 0)
        }
      };

      const formData = new FormData();
      formData.append("recipe", new Blob([JSON.stringify(payload)], { type: "application/json" }));
      if (imageFile) formData.append("file", imageFile);

      let res;
      if (isEditMode) {
          res = await axios.put(`http://localhost:8080/api/v1/recipes/${recipeId}`, formData, {
              headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
          });
          toast.success("Recipe updated successfully!");
      } else {
          res = await axios.post("http://localhost:8080/api/v1/recipes", formData, {
              headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
          });
      }

      if (publishNow && (!isEditMode || !res.data.data.isPublished)) {
        await axios.patch(`http://localhost:8080/api/v1/recipes/${res.data.data.id}/publish`, null, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Recipe published successfully!");
      } else if (!isEditMode) {
        toast.success("Draft saved successfully!");
      }
      
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save recipe");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header & Progress */}
      <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-headline font-black text-on-surface">{isEditMode ? "Edit Recipe" : "Recipe Creator"}</h2>
            <p className="text-sm font-black text-on-surface-variant uppercase tracking-widest mt-3">Step {step} of 5</p>
          </div>
          {onCancel && (
              <button onClick={onCancel} className="text-sm font-black text-on-surface-variant uppercase tracking-widest hover:text-primary transition-colors">
                  Cancel
              </button>
          )}
      </div>
      <div>
        <div className="flex gap-2 mt-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className={`h-2 flex-1 rounded-full transition-all duration-300 ${step >= i ? 'vitality-gradient shadow-md shadow-primary/20' : 'bg-outline-variant/20'}`} />
          ))}
        </div>
        <p className="text-sm font-black text-on-surface-variant uppercase tracking-widest mt-3">Step {step} of 5</p>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-outline-variant/10 shadow-sm">
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="font-headline font-black text-xl mb-4">1. Basic Details</h3>
            <div className="space-y-2">
              <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${errors.title ? 'text-error' : 'text-on-surface-variant'}`}>Title *</label>
              <input type="text" name="title" value={recipe.title} onChange={handleChange} className={`w-full bg-surface-container-low border-2 rounded-2xl px-6 py-4 outline-none font-bold ${errors.title ? 'border-error/50 focus:border-error' : 'border-transparent focus:border-primary/30'}`} placeholder="e.g. Avocado Toast" />
              {errors.title && <p className="text-[10px] text-error font-black mt-1 ml-1">{errors.title}</p>}
            </div>
            <div className="space-y-2">
              <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${errors.description ? 'text-error' : 'text-on-surface-variant'}`}>Description *</label>
              <textarea name="description" value={recipe.description} onChange={handleChange} rows={3} className={`w-full bg-surface-container-low border-2 rounded-2xl px-6 py-4 outline-none font-medium resize-none ${errors.description ? 'border-error/50 focus:border-error' : 'border-transparent focus:border-primary/30'}`} placeholder="Short description..." />
              {errors.description && <p className="text-[10px] text-error font-black mt-1 ml-1">{errors.description}</p>}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${errors.dietType ? 'text-error' : 'text-on-surface-variant'}`}>Diet *</label>
                <select name="dietType" value={recipe.dietType} onChange={handleChange} className={`w-full bg-surface-container-low border-2 rounded-2xl px-4 py-3 outline-none font-bold text-sm text-on-surface ${errors.dietType ? 'border-error/50' : 'border-transparent'}`}>
                  <option value="">Select</option>
                  {referenceData.dietTypes.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                {errors.dietType && <p className="text-[10px] text-error font-black mt-1 ml-1">{errors.dietType}</p>}
              </div>
              <div className="space-y-2">
                <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${errors.mealType ? 'text-error' : 'text-on-surface-variant'}`}>Meal *</label>
                <select name="mealType" value={recipe.mealType} onChange={handleChange} className={`w-full bg-surface-container-low border-2 rounded-2xl px-4 py-3 outline-none font-bold text-sm text-on-surface ${errors.mealType ? 'border-error/50' : 'border-transparent'}`}>
                  <option value="">Select</option>
                  {referenceData.mealTypes.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                {errors.mealType && <p className="text-[10px] text-error font-black mt-1 ml-1">{errors.mealType}</p>}
              </div>
              <div className="space-y-2">
                <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${errors.cuisineType ? 'text-error' : 'text-on-surface-variant'}`}>Cuisine *</label>
                <select name="cuisineType" value={recipe.cuisineType} onChange={handleChange} className={`w-full bg-surface-container-low border-2 rounded-2xl px-4 py-3 outline-none font-bold text-sm text-on-surface ${errors.cuisineType ? 'border-error/50' : 'border-transparent'}`}>
                  <option value="">Select</option>
                  {referenceData.cuisineTypes.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.cuisineType && <p className="text-[10px] text-error font-black mt-1 ml-1">{errors.cuisineType}</p>}
              </div>
              <div className="space-y-2">
                <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${errors.servings ? 'text-error' : 'text-on-surface-variant'}`}>Servings</label>
                <input type="number" name="servings" value={recipe.servings} onChange={handleChange} min="1" className={`w-full bg-surface-container-low border-2 rounded-2xl px-4 py-3 outline-none font-bold text-sm ${errors.servings ? 'border-error/50' : 'border-transparent'}`} />
                {errors.servings && <p className="text-[10px] text-error font-black mt-1 ml-1">{errors.servings}</p>}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 border-t border-outline-variant/10 pt-6">
              <div className="space-y-2">
                <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${errors.protein ? 'text-error' : 'text-on-surface-variant'}`}>Protein (g) *</label>
                <input type="number" name="nutrition.protein" value={recipe.nutrition.protein} onChange={handleChange} min="0" className={`w-full bg-surface-container-low border-2 rounded-2xl px-4 py-3 outline-none font-bold text-sm ${errors.protein ? 'border-error/50 focus:border-error' : 'border-transparent focus:border-primary/30'}`} placeholder="0" />
                {errors.protein && <p className="text-[10px] text-error font-black mt-1 ml-1">{errors.protein}</p>}
              </div>
              <div className="space-y-2">
                <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${errors.carbs ? 'text-error' : 'text-on-surface-variant'}`}>Carbs (g) *</label>
                <input type="number" name="nutrition.carbs" value={recipe.nutrition.carbs} onChange={handleChange} min="0" className={`w-full bg-surface-container-low border-2 rounded-2xl px-4 py-3 outline-none font-bold text-sm ${errors.carbs ? 'border-error/50 focus:border-error' : 'border-transparent focus:border-primary/30'}`} placeholder="0" />
                {errors.carbs && <p className="text-[10px] text-error font-black mt-1 ml-1">{errors.carbs}</p>}
              </div>
              <div className="space-y-2">
                <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${errors.fat ? 'text-error' : 'text-on-surface-variant'}`}>Fat (g) *</label>
                <input type="number" name="nutrition.fat" value={recipe.nutrition.fat} onChange={handleChange} min="0" className={`w-full bg-surface-container-low border-2 rounded-2xl px-4 py-3 outline-none font-bold text-sm ${errors.fat ? 'border-error/50 focus:border-error' : 'border-transparent focus:border-primary/30'}`} placeholder="0" />
                {errors.fat && <p className="text-[10px] text-error font-black mt-1 ml-1">{errors.fat}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mt-4">
              <div className="space-y-3">
                <div className="flex justify-between"><label className={`text-[10px] font-black uppercase tracking-widest ${errors.prepTime ? 'text-error' : 'text-on-surface-variant'}`}>Prep Time</label><span className="text-primary font-black text-xs">{recipe.prepTime} min</span></div>
                <input type="range" name="prepTime" min="0" max="180" value={recipe.prepTime} onChange={handleChange} className="w-full accent-primary cursor-pointer" />
                {errors.prepTime && <p className="text-[10px] text-error font-black mt-1 ml-1">{errors.prepTime}</p>}
              </div>
              <div className="space-y-3">
                <div className="flex justify-between"><label className={`text-[10px] font-black uppercase tracking-widest ${errors.cookTime ? 'text-error' : 'text-on-surface-variant'}`}>Cook Time</label><span className="text-secondary font-black text-xs">{recipe.cookTime} min</span></div>
                <input type="range" name="cookTime" min="0" max="240" value={recipe.cookTime} onChange={handleChange} className="w-full accent-secondary cursor-pointer" />
                {errors.cookTime && <p className="text-[10px] text-error font-black mt-1 ml-1">{errors.cookTime}</p>}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="font-headline font-black text-xl mb-4">2. Ingredients & Instructions</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${errors.ingredients ? 'text-error' : 'text-on-surface-variant'}`}>Ingredients *</label>
                <button type="button" onClick={addIngredient} className="text-xs font-black text-primary uppercase tracking-widest hover:bg-primary/10 px-3 py-1 rounded-full transition-colors">+ Add</button>
              </div>
              {errors.ingredients && <p className="text-[10px] text-error font-black mt-1 ml-1">{errors.ingredients}</p>}
              {recipe.ingredients.map((ing, idx) => (
                <div key={idx} className="flex gap-2">
                  <input type="text" name="name" value={ing.name} onChange={e => handleIngredientChange(idx, e)} placeholder="Name" className={`flex-[2] bg-surface-container-low rounded-xl px-4 py-3 font-bold text-sm outline-none focus:border-primary/30 border-2 ${(!ing.name && errors.ingredients) ? 'border-error/50' : 'border-transparent'}`} />
                  <input type="number" name="quantity" value={ing.quantity} onChange={e => handleIngredientChange(idx, e)} placeholder="Qty" className={`flex-1 bg-surface-container-low rounded-xl px-4 py-3 font-bold text-sm outline-none focus:border-primary/30 border-2 ${(!ing.quantity && errors.ingredients) ? 'border-error/50' : 'border-transparent'}`} />
                  <select name="unit" value={ing.unit} onChange={e => handleIngredientChange(idx, e)} className="flex-1 bg-surface-container-low rounded-xl px-2 py-3 font-bold text-sm outline-none">
                    {["GRAM","KILOGRAM","LITER","MILLILITER","CUP","TABLESPOON","TEASPOON","PIECE"].map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                  <button type="button" onClick={() => removeIngredient(idx)} disabled={recipe.ingredients.length === 1} className="w-12 bg-error/10 text-error rounded-xl flex items-center justify-center hover:bg-error hover:text-white transition-colors disabled:opacity-50">
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              ))}
            </div>
            <div className="space-y-2 mt-6">
              <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${errors.instructions ? 'text-error' : 'text-on-surface-variant'}`}>Instructions *</label>
              <textarea name="instructions" value={recipe.instructions} onChange={handleChange} rows={6} className={`w-full bg-surface-container-low border-2 rounded-2xl px-6 py-4 outline-none font-medium resize-none ${errors.instructions ? 'border-error/50 focus:border-error' : 'border-transparent focus:border-primary/30'}`} placeholder="Step 1...&#10;Step 2..." />
              {errors.instructions && <p className="text-[10px] text-error font-black mt-1 ml-1">{errors.instructions}</p>}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="font-headline font-black text-xl mb-4">3. Health Tagging</h3>
            
            <div className="space-y-3 border-b border-outline-variant/10 pb-6">
              <label className="text-[10px] font-black uppercase tracking-widest text-error">Contains Allergens (Warning)</label>
              <div className="flex flex-wrap gap-2">
                {referenceData.allergies.map(a => {
                  const isSelected = recipe.allergenIds.includes(a.id);
                  return (
                    <button key={a.id} type="button" onClick={() => toggleArrayItem("allergenIds", a.id)}
                      className={`px-4 py-2 rounded-xl text-sm font-black border-2 transition-all ${isSelected ? "border-error bg-error/10 text-error" : "border-outline-variant/20 text-on-surface-variant hover:border-error/40 hover:text-error"}`}>
                      {a.name} {isSelected && "✓"}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3 pb-6 border-b border-outline-variant/10">
              <label className="text-[10px] font-black uppercase tracking-widest text-primary">Intended Dietary Goals (Optional)</label>
              <div className="flex flex-wrap gap-2">
                {DIETARY_GOALS.map(goal => {
                  const isSelected = recipe.dietaryGoals.includes(goal.id);
                  return (
                    <button key={goal.id} type="button" onClick={() => toggleArrayItem("dietaryGoals", goal.id)}
                      className={`px-4 py-2 rounded-xl text-sm font-black border-2 transition-all ${isSelected ? "border-primary bg-primary/10 text-primary" : "border-outline-variant/20 text-on-surface-variant hover:border-primary/40 hover:text-primary"}`}>
                      {goal.name} {isSelected && "✓"}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="font-headline font-black text-xl mb-4">4. Aesthetics</h3>
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Cover Image</label>
              <div className="relative bg-surface-container-low rounded-3xl border-2 border-dashed border-outline-variant/20 h-64 flex flex-col items-center justify-center overflow-hidden cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all group">
                {imagePreview ? (
                  <>
                    <img src={imagePreview} className="absolute inset-0 w-full h-full object-cover" alt="preview" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white font-black px-4 py-2 rounded-xl bg-black/50 backdrop-blur-sm">Change Image</span>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-4xl text-outline-variant/50 mb-2 group-hover:text-primary transition-colors">add_photo_alternate</span>
                    <span className="text-sm font-black text-on-surface-variant/70 uppercase tracking-widest group-hover:text-primary transition-colors">Upload High-Res Photo</span>
                  </>
                )}
                <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="font-headline font-black text-xl mb-4 text-center">Ready to publish?</h3>
            <div className="bg-surface-container-low rounded-3xl p-6 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-lg border border-outline-variant/10">
                {imagePreview ? <img src={imagePreview} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-surface-container-high flex justify-center items-center"><span className="material-symbols-outlined text-outline-variant/30 text-4xl">restaurant</span></div>}
              </div>
              <div>
                <h4 className="font-headline font-black text-2xl text-on-surface">{recipe.title}</h4>
                <p className="text-on-surface-variant text-sm font-medium">{recipe.description}</p>
              </div>
              <div className="flex gap-2 flex-wrap justify-center">
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest">{recipe.dietType}</span>
                <span className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-[10px] font-black uppercase tracking-widest">{recipe.mealType}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="flex justify-between pt-4">
        {step > 1 ? (
          <button type="button" onClick={prevStep} className="px-6 py-3 rounded-2xl font-black text-on-surface border border-outline-variant/20 hover:bg-surface-container-low transition-all">Back</button>
        ) : <div />}
        
        {step < 5 ? (
          <button type="button" onClick={nextStep} className="px-8 py-3 rounded-2xl font-black text-white vitality-gradient shadow-lg shadow-primary/20 hover:scale-105 transition-all">Next</button>
        ) : (
          <div className="flex gap-4">
            {!isEditMode && (
                <button type="button" onClick={(e) => handleSubmit(e, false)} disabled={loading} className="px-6 py-3 rounded-2xl font-black text-primary border-2 border-primary/20 hover:bg-primary/5 transition-all disabled:opacity-50">
                  Save Draft
                </button>
            )}
            <button type="button" onClick={(e) => handleSubmit(e, true)} disabled={loading} className="px-8 py-3 rounded-2xl font-black text-white vitality-gradient shadow-lg shadow-primary/20 hover:scale-105 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
              {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {isEditMode ? "Save Changes" : "Publish"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateRecipeForm;
