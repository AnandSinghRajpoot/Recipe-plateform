import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link, useSearchParams } from "react-router-dom";

const Signup = () => {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    specializations: [],
    experienceLevel: "HOME_COOK",
    bio: "",
    role: "USER",
    instagramLink: "",
    youtubeLink: "",
    websiteLink: "",
    contentIntent: "RECIPE_SHARING",
    profilePhoto: ""
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'chef') {
      setFormData(prev => ({ ...prev, role: 'CHEF' }));
    }
  }, [searchParams]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name] || errors.form) {
      setErrors({ ...errors, [name]: "", form: "" });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name || formData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (formData.role === 'CHEF' && !formData.phoneNumber) {
      newErrors.phoneNumber = "Phone number is required for Chefs";
    }

    const passwordRegex = /^(?=.*[0-9])(?=.*[a-zA-Z]).+$/;
    if (!formData.password || formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    } else if (!passwordRegex.test(formData.password)) {
      newErrors.password = "Must contain at least one digit and one letter";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (formData.role === 'CHEF' && formData.specializations.length === 0) {
      newErrors.specializations = "Please select at least one specialization";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      const data = new FormData();
      
      // Prepare the registration request JSON
      const submissionData = { ...formData };
      if (formData.role === "USER") {
        const userFields = ['name', 'email', 'password', 'role'];
        Object.keys(submissionData).forEach(key => {
          if (!userFields.includes(key)) delete submissionData[key];
        });
      }

      // Add the request as a Blob with type application/json
      data.append("request", new Blob([JSON.stringify(submissionData)], { type: "application/json" }));
      
      // Add the file if it exists
      if (profileImage) {
        data.append("profilePhoto", profileImage);
      }

      await axios.post("http://localhost:8080/api/v1/auth/register", data, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      setSuccess("Account created successfully! Redirecting to login...");
      setErrors({});
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Registration failed";
      setErrors({ form: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface font-body text-on-surface min-h-[calc(100vh-136px)] flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
      
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center z-10 relative">
        
        {/* Left Column: Hero Section (Dynamic Content) - Enhanced with Crossfade */}
        <div className="hidden lg:block relative h-[700px] rounded-[3rem] overflow-hidden group shadow-2xl bg-surface-container-high">
          {/* Dual Layer Crossfade Images */}
          <div className="absolute inset-0 transition-opacity duration-1000 ease-in-out" style={{ opacity: formData.role === 'USER' ? 1 : 0, zIndex: formData.role === 'USER' ? 1 : 0 }}>
             <img 
               alt="Enthusiast botanical kitchen" 
               className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
               src="https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=1200"
             />
             <div className="absolute inset-0 bg-black/40" />
          </div>
          
          <div className="absolute inset-0 transition-opacity duration-1000 ease-in-out" style={{ opacity: formData.role === 'CHEF' ? 1 : 0, zIndex: formData.role === 'CHEF' ? 1 : 0 }}>
             <img 
               alt="Professional chef botanical kitchen" 
               className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
               src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=1200"
             />
             <div className="absolute inset-0 bg-black/60" />
          </div>

          {/* Dynamic Content Overlays with Animation Key */}
          <div className="absolute inset-x-0 bottom-0 p-16 z-10">
            <div className="overflow-hidden">
               <h2 
                 key={formData.role + "-h2"}
                 className="font-headline text-6xl font-black text-white leading-[1.1] mb-6 tracking-tighter animate-slide-up"
               >
                 {formData.role === 'CHEF' 
                   ? <>Cultivate Your <br/><span className="text-primary-fixed">Influence.</span></>
                   : <>Fuel your life with<br/><span className="text-primary-fixed">Vitality.</span></>}
               </h2>
            </div>
            <p 
              key={formData.role + "-p"}
              className="text-white/90 text-xl max-w-md font-medium leading-relaxed animate-fade-in"
            >
              {formData.role === 'CHEF'
                ? "Join our elite greenhouse of culinary creators. Share your masterpieces with a community that craves health."
                : "Join over 50,000 home chefs creating nutritionally balanced, chef-inspired meals every single day."}
            </p>
          </div>
        </div>
        
        {/* Right Column: Signup Form */}
        <div className="w-full max-w-xl mx-auto lg:ml-auto">
          
          {/* Header & Role Toggle */}
          <div className="mb-10">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl vitality-gradient flex items-center justify-center text-white shadow-lg">
                  <span className="material-symbols-outlined text-xl">restaurant</span>
                </div>
                <span className="font-headline font-black text-3xl tracking-tighter text-on-surface">RecipeHub</span>
              </div>
              <button 
                onClick={() => navigate("/")} 
                className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-all group px-3 py-1.5 hover:bg-surface-container-low rounded-full border border-outline-variant/10 shadow-sm"
              >
                <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Back to Hub</span>
              </button>
            </div>
            
            <div className="flex flex-col lg:flex-row items-center justify-start gap-6 mb-8">
              <div className="inline-flex items-center gap-3 bg-surface-container-high p-1.5 rounded-full border border-outline-variant/10 shadow-inner">
                <button 
                  onClick={() => setFormData({...formData, role: "USER"})}
                  className={`px-8 py-2.5 rounded-full text-sm font-black transition-all ${formData.role === 'USER' ? 'vibrant-gradient text-white shadow-lg' : 'text-on-surface-variant hover:text-primary'}`}
                  type="button"
                >
                  Join as Enthusiast
                </button>
                <button 
                  onClick={() => setFormData({...formData, role: "CHEF"})}
                  className={`px-8 py-2.5 rounded-full text-sm font-black transition-all ${formData.role === 'CHEF' ? 'vibrant-gradient text-white shadow-lg' : 'text-on-surface-variant hover:text-primary'}`}
                  type="button"
                >
                  Join as Chef
                </button>
              </div>
            </div>
            <h1 className="font-headline text-4xl font-black text-on-surface tracking-tight mb-2">
              {searchParams.get('role') === 'chef' ? 'Upgrade to Chef' : 'Create Account'}
            </h1>
            <p className="text-on-surface-variant font-medium">
              {searchParams.get('role') === 'chef' 
                ? 'Complete your chef profile to start sharing recipes.' 
                : 'Join the RecipeHub digital greenhouse.'}
            </p>
          </div>
          
          {/* Form Card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 lg:p-10 shadow-[0_24px_48px_rgba(0,110,28,0.06)] border border-white">
            {success && (
              <div className="mb-8 p-4 bg-primary/10 border border-primary/20 text-primary rounded-2xl text-center font-black animate-fade-in">
                {success}
              </div>
            )}
            {errors.form && (
              <div className="mb-8 p-4 bg-error-container text-on-error-container rounded-2xl text-center font-black animate-shake">
                {errors.form}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit} noValidate>
              
              {/* Chef specific section: Grid Animation Container */}
              <div className={`grid transition-all duration-700 ease-in-out ${formData.role === 'CHEF' ? 'grid-rows-[1fr] opacity-100 mb-8' : 'grid-rows-[0fr] opacity-0 mb-0'}`}>
                <div className="overflow-hidden">
                  <div className="flex items-center gap-6 p-5 bg-surface-container-low rounded-3xl border border-outline-variant/5">
                    <div className="relative shrink-0 cursor-pointer group" onClick={() => document.getElementById('profile-upload').click()}>
                      <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-lg relative bg-surface-container-high">
                        {imagePreview ? (
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <img 
                            alt="Chef portrait preview" 
                            className="w-full h-full object-cover opacity-50 grayscale group-hover:grayscale-0 transition-all" 
                            src="https://images.unsplash.com/photo-1581299894007-aaa50297cf16?auto=format&fit=crop&q=80&w=400"
                          />
                        )}
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="material-symbols-outlined text-white">upload</span>
                        </div>
                      </div>
                      <input 
                        id="profile-upload"
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                      <div className="absolute -bottom-1 -right-1 bg-primary text-white p-1.5 rounded-full shadow-lg border-2 border-white scale-75">
                        <span className="material-symbols-outlined text-xs">add_a_photo</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-black text-on-surface text-sm">Professional Profile Photo</h4>
                      <p className="text-[10px] text-on-surface-variant font-medium leading-tight mt-1">First impressions matter. Upload a clean, high-resolution portrait.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Standard Identity & Security Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-on-surface-variant ml-2 uppercase tracking-widest">Full Name *</label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">person</span>
                    <input 
                      type="text" name="name" value={formData.name} onChange={handleChange}
                      className={`w-full pl-12 pr-4 py-3.5 bg-surface-container-low border-2 border-transparent rounded-2xl focus:border-primary/30 focus:bg-white transition-all text-on-surface font-bold placeholder:text-outline-variant/30 ${errors.name ? 'border-error/40' : ''}`} 
                      placeholder="Jane Doe" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-on-surface-variant ml-2 uppercase tracking-widest">Email *</label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">alternate_email</span>
                    <input 
                      type="email" name="email" value={formData.email} onChange={handleChange}
                      className={`w-full pl-12 pr-4 py-3.5 bg-surface-container-low border-2 border-transparent rounded-2xl focus:border-primary/30 focus:bg-white transition-all text-on-surface font-bold placeholder:text-outline-variant/30 ${errors.email ? 'border-error/40' : ''}`} 
                      placeholder="jane@recipehub.io" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-on-surface-variant ml-2 uppercase tracking-widest">Phone Number {formData.role === 'CHEF' ? '*' : '(Optional)'}</label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">call</span>
                    <input 
                      type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange}
                      className={`w-full pl-12 pr-4 py-3.5 bg-surface-container-low border-2 border-transparent rounded-2xl focus:border-primary/30 focus:bg-white transition-all text-on-surface font-bold placeholder:text-outline-variant/30 ${errors.phoneNumber ? 'border-error/40' : ''}`} 
                      placeholder="+1 (555) 000-0000" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-on-surface-variant ml-2 uppercase tracking-widest">Experience Level</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary">workspace_premium</span>
                    <select 
                      name="experienceLevel" value={formData.experienceLevel} onChange={handleChange}
                      className="w-full pl-12 pr-8 py-3.5 bg-surface-container-low border-2 border-transparent rounded-2xl focus:border-primary/30 focus:bg-white transition-all text-on-surface font-bold appearance-none outline-none"
                    >
                      <option value="BEGINNER">Beginner / Learner</option>
                      <option value="HOME_COOK">Home Cook</option>
                      <option value="PROFESSIONAL_CHEF">Professional Chef</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 pointer-events-none">expand_more</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-on-surface-variant ml-2 uppercase tracking-widest">Password *</label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">lock</span>
                    <input 
                      type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange}
                      className={`w-full pl-12 pr-12 py-3.5 bg-surface-container-low border-2 border-transparent rounded-2xl focus:border-primary/30 focus:bg-white transition-all text-on-surface font-bold placeholder:text-outline-variant/30 ${errors.password ? 'border-error/40' : ''}`} 
                      placeholder="••••••••" 
                    />
                    <button className="absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant hover:text-primary" type="button" onClick={() => setShowPassword(!showPassword)}>
                      <span className="material-symbols-outlined">{showPassword ? "visibility_off" : "visibility"}</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-on-surface-variant ml-2 uppercase tracking-widest">Confirm Password *</label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">enhanced_encryption</span>
                    <input 
                      type={showPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
                      className={`w-full pl-12 pr-4 py-3.5 bg-surface-container-low border-2 border-transparent rounded-2xl focus:border-primary/30 focus:bg-white transition-all text-on-surface font-bold placeholder:text-outline-variant/30 ${errors.confirmPassword ? 'border-error/40' : ''}`} 
                      placeholder="••••••••" 
                    />
                  </div>
                </div>
              </div>

              {/* Chef Only Expansion: Dynamic Grid Section */}
              <div className={`grid transition-all duration-1000 ease-in-out ${formData.role === 'CHEF' ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden space-y-8">
                  
                  {/* Specialization Multi-select */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-end ml-2">
                      <label className="text-xs font-black text-on-surface-variant uppercase tracking-widest">Cooking Specializations *</label>
                      <span className="text-[10px] font-black text-primary uppercase">Select all that apply</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {['Indian', 'Continental', 'Vegan', 'Fitness / Diet', 'Street Food', 'Keto / Low Carb', 'Mediterranean', 'Baking'].map((spec) => (
                        <button
                          key={spec} type="button"
                          onClick={() => {
                            const newSpecs = formData.specializations.includes(spec)
                              ? formData.specializations.filter(s => s !== spec)
                              : [...formData.specializations, spec];
                            setFormData({...formData, specializations: newSpecs});
                          }}
                          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-between group/chip ${formData.specializations.includes(spec) ? 'vibrant-gradient text-white shadow-lg border-transparent' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high border-transparent'}`}
                          style={{ border: 'none' }}
                        >
                          <span className="relative z-10">{spec}</span>
                          {formData.specializations.includes(spec) && <span className="material-symbols-outlined text-sm relative z-10">check_circle</span>}
                        </button>
                      ))}
                    </div>
                    {errors.specializations && <p className="text-[10px] text-error font-black ml-2 uppercase animate-fade-in">{errors.specializations}</p>}
                  </div>

                  {/* Bio & Links Group */}
                  <div className="space-y-4">
                    <label className="text-xs font-black text-on-surface-variant ml-2 uppercase tracking-widest">Bio & Digital Presence</label>
                    <textarea 
                      name="bio" value={formData.bio} onChange={handleChange} maxLength={200}
                      className="w-full px-6 py-4 bg-surface-container-low border-2 border-transparent rounded-2xl focus:border-primary/30 focus:bg-white transition-all text-on-surface font-bold min-h-[120px] resize-none outline-none placeholder:text-outline-variant/30"
                      placeholder="Share your culinary philosophy (max 200 chars)..."
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="relative group">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary scale-75">link</span>
                        <input 
                          type="url" name="instagramLink" value={formData.instagramLink} onChange={handleChange}
                          className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border-2 border-transparent rounded-xl focus:border-primary/30 focus:bg-white text-[11px] font-bold text-on-surface placeholder:text-outline-variant/30"
                          placeholder="Instagram Link" 
                        />
                      </div>
                      <div className="relative group">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary scale-75">video_library</span>
                        <input 
                          type="url" name="youtubeLink" value={formData.youtubeLink} onChange={handleChange}
                          className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border-2 border-transparent rounded-xl focus:border-primary/30 focus:bg-white text-[11px] font-bold text-on-surface placeholder:text-outline-variant/30"
                          placeholder="YouTube Channel" 
                        />
                      </div>
                      <div className="relative group">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary scale-75">language</span>
                        <input 
                          type="url" name="websiteLink" value={formData.websiteLink} onChange={handleChange}
                          className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border-2 border-transparent rounded-xl focus:border-primary/30 focus:bg-white text-[11px] font-bold text-on-surface placeholder:text-outline-variant/30"
                          placeholder="Portfolio Website" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pb-4">
                    <label className="text-xs font-black text-on-surface-variant ml-2 uppercase tracking-widest">Content Intent</label>
                    <div className="flex flex-wrap gap-4">
                      {['RECIPE_SHARING', 'BRAND_BUILDING', 'HEALTH_COACHING'].map((intent) => (
                        <button
                          key={intent} type="button"
                          onClick={() => setFormData({...formData, contentIntent: intent})}
                          className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-[10px] font-black transition-all ${formData.contentIntent === intent ? 'bg-primary text-white shadow-md' : 'bg-surface-container-high text-on-surface-variant hover:bg-white hover:shadow-sm'}`}
                        >
                          <span className={`w-2 h-2 rounded-full ${formData.contentIntent === intent ? 'bg-white' : 'bg-primary'}`}></span>
                          {intent.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full vibrant-gradient text-white font-headline font-black py-5 rounded-2xl shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex justify-center items-center gap-3 text-xl disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Join RecipeHub</span>
                    <span className="material-symbols-outlined font-black">arrow_forward</span>
                  </>
                )}
              </button>
            </form>
            
            <p className="mt-8 text-center font-bold text-on-surface-variant">
              Already have an account? 
              <Link to="/login" className="text-primary hover:underline ml-2">Sign In</Link>
            </p>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fadeIn 0.6s ease-out forwards; }
        .animate-slide-up { animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
      `}} />
    </div>
  );
};

export default Signup;
