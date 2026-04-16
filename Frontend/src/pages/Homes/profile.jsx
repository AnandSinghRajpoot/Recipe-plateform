import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { SkeletonProfile, SkeletonCard } from "../../components/Skeleton";
import { FadeUp } from "../../hooks/useAnimations.jsx";
import MealPlannerLanding from "../product/MealPlannerLanding.jsx";
import SavedRecipesTab from "../product/SavedRecipesTab.jsx";
import CollectionsTab from "../product/CollectionsTab.jsx";
import { resolveImageUrl, handleImageError } from "../../utils/imageUtils";
import { toast } from "react-hot-toast";
import generalProfilePic from "../../assets/general-profile-pic.png";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  const handleUpgradeToChef = () => {
    navigate('/signup?role=chef');
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("profilePhoto", file);

    setUploading(true);
    try {
      const res = await axios.post("http://localhost:8080/api/v1/auth/profile/photo", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setProfile(prev => ({ ...prev, profilePhoto: res.data }));
      toast.success("Profile photo updated!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update photo");
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    axios.get("http://localhost:8080/api/v1/auth/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) => {
      setProfile(res.data);
      // Fetch recommendations if profile loaded successfully
      if (res.data.isProfileCompleted) {
         axios.get("http://localhost:8080/api/v1/recommendations?limit=4", {
           headers: { Authorization: `Bearer ${token}` }
         }).then(recRes => setRecommendations(recRes.data.data || []))
           .catch(err => console.error("Rec API error:", err));
      }
      setLoading(false);
    })
    .catch((err) => {
      console.error(err);
      setError(err.response?.status === 401 ? "Unauthorized" : "Failed to load profile");
      setLoading(false);
      // Clear token if unauthorized
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
      }
    });
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-surface font-body text-on-surface px-6 lg:px-12 py-24">
      <div className="max-w-5xl mx-auto space-y-8">
        <SkeletonProfile />
        <div className="space-y-6">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    </div>
  );

  const token = localStorage.getItem("token");
  if (!token || error === "Unauthorized") return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center space-y-8">
        <span className="material-symbols-outlined text-7xl text-error/40">lock_open</span>
        <div className="space-y-2">
            <h2 className="text-3xl font-headline font-black text-on-surface">Session Expired</h2>
            <p className="text-on-surface-variant font-medium opacity-60">Please sign in again to view your profile.</p>
        </div>
        <Link to="/login" className="vitality-gradient text-white px-10 py-4 rounded-2xl font-black text-lg shadow-xl shadow-primary/20">Sign In</Link>
    </div>
  );

  if (error || !profile) return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center space-y-8">
        <span className="material-symbols-outlined text-7xl text-error/40">error</span>
        <div className="space-y-2">
            <h2 className="text-3xl font-headline font-black text-on-surface">Oops!</h2>
            <p className="text-on-surface-variant font-medium opacity-60">Something went wrong. Please try again.</p>
        </div>
        <button onClick={() => window.location.reload()} className="vitality-gradient text-white px-10 py-4 rounded-2xl font-black text-lg shadow-xl shadow-primary/20">Retry</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface font-body text-on-surface px-6 lg:px-12 py-24 relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-[10%] left-[10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]"></div>
        <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] rounded-full bg-secondary-container/10 blur-[100px]"></div>
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        
        {/* Navigation Action */}
        <div className="flex justify-start mb-8">
            <Link 
                to="/" 
                className="group flex items-center gap-3 bg-white/60 backdrop-blur-xl px-6 py-3 rounded-2xl border border-white botanical-shadow hover:bg-white transition-all transform hover:-translate-x-1"
            >
                <div className="w-8 h-8 rounded-lg vitality-gradient flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-lg font-black">arrow_back</span>
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant group-hover:text-primary transition-colors">Back to Greenhouse</span>
            </Link>
        </div>
        
        {/* Profile Hero Header */}
        <div className="bg-white/60 backdrop-blur-2xl rounded-[3rem] p-10 md:p-12 border border-white botanical-shadow mb-8 flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-10">
            
            {/* Avatar */}
            <div className="relative group shrink-0">
                <div className="absolute inset-0 bg-primary/20 rounded-[2.5rem] blur-2xl group-hover:bg-primary/40 transition-all duration-700"></div>
                <div 
                  className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] bg-surface-container-high border-4 border-white shadow-xl relative overflow-hidden cursor-pointer group/avatar"
                  onClick={handlePhotoClick}
                >
                    <img 
                        src={profile.profilePhoto ? resolveImageUrl(profile.profilePhoto) : generalProfilePic} 
                        alt="Profile" 
                        className={`w-full h-full object-cover transition-all duration-500 ${uploading ? 'opacity-40 grayscale' : 'group-hover/avatar:scale-110'}`}
                    />
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-300">
                        <span className="material-symbols-outlined text-white text-3xl mb-1">photo_camera</span>
                        <span className="text-white text-[10px] font-black uppercase tracking-widest">Update</span>
                    </div>
                    {uploading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handlePhotoChange} 
                  className="hidden" 
                  accept="image/*"
                />
            </div>
            
            {/* Details */}
            <div className="flex-grow text-center md:text-left space-y-4 flex flex-col items-center md:items-start">
                <div className="flex flex-col md:flex-row items-center md:items-baseline gap-3 md:gap-4">
                    <h1 className="text-4xl md:text-5xl font-headline font-black text-on-surface tracking-tighter capitalize">{profile.name || profile.email.split('@')[0]}</h1>
                    <span className="px-4 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-full text-[10px] font-black uppercase tracking-widest">{profile.role || 'Member'}</span>
                </div>
                <p className="text-on-surface-variant font-medium text-lg opacity-70 flex items-center justify-center md:justify-start gap-2">
                    <span className="material-symbols-outlined text-lg">alternate_email</span>
                    {profile.email}
                </p>
                
                {/* Health Overview Tags */}
                <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-2">
                    <div className="bg-surface-container-low px-4 py-2 rounded-xl border border-outline-variant/5 text-[10px] font-black uppercase tracking-widest text-primary">
                        {profile.dietType || 'Omnivore'}
                    </div>
                    <div className="bg-surface-container-low px-4 py-2 rounded-xl border border-outline-variant/5 text-[10px] font-black uppercase tracking-widest text-secondary">
                        {profile.skillLevel || 'Beginner'}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0 w-full sm:w-auto mt-4 md:mt-0">
                <Link to="/profile/complete" className="w-full sm:w-auto bg-primary/10 hover:bg-primary/20 text-primary py-3 px-6 rounded-2xl font-bold text-center transition-colors flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-sm">edit</span>
                    Edit Profile
                </Link>
                <Link to="/settings" className="w-full sm:w-auto bg-surface-container-low hover:bg-surface-container-high text-on-surface py-3 px-6 rounded-2xl font-bold text-center transition-colors flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-sm">settings</span>
                    Settings
                </Link>
            </div>
        </div>

        {/* Ecosystem Integrity (Completion Status Bar) */}
        <div className="bg-white/40 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white botanical-shadow mb-12">
            <div className="flex justify-between items-center mb-4 text-primary">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shadow-inner">
                        <span className="material-symbols-outlined text-xl">analytics</span>
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] leading-none mb-1">Ecosystem Integrity</p>
                        <p className="text-2xl font-headline font-black tracking-tighter">Profile Completion</p>
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-3xl font-headline font-black">{profile.isProfileCompleted ? '100%' : '30%'}</span>
                </div>
            </div>
            
            <div className="w-full h-3 bg-primary/10 rounded-full overflow-hidden shadow-inner group">
                <div 
                    className="h-full vitality-gradient rounded-full transition-all duration-[1500ms] ease-out shadow-[0_0_15px_rgba(56,99,79,0.3)] relative" 
                    style={{ width: profile.isProfileCompleted ? '100%' : '30%' }}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                </div>
            </div>
            
            {!profile.isProfileCompleted ? (
                <div className="mt-6 flex flex-col sm:flex-row items-center gap-4 bg-primary/5 p-4 rounded-2xl border border-primary/10">
                    <div className="flex items-center gap-3 flex-grow">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary shadow-sm shrink-0">
                            <span className="material-symbols-outlined text-sm">lightbulb</span>
                        </div>
                        <p className="text-[11px] font-bold text-on-surface-variant opacity-80 leading-relaxed italic">
                            "Your botanical profile requires refinement. Complete the onboarding to unlock highly personalized nutrient strategies."
                        </p>
                    </div>
                    <Link to="/profile/complete" className="w-full sm:w-auto shrink-0 vitality-gradient text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                        Complete Profile
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </Link>
                </div>
            ) : (
                <div className="mt-6 flex justify-end">
                    <Link to="/profile/complete" className="bg-surface-container-high hover:bg-surface-container-highest text-on-surface px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 border border-outline-variant/10 shadow-sm">
                        <span className="material-symbols-outlined text-sm">fitness_center</span>
                        Update Profile
                    </Link>
                </div>
            )}
        </div>
        
        {/* Dashboard Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-10 border-b border-outline-variant/10 pb-4">
            {[
                { id: 'overview', label: 'Overview', icon: 'dashboard' },
                { id: 'planner', label: 'Meal Plan', icon: 'calendar_month' },
                { id: 'saved', label: 'Saved Recipes', icon: 'bookmark' },
                { id: 'collections', label: 'Collections', icon: 'folder_special' }
            ].map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-3 rounded-2xl font-bold text-sm tracking-wide transition-all flex items-center gap-2 ${
                        activeTab === tab.id 
                        ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]' 
                        : 'bg-transparent text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                    }`}
                >
                    <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                    {tab.label}
                </button>
            ))}
        </div>

        {/* Tab Sub-router Content */}
        {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 animate-fade-in-up">
                
                <div className="md:col-span-1 space-y-8">
                    <div className="bg-white/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white botanical-shadow space-y-8">
                        <h3 className="text-xl font-headline font-black text-on-surface flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary">analytics</span>
                            Metrics
                        </h3>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest opacity-50">
                                    <span>Botanical Consistency</span>
                                    <span>85%</span>
                                </div>
                                <div className="w-full h-3 bg-surface-container-high rounded-full overflow-hidden">
                                    <div className="h-full vitality-gradient w-[85%] rounded-full shadow-lg"></div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest opacity-50">
                                    <span>Meal Preparation</span>
                                    <span>62%</span>
                                </div>
                                <div className="w-full h-3 bg-surface-container-high rounded-full overflow-hidden">
                                    <div className="h-full bg-secondary-container w-[62%] rounded-full opacity-60"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <Link to="/edit-profile" className="w-full bg-on-surface text-white py-5 rounded-[2rem] font-black text-center shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group">
                        <span className="material-symbols-outlined text-lg group-hover:rotate-12 transition-transform">settings</span>
                        Update Ecosystem
                    </Link>
                </div>

                <div className="md:col-span-2 space-y-12">
                    <div className="space-y-6">
                        <h3 className="text-3xl font-headline font-black text-on-surface flex items-center gap-4">
                            <span className="w-10 h-10 rounded-xl vitality-gradient flex items-center justify-center text-white shadow-lg">
                                <span className="material-symbols-outlined text-xl">auto_awesome</span>
                            </span>
                            Curated For You
                        </h3>
                        
                        {!profile.isProfileCompleted ? (
                            <div className="text-center py-10 bg-surface-container-high rounded-3xl opacity-60">
                                <span className="material-symbols-outlined text-4xl mb-2">lock</span>
                                <p className="font-bold">Complete your profile to unlock recommendations.</p>
                            </div>
                        ) : recommendations.length === 0 ? (
                            <div className="text-center py-10 bg-surface-container-high rounded-3xl opacity-60">
                                <p className="font-bold">Calculating optimal nutrition plan...</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {recommendations.map(recipe => (
                                    <div key={recipe.id} className="bg-white p-5 rounded-[2rem] border border-outline-variant/10 shadow-sm flex flex-col group hover:-translate-y-1 transition-all cursor-pointer" onClick={() => navigate(`/items/${recipe.id}`)}>
                                        <div className="h-32 rounded-2xl bg-surface-container-low mb-4 overflow-hidden relative">
                                            {recipe.coverImageUrl ? (
                                                <img src={recipe.coverImageUrl} onError={handleImageError} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt={recipe.title} />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center"><span className="material-symbols-outlined opacity-30">restaurant</span></div>
                                            )}
                                        </div>
                                        <h4 className="font-black text-on-surface text-lg leading-tight mb-1">{recipe.title}</h4>
                                        <div className="flex flex-wrap gap-1 mb-3">
                                            {recipe.matchReasons && recipe.matchReasons.slice(0, 2).map((reason, i) => (
                                                <span key={i} className="text-[9px] font-black uppercase tracking-widest bg-primary/10 text-primary px-2 py-1 rounded-full">{reason}</span>
                                            ))}
                                        </div>
                                        <div className="mt-auto flex justify-between items-center border-t border-outline-variant/10 pt-3">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[14px]">local_fire_department</span>
                                                {recipe.calories} kcal
                                            </span>
                                            <span className="text-[10px] font-black uppercase tracking-widest bg-secondary/10 text-secondary px-2 py-1 rounded-full">Score: {Math.round(recipe.score)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-3xl font-headline font-black text-on-surface flex items-center gap-4">
                            <span className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-on-surface-variant shadow-sm border border-outline-variant/10">
                                <span className="material-symbols-outlined text-xl">checked_bag</span>
                            </span>
                            Harvested Recipes
                        </h3>

                        {profile.completedRecipes?.length === 0 ? (
                            <div className="text-center py-10 bg-white/20 rounded-[3rem] border border-white/40 border-dashed space-y-4">
                                <span className="material-symbols-outlined text-5xl text-primary/30">inventory_2</span>
                                <p className="text-on-surface-variant font-bold opacity-40 px-12">Your personal cookbook currently contains no harvested recipes. Start exploring to populate your digital garden.</p>
                                <Link to="/recipes" className="text-primary font-black uppercase tracking-[0.2em] text-[10px] hover:underline block pt-4">Explore Recipes Compendium</Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {(profile.completedRecipes || []).map((recipe, index) => (
                                    <div key={index} className="bg-white/60 p-6 rounded-[2rem] border border-white shadow-sm flex items-center gap-4 group hover:bg-white transition-all">
                                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                            <span className="material-symbols-outlined text-xl">restaurant</span>
                                        </div>
                                        <span className="font-black text-on-surface group-hover:text-primary transition-colors">{recipe}</span>
                                        <span className="material-symbols-outlined ml-auto text-primary opacity-0 group-hover:opacity-100 transition-opacity">verified</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {profile.role !== 'CHEF' && profile.role !== 'ADMIN' && (
                    <div className="bg-on-surface rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
                        <div className="relative z-10 space-y-6">
                            <h4 className="text-2xl font-headline font-black tracking-tight">Become a Professional <span className="text-primary-fixed">Chef?</span></h4>
                            <p className="text-white/60 font-medium leading-relaxed">Upgrade your account to a Chef profile to share your culinary intelligence with our global greenhouse community.</p>
                            <button 
                            onClick={handleUpgradeToChef}
                            className="bg-white text-on-surface px-8 py-3 rounded-2xl font-black text-sm hover:scale-105 active:scale-95 transition-all shadow-lg"
                            >
                            Upgrade to Chef
                            </button>
                        </div>
                    </div>
                    )}
                </div>
            </div>
        )}

        {activeTab === 'planner' && (
            <div className="animate-fade-in-up">
                <MealPlannerLanding isTab={true} />
            </div>
        )}

        {activeTab === 'saved' && (
            <SavedRecipesTab />
        )}

        {activeTab === 'collections' && (
            <CollectionsTab />
        )}

      </div>
    </div>
  );
};

export default Profile;
