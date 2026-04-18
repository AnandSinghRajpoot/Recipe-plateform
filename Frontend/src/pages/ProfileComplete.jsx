import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import apiClient from "../utils/apiClient";

const ProfileComplete = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    
    const [profile, setProfile] = useState({
        // Phase 1: Basic Health
        age: "",
        gender: "",
        height: "",
        weight: "",
        activityLevel: "MODERATELY_ACTIVE",
        
        // Phase 2: Lifestyle
        workType: "MIXED",
        travelFrequency: "RARE",
        eatingPattern: "FIXED_MEALS",
        sleepDuration: "SIX_TO_EIGHT",
        waterIntakeGlasses: 8,
        smokingHabit: "NONE",
        alcoholHabit: "NONE",

        // Phase 3: Health & Medical
        diseaseNames: [],
        allergyNames: [],

        // Phase 4: Cooking Preferences
        dietType: "OMNIVORE",
        skillLevel: "BEGINNER"
    });

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                setFetchLoading(true);
                
                // Fetch both user profile and health profile
                const [userRes, healthRes] = await Promise.allSettled([
                    apiClient.get("/auth/profile"),
                    apiClient.get("/health-profile")
                ]);

                const userData = userRes.status === 'fulfilled' ? userRes.value.data : {};
                const healthData = healthRes.status === 'fulfilled' ? healthRes.value.data?.data : {};

                setProfile(prev => ({
                    ...prev,
                    // Health profile data
                    age: healthData.age || "",
                    gender: healthData.gender || "",
                    height: healthData.height || "",
                    weight: healthData.weight || "",
                    activityLevel: healthData.activityLevel || "MODERATELY_ACTIVE",
                    workType: healthData.workType || "MIXED",
                    travelFrequency: healthData.travelFrequency || "RARE",
                    eatingPattern: healthData.eatingPattern || "FIXED_MEALS",
                    sleepDuration: healthData.sleepDuration || "SIX_TO_EIGHT",
                    waterIntakeGlasses: healthData.waterIntakeGlasses !== undefined ? healthData.waterIntakeGlasses : 8,
                    smokingHabit: healthData.smokingHabit || "NONE",
                    alcoholHabit: healthData.alcoholHabit || "NONE",
                    diseaseNames: healthData.diseases?.map(d => d.diseaseName) || [],
                    allergyNames: healthData.allergies?.map(a => a.allergyName) || [],
                    // User profile data
                    dietType: userData.dietType || "OMNIVORE",
                    skillLevel: userData.skillLevel || "BEGINNER"
                }));
                
                setIsEditMode(true);
            } catch (err) {
                console.error("Profile fetch error:", err.message);
                toast.error("Failed to load existing profile data");
            } finally {
                setFetchLoading(false);
            }
        };

        fetchProfileData();
    }, []);

    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [error, setError] = useState("");
    const [isEditMode, setIsEditMode] = useState(false);

    const handleInputChange = (e) => {
        const { name, value, type } = e.target;
        
        // BUG FIX: Prevent negative values for numeric inputs
        if (type === "number" && value !== "" && parseFloat(value) < 0) {
            setProfile({ ...profile, [name]: "0" });
            return;
        }
        
        setProfile({ ...profile, [name]: value });
    };

    const toggleMultiSelect = (field, value) => {
        setProfile(prev => {
            const list = prev[field] || [];
            const lowerValue = value.toLowerCase();
            if (list.some(item => item.toLowerCase() === lowerValue)) {
                return { ...prev, [field]: list.filter(item => item.toLowerCase() !== lowerValue) };
            } else {
                return { ...prev, [field]: [...list, value] };
            }
        });
    };

    const nextStep = () => setStep(prev => Math.min(prev + 1, 4));
    const prevStep = () => setStep(prev => Math.max(prev - 1, 1));
    
    // Unified Color Palette (Green/Primary) for all Phases
    const phaseColor = {
        1: { border: 'border-primary', bg: 'bg-primary', text: 'text-primary', gradient: 'vibrant-gradient', overlay: 'from-primary/80' },
        2: { border: 'border-primary', bg: 'bg-primary', text: 'text-primary', gradient: 'vibrant-gradient', overlay: 'from-primary/80' },
        3: { border: 'border-primary', bg: 'bg-primary', text: 'text-primary', gradient: 'vibrant-gradient', overlay: 'from-primary/80' },
        4: { border: 'border-primary', bg: 'bg-primary', text: 'text-primary', gradient: 'vibrant-gradient', overlay: 'from-primary/80' }
    };
    const currentTheme = phaseColor[step] || phaseColor[1];

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Safety Guard: Only allow submission on the final step
        if (step < 4) {
            nextStep();
            return;
        }

        setError("");
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Please login first");
            navigate("/login");
            return;
        }

        setLoading(true);
        try {
            // Extract user profile data (dietType, skillLevel) from profile
            const userProfileData = {
                dietType: profile.dietType,
                skillLevel: profile.skillLevel
            };

            // Extract health profile data (everything else)
            const healthProfileData = {
                age: profile.age,
                gender: profile.gender,
                height: profile.height,
                weight: profile.weight,
                activityLevel: profile.activityLevel,
                workType: profile.workType,
                travelFrequency: profile.travelFrequency,
                eatingPattern: profile.eatingPattern,
                sleepDuration: profile.sleepDuration,
                waterIntakeGlasses: profile.waterIntakeGlasses,
                smokingHabit: profile.smokingHabit,
                alcoholHabit: profile.alcoholHabit,
                diseaseNames: profile.diseaseNames,
                allergyNames: profile.allergyNames
            };

            // Save both profiles in parallel
            await Promise.all([
                apiClient.post("/auth/complete-profile", healthProfileData),
                apiClient.put("/auth/profile", userProfileData)
            ]);

            toast.success(isEditMode ? "Profile successfully updated!" : "Profile successfully completed!");
            navigate("/profile");
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            toast.error("Failed to save profile.");
        } finally {
            setLoading(false);
        }
    };

    if (fetchLoading) {
        return (
            <div className="bg-surface font-body text-on-surface min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-on-surface-variant font-bold">Loading your profile data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-surface font-body text-on-surface min-h-screen pb-24 selection:bg-primary/20">
            <main className="max-w-5xl mx-auto px-6 pt-12 md:pt-16">
                
                {/* Dynamic Header & Stepper */}
                <div className="mb-12 text-center">
                    <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight text-primary mb-4">
                        {isEditMode ? "Edit your profile" : (
                            step === 1 ? "Start with basics" :
                            step === 2 ? "Tell us about your day" :
                            step === 3 ? "Your health matters" :
                            "Cooking preferences"
                        )}
                    </h1>
                    <p className="text-on-surface-variant max-w-lg mx-auto text-lg">
                        {isEditMode ? "Update your health information below. Changes will be saved when you submit." : 
                         (step === 1 ? "A few simple details to help us calculate your health profile foundation." :
                          step === 2 ? "Understanding your daily rhythm helps us tailor recipes for your energy needs." :
                          step === 3 ? "Critical information to ensure every recommendation is safe and healthy for you." :
                          "Tell us about your dietary needs and cooking experience.")}
                    </p>
                </div>
                
                {/* Dynamic Stepper UI - Phase-Specific Color Track */}
                <div className="flex items-center justify-between mb-20 max-w-3xl mx-auto relative px-4">
                    {/* Background Track */}
                    <div className="absolute top-6 left-10 right-10 h-2 bg-surface-container-high rounded-full -z-0 overflow-hidden border border-outline-variant/10 shadow-inner">
                        <div 
                            className={`h-full ${currentTheme.gradient} transition-all duration-700 ease-in-out shadow-lg rounded-full`} 
                            style={{ width: `${(step - 1) * 33.33}%` }}
                        ></div>
                    </div>
                    
                    {[1, 2, 3, 4].map((num) => (
                        <div key={num} className="flex flex-col items-center gap-4 relative z-10">
                            <div className={`w-14 h-14 rounded-full flex items-center justify-center font-headline font-extrabold transition-all duration-500 border-4 ${
                                step === num 
                                ? `${phaseColor[num].gradient} text-white border-white shadow-[0_0_20px_rgba(0,0,0,0.15)] scale-110` 
                                : step > num 
                                ? `${phaseColor[num].gradient} text-white border-white scale-100` 
                                : "bg-white border-surface-container-high text-on-surface-variant scale-90"
                            }`}>
                                {step > num ? (
                                    <span className="material-symbols-outlined font-bold text-2xl">check</span>
                                ) : (
                                    <span className="text-xl">{num}</span>
                                )}
                            </div>
                            <div className="flex flex-col items-center">
                                <span className={`text-[11px] uppercase font-label font-black tracking-[0.2em] transition-all duration-300 ${
                                    step >= num ? phaseColor[num].text : "text-on-surface-variant/40"
                                }`}>
                                    {num === 1 && "Foundation"}
                                    {num === 2 && "Lifestyle"}
                                    {num === 3 && "Health"}
                                    {num === 4 && "Cooking"}
                                </span>
                                {step === num && (
                                    <div className={`w-1.5 h-1.5 rounded-full ${currentTheme.bg} mt-2 animate-bounce`}></div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                    {/* Hero Sidebar - Context Aware */}
                    <div className="hidden lg:block lg:col-span-4 sticky top-10">
                        <div className="relative rounded-[2.5rem] overflow-hidden h-[600px] glass-card border-white/40 shadow-inner">
                            <img 
                                alt="Onboarding context" 
                                className="w-full h-full object-cover transition-all duration-700 hover:scale-105" 
                                src={
                                    step === 1 ? "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=800" : 
                                    step === 2 ? "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800" : 
                                    "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=800"
                                }
                            />
                            <div className={`absolute inset-0 bg-gradient-to-t ${currentTheme.overlay} via-black/20 to-transparent transition-colors duration-700`}></div>
                            <div className="absolute bottom-10 left-10 right-10 text-white">
                                <div className={`w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-6 transition-all duration-500`}>
                                    <span className="material-symbols-outlined text-3xl">
                                        {step === 1 ? "fitness_center" : step === 2 ? "schedule" : "monitor_heart"}
                                    </span>
                                </div>
                                <h3 className="font-headline text-3xl font-bold leading-tight mb-4">
                                    {step === 1 && "Your physical profile is our foundation."}
                                    {step === 2 && "Optimize recipes for your daily rhythm."}
                                    {step === 3 && "Health first approach to food."}
                                </h3>
                                <p className="text-on-primary/80 font-medium tracking-wide flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                                    Phase {step}: {step === 1 ? "Vitality" : step === 2 ? "Energy" : "Care"}
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Wizard Container */}
                    <div className="lg:col-span-8 bg-surface-container-lowest rounded-[2.5rem] p-8 md:p-12 shadow-[0_32px_64px_rgba(25,28,27,0.06)] border border-surface-container-high transition-all duration-500 relative overflow-hidden">
                        
                        {/* Phase 1+ Back Navigation */}
                        <button 
                            onClick={step === 1 ? () => navigate(-1) : prevStep}
                            className="absolute top-6 left-6 w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:bg-surface-container-highest transition-all z-20 shadow-sm group"
                            title={step === 1 ? "Go Back" : "Previous Step"}
                        >
                            <span className="material-symbols-outlined font-bold group-hover:-translate-x-1 transition-transform">
                                arrow_back
                            </span>
                        </button>

                        {error && (
                            <div className="mb-8 p-6 bg-error-container text-on-error-container rounded-2xl flex items-center gap-4 animate-shake">
                                <span className="material-symbols-outlined">error</span>
                                <p className="font-bold">{error}</p>
                            </div>
                        )}

                        <form 
                            onSubmit={handleSubmit} 
                            onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
                            className="space-y-12 pt-8"
                        >
                            {/* PHASE 1: PHYSICAL FOUNDATION */}
                            {step === 1 && (
                                <div className="space-y-10 animate-fade-in-right text-left">
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="w-1 bg-primary h-8 rounded-full"></div>
                                        <h2 className="font-headline text-2xl font-extrabold text-on-surface">Physical Metrics</h2>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                                        <div className="space-y-2">
                                            <label className="block text-sm font-bold text-on-surface-variant ml-2">Age</label>
                                            <input name="age" value={profile.age} onChange={handleInputChange} min="1" max="120" className="w-full bg-surface-container-low border-2 border-transparent rounded-2xl px-6 py-5 focus:border-primary/40 focus:bg-white transition-all outline-none font-bold text-lg" placeholder="28" type="number"/>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-sm font-bold text-on-surface-variant ml-2">Gender</label>
                                            <div className="relative group">
                                                <select 
                                                    name="gender" 
                                                    value={profile.gender} 
                                                    onChange={handleInputChange} 
                                                    className="w-full bg-surface-container-low border-2 border-transparent rounded-2xl px-6 py-5 focus:border-primary/40 focus:bg-white transition-all outline-none font-bold text-lg appearance-none"
                                                >
                                                    <option value="" disabled>Select Gender</option>
                                                    <option value="MALE">Male</option>
                                                    <option value="FEMALE">Female</option>
                                                    <option value="OTHER">Other</option>
                                                </select>
                                                <span className="material-symbols-outlined absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant group-focus-within:text-primary transition-colors">expand_more</span>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-sm font-bold text-on-surface-variant ml-2">Height (cm)</label>
                                            <input name="height" value={profile.height} onChange={handleInputChange} min="0" className="w-full bg-surface-container-low border-2 border-transparent rounded-2xl px-6 py-5 focus:border-primary/40 focus:bg-white transition-all outline-none font-bold text-lg" placeholder="175" type="number"/>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-sm font-bold text-on-surface-variant ml-2">Weight (kg)</label>
                                            <input name="weight" value={profile.weight} onChange={handleInputChange} min="0" className="w-full bg-surface-container-low border-2 border-transparent rounded-2xl px-6 py-5 focus:border-primary/40 focus:bg-white transition-all outline-none font-bold text-lg" placeholder="72" type="number"/>
                                        </div>
                                    </div>

                                    <div className="h-px w-full bg-outline-variant/30 my-10"></div>

                                    <div className="space-y-4 pt-4">
                                        <label className="block text-sm font-bold text-on-surface-variant ml-2">Lifestyle Activity</label>
                                        <div className="grid grid-cols-1 gap-4">
                                            {[
                                                {id: 'SEDENTARY', title: 'Sedentary', desc: 'Sitting job, zero exercise', icon: 'chair'},
                                                {id: 'MODERATELY_ACTIVE', title: 'Moderate', desc: 'Walking, light exercise 3-4x/week', icon: 'directions_walk'},
                                                {id: 'VERY_ACTIVE', title: 'Very Active', desc: 'Physical labor or intense daily training', icon: 'fitness_center'}
                                            ].map(lvl => (
                                                <label key={lvl.id} className={`flex items-center p-6 rounded-[2rem] cursor-pointer transition-all duration-500 border-2 ${profile.activityLevel === lvl.id ? 'vibrant-gradient border-primary shadow-2xl scale-[1.02] -translate-y-1' : 'bg-surface-container-low border-transparent hover:border-surface-container-highest'}`}>
                                                    <input className="hidden" name="activityLevel" type="radio" value={lvl.id} checked={profile.activityLevel === lvl.id} onChange={handleInputChange}/>
                                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mr-6 transition-all duration-300 shrink-0 ${profile.activityLevel === lvl.id ? 'bg-white/20 backdrop-blur-md text-white' : 'bg-white text-primary shadow-sm'}`}>
                                                        <span className="material-symbols-outlined text-3xl font-bold">{lvl.icon}</span>
                                                    </div>
                                                    <div className="flex-1 text-left">
                                                        <p className={`font-black text-2xl leading-none transition-colors duration-300 ${profile.activityLevel === lvl.id ? 'text-white' : 'text-on-surface'}`}>{lvl.title}</p>
                                                        <p className={`text-sm font-bold mt-2 transition-colors duration-300 ${profile.activityLevel === lvl.id ? 'text-white/80' : 'text-on-surface-variant'}`}>{lvl.desc}</p>
                                                    </div>
                                                    <div className={`w-10 h-10 rounded-full border-4 shrink-0 flex items-center justify-center transition-all duration-500 ${profile.activityLevel === lvl.id ? 'border-white/30 bg-white/10' : 'border-outline-variant bg-transparent'}`}>
                                                        <div className={`w-5 h-5 rounded-full bg-white transition-all duration-500 shadow-[0_0_15px_rgba(255,255,255,0.8)] ${profile.activityLevel === lvl.id ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}></div>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* PHASE 2: BEHAVIOR & HABITS */}
                            {step === 2 && (
                                <div className="space-y-10 animate-fade-in-right text-left pt-6">
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="w-1 bg-primary h-8 rounded-full"></div>
                                        <h2 className="font-headline text-2xl font-extrabold text-on-surface">Daily Behavior</h2>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <label className="block text-sm font-bold text-on-surface-variant ml-2">Work Type</label>
                                            <select name="workType" value={profile.workType} onChange={handleInputChange} className="w-full bg-surface-container-low border-2 border-transparent rounded-2xl px-6 py-5 focus:border-primary/40 focus:bg-white transition-all outline-none font-bold">
                                                <option value="SITTING">Sitting Job</option>
                                                <option value="FIELD_WORK">Field Work</option>
                                                <option value="MIXED">Mixed</option>
                                            </select>
                                        </div>
                                        <div className="space-y-4">
                                            <label className="block text-sm font-bold text-on-surface-variant ml-2">Eating Pattern</label>
                                            <select name="eatingPattern" value={profile.eatingPattern} onChange={handleInputChange} className="w-full bg-surface-container-low border-2 border-transparent rounded-2xl px-6 py-5 focus:border-primary/40 focus:bg-white transition-all outline-none font-bold">
                                                <option value="FIXED_MEALS">Fixed Meals</option>
                                                <option value="IRREGULAR_MEALS">Irregular / On-the-go</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="h-px w-full bg-outline-variant/30 my-10"></div>

                                    <div className="space-y-6 pt-4">
                                        <label className="block text-sm font-bold text-on-surface-variant ml-2">Daily Habits</label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className={`p-6 rounded-2xl border-2 transition-all ${profile.smokingHabit !== 'NONE' ? 'border-primary bg-primary/5 shadow-inner' : 'bg-surface-container-low border-transparent'}`}>
                                                <div className="flex items-center gap-4 mb-4">
                                                    <span className="material-symbols-outlined text-primary">smoking_rooms</span>
                                                    <p className="font-extrabold text-on-surface">Smoking</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    {["NONE", "OCCASIONAL", "REGULAR"].map(h => (
                                                        <button 
                                                            key={h}
                                                            type="button"
                                                            onClick={() => setProfile({...profile, smokingHabit: h})}
                                                            className={`flex-1 py-3 text-xs font-bold rounded-xl border transition-all ${profile.smokingHabit === h ? "vibrant-gradient text-white border-primary" : "bg-white border-outline-variant text-on-surface-variant hover:border-primary"}`}
                                                        >
                                                            {h}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className={`p-6 rounded-2xl border-2 transition-all ${profile.alcoholHabit !== 'NONE' ? 'border-primary bg-primary/5 shadow-inner' : 'bg-surface-container-low border-transparent'}`}>
                                                <div className="flex items-center gap-4 mb-4">
                                                    <span className="material-symbols-outlined text-primary">wine_bar</span>
                                                    <p className="font-extrabold text-on-surface">Alcohol</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    {["NONE", "OCCASIONAL", "REGULAR"].map(h => (
                                                        <button 
                                                            key={h}
                                                            type="button"
                                                            onClick={() => setProfile({...profile, alcoholHabit: h})}
                                                            className={`flex-1 py-3 text-xs font-bold rounded-xl border transition-all ${profile.alcoholHabit === h ? "vibrant-gradient text-white border-primary" : "bg-white border-outline-variant text-on-surface-variant hover:border-primary"}`}
                                                        >
                                                            {h}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="h-px w-full bg-outline-variant/30 my-10"></div>
                                    
                                    <div className="space-y-4 pt-4">
                                        <div className="flex justify-between items-center ml-2">
                                            <label className="text-sm font-bold text-on-surface-variant">Daily Water Intake</label>
                                            <span className="bg-primary text-white px-4 py-1 rounded-full text-sm font-extrabold">{profile.waterIntakeGlasses} glasses</span>
                                        </div>
                                        <input 
                                            name="waterIntakeGlasses" 
                                            type="range" 
                                            min="0" 
                                            max="20" 
                                            step="1" 
                                            value={profile.waterIntakeGlasses} 
                                            onChange={handleInputChange}
                                            className="w-full accent-primary h-2 bg-surface-container-high rounded-full outline-none cursor-pointer"
                                        />
                                        <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold text-on-surface-variant pt-1 px-1">
                                            <span>Dehydrated</span>
                                            <span>Optimal</span>
                                            <span>Supercharged</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* PHASE 3: MEDICAL & HEALTH */}
                            {step === 3 && (
                                <div className="space-y-10 animate-fade-in-right text-left pt-6">
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="w-1 bg-primary h-8 rounded-full"></div>
                                        <h2 className="font-headline text-2xl font-extrabold text-on-surface">Critical Health Data</h2>
                                    </div>

                                    <div className="space-y-8">
                                        <div>
                                            <label className="block text-sm font-bold text-on-surface-variant ml-2 mb-4">Health Conditions (Select Multiple)</label>
                                            <div className="flex flex-wrap gap-3">
                                                {["Diabetes", "Hypertension", "PCOS", "Cholesterol", "IBS", "Obesity", "Thyroid"].map(disease => {
                                                    const isSelected = profile.diseaseNames.some(d => d.toLowerCase() === disease.toLowerCase());
                                                    return (
                                                        <button 
                                                            key={disease}
                                                            onClick={() => toggleMultiSelect('diseaseNames', disease)}
                                                            className={`px-8 py-4 rounded-2xl text-sm font-extrabold transition-all border-2 ${
                                                                isSelected 
                                                                ? 'vibrant-gradient border-primary text-white shadow-lg scale-105' 
                                                                : 'bg-surface-container-low border-transparent text-on-surface-variant hover:border-primary/30'
                                                            }`} 
                                                            type="button"
                                                        >
                                                            {disease}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        
                                        <div className="h-px w-full bg-outline-variant/30 my-8"></div>
                                        
                                        <div>
                                            <label className="block text-sm font-bold text-on-surface-variant ml-2 mb-4">Food Allergies (Select Multiple)</label>
                                            <div className="flex flex-wrap gap-3">
                                                {["Peanuts", "Dairy", "Gluten", "Shellfish", "Soy", "Tree Nuts", "Eggs"].map(allergy => {
                                                    const isSelected = profile.allergyNames.some(a => a.toLowerCase() === allergy.toLowerCase());
                                                    return (
                                                        <button 
                                                            key={allergy}
                                                            onClick={() => toggleMultiSelect('allergyNames', allergy)}
                                                            className={`px-8 py-4 rounded-2xl text-sm font-extrabold transition-all border-2 ${
                                                                isSelected 
                                                                ? 'vibrant-gradient border-primary text-white shadow-lg scale-105' 
                                                                : 'bg-surface-container-low border-transparent text-on-surface-variant hover:border-primary/30'
                                                            }`} 
                                                            type="button"
                                                        >
                                                            {allergy}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="h-px w-full bg-outline-variant/30 my-10"></div>

                                    <div className="p-8 bg-surface-container-low rounded-[2rem] border-2 border-primary/10 border-dashed">
                                        <div className="flex items-start gap-5">
                                            <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center shrink-0 text-primary">
                                                <span className="material-symbols-outlined text-3xl">verified_user</span>
                                            </div>
                                            <div>
                                                <h4 className="font-headline font-bold text-on-surface mb-2">We respect your data privacy.</h4>
                                                <p className="text-sm text-on-surface-variant leading-relaxed">This information is only used to exclude ingredients that might be harmful to you and to calculate your caloric goals accurately using metabolic algorithms.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* PHASE 4: COOKING PREFERENCES */}
                            {step === 4 && (
                                <div className="space-y-10 animate-fade-in-right text-left pt-6">
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="w-1 bg-primary h-8 rounded-full"></div>
                                        <h2 className="font-headline text-2xl font-extrabold text-on-surface">Cooking Preferences</h2>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <label className="block text-sm font-bold text-on-surface-variant ml-2">Dietary Preference</label>
                                            <div className="relative group">
                                                <select 
                                                    name="dietType" 
                                                    value={profile.dietType} 
                                                    onChange={handleInputChange} 
                                                    className="w-full bg-surface-container-low border-2 border-transparent rounded-2xl px-6 py-5 focus:border-primary/40 focus:bg-white transition-all outline-none font-bold text-lg appearance-none"
                                                >
                                                    <option value="OMNIVORE">Omnivore</option>
                                                    <option value="VEGETARIAN">Vegetarian</option>
                                                    <option value="VEGAN">Vegan</option>
                                                    <option value="PESCATARIAN">Pescatarian</option>
                                                    <option value="KETO">Keto</option>
                                                    <option value="PALEO">Paleo</option>
                                                    <option value="MEDITERRANEAN">Mediterranean</option>
                                                    <option value="GLUTEN_FREE">Gluten-Free</option>
                                                </select>
                                                <span className="material-symbols-outlined absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant group-focus-within:text-primary transition-colors">expand_more</span>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="block text-sm font-bold text-on-surface-variant ml-2">Cooking Skill Level</label>
                                            <div className="relative group">
                                                <select 
                                                    name="skillLevel" 
                                                    value={profile.skillLevel} 
                                                    onChange={handleInputChange} 
                                                    className="w-full bg-surface-container-low border-2 border-transparent rounded-2xl px-6 py-5 focus:border-primary/40 focus:bg-white transition-all outline-none font-bold text-lg appearance-none"
                                                >
                                                    <option value="BEGINNER">Beginner</option>
                                                    <option value="INTERMEDIATE">Intermediate</option>
                                                    <option value="ADVANCED">Advanced</option>
                                                    <option value="EXPERT">Expert</option>
                                                </select>
                                                <span className="material-symbols-outlined absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant group-focus-within:text-primary transition-colors">expand_more</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="h-px w-full bg-outline-variant/30 my-10"></div>

                                    <div className="p-8 bg-surface-container-low rounded-[2rem] border-2 border-primary/10 border-dashed">
                                        <div className="flex items-start gap-5">
                                            <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center shrink-0 text-primary">
                                                <span className="material-symbols-outlined text-3xl">restaurant</span>
                                            </div>
                                            <div>
                                                <h4 className="font-headline font-bold text-on-surface mb-2">Personalized Recipe Experience</h4>
                                                <p className="text-sm text-on-surface-variant leading-relaxed">Your dietary preferences and cooking skill level help us recommend recipes that match your lifestyle and expertise. We'll filter content and adjust difficulty levels accordingly.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Persistent Footer Navigation - ALIGNED & RENAMED */}
                            <div className="pt-10 flex flex-row items-center gap-4">
                                {step > 1 && (
                                    <button 
                                        type="button"
                                        onClick={prevStep}
                                        className={`px-8 py-5 rounded-2xl font-bold transition-all flex items-center justify-center hover:bg-surface-container-high ${currentTheme.text}`}
                                    >
                                        <span className="material-symbols-outlined">arrow_back</span>
                                    </button>
                                )}
                                
                                <div className="flex-1 flex gap-4">
                                    {step < 4 ? (
                                        <button 
                                            key="btn-next"
                                            type="button"
                                            onClick={(e) => { e.preventDefault(); nextStep(); }}
                                            className={`flex-1 px-8 py-5 rounded-2xl font-bold text-lg shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 text-white ${currentTheme.gradient}`}
                                        >
                                            Next
                                            <span className="material-symbols-outlined">arrow_forward</span>
                                        </button>
                                    ) : (
                                        <button 
                                            key="btn-submit"
                                            disabled={loading} 
                                            className={`flex-1 px-8 py-6 rounded-2xl font-extrabold text-xl shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 text-white ${currentTheme.gradient}`} 
                                            type="submit"
                                        >
                                            {loading ? (
                                                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            ) : (
                                                <>
                                                    Submit
                                                    <span className="material-symbols-outlined font-bold">stars</span>
                                                </>
                                            )}
                                        </button>
                                    )}

                                    {step === 1 && (
                                        <button 
                                            onClick={() => navigate("/")} 
                                            className="px-10 py-5 rounded-2xl font-bold text-on-surface-variant bg-surface-container-low hover:bg-surface-container-high transition-all" 
                                            type="button"
                                        >
                                            Skip
                                        </button>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Supportive Info - Responsive Desktop Grid */}
                <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                    {[
                        { icon: 'shield', title: 'Secure Data', desc: 'Encrypted storage following global health privacy standards.', color: 'primary' },
                        { icon: 'temp_preferences_custom', title: 'AI Personalized', desc: 'Real-time metabolic calculation for caloric accuracy.', color: 'primary' },
                        { icon: 'auto_awesome', title: 'Dynamic Feed', desc: 'Your home feed updates instantly based on this data.', color: 'primary' }
                    ].map((item, i) => (
                        <div key={i} className="group glass-card p-8 rounded-[2rem] border-white/50 hover:bg-white/40 transition-all flex flex-col gap-5">
                            <div className={`w-14 h-14 rounded-2xl bg-surface-container-high flex items-center justify-center transition-transform group-hover:scale-110`}>
                                <span className={`material-symbols-outlined text-3xl font-bold text-primary`}>{item.icon}</span>
                            </div>
                            <div>
                                <h4 className="font-headline font-extrabold text-xl mb-2">{item.title}</h4>
                                <p className="text-sm text-on-surface-variant leading-relaxed font-medium">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
            
            {/* Custom Animations Inline */}
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                .animate-shake { animation: shake 0.3s cubic-bezier(.36,.07,.19,.97) both; }
                .animate-fade-in-right {
                    animation: fadeInRight 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
                }
                @keyframes fadeInRight {
                    from { opacity: 0; transform: translateX(20px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                select {
                    -webkit-appearance: none;
                    -moz-appearance: none;
                    appearance: none;
                }
            ` }} />
        </div>
    );
};

export default ProfileComplete;
