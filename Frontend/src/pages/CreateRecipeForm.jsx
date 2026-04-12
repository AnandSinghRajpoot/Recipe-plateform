import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const CreateRecipeForm = ({ onSuccess }) => {
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
    safeForDiseaseIds: []
  });

  const [loading, setLoading] = useState(false);
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
    fetchRefData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRecipe({ ...recipe, [name]: value });
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
    if (step === 1) {
      if (!recipe.title || !recipe.description || !recipe.dietType || !recipe.mealType || !recipe.cuisineType) {
        toast.error("Please fill all required basic fields");
        return false;
      }
    }
    if (step === 2) {
      if (!recipe.instructions) {
        toast.error("Instructions are required");
        return false;
      }
      if (recipe.ingredients.some(i => !i.name || !i.quantity)) {
        toast.error("All ingredients must have name and quantity");
        return false;
      }
    }
    return true;
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
        ingredients: recipe.ingredients.map(ing => ({ ...ing, quantity: parseFloat(ing.quantity) }))
      };

      const formData = new FormData();
      formData.append("recipe", new Blob([JSON.stringify(payload)], { type: "application/json" }));
      if (imageFile) formData.append("file", imageFile);

      const res = await axios.post("http://localhost:8080/api/v1/recipes", formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
      });

      if (publishNow) {
        await axios.patch(`http://localhost:8080/api/v1/recipes/${res.data.data.id}/publish`, null, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Recipe published successfully!");
      } else {
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
      <div>
        <h2 className="text-3xl font-headline font-black text-on-surface">Recipe Creator</h2>
        <div className="flex gap-2 mt-6">
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
              <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Title *</label>
              <input type="text" name="title" value={recipe.title} onChange={handleChange} className="w-full bg-surface-container-low border-2 border-transparent rounded-2xl px-6 py-4 focus:border-primary/30 outline-none font-bold" placeholder="e.g. Avocado Toast" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Description *</label>
              <textarea name="description" value={recipe.description} onChange={handleChange} rows={3} className="w-full bg-surface-container-low border-2 border-transparent rounded-2xl px-6 py-4 focus:border-primary/30 outline-none font-medium resize-none" placeholder="Short description..." />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Diet *</label>
                <select name="dietType" value={recipe.dietType} onChange={handleChange} className="w-full bg-surface-container-low border-2 border-transparent rounded-2xl px-4 py-3 outline-none font-bold text-sm text-on-surface">
                  <option value="">Select</option>
                  {referenceData.dietTypes.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Meal *</label>
                <select name="mealType" value={recipe.mealType} onChange={handleChange} className="w-full bg-surface-container-low border-2 border-transparent rounded-2xl px-4 py-3 outline-none font-bold text-sm text-on-surface">
                  <option value="">Select</option>
                  {referenceData.mealTypes.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Cuisine *</label>
                <select name="cuisineType" value={recipe.cuisineType} onChange={handleChange} className="w-full bg-surface-container-low border-2 border-transparent rounded-2xl px-4 py-3 outline-none font-bold text-sm text-on-surface">
                  <option value="">Select</option>
                  {referenceData.cuisineTypes.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Servings</label>
                <input type="number" name="servings" value={recipe.servings} onChange={handleChange} min="1" className="w-full bg-surface-container-low border-2 border-transparent rounded-2xl px-4 py-3 outline-none font-bold text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mt-4">
              <div className="space-y-3">
                <div className="flex justify-between"><label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Prep Time</label><span className="text-primary font-black text-xs">{recipe.prepTime} min</span></div>
                <input type="range" name="prepTime" min="0" max="180" value={recipe.prepTime} onChange={handleChange} className="w-full accent-primary cursor-pointer" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between"><label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Cook Time</label><span className="text-secondary font-black text-xs">{recipe.cookTime} min</span></div>
                <input type="range" name="cookTime" min="0" max="240" value={recipe.cookTime} onChange={handleChange} className="w-full accent-secondary cursor-pointer" />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="font-headline font-black text-xl mb-4">2. Ingredients & Instructions</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Ingredients *</label>
                <button type="button" onClick={addIngredient} className="text-xs font-black text-primary uppercase tracking-widest hover:bg-primary/10 px-3 py-1 rounded-full transition-colors">+ Add</button>
              </div>
              {recipe.ingredients.map((ing, idx) => (
                <div key={idx} className="flex gap-2">
                  <input type="text" name="name" value={ing.name} onChange={e => handleIngredientChange(idx, e)} placeholder="Name" className="flex-[2] bg-surface-container-low rounded-xl px-4 py-3 font-bold text-sm outline-none focus:border-primary/30 border-2 border-transparent" />
                  <input type="number" name="quantity" value={ing.quantity} onChange={e => handleIngredientChange(idx, e)} placeholder="Qty" className="flex-1 bg-surface-container-low rounded-xl px-4 py-3 font-bold text-sm outline-none focus:border-primary/30 border-2 border-transparent" />
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
              <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Instructions *</label>
              <textarea name="instructions" value={recipe.instructions} onChange={handleChange} rows={6} className="w-full bg-surface-container-low border-2 border-transparent rounded-2xl px-6 py-4 focus:border-primary/30 outline-none font-medium resize-none" placeholder="Step 1...&#10;Step 2..." />
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

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-primary">Safe For Diseases (Verified by you)</label>
              <div className="flex flex-wrap gap-2">
                {referenceData.diseases.map(d => {
                  const isSelected = recipe.safeForDiseaseIds.includes(d.id);
                  return (
                    <button key={d.id} type="button" onClick={() => toggleArrayItem("safeForDiseaseIds", d.id)}
                      className={`px-4 py-2 rounded-xl text-sm font-black border-2 transition-all ${isSelected ? "border-primary bg-primary/10 text-primary" : "border-outline-variant/20 text-on-surface-variant hover:border-primary/40 hover:text-primary"}`}>
                      {d.name} {isSelected && "✓"}
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
            <button type="button" onClick={(e) => handleSubmit(e, false)} disabled={loading} className="px-6 py-3 rounded-2xl font-black text-primary border-2 border-primary/20 hover:bg-primary/5 transition-all disabled:opacity-50">
              Save Draft
            </button>
            <button type="button" onClick={(e) => handleSubmit(e, true)} disabled={loading} className="px-8 py-3 rounded-2xl font-black text-white vitality-gradient shadow-lg shadow-primary/20 hover:scale-105 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
              {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              Publish
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateRecipeForm;
