import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import CreateRecipeForm from "./CreateRecipeForm";
import MyRecipesTab from "./MyRecipesTab";
import { resolveImageUrl } from "../utils/imageUtils";
import { toast } from "react-hot-toast";

// ──────────────────────────────────────────────────────────────────
// Inline tab components
// ──────────────────────────────────────────────────────────────────

const OverviewTab = ({ stats, setActiveTab }) => (
  <div className="space-y-10">
    <div>
      <h2 className="text-3xl font-headline font-black text-on-surface tracking-tight mb-2">Good day, Chef 👨‍🍳</h2>
      <p className="text-on-surface-variant font-medium opacity-60">Here's a snapshot of your culinary workspace.</p>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      {[
        { icon: "menu_book", label: "Published Recipes", value: stats.total ?? "—", color: "bg-primary/10 text-primary" },
        { icon: "bookmark", label: "Total Saves", value: stats.saves ?? "—", color: "bg-secondary-container/40 text-secondary" },
        { icon: "visibility", label: "Total Views", value: stats.views ?? "—", color: "bg-tertiary-container/40 text-tertiary" },
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
          { icon: "settings", label: "Settings & Profile", action: "profile" },
        ].map((a) => (
          <button key={a.label} onClick={() => setActiveTab(a.action)}
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

const ProfileTab = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios.get("http://localhost:8080/api/v1/auth/profile", {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setProfile(res.data);
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      toast.error("Failed to load profile");
      setLoading(false);
    });
  }, [token]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Extract completion request fields
      const request = {
        name: profile.name,
        phoneNumber: profile.phoneNumber,
        bio: profile.bio,
        instagramLink: profile.instagramLink,
        youtubeLink: profile.youtubeLink,
        websiteLink: profile.websiteLink,
        contentIntent: profile.contentIntent,
        specializations: profile.specializations || [],
        experienceLevel: profile.experienceLevel || "BEGINNER",
        dietType: profile.dietType || "VEGETARIAN",
        skillLevel: profile.skillLevel || "BEGINNER"
      };

      await axios.post("http://localhost:8080/api/v1/auth/complete-profile", request, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profilePhoto", file);

    try {
      const res = await axios.post("http://localhost:8080/api/v1/auth/profile/photo", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });
      setProfile(prev => ({ ...prev, profilePhoto: res.data }));
      toast.success("Photo updated!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload photo");
    }
  };

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 w-48 bg-surface-container-high rounded-lg" /><div className="h-64 bg-surface-container-high rounded-3xl" /></div>;

  return (
    <div className="space-y-8 max-w-4xl animate-fade-in">
      <div>
        <h2 className="text-3xl font-headline font-black text-on-surface">Settings & Profile</h2>
        <p className="text-on-surface-variant text-sm font-medium opacity-60 mt-1">Manage your professional chef identity and account preferences.</p>
      </div>

      <form onSubmit={handleUpdate} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Quick Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 border border-outline-variant/10 shadow-sm flex flex-col items-center text-center">
            <div className="relative group mb-6">
              <div className="w-32 h-32 rounded-[2rem] bg-surface-container-high border-4 border-white shadow-xl overflow-hidden">
                <img 
                  src={profile.profilePhoto ? resolveImageUrl(profile.profilePhoto) : `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.email}`} 
                  alt="Chef" 
                  className="w-full h-full object-cover"
                />
              </div>
              <button 
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl vitality-gradient text-white shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
              >
                <span className="material-symbols-outlined text-sm">photo_camera</span>
              </button>
              <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} className="hidden" accept="image/*" />
            </div>
            
            <h3 className="font-headline font-black text-on-surface text-xl">{profile.name}</h3>
            <p className="text-on-surface-variant text-xs font-bold opacity-60 mt-1 uppercase tracking-widest">{profile.role}</p>
            
            <div className="w-full mt-6 pt-6 border-t border-outline-variant/10 space-y-4">
               <div className="flex justify-between text-xs font-bold px-2">
                  <span className="text-on-surface-variant opacity-60">Status</span>
                  <span className="text-primary">Professional</span>
               </div>
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Forms */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 border border-outline-variant/10 shadow-sm space-y-6">
            <h4 className="font-headline font-black text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">person</span>
              Basic Information
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Full Name</label>
                <input 
                  type="text" 
                  value={profile.name || ""} 
                  onChange={e => setProfile({...profile, name: e.target.value})}
                  className="w-full bg-surface-container-low border-2 border-transparent focus:border-primary/20 rounded-2xl px-6 py-4 outline-none font-bold transition-all" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Phone Number</label>
                <input 
                  type="text" 
                  value={profile.phoneNumber || ""} 
                  onChange={e => setProfile({...profile, phoneNumber: e.target.value})}
                  className="w-full bg-surface-container-low border-2 border-transparent focus:border-primary/20 rounded-2xl px-6 py-4 outline-none font-bold transition-all" 
                />
              </div>
            </div>

            <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Culinay Biography</label>
               <textarea 
                  rows={4}
                  value={profile.bio || ""} 
                  onChange={e => setProfile({...profile, bio: e.target.value})}
                  className="w-full bg-surface-container-low border-2 border-transparent focus:border-primary/20 rounded-2xl px-6 py-4 outline-none font-medium transition-all resize-none" 
                  placeholder="Share your culinary journey..."
               />
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 border border-outline-variant/10 shadow-sm space-y-6">
            <h4 className="font-headline font-black text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">share</span>
              Social Presence
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Instagram Link</label>
                <input 
                  type="text" 
                  value={profile.instagramLink || ""} 
                  onChange={e => setProfile({...profile, instagramLink: e.target.value})}
                  className="w-full bg-surface-container-low border-2 border-transparent focus:border-primary/20 rounded-2xl px-6 py-3 outline-none font-bold" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">YouTube Link</label>
                <input 
                  type="text" 
                  value={profile.youtubeLink || ""} 
                  onChange={e => setProfile({...profile, youtubeLink: e.target.value})}
                  className="w-full bg-surface-container-low border-2 border-transparent focus:border-primary/20 rounded-2xl px-6 py-3 outline-none font-bold" 
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-8">
            <button 
              type="submit" 
              disabled={saving}
              className="vitality-gradient text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-[1.03] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

// ──────────────────────────────────────────────────────────────────
// Main Chef Dashboard Shell
// ──────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: "overview",  icon: "dashboard",    label: "Dashboard" },
  { id: "recipes",   icon: "menu_book",    label: "My Recipes" },
  { id: "profile",   icon: "settings",     label: "Settings & Profile" },
];

const ChefDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState({ total: null, views: null, saves: null });
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  useEffect(() => {
    // Redirect if not authenticated or not a chef / admin
    if (!token || (role !== "CHEF" && role !== "ADMIN")) {
      navigate("/login");
    } else {
        // fetch stats
        axios.get("http://localhost:8080/api/v1/recipes/my-recipes", {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => {
            const recipes = res.data.data || res.data || [];
            const totalSaves = recipes.reduce((sum, r) => sum + (r.savedCount || 0), 0);
            setStats(prev => ({ ...prev, total: recipes.length, saves: totalSaves }));
        }).catch(console.error);
    }
  }, [token, role, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const renderTab = () => {
    switch (activeTab) {
      case "overview": return <OverviewTab stats={stats} setActiveTab={setActiveTab} />;
      case "add":      return <CreateRecipeForm onSuccess={() => setActiveTab("recipes")} />;
      case "recipes":  return <MyRecipesTab />;
      case "profile":  return <ProfileTab />;
      default:         return <OverviewTab stats={stats} setActiveTab={setActiveTab} />;
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
      <main className="flex-1 overflow-auto bg-surface-container-lowest">
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
