import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { SkeletonProfile, SkeletonCard } from "../../components/Skeleton";
import { FadeUp } from "../../hooks/useAnimations.jsx";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleUpgradeToChef = () => {
    navigate('/signup?role=chef');
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
        
        {/* Profile Hero Header */}
        <div className="bg-white/60 backdrop-blur-2xl rounded-[3rem] p-10 md:p-16 border border-white botanical-shadow mb-12 flex flex-col md:flex-row items-center gap-10">
            <div className="relative group">
                <div className="absolute inset-0 bg-primary/20 rounded-[2.5rem] blur-2xl group-hover:bg-primary/40 transition-all duration-700"></div>
                <div className="w-40 h-40 rounded-[2.5rem] bg-surface-container-high border-4 border-white shadow-xl relative overflow-hidden">
                    <img 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.email}`} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="absolute -bottom-3 -right-3 w-12 h-12 bg-white rounded-2xl shadow-lg flex items-center justify-center text-primary border border-outline-variant/10">
                    <span className="material-symbols-outlined text-xl font-black">edit_note</span>
                </div>
            </div>
            
            <div className="flex-grow text-center md:text-left space-y-4">
                <div className="flex flex-col md:flex-row items-center gap-4">
                    <h1 className="text-4xl md:text-6xl font-headline font-black text-on-surface tracking-tighter capitalize">{profile.email.split('@')[0]}</h1>
                    <span className="px-5 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-full text-[10px] font-black uppercase tracking-widest">{profile.role || 'Member'}</span>
                </div>
                <p className="text-on-surface-variant font-medium text-lg opacity-70 flex items-center justify-center md:justify-start gap-2">
                    <span className="material-symbols-outlined text-lg">alternate_email</span>
                    {profile.email}
                </p>
                
                {/* Quick Summary Cards */}
                <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-2">
                    <div className="bg-surface-container-low px-4 py-3 rounded-2xl border border-outline-variant/5 text-center min-w-[120px]">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Profile</p>
                        <p className="text-lg font-black text-primary">{profile.isProfileCompleted ? '100%' : '30%'}</p>
                    </div>
                    <div className="bg-surface-container-low px-4 py-3 rounded-2xl border border-outline-variant/5 text-center min-w-[120px]">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Last Updated</p>
                        <p className="text-sm font-black text-on-surface">{profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Just now'}</p>
                    </div>
                    <div className="bg-surface-container-low px-4 py-3 rounded-2xl border border-outline-variant/5 text-center min-w-[120px]">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Diet Focus</p>
                        <p className="text-sm font-black text-secondary capitalize">{profile.dietType || 'Omnivore'}</p>
                    </div>
                </div>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-4">
                    <div className="bg-surface-container-low px-6 py-4 rounded-[2rem] border border-outline-variant/5 text-center min-w-[140px]">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Growth Level</p>
                        <p className="text-xl font-black text-primary capitalize">{profile.skillLevel || 'Beginner'}</p>
                    </div>
                    <div className="bg-surface-container-low px-6 py-4 rounded-[2rem] border border-outline-variant/5 text-center min-w-[140px]">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Diet Focus</p>
                        <p className="text-xl font-black text-secondary capitalize">{profile.dietType || 'Omnivore'}</p>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3 mt-6">
                <Link to="/profile/complete" className="flex-1 min-w-[140px] bg-primary/10 hover:bg-primary/20 text-primary py-3 px-5 rounded-2xl font-bold text-center transition-colors flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-sm">edit</span>
                    Edit Profile
                </Link>
                <Link to="/settings" className="flex-1 min-w-[140px] bg-surface-container-low hover:bg-surface-container-high text-on-surface py-3 px-5 rounded-2xl font-bold text-center transition-colors flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-sm">settings</span>
                    Settings
                </Link>
            </div>
        </div>
        
        {/* Smart Reminders Section */}
        <div className="bg-gradient-to-r from-primary/5 to-secondary-container/20 rounded-[3rem] p-8 mt-12 border border-primary/10">
            <h3 className="text-xl font-headline font-black text-on-surface mb-6 flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">notifications_active</span>
                Smart Reminders
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link to="/profile/complete" className={`p-5 rounded-2xl border transition-all flex items-center gap-4 ${
                    profile.isProfileCompleted 
                        ? 'bg-surface-container-low border-outline-variant/10 opacity-50' 
                        : 'bg-white border-primary/20 hover:border-primary hover:shadow-lg'
                }`}>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        profile.isProfileCompleted ? 'bg-primary/10 text-primary' : 'vitality-gradient text-white'
                    }`}>
                        <span className="material-symbols-outlined">person</span>
                    </div>
                    <div>
                        <p className="font-black text-on-surface">
                            {profile.isProfileCompleted ? 'Profile Complete ✓' : 'Complete Your Profile'}
                        </p>
                        <p className="text-xs text-on-surface-variant">
                            {profile.isProfileCompleted ? 'All information saved' : 'Add your personal details'}
                        </p>
                    </div>
                </Link>
                
                <Link to="/profile/complete" className="p-5 rounded-2xl border bg-white border-outline-variant/10 hover:border-primary hover:shadow-lg transition-all flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-secondary-container flex items-center justify-center text-secondary">
                        <span className="material-symbols-outlined">fitness_center</span>
                    </div>
                    <div>
                        <p className="font-black text-on-surface">Update Your Lifestyle</p>
                        <p className="text-xs text-on-surface-variant">Refresh your health & diet preferences</p>
                    </div>
                </Link>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            
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
                            <span className="material-symbols-outlined text-xl">checked_bag</span>
                        </span>
                        Harvested Recipes
                    </h3>

                    {profile.completedRecipes?.length === 0 ? (
                        <div className="text-center py-20 bg-white/20 rounded-[3rem] border border-white/40 border-dashed space-y-4">
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
      </div>
    </div>
  );
};

export default Profile;
