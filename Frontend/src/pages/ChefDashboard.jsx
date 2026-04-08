import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// ──────────────────────────────────────────────────────────────────
// Inline tab components – no extra files needed
// ──────────────────────────────────────────────────────────────────

const OverviewTab = ({ stats }) => (
  <div className="space-y-10">
    <div>
      <h2 className="text-3xl font-headline font-black text-on-surface tracking-tight mb-2">Good day, Chef 👨‍🍳</h2>
      <p className="text-on-surface-variant font-medium opacity-60">Here's a snapshot of your culinary workspace.</p>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      {[
        { icon: "menu_book", label: "Published Recipes", value: stats.total ?? "—", color: "bg-primary/10 text-primary" },
        { icon: "visibility", label: "Total Views", value: stats.views ?? "—", color: "bg-secondary-container/40 text-secondary" },
        { icon: "favorite", label: "Total Likes", value: stats.likes ?? "—", color: "bg-tertiary-container/40 text-tertiary" },
      ].map((s) => (
        <div key={s.label} className="bg-white rounded-3xl p-7 border border-outline-variant/10 shadow-sm hover:shadow-lg transition-all group">
          <div className={`w-12 h-12 rounded-2xl ${s.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
            <span className="material-symbols-outlined">{s.icon}</span>
          </div>
          <p className="text-3xl font-headline font-black text-on-surface">{s.value}</p>
          <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant mt-1 opacity-60">{s.label}</p>
        </div>
      ))}
    </div>
    <div className="bg-white rounded-3xl p-8 border border-outline-variant/10 shadow-sm">
      <h3 className="font-headline font-black text-lg text-on-surface mb-4">Quick Actions</h3>
      <div className="flex flex-wrap gap-4">
        {[
          { icon: "add_circle", label: "New Recipe", action: "add" },
          { icon: "photo_library", label: "My Library", action: "recipes" },
          { icon: "person", label: "Edit Profile", action: "profile" },
        ].map((a) => (
          <button key={a.label} data-action={a.action}
            className="flex items-center gap-3 px-6 py-3 bg-surface-container-low hover:bg-primary hover:text-white rounded-2xl transition-all text-sm font-black text-on-surface-variant group border border-transparent hover:border-primary/20 hover:shadow-lg"
          >
            <span className="material-symbols-outlined text-sm">{a.icon}</span>
            {a.label}
          </button>
        ))}
      </div>
    </div>
  </div>
);

const MyRecipesTab = () => {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios.get("http://localhost:8080/api/v1/recipes/my-recipes", {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setRecipes(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this recipe?")) return;
    const token = localStorage.getItem("token");
    await axios.delete(`http://localhost:8080/api/v1/recipes/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setRecipes(recipes.filter(r => r.id !== id));
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-headline font-black text-on-surface">My Recipes</h2>
          <p className="text-on-surface-variant text-sm font-medium opacity-60 mt-1">{recipes.length} recipe{recipes.length !== 1 ? 's' : ''} published</p>
        </div>
      </div>
      {recipes.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-outline-variant/10">
          <span className="material-symbols-outlined text-6xl text-outline-variant/30 block mb-4">soup_kitchen</span>
          <p className="font-headline font-black text-xl text-on-surface-variant/50">No recipes yet. Start creating!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {recipes.map(recipe => (
            <div key={recipe.id} className="bg-white rounded-3xl overflow-hidden border border-outline-variant/10 shadow-sm hover:shadow-xl transition-all group">
              <div className="h-44 bg-surface-container-high overflow-hidden relative">
                {recipe.imageUrl ? (
                  <img src={`http://localhost:8080/api/v1/images/${recipe.imageUrl}`} alt={recipe.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-5xl text-outline-variant/20">restaurant</span>
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${recipe.difficulty === 'EASY' ? 'bg-primary/10 text-primary' : recipe.difficulty === 'MEDIUM' ? 'bg-amber-100 text-amber-800' : 'bg-error/10 text-error'}`}>
                    {recipe.difficulty}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-headline font-black text-on-surface text-lg leading-tight mb-2 line-clamp-1">{recipe.title}</h3>
                <p className="text-xs text-on-surface-variant opacity-60 font-medium line-clamp-2 mb-4">{recipe.description}</p>
                <div className="flex items-center gap-3 text-[10px] font-black text-on-surface-variant/50 uppercase tracking-widest mb-5">
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-xs">timer</span>{recipe.prepTime + recipe.cookTime}m</span>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => navigate(`/edit-recipe/${recipe.id}`)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-surface-container-low hover:bg-primary hover:text-white text-xs font-black transition-all text-on-surface-variant">
                    <span className="material-symbols-outlined text-sm">edit</span> Edit
                  </button>
                  <button onClick={() => handleDelete(recipe.id)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-error/5 hover:bg-error hover:text-white text-xs font-black text-error transition-all">
                    <span className="material-symbols-outlined text-sm">delete</span> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const AddRecipeTab = ({ onSuccess }) => {
  const [recipe, setRecipe] = useState({
    title: "", description: "", instructions: "", difficulty: "EASY",
    prepTime: 15, cookTime: 30,
    ingredients: [{ name: "", quantity: "", unit: "GRAM" }]
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

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
  };

  const addIngredient = () => setRecipe({ ...recipe, ingredients: [...recipe.ingredients, { name: "", quantity: "", unit: "GRAM" }] });
  const removeIngredient = (index) => setRecipe({ ...recipe, ingredients: recipe.ingredients.filter((_, i) => i !== index) });

  const validate = () => {
    const newErrors = {};
    if (!recipe.title || recipe.title.length < 3) newErrors.title = "Title must be at least 3 characters";
    if (!recipe.description || recipe.description.length < 20) newErrors.description = "Description must be at least 20 characters";
    if (!recipe.instructions || recipe.instructions.length < 30) newErrors.instructions = "Instructions must be at least 30 characters";
    recipe.ingredients.forEach(ing => {
      if (!ing.name) newErrors.ingredients = "All ingredients must have a name";
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const token = localStorage.getItem("token");
    setLoading(true);
    try {
      const payload = { ...recipe, prepTime: parseInt(recipe.prepTime), cookTime: parseInt(recipe.cookTime), ingredients: recipe.ingredients.map(ing => ({ ...ing, quantity: parseFloat(ing.quantity) })) };
      const formData = new FormData();
      formData.append("recipe", new Blob([JSON.stringify(payload)], { type: "application/json" }));
      if (imageFile) formData.append("file", imageFile);
      await axios.post("http://localhost:8080/api/v1/recipes", formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
      });
      onSuccess();
    } catch (err) {
      setErrors({ form: err.response?.data?.message || "Failed to publish recipe." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h2 className="text-3xl font-headline font-black text-on-surface">New Recipe</h2>
        <p className="text-on-surface-variant text-sm font-medium opacity-60 mt-1">Share your culinary creation with the community.</p>
      </div>
      {errors.form && <div className="p-4 bg-error/10 text-error rounded-2xl text-sm font-black border border-error/20">{errors.form}</div>}
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <div className="bg-white rounded-3xl p-8 border border-outline-variant/10 shadow-sm space-y-6">
          <h3 className="font-headline font-black text-on-surface border-b border-outline-variant/10 pb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Recipe Title *</label>
              <input type="text" name="title" value={recipe.title} onChange={handleChange} placeholder="e.g. Avocado Toast with Poached Egg"
                className={`w-full bg-surface-container-low border-2 border-transparent rounded-2xl px-6 py-4 focus:border-primary/30 focus:bg-white outline-none font-bold transition-all ${errors.title ? 'border-error/40' : ''}`} />
              {errors.title && <p className="text-error text-[10px] font-black ml-1">{errors.title}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Difficulty</label>
              <select name="difficulty" value={recipe.difficulty} onChange={handleChange}
                className="w-full bg-surface-container-low border-2 border-transparent rounded-2xl px-6 py-4 focus:border-primary/30 outline-none font-bold appearance-none">
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Photo</label>
              <div className="relative bg-surface-container-low rounded-2xl border-2 border-dashed border-outline-variant/20 h-16 flex items-center justify-center overflow-hidden cursor-pointer hover:border-primary/40 transition-all group">
                {imagePreview ? <img src={imagePreview} className="w-full h-full object-cover" alt="preview" /> : <span className="text-xs font-black text-on-surface-variant/50 uppercase tracking-widest group-hover:text-primary transition-colors">Click to upload photo</span>}
                <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Description *</label>
            <textarea name="description" value={recipe.description} onChange={handleChange} placeholder="Describe the spirit of this recipe..." rows={3}
              className={`w-full bg-surface-container-low border-2 border-transparent rounded-2xl px-6 py-4 focus:border-primary/30 focus:bg-white outline-none font-medium resize-none transition-all ${errors.description ? 'border-error/40' : ''}`} />
            {errors.description && <p className="text-error text-[10px] font-black ml-1">{errors.description}</p>}
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between"><label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Prep Time</label><span className="text-primary font-black text-xs">{recipe.prepTime} min</span></div>
              <input type="range" name="prepTime" min="0" max="180" value={recipe.prepTime} onChange={handleChange} className="w-full h-2 rounded-full accent-primary appearance-none cursor-pointer bg-surface-container-high" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between"><label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Cook Time</label><span className="text-secondary font-black text-xs">{recipe.cookTime} min</span></div>
              <input type="range" name="cookTime" min="0" max="240" value={recipe.cookTime} onChange={handleChange} className="w-full h-2 rounded-full accent-secondary appearance-none cursor-pointer bg-surface-container-high" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-outline-variant/10 shadow-sm space-y-5">
          <div className="flex justify-between items-center border-b border-outline-variant/10 pb-4">
            <h3 className="font-headline font-black text-on-surface">Ingredients</h3>
            <button type="button" onClick={addIngredient} className="text-primary font-black text-xs uppercase tracking-widest flex items-center gap-1 hover:bg-primary/5 px-3 py-1.5 rounded-full">
              <span className="material-symbols-outlined text-sm">add</span> Add
            </button>
          </div>
          {recipe.ingredients.map((ing, index) => (
            <div key={index} className="grid grid-cols-12 gap-3 items-center">
              <input type="text" name="name" value={ing.name} onChange={e => handleIngredientChange(index, e)} placeholder="Ingredient" className="col-span-5 bg-surface-container-low rounded-2xl px-4 py-3 font-bold text-sm outline-none focus:bg-white border-2 border-transparent focus:border-primary/30 transition-all" />
              <input type="number" name="quantity" value={ing.quantity} onChange={e => handleIngredientChange(index, e)} placeholder="Qty" className="col-span-3 bg-surface-container-low rounded-2xl px-4 py-3 font-bold text-sm outline-none focus:bg-white border-2 border-transparent focus:border-primary/30 transition-all" step="0.1" min="0.1" />
              <select name="unit" value={ing.unit} onChange={e => handleIngredientChange(index, e)} className="col-span-3 bg-surface-container-low rounded-2xl px-3 py-3 font-bold text-sm outline-none appearance-none">
                {["GRAM","KILOGRAM","LITER","MILLILITER","CUP","TABLESPOON","TEASPOON","PIECE"].map(u => <option key={u} value={u}>{u}</option>)}
              </select>
              <button type="button" onClick={() => removeIngredient(index)} className="col-span-1 w-9 h-9 rounded-xl bg-error/5 text-error flex items-center justify-center hover:bg-error hover:text-white transition-all disabled:opacity-30" disabled={recipe.ingredients.length <= 1}>
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
          ))}
          {errors.ingredients && <p className="text-error text-[10px] font-black">{errors.ingredients}</p>}
        </div>

        <div className="bg-white rounded-3xl p-8 border border-outline-variant/10 shadow-sm space-y-5">
          <h3 className="font-headline font-black text-on-surface border-b border-outline-variant/10 pb-4">Step-by-Step Instructions *</h3>
          <textarea name="instructions" value={recipe.instructions} onChange={handleChange} placeholder="Describe your cooking process step by step..." rows={8}
            className={`w-full bg-surface-container-low border-2 border-transparent rounded-2xl px-6 py-4 focus:border-primary/30 focus:bg-white outline-none font-medium resize-none transition-all ${errors.instructions ? 'border-error/40' : ''}`} />
          {errors.instructions && <p className="text-error text-[10px] font-black">{errors.instructions}</p>}
        </div>

        <div className="flex gap-4 pt-2">
          <button type="submit" disabled={loading}
            className="flex-1 vitality-gradient text-white py-4 rounded-2xl font-black text-lg shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-60">
            {loading ? <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div> : <><span className="material-symbols-outlined">upload</span> Publish Recipe</>}
          </button>
        </div>
      </form>
      <style dangerouslySetInnerHTML={{ __html: `input[type=range]{-webkit-appearance:none}input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;height:20px;width:20px;border-radius:50%;background:#006e1c;cursor:pointer;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.15);margin-top:-6px}input[type=range]::-webkit-slider-runnable-track{width:100%;height:8px;background:#e1e9db;border-radius:4px}` }} />
    </div>
  );
};

const ProfileTab = () => {
  const role = localStorage.getItem("role");
  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h2 className="text-3xl font-headline font-black text-on-surface">Chef Profile</h2>
        <p className="text-on-surface-variant text-sm font-medium opacity-60 mt-1">Your public culinary identity on RecipeHub.</p>
      </div>
      <div className="bg-white rounded-3xl p-8 border border-outline-variant/10 shadow-sm space-y-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full vitality-gradient flex items-center justify-center shadow-lg">
            <span className="material-symbols-outlined text-4xl text-white">person</span>
          </div>
          <div>
            <h3 className="font-headline font-black text-on-surface text-xl">Chef Account</h3>
            <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full inline-block mt-1">{role}</span>
          </div>
        </div>
        <div className="p-5 bg-surface-container-low rounded-2xl border border-outline-variant/10">
          <p className="text-sm font-medium text-on-surface-variant opacity-60">Full profile management is coming soon. You can update your bio, social links, and specializations from this section.</p>
        </div>
      </div>
    </div>
  );
};

// ──────────────────────────────────────────────────────────────────
// Main Chef Dashboard Shell
// ──────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: "overview",  icon: "dashboard",    label: "Dashboard" },
  { id: "add",       icon: "add_circle",   label: "New Recipe" },
  { id: "recipes",   icon: "menu_book",    label: "My Recipes" },
  { id: "profile",   icon: "account_circle", label: "Profile" },
];

const ChefDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats] = useState({ total: null, views: null, likes: null });
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  useEffect(() => {
    // Redirect if not authenticated or not a chef / admin
    if (!token || (role !== "CHEF" && role !== "ADMIN")) {
      navigate("/login");
    }
  }, [token, role, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const renderTab = () => {
    switch (activeTab) {
      case "overview": return <OverviewTab stats={stats} />;
      case "add":      return <AddRecipeTab onSuccess={() => setActiveTab("recipes")} />;
      case "recipes":  return <MyRecipesTab />;
      case "profile":  return <ProfileTab />;
      default:         return <OverviewTab stats={stats} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-surface font-body text-on-surface">
      {/* ── Sidebar ── */}
      <aside className={`${sidebarOpen ? "w-72" : "w-20"} transition-all duration-500 flex flex-col bg-white border-r border-outline-variant/10 shadow-sm relative z-20`}>
        {/* Logo */}
        <div className={`h-20 flex items-center px-6 gap-3 border-b border-outline-variant/10 ${!sidebarOpen ? 'justify-center' : ''}`}>
          <div className="w-10 h-10 shrink-0 rounded-xl vitality-gradient flex items-center justify-center shadow-lg">
            <span className="material-symbols-outlined text-white">restaurant</span>
          </div>
          {sidebarOpen && <span className="font-headline font-black text-xl text-on-surface tracking-tight">RecipeHub</span>}
        </div>

        {/* Chef Badge */}
        {sidebarOpen && (
          <div className="mx-4 mt-6 p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full vitality-gradient flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-white text-xl">person</span>
            </div>
            <div className="overflow-hidden">
              <p className="font-black text-sm text-on-surface truncate">Chef Workspace</p>
              <p className="text-[10px] font-black text-primary uppercase tracking-widest">{role}</p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all text-left group ${activeTab === item.id ? 'vitality-gradient text-white shadow-lg shadow-primary/20' : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'}`}
            >
              <span className="material-symbols-outlined text-xl shrink-0">{item.icon}</span>
              {sidebarOpen && <span className="font-black text-sm">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Footer Actions */}
        <div className="px-3 py-4 border-t border-outline-variant/10 space-y-1">
          <button onClick={() => navigate("/")}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-on-surface-variant hover:bg-surface-container-low transition-all">
            <span className="material-symbols-outlined shrink-0">home</span>
            {sidebarOpen && <span className="font-black text-sm">Back to Home</span>}
          </button>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-error hover:bg-error/5 transition-all">
            <span className="material-symbols-outlined shrink-0">logout</span>
            {sidebarOpen && <span className="font-black text-sm">Sign Out</span>}
          </button>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-24 w-6 h-6 rounded-full bg-white border border-outline-variant/20 shadow-md flex items-center justify-center hover:bg-surface-container-low transition-all"
        >
          <span className={`material-symbols-outlined text-sm text-on-surface-variant transition-transform ${sidebarOpen ? '' : 'rotate-180'}`}>chevron_left</span>
        </button>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <div className="h-20 bg-white/80 backdrop-blur-xl border-b border-outline-variant/10 flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
          <h1 className="font-headline font-black text-xl text-on-surface capitalize">
            {NAV_ITEMS.find(n => n.id === activeTab)?.label ?? "Dashboard"}
          </h1>
          <div className="flex items-center gap-3">
            <button onClick={() => setActiveTab("add")}
              className="vitality-gradient text-white px-5 py-2.5 rounded-xl text-sm font-black flex items-center gap-2 shadow-lg hover:scale-[1.03] transition-all">
              <span className="material-symbols-outlined text-sm">add</span>
              New Recipe
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-8">
          {renderTab()}
        </div>
      </main>
    </div>
  );
};

export default ChefDashboard;
