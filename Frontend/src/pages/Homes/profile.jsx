import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SkeletonProfile, SkeletonCard } from "../../components/Skeleton";
import MealPlannerLanding from "../product/MealPlannerLanding.jsx";
import SavedRecipesTab from "../product/SavedRecipesTab.jsx";
import CollectionsTab from "../product/CollectionsTab.jsx";
import ShoppingListsTab from "../product/ShoppingListsTab.jsx";
import { resolveImageUrl, handleImageError } from "../../utils/imageUtils";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import apiClient from "../../utils/apiClient";
import generalProfilePic from "../../assets/general-profile-pic.png";
import { 
    IoGridOutline, 
    IoCalendarOutline, 
    IoBookmarkOutline, 
    IoFolderOutline, 
    IoChevronBackOutline, 
    IoChevronForwardOutline,
    IoPersonOutline,
    IoSettingsOutline,
    IoLogOutOutline,
    IoCloudUploadOutline,
    IoCartOutline
} from "react-icons/io5";

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [healthProfile, setHealthProfile] = useState(null);
    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const navigate = useNavigate();

    // Settings state
    const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
    const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
    const [savingPassword, setSavingPassword] = useState(false);
    const [passwordSuccess, setPasswordSuccess] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const settingsFileInputRef = useRef(null);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [activeSettingsTab, setActiveSettingsTab] = useState("account");
    const [editProfileForm, setEditProfileForm] = useState({ name: "", bio: "", dietType: "NON_VEG", skillLevel: "BEGINNER" });
    const [savingProfile, setSavingProfile] = useState(false);
    const [notifications, setNotifications] = useState({
        emailRecipes: true,
        emailNews: false,
        pushNewFollower: true,
        pushComments: true
    });

    const handlePhotoClick = () => fileInputRef.current?.click();

    const handlePhotoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("profilePhoto", file);

        setUploading(true);
        try {
            const res = await apiClient.post("/auth/profile/photo", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setProfile(prev => ({ ...prev, profilePhoto: res.data }));
            toast.success("Photo updated!");
        } catch (err) {
            toast.error("Failed to update photo");
        } finally {
            setUploading(false);
        }
    };

    useEffect(() => {
        const fetchProfileData = async () => {
            setLoading(true);
            try {
                const res = await apiClient.get("/auth/profile");
                setProfile(res.data);
                setEditProfileForm({ 
                    name: res.data.name || "", 
                    bio: res.data.bio || "",
                    dietType: res.data.dietType || "NON_VEG",
                    skillLevel: res.data.skillLevel || "BEGINNER"
                });
                
                // Fetch health profile for completion tracking
                try {
                    const healthRes = await apiClient.get("/health-profile");
                    setHealthProfile(healthRes.data.data);
                } catch (hErr) {
                    console.error("Health profile fetch failed", hErr);
                }
                
                if (res.data.isProfileCompleted) {
                    try {
                        const recRes = await apiClient.get("/recommendations?limit=4");
                        setRecommendations(recRes.data.data || []);
                    } catch (recErr) {
                        console.error("Recommendations fetch failed", recErr);
                    }
                }
            } catch (err) {
                console.error("Profile fetch failed", err);
                setError(err.response?.status === 401 ? "Unauthorized" : "Load failed");
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, []);

    const calculateCompletion = () => {
        if (!profile) return 0;
        let filledFields = 0;
        const totalFields = 10;

        // Account fields
        if (profile.name) filledFields++;
        if (profile.profilePhoto && !profile.profilePhoto.includes("general-profile-pic")) filledFields++;
        if (profile.bio) filledFields++;
        if (profile.dietType) filledFields++;
        if (profile.skillLevel) filledFields++;

        // Health fields
        if (healthProfile) {
            if (healthProfile.age) filledFields++;
            if (healthProfile.gender) filledFields++;
            if (healthProfile.weight) filledFields++;
            if (healthProfile.height) filledFields++;
            if (healthProfile.activityLevel) filledFields++;
        }

        return Math.round((filledFields / totalFields) * 100);
    };

    const getMissingItems = () => {
        if (!profile) return [];
        const missing = [];
        if (!profile.name) missing.push("Full Name");
        if (!profile.profilePhoto || profile.profilePhoto.includes("general-profile-pic")) missing.push("Profile Photo");
        if (!profile.bio) missing.push("Bio");
        if (!profile.dietType) missing.push("Diet Preference");
        if (!profile.skillLevel) missing.push("Skill Level");

        if (!healthProfile) {
            missing.push("Health Metrics (Age, Weight, etc.)");
        } else {
            if (!healthProfile.age) missing.push("Age");
            if (!healthProfile.gender) missing.push("Gender");
            if (!healthProfile.weight) missing.push("Weight");
            if (!healthProfile.height) missing.push("Height");
            if (!healthProfile.activityLevel) missing.push("Activity Level");
        }
        return missing;
    };

    const completionPercentage = calculateCompletion();
    const missingItems = getMissingItems();

    const calculateBMI = () => {
        if (!healthProfile?.height || !healthProfile?.weight) return null;
        const heightInMeters = healthProfile.height / 100;
        const bmi = healthProfile.weight / (heightInMeters * heightInMeters);
        return bmi.toFixed(1);
    };

    const getBMICategory = (bmi) => {
        if (!bmi) return null;
        if (bmi < 18.5) return { label: "Underweight", color: "text-blue-500", bg: "bg-blue-500/10" };
        if (bmi < 25) return { label: "Healthy Weight", color: "text-primary", bg: "bg-primary/10" };
        if (bmi < 30) return { label: "Overweight", color: "text-amber-500", bg: "bg-amber-500/10" };
        return { label: "Obese", color: "text-red-500", bg: "bg-red-500/10" };
    };

    const bmi = calculateBMI();
    const bmiCategory = getBMICategory(bmi);

    // Settings functions
    const getPasswordStrength = (pwd) => {
        if (!pwd) return 0;
        let strength = 0;
        if (pwd.length >= 6) strength += 25;
        if (pwd.length >= 10) strength += 15;
        if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength += 20;
        if (/[0-9]/.test(pwd)) strength += 20;
        if (/[^a-zA-Z0-9]/.test(pwd)) strength += 20;
        return Math.min(100, strength);
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        
        if (!passwords.currentPassword) {
            setPasswordError("Current password is required");
            return;
        }
        if (!passwords.newPassword) {
            setPasswordError("New password is required");
            return;
        }
        if (passwords.newPassword.length < 6) {
            setPasswordError("Password must be at least 6 characters");
            return;
        }
        if (!/^(?=.*[0-9])(?=.*[a-zA-Z]).+$/.test(passwords.newPassword)) {
            setPasswordError("Must contain at least one digit and one letter");
            return;
        }
        if (passwords.newPassword !== passwords.confirmPassword) {
            setPasswordError("Passwords do not match");
            return;
        }

        setSavingPassword(true);
        setPasswordError("");
        setPasswordSuccess("");

        try {
            await apiClient.post("/auth/change-password", {
                currentPassword: passwords.currentPassword,
                newPassword: passwords.newPassword
            });
            setPasswordSuccess("Password updated successfully!");
            setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (err) {
            setPasswordError(err.response?.data?.message || "Failed to update password");
        } finally {
            setSavingPassword(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setSavingProfile(true);
        try {
            await apiClient.put("/auth/profile", editProfileForm);
            setProfile(prev => ({ ...prev, ...editProfileForm }));
            toast.success("Profile updated successfully!");
        } catch (err) {
            toast.error("Failed to update profile details");
        } finally {
            setSavingProfile(false);
        }
    };

    const handleSettingsPhotoClick = () => settingsFileInputRef?.current?.click();

    const handleSettingsPhotoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("profilePhoto", file);

        setUploadingPhoto(true);
        try {
            const res = await apiClient.post("/auth/profile/photo", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setProfile(prev => ({ ...prev, profilePhoto: res.data }));
            toast.success("Photo updated successfully!");
        } catch (err) {
            toast.error("Failed to update photo");
        } finally {
            setUploadingPhoto(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/login");
    };

    if (error === "Unauthorized" || (error && !profile)) return (
        <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center">
            <h2 className="text-3xl font-headline font-black mb-4">Please log in to continue</h2>
            <Link to="/login" className="vitality-gradient text-white px-8 py-3 rounded-xl font-bold rounded-2xl shadow-lg">Sign In</Link>
        </div>
    );

    const TABS = [
        { id: 'overview', label: 'Overview', icon: <IoGridOutline /> },
        { id: 'planner', label: 'Meal Plans', icon: <IoCalendarOutline /> },
        { id: 'saved', label: 'Saved Recipes', icon: <IoBookmarkOutline /> },
        { id: 'shopping', label: 'Shopping Lists', icon: <IoCartOutline /> },
        { id: 'collections', label: 'Collections', icon: <IoFolderOutline /> },
        { id: 'settings', label: 'Settings', icon: <IoSettingsOutline /> }
    ];

    return (
        <div className="min-h-screen bg-[#F8F9FA] flex text-on-surface">
            
            {/* Sidebar */}
            <motion.aside 
                layout
                initial={false}
                animate={{ width: isSidebarOpen ? 280 : 88 }}
                className="bg-white border-r border-outline-variant/10 flex flex-col sticky top-0 h-screen z-50 shadow-sm transition-all overflow-y-auto"
            >
                {/* Branding / Header */}
                <div className="p-6 flex items-center justify-between">
                    {isSidebarOpen && (
                        <motion.button 
                            onClick={() => navigate("/")}
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                        >
                            <div className="w-8 h-8 rounded-lg vitality-gradient shadow-lg"></div>
                            <span className="font-headline font-black text-xl tracking-tighter text-on-surface">RecipeHub</span>
                        </motion.button>
                    )}
                    <button 
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="w-10 h-10 rounded-xl bg-surface-container-low hover:bg-surface-container-high flex items-center justify-center text-primary transition-colors"
                    >
                        {isSidebarOpen ? <IoChevronBackOutline /> : <IoChevronForwardOutline />}
                    </button>
                </div>

                {/* User Snapshot in Sidebar (when open) */}
                <AnimatePresence>
                    {isSidebarOpen && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="px-6 mb-8"
                        >
                            <div className="bg-surface-container-low p-4 rounded-3xl flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl overflow-hidden bg-white shadow-sm border border-white">
                                    <img 
                                        src={profile?.profilePhoto ? resolveImageUrl(profile.profilePhoto) : generalProfilePic} 
                                        className="w-full h-full object-cover" 
                                        alt="Avatar" 
                                    />
                                </div>
                                <div className="overflow-hidden">
                                    <p className="font-bold text-sm truncate">{profile?.name || "Member"}</p>
                                    <p className="text-[10px] font-black uppercase text-primary/60">{profile?.role}</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Navigation Links */}
                <nav className="flex-grow px-4 space-y-2 pb-4">
                    <Link
                        to="/"
                        className="w-full flex items-center gap-4 p-4 rounded-2xl text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-all mb-4 border-b border-outline-variant/10"
                    >
                        <span className="text-xl shrink-0"><IoChevronBackOutline /></span>
                        {isSidebarOpen && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-bold text-sm">Back to Home</motion.span>}
                    </Link>

                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${
                                activeTab === tab.id 
                                ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]' 
                                : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                            }`}
                        >
                            <span className="text-xl shrink-0">{tab.icon}</span>
                            {isSidebarOpen && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-bold text-sm">{tab.label}</motion.span>}
                        </button>
                    ))}
                </nav>

                {/* Bottom Actions */}
                <div className="p-4 border-t border-outline-variant/10 space-y-2 flex-shrink-0">
                    <button onClick={handleLogout} className="w-full flex items-center gap-4 p-4 rounded-2xl text-error hover:bg-error/10 transition-all">
                        <IoLogOutOutline className="text-xl shrink-0" />
                        {isSidebarOpen && <span className="font-bold text-sm">Logout</span>}
                    </button>
                </div>
            </motion.aside>

            {/* Main Content Area */}
            <main className="flex-grow overflow-x-hidden relative">
                
                {/* Dynamic Background Decoration */}
                <div className="absolute inset-0 pointer-events-none opacity-20 z-0">
                    <div className="absolute top-0 right-0 w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]"></div>
                </div>

                <div className="p-8 lg:p-12 relative z-10 max-w-7xl mx-auto">
                    
                    {/* Content Section with Transitions */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                        >
                            {activeTab === 'overview' && (
                                <div className="space-y-12">
                                    <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-2">Welcome Back,</p>
                                            <h1 className="text-4xl md:text-6xl font-headline font-black tracking-tight text-on-surface capitalize">
                                                {profile?.name || profile?.email?.split('@')[0] || "..."}
                                            </h1>
                                        </div>
                                    </header>

                                    {/* Dashboard Grid */}
                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                        
                                        {/* Profile Card - Spans 4 columns */}
                                        <div className="lg:col-span-4 bg-white p-8 rounded-[3rem] border border-white shadow-sm botanical-shadow flex flex-col items-center">
                                            <div className="w-24 h-24 rounded-[2rem] overflow-hidden mb-4 shadow-xl border-2 border-white relative">
                                                <img 
                                                    src={profile?.profilePhoto ? resolveImageUrl(profile.profilePhoto) : generalProfilePic} 
                                                    className="w-full h-full object-cover" 
                                                    alt="Profile" 
                                                />
                                            </div>
                                            <h3 className="text-xl font-headline font-black text-center">{profile?.name}</h3>
                                            <p className="text-xs text-on-surface-variant font-medium opacity-60 italic mb-6 text-center">{profile?.email}</p>
                                            
                                            <div className="w-full space-y-3 pt-6 border-t border-outline-variant/10">
                                                <div className="flex justify-between items-center bg-surface-container-low/50 p-4 rounded-2xl">
                                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Diet</span>
                                                    <span className="text-xs font-bold text-primary capitalize">
                                                        {profile?.dietType === 'NON_VEG' ? 'Non-Vegetarian' : 
                                                         profile?.dietType === 'VEG' ? 'Vegetarian' :
                                                         profile?.dietType === 'VEGAN' ? 'Vegan' :
                                                         profile?.dietType === 'NO_PREFERENCE' ? 'No Preference' :
                                                         'Not Set'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center bg-surface-container-low/50 p-4 rounded-2xl">
                                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Skill</span>
                                                    <span className="text-xs font-bold text-secondary capitalize">{profile?.skillLevel || 'Not Set'}</span>
                                                </div>
                                                
                                                {bmi && (
                                                    <div className="mt-4 p-4 rounded-[1.5rem] bg-surface-container-low/50 border border-outline-variant/10">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">BMI Score</span>
                                                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${bmiCategory.bg} ${bmiCategory.color}`}>
                                                                {bmiCategory.label}
                                                            </span>
                                                        </div>
                                                        <p className="text-3xl font-headline font-black text-on-surface">{bmi}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Profile Status & Action - Spans 8 columns */}
                                        <div className="lg:col-span-8 bg-on-surface text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col justify-center">
                                            <div className="relative z-10">
                                                <div className="flex justify-between items-end mb-6">
                                                    <div>
                                                        <h4 className="text-2xl md:text-3xl font-headline font-black">Profile Completion</h4>
                                                        <p className="text-xs font-black uppercase tracking-[0.2em] opacity-40 mt-1">
                                                            {completionPercentage === 100 ? 'Master Chef Status' : 'Culinary Seedling'}
                                                        </p>
                                                    </div>
                                                    <span className="text-4xl md:text-5xl font-headline font-black text-primary">{completionPercentage}%</span>
                                                </div>
                                                
                                                <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden mb-8">
                                                    <motion.div 
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${completionPercentage}%` }}
                                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                                        className="h-full vitality-gradient shadow-[0_0_20px_rgba(var(--primary-rgb),0.5)]"
                                                    />
                                                </div>

                                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
                                                    <div className="max-w-md">
                                                        {completionPercentage < 100 ? (
                                                            <div className="space-y-4">
                                                                <p className="text-base text-white/60 font-medium leading-relaxed">
                                                                    Complete these details to reach 100% and unlock precision tracking:
                                                                </p>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {missingItems.slice(0, 4).map((item, i) => (
                                                                        <span key={i} className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-primary border border-primary/20">
                                                                            {item}
                                                                        </span>
                                                                    ))}
                                                                    {missingItems.length > 4 && (
                                                                        <span className="bg-white/5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white/40">
                                                                            +{missingItems.length - 4} More
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <p className="text-base text-white/60 font-medium leading-relaxed">
                                                                Your profile is fully optimized. We're using your metabolic data to provide the best recipe matches.
                                                            </p>
                                                        )}
                                                    </div>
                                                    
                                                    {completionPercentage < 100 ? (
                                                        <button 
                                                            onClick={() => navigate('/profile/complete')}
                                                            className="bg-white text-on-surface px-10 py-4 rounded-2xl font-black text-sm hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/40 whitespace-nowrap self-center md:self-end"
                                                        >
                                                            Resume Setup
                                                        </button>
                                                    ) : (
                                                        <div className="flex items-center gap-3 bg-primary/20 px-6 py-3 rounded-2xl border border-primary/30 self-center md:self-end">
                                                            <span className="material-symbols-outlined font-black text-primary">verified</span>
                                                            <span className="text-sm font-black uppercase tracking-widest text-primary">Fully Optimized</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-[100px]"></div>
                                        </div>
                                    </div>

                                    {/* Recommendations Section */}
                                    {recommendations.length > 0 && (
                                        <div className="space-y-8 pt-4">
                                            <div className="flex items-center justify-between">
                                                <h2 className="text-3xl font-headline font-black flex items-center gap-3">
                                                    Recommended For You
                                                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                                                </h2>
                                                <button onClick={() => navigate('/recipes?tab=recommended')} className="text-xs font-black uppercase tracking-widest text-primary hover:underline">View All</button>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                                {recommendations.map(recipe => (
                                                    <motion.div 
                                                        key={recipe.id}
                                                        whileHover={{ y: -8 }}
                                                        onClick={() => navigate(`/items/${recipe.id}`)}
                                                        className="group bg-white rounded-[2.5rem] overflow-hidden border border-white shadow-sm hover:shadow-xl transition-all cursor-pointer"
                                                    >
                                                        <div className="h-48 overflow-hidden relative">
                                                            <img 
                                                                src={resolveImageUrl(recipe.coverImageUrl)} 
                                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                                alt={recipe.title}
                                                            />
                                                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest">
                                                                {recipe.difficulty}
                                                            </div>
                                                        </div>
                                                        <div className="p-6">
                                                            <h4 className="font-bold text-lg mb-2 line-clamp-1">{recipe.title}</h4>
                                                            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-60">
                                                                <span>{recipe.prepTime} Min</span>
                                                                <span className="w-1 h-1 bg-current rounded-full"></span>
                                                                <span>{recipe.cuisineType}</span>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}


                            {activeTab === 'planner' && (
                                <div className="space-y-6">
                                    <h2 className="text-2xl font-headline font-black mb-8 px-4">Your Weekly Plans</h2>
                                    <div className="bg-white rounded-[4rem] p-4 shadow-sm border border-white overflow-hidden botanical-shadow">
                                        <MealPlannerLanding isTab={true} />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'saved' && (
                                <div className="px-4">
                                    <SavedRecipesTab />
                                </div>
                            )}

                            {activeTab === 'collections' && (
                                <div className="px-4">
                                    <CollectionsTab />
                                </div>
                            )}

                            {activeTab === 'settings' && (
                                <div className="max-w-4xl mx-auto space-y-6">
                                    {/* Settings Tabs */}
                                    <div className="flex gap-2 overflow-x-auto pb-2">
                                        {[
                                            { id: "account", label: "Account", icon: "person" },
                                            { id: "health", label: "Health & Lifestyle", icon: "monitor_heart" },
                                            { id: "notifications", label: "Notifications", icon: "notifications" },
                                            { id: "privacy", label: "Privacy", icon: "security" }
                                        ].map(tab => (
                                            <button
                                                key={tab.id}
                                                onClick={() => setActiveSettingsTab(tab.id)}
                                                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold whitespace-nowrap transition-all ${
                                                    activeSettingsTab === tab.id 
                                                        ? "vitality-gradient text-white shadow-lg" 
                                                        : "bg-white text-on-surface-variant hover:bg-surface-container-low"
                                                }`}
                                            >
                                                <span className="material-symbols-outlined text-sm">{tab.icon}</span>
                                                {tab.label}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Health Tab */}
                                    {activeSettingsTab === "health" && (
                                        <div className="space-y-6">
                                            <div className="bg-on-surface text-white rounded-[2rem] p-8 shadow-xl relative overflow-hidden">
                                                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                                    <div>
                                                        <h2 className="font-headline font-black text-2xl mb-2">Metabolic Profile</h2>
                                                        <p className="text-white/60 text-sm">Manage your caloric requirements and health constraints.</p>
                                                    </div>
                                                    <button 
                                                        onClick={() => navigate('/profile/complete')}
                                                        className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:scale-105 transition-all shadow-lg flex items-center gap-2"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">edit_note</span>
                                                        Re-run Setup Wizard
                                                    </button>
                                                </div>
                                                <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl"></div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <div className="bg-white rounded-[2rem] p-6 shadow-lg border border-surface-container-low">
                                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                                                        <span className="material-symbols-outlined">fitness_center</span>
                                                    </div>
                                                    <h3 className="font-black text-sm uppercase tracking-widest text-on-surface-variant mb-4">Physical</h3>
                                                    <div className="space-y-3">
                                                        <div className="flex justify-between">
                                                            <span className="text-sm font-medium opacity-60">Weight</span>
                                                            <span className="text-sm font-bold">{healthProfile?.weight || '--'} kg</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-sm font-medium opacity-60">Height</span>
                                                            <span className="text-sm font-bold">{healthProfile?.height || '--'} cm</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-sm font-medium opacity-60">Age</span>
                                                            <span className="text-sm font-bold">{healthProfile?.age || '--'}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="bg-white rounded-[2rem] p-6 shadow-lg border border-surface-container-low">
                                                    <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary mb-4">
                                                        <span className="material-symbols-outlined">bolt</span>
                                                    </div>
                                                    <h3 className="font-black text-sm uppercase tracking-widest text-on-surface-variant mb-4">Activity</h3>
                                                    <div className="space-y-3">
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-black text-secondary uppercase mb-1">{healthProfile?.activityLevel?.replace(/_/g, ' ') || 'NOT SET'}</span>
                                                            <span className="text-[10px] opacity-40 leading-tight">Daily energy expenditure level based on your routine.</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="bg-white rounded-[2rem] p-6 shadow-lg border border-surface-container-low">
                                                    <div className="w-10 h-10 rounded-xl bg-error/10 flex items-center justify-center text-error mb-4">
                                                        <span className="material-symbols-outlined">medical_information</span>
                                                    </div>
                                                    <h3 className="font-black text-sm uppercase tracking-widest text-on-surface-variant mb-4">Medical</h3>
                                                    <div className="space-y-4">
                                                        <div>
                                                            <span className="text-[10px] font-black opacity-40 block mb-2 uppercase">Conditions</span>
                                                            <div className="flex flex-wrap gap-1">
                                                                {healthProfile?.diseases?.length > 0 ? (
                                                                    healthProfile.diseases.map((d, i) => (
                                                                        <span key={i} className="text-[9px] bg-surface-container text-on-surface px-2 py-0.5 rounded-full font-bold">{d.diseaseName}</span>
                                                                    ))
                                                                ) : <span className="text-[10px] font-bold opacity-30 italic">None reported</span>}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <span className="text-[10px] font-black opacity-40 block mb-2 uppercase">Allergies</span>
                                                            <div className="flex flex-wrap gap-1">
                                                                {healthProfile?.allergies?.length > 0 ? (
                                                                    healthProfile.allergies.map((a, i) => (
                                                                        <span key={i} className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">{a.allergyName}</span>
                                                                    ))
                                                                ) : <span className="text-[10px] font-bold opacity-30 italic">None reported</span>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Account Tab */}
                                    {activeSettingsTab === "account" && (
                                        <div className="space-y-6">
                                            {/* Profile Photo Section */}
                                            <div className="bg-white rounded-[2rem] p-6 shadow-lg">
                                                <h2 className="font-headline font-black text-xl mb-6">Profile Photo</h2>
                                                
                                                <div className="flex items-center gap-6">
                                                    <div className="relative">
                                                        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-surface-container-low border-2 border-white shadow-lg">
                                                            <img 
                                                                src={profile?.profilePhoto ? resolveImageUrl(profile.profilePhoto) : generalProfilePic} 
                                                                className="w-full h-full object-cover" 
                                                                alt="Profile" 
                                                            />
                                                        </div>
                                                        {uploadingPhoto && (
                                                            <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-2xl">
                                                                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-grow">
                                                        <button
                                                            onClick={handleSettingsPhotoClick}
                                                            disabled={uploadingPhoto}
                                                            className="bg-surface-container-low hover:bg-surface-container-high text-on-surface px-6 py-3 rounded-2xl font-bold transition-all flex items-center gap-2 disabled:opacity-50"
                                                        >
                                                            Change Photo
                                                        </button>
                                                        <p className="text-xs text-on-surface-variant mt-2">JPG, PNG or GIF. Max 5MB.</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Personal Information Section */}
                                             <div className="bg-white rounded-[2rem] p-6 shadow-lg">
                                                 <h2 className="font-headline font-black text-xl mb-6">Personal Information</h2>
                                                 <form onSubmit={handleUpdateProfile} className="space-y-6">
                                                     <div className="space-y-2">
                                                         <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant ml-2">Display Name</label>
                                                         <input
                                                             type="text"
                                                             value={editProfileForm.name}
                                                             onChange={(e) => setEditProfileForm({ ...editProfileForm, name: e.target.value })}
                                                             className="w-full px-6 py-4 bg-surface-container-low rounded-2xl font-bold"
                                                             placeholder="Your name"
                                                         />
                                                     </div>
                                                     <div className="space-y-2">
                                                         <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant ml-2">Bio</label>
                                                         <textarea
                                                             value={editProfileForm.bio}
                                                             onChange={(e) => setEditProfileForm({ ...editProfileForm, bio: e.target.value })}
                                                             className="w-full px-6 py-4 bg-surface-container-low rounded-2xl font-bold min-h-[120px] resize-none"
                                                             placeholder="Tell us about yourself..."
                                                         />
                                                     </div>
                                                     <button
                                                         type="submit"
                                                         disabled={savingProfile}
                                                         className="vibrant-gradient text-white px-8 py-4 rounded-xl font-bold hover:scale-105 active:scale-95 transition-all w-full flex items-center justify-center gap-2"
                                                     >
                                                         {savingProfile ? (
                                                             <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                         ) : (
                                                             <>
                                                                 <span className="material-symbols-outlined text-sm">save</span>
                                                                 Save Profile Details
                                                             </>
                                                         )}
                                                     </button>
                                                 </form>
                                             </div>

                                             {/* Cooking Preferences Section */}
                                             <div className="bg-white rounded-[2rem] p-6 shadow-lg">
                                                 <h2 className="font-headline font-black text-xl mb-6">Cooking Preferences</h2>
                                                 <form onSubmit={handleUpdateProfile} className="space-y-6">
                                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                         <div className="space-y-2">
                                                             <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant ml-2">Dietary Preference</label>
                                                             <select
                                                                 value={editProfileForm.dietType}
                                                                 onChange={(e) => setEditProfileForm({ ...editProfileForm, dietType: e.target.value })}
                                                                 className="w-full px-6 py-4 bg-surface-container-low rounded-2xl font-bold appearance-none"
                                                             >
                                                                 <option value="VEG">Vegetarian</option>
                                                                 <option value="NON_VEG">Non-Vegetarian</option>
                                                                 <option value="VEGAN">Vegan</option>
                                                                 <option value="NO_PREFERENCE">No Preference</option>
                                                             </select>
                                                         </div>
                                                         <div className="space-y-2">
                                                             <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant ml-2">Skill Level</label>
                                                             <select
                                                                 value={editProfileForm.skillLevel}
                                                                 onChange={(e) => setEditProfileForm({ ...editProfileForm, skillLevel: e.target.value })}
                                                                 className="w-full px-6 py-4 bg-surface-container-low rounded-2xl font-bold appearance-none"
                                                             >
                                                                 <option value="BEGINNER">Beginner</option>
                                                                 <option value="INTERMEDIATE">Intermediate</option>
                                                                 <option value="EXPERT">Expert</option>
                                                             </select>
                                                         </div>
                                                     </div>
                                                     <button
                                                         type="submit"
                                                         disabled={savingProfile}
                                                         className="bg-surface-container-low hover:bg-surface-container-high text-on-surface px-8 py-4 rounded-xl font-bold transition-all w-full flex items-center justify-center gap-2"
                                                     >
                                                         {savingProfile ? (
                                                             <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                                         ) : (
                                                             <>
                                                                 <span className="material-symbols-outlined text-sm">update</span>
                                                                 Update Preferences
                                                             </>
                                                         )}
                                                     </button>
                                                 </form>
                                             </div>

                                            <div className="bg-white rounded-[2rem] p-6 shadow-lg">
                                                <h2 className="font-headline font-black text-xl mb-6">Change Password</h2>
                                                {passwordSuccess && (
                                                    <div className="mb-6 p-4 bg-primary/10 border border-primary/20 text-primary rounded-2xl flex items-center gap-2">
                                                        <span className="material-symbols-outlined">check_circle</span>
                                                        {passwordSuccess}
                                                    </div>
                                                )}
                                                
                                                {passwordError && (
                                                    <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-2xl">
                                                        <span className="material-symbols-outlined text-sm mr-2">error</span>
                                                        {passwordError}
                                                    </div>
                                                )}

                                                <form onSubmit={handlePasswordChange} className="space-y-5">
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant ml-2">Current Password</label>
                                                        <div className="relative">
                                                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">lock</span>
                                                            <input
                                                                type={showPasswords.current ? "text" : "password"}
                                                                value={passwords.currentPassword}
                                                                onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                                                                className="w-full pl-12 pr-12 py-4 bg-surface-container-low rounded-2xl font-bold"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant"
                                                            >
                                                                <span className="material-symbols-outlined">{showPasswords.current ? "visibility_off" : "visibility"}</span>
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant ml-2">New Password</label>
                                                        <div className="relative">
                                                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">lock</span>
                                                            <input
                                                                type={showPasswords.new ? "text" : "password"}
                                                                value={passwords.newPassword}
                                                                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                                                                className="w-full pl-12 pr-12 py-4 bg-surface-container-low rounded-2xl font-bold"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant"
                                                            >
                                                                <span className="material-symbols-outlined">{showPasswords.new ? "visibility_off" : "visibility"}</span>
                                                            </button>
                                                        </div>
                                                        {passwords.newPassword && (
                                                            <div className="h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                                                                <div
                                                                    className={`h-full transition-all ${
                                                                        getPasswordStrength(passwords.newPassword) < 40 ? "bg-error" :
                                                                        getPasswordStrength(passwords.newPassword) < 70 ? "bg-yellow-500" : "bg-primary"
                                                                    }`}
                                                                    style={{ width: `${getPasswordStrength(passwords.newPassword)}%` }}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="space-y-2">
                                                        <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant ml-2">Confirm New Password</label>
                                                        <div className="relative">
                                                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">enhanced_encryption</span>
                                                            <input
                                                                type={showPasswords.confirm ? "text" : "password"}
                                                                value={passwords.confirmPassword}
                                                                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                                                className="w-full pl-12 pr-12 py-4 bg-surface-container-low rounded-2xl font-bold"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant"
                                                            >
                                                                <span className="material-symbols-outlined">{showPasswords.confirm ? "visibility_off" : "visibility"}</span>
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <button
                                                        type="submit"
                                                        disabled={savingPassword}
                                                        className="w-full vitality-gradient text-white py-4 rounded-2xl font-bold shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                                    >
                                                        {savingPassword ? (
                                                            <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                        ) : "Update Password"}
                                                    </button>
                                                </form>
                                            </div>
                                        </div>
                                    )}

                                    {/* Notifications Tab */}
                                    {activeSettingsTab === "notifications" && (
                                        <div className="bg-white rounded-[2rem] p-6 shadow-lg space-y-4">
                                            <h2 className="font-headline font-black text-xl mb-6">Notification Settings</h2>
                                            
                                            {[
                                                { key: "emailRecipes", label: "Daily Recipe Recommendations", desc: "Get personalized recipes in your inbox" },
                                                { key: "emailNews", label: "News & Updates", desc: "Latest features and community news" },
                                                { key: "pushNewFollower", label: "New Followers", desc: "When someone follows you" },
                                                { key: "pushComments", label: "Comments & Mentions", desc: "When someone comments on your recipes" }
                                            ].map(item => (
                                                <div key={item.key} className="flex items-center justify-between p-4 bg-surface-container-low rounded-2xl">
                                                    <div>
                                                        <p className="font-bold text-on-surface">{item.label}</p>
                                                        <p className="text-xs text-on-surface-variant">{item.desc}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key] })}
                                                        className={`w-14 h-8 rounded-full transition-all ${
                                                            notifications[item.key] ? "bg-primary" : "bg-surface-container-high"
                                                        }`}
                                                    >
                                                        <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                                                            notifications[item.key] ? "translate-x-7" : "translate-x-1"
                                                        }`} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Privacy Tab */}
                                    {activeSettingsTab === "privacy" && (
                                        <div className="bg-white rounded-[2rem] p-6 shadow-lg space-y-4">
                                            <h2 className="font-headline font-black text-xl mb-6">Privacy Controls</h2>
                                            
                                            <div className="p-4 bg-surface-container-low rounded-2xl space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-bold">Profile Visibility</span>
                                                    <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-black">Public</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="font-bold">Show Email</span>
                                                    <button className="w-12 h-6 bg-surface-container-high rounded-full relative">
                                                        <div className="w-4 h-4 bg-primary rounded-full absolute left-1 top-1"></div>
                                                    </button>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="font-bold">Show Recipes</span>
                                                    <button className="w-12 h-6 bg-primary rounded-full relative">
                                                        <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>

            <input type="file" ref={fileInputRef} onChange={handlePhotoChange} className="hidden" accept="image/*" />
            <input type="file" ref={settingsFileInputRef} onChange={handleSettingsPhotoChange} className="hidden" accept="image/*" />
        </div>
    );
};

export default Profile;
