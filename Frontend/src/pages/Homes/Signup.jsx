import React, { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import apiClient from "../../utils/apiClient";
import { extractErrorMessage } from "../../utils/errorHandler";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import MagneticWrapper from "../../components/common/MagneticWrapper";

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
    contentIntent: "RECIPE_SHARING"
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'chef') {
      setFormData(prev => ({ ...prev, role: 'CHEF' }));
    }
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name] || errors.form) {
      setErrors({ ...errors, [name]: "", form: "" });
    }
  };

  const getPasswordStrength = (pwd) => {
    let strength = 0;
    if (!pwd) return 0;
    if (pwd.length >= 6) strength += 25;
    if (pwd.length >= 10) strength += 15;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength += 20;
    if (/[0-9]/.test(pwd)) strength += 20;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength += 20;
    return Math.min(100, strength);
  };

  const getStrengthColor = (strength) => {
    if (strength < 40) return "bg-error";
    if (strength < 70) return "bg-yellow-500";
    return "bg-primary";
  };

  const getStrengthLabel = (strength) => {
    if (strength < 40) return "Weak";
    if (strength < 70) return "Medium";
    if (strength < 90) return "Strong";
    return "Very Strong";
  };

  const currentPasswordStrength = getPasswordStrength(formData.password);

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
    } else if (currentPasswordStrength < 70) {
      newErrors.password = "Password is too weak. Please include uppercase, lowercase, numbers and symbols.";
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

    const data = new FormData();
    const jsonRequest = new Blob([JSON.stringify(formData)], { type: 'application/json' });
    data.append('request', jsonRequest);

    try {
      await apiClient.post("/auth/register", data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success("Account created successfully!");
      navigate("/login");
    } catch (err) {
      const errorMsg = extractErrorMessage(err);
      setErrors({ form: errorMsg });
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const toggleSpecialization = (spec) => {
    const specs = [...formData.specializations];
    if (specs.includes(spec)) {
      setFormData({ ...formData, specializations: specs.filter(s => s !== spec) });
    } else {
      setFormData({ ...formData, specializations: [...specs, spec] });
    }
  };

  return (
    <div className="bg-surface font-body text-on-surface min-h-[calc(100vh-136px)] flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* Simplified Botanical Background Layer for Performance */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-30">
        <div className="absolute -top-[5%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/15 blur-[100px]" />
        <div className="absolute top-[50%] -right-[15%] w-[60%] h-[60%] rounded-full bg-secondary-container/15 blur-[80px]" />
      </div>
      
      <div className="relative z-10 w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden rounded-[3rem] shadow-[0_32px_64px_rgba(0,110,28,0.08)] bg-white/90 backdrop-blur-xl border border-white my-12 antialiased">
        
        {/* Back Button */}
        <Link 
          to="/" 
          className="absolute top-8 left-8 z-50 flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-black uppercase tracking-widest text-[10px] bg-white/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/50"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to Home
        </Link>

        {/* Left Column - User Experience */}
        <div className="hidden lg:block relative p-20 bg-primary/5">
          <div className="sticky top-20 flex flex-col justify-between h-full">
            <div>
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-14 h-14 rounded-2xl vitality-gradient flex items-center justify-center text-white shadow-lg mb-12"
              >
                <span className="material-symbols-outlined text-2xl">potted_plant</span>
              </motion.div>
              
              <h1 className="text-5xl font-headline font-black text-on-surface tracking-tighter leading-[1] mb-8">
                Cultivate your <br/>
                <span className="text-primary italic">Vitality Hub</span>
              </h1>
              <p className="text-lg text-on-surface-variant font-medium leading-relaxed max-w-md">
                Join our digital greenhouse where metabolic science meets culinary artistry. Transform your relationship with food tonight.
              </p>
            </div>
            
            <div className="space-y-12">
               <div className="grid grid-cols-2 gap-8">
                  {[
                    { icon: 'nutrition', title: 'Data-Driven', sub: 'Real insights' },
                    { icon: 'communities', title: 'Global Chefs', sub: 'Pro network' },
                    { icon: 'auto_awesome', title: 'Expert Planning', sub: 'Personalized' },
                    { icon: 'rocket_launch', title: 'Quick Prep', sub: 'Under 30min' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex gap-4 items-start group">
                      <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm group-hover:bg-primary group-hover:text-white transition-all duration-500">
                        <span className="material-symbols-outlined text-sm">{item.icon}</span>
                      </div>
                      <div>
                        <h4 className="font-black text-on-surface text-sm leading-none mb-1">{item.title}</h4>
                        <p className="text-[9px] font-black uppercase text-on-surface-variant opacity-60 tracking-widest">{item.sub}</p>
                      </div>
                    </div>
                  ))}
               </div>
               
               <div className="p-1.5 bg-surface-container-high rounded-2xl border border-outline-variant/10 shadow-inner flex items-center gap-4 w-fit">
                  <div className="flex -space-x-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-surface-container-low">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=user${i}`} alt="user" />
                      </div>
                    ))}
                  </div>
                  <p className="pr-4 text-[9px] font-black text-primary uppercase tracking-widest">Join 12k Members</p>
               </div>
            </div>
          </div>
        </div>

        {/* Right Column - Registration Flow */}
        <div className="p-8 md:p-16 lg:p-20">
          <div className="max-w-md mx-auto">
            <div className="mb-10 text-center lg:text-left">
              <h2 className="text-3xl font-headline font-black text-on-surface tracking-tighter mb-2">Begin Your Journey</h2>
              <p className="text-on-surface-variant font-medium text-sm">Configure your biological food profile.</p>
            </div>

            <div className="mb-10">
              <div className="inline-flex p-1 bg-surface-container-high rounded-full border border-outline-variant/10 shadow-inner items-center relative overflow-hidden">
                <div 
                  className="absolute top-1 bottom-1 bg-primary rounded-full transition-all duration-500 ease-[0.16, 1, 0.3, 1] shadow-lg shadow-primary/20"
                  style={{ 
                    left: formData.role === 'USER' ? '4px' : 'calc(50% + 2px)',
                    width: 'calc(50% - 6px)'
                  }}
                />
                <button 
                  className={`relative z-10 px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors duration-500 w-32 ${formData.role === 'USER' ? 'text-white' : 'text-on-surface-variant hover:text-primary'}`} 
                  onClick={() => setFormData({...formData, role: 'USER'})}
                >Enthusiast</button>
                <button 
                  className={`relative z-10 px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors duration-500 w-32 ${formData.role === 'CHEF' ? 'text-white' : 'text-on-surface-variant hover:text-primary'}`} 
                  onClick={() => setFormData({...formData, role: 'CHEF'})}
                >Chef</button>
              </div>
            </div>

<AnimatePresence mode="wait">
                {errors.form && (
                  <motion.div 
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.95 }}
                     className="mb-8 p-4 bg-error-container text-on-error-container rounded-2xl text-center font-black border border-error/10 text-xs"
                  >
                    {errors.form}
                  </motion.div>
                )}
              </AnimatePresence>

              <form className="space-y-8" onSubmit={handleSubmit}>
              {/* Standard Identity Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 col-span-2">
                  <label className="text-[10px] font-black text-on-surface-variant ml-2 uppercase tracking-widest">Full Name</label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">person</span>
                    <input 
                      type="text" name="name" value={formData.name} onChange={handleChange}
                      className={`w-full pl-12 pr-6 py-4 bg-surface-container-low border-2 border-transparent rounded-2xl focus:border-primary/30 focus:bg-white transition-all text-xs font-bold text-on-surface placeholder:text-outline-variant/30 ${errors.name ? 'border-error/30' : ''}`}
                      placeholder="Jane Doe" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-on-surface-variant ml-2 uppercase tracking-widest">Metabolic Email</label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">alternate_email</span>
                    <input 
                      type="email" name="email" value={formData.email} onChange={handleChange}
                      className={`w-full pl-12 pr-6 py-4 bg-surface-container-low border-2 border-transparent rounded-2xl focus:border-primary/30 focus:bg-white transition-all text-xs font-bold text-on-surface placeholder:text-outline-variant/30 ${errors.email ? 'border-error/30' : ''}`}
                      placeholder="jane@greenhouse.com" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-on-surface-variant ml-2 uppercase tracking-widest">Phone Link</label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">call</span>
                    <input 
                      type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange}
                      className={`w-full pl-12 pr-6 py-4 bg-surface-container-low border-2 border-transparent rounded-2xl focus:border-primary/30 focus:bg-white transition-all text-xs font-bold text-on-surface placeholder:text-outline-variant/30 ${errors.phoneNumber ? 'border-error/30' : ''}`}
                      placeholder="+91 00000 00000" 
                    />
                  </div>
                </div>

                <div className="space-y-2 relative">
                  <label className="text-[10px] font-black text-on-surface-variant ml-2 uppercase tracking-widest">Security Protocol</label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">lock</span>
                    <input 
                      type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange}
                      className={`w-full pl-12 pr-12 py-4 bg-surface-container-low border-2 border-transparent rounded-2xl focus:border-primary/30 focus:bg-white transition-all text-xs font-bold text-on-surface placeholder:text-outline-variant/30 ${errors.password ? 'border-error/30' : ''}`}
                      placeholder="••••••••" 
                    />
                    <button className="absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant hover:text-primary" type="button" onClick={() => setShowPassword(!showPassword)}>
                      <span className="material-symbols-outlined">{showPassword ? "visibility_off" : "visibility"}</span>
                    </button>
                  </div>
                  {formData.password && (
                    <div className="space-y-2 mt-2 px-2">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                        <span className="text-on-surface-variant">Security Level:</span>
                        <span className={currentPasswordStrength < 40 ? "text-error" : currentPasswordStrength < 70 ? "text-yellow-500" : "text-primary"}>
                          {getStrengthLabel(currentPasswordStrength)}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${getStrengthColor(currentPasswordStrength)} transition-all duration-300`}
                          style={{ width: `${currentPasswordStrength}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-on-surface-variant ml-2 uppercase tracking-widest">Repeat Protocol</label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">enhanced_encryption</span>
                    <input 
                      type={showPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
                      className={`w-full pl-12 pr-6 py-4 bg-surface-container-low border-2 border-transparent rounded-2xl focus:border-primary/30 focus:bg-white transition-all text-xs font-bold text-on-surface placeholder:text-outline-variant/30 ${errors.confirmPassword ? 'border-error/30' : ''}`}
                      placeholder="••••••••" 
                    />
                  </div>
                </div>
              </div>

              {/* Advanced Controls - Roles based */}
              <AnimatePresence>
                {formData.role === 'CHEF' && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="pt-8 mt-4 border-t border-outline-variant/10 space-y-8 animate-slide-up">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-on-surface-variant ml-2 uppercase tracking-widest">Curated Specializations</label>
                        <div className="flex flex-wrap gap-2">
                          {['Italian', 'Asian', 'Keto', 'Plant-Based', 'Modernism', 'Desserts', 'Baking', 'Organic'].map((spec) => (
                            <button
                              key={spec} type="button"
                              onClick={() => toggleSpecialization(spec)}
                              className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${formData.specializations.includes(spec) ? 'bg-primary/10 border-primary/50 text-primary' : 'bg-surface-container-low border-transparent text-on-surface-variant'}`}
                              style={{ borderWidth: '1px' }}
                            >
                              {spec}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 col-span-2">
                          <label className="text-[10px] font-black text-on-surface-variant ml-2 uppercase tracking-widest">Biological Bio</label>
                          <textarea 
                            name="bio" value={formData.bio} onChange={handleChange}
                            className="w-full px-6 py-4 bg-surface-container-low border-2 border-transparent rounded-2xl focus:border-primary/30 focus:bg-white transition-all text-xs font-bold text-on-surface placeholder:text-outline-variant/30 resize-none h-32"
                            placeholder="Tell the community about your culinary vision..."
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-on-surface-variant ml-2 uppercase tracking-widest">Digital Presence</label>
                          <div className="space-y-3">
                            <div className="relative group">
                              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary scale-75">link</span>
                              <input 
                                type="url" name="instagramLink" value={formData.instagramLink} onChange={handleChange}
                                className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border-2 border-transparent rounded-xl focus:border-primary/30 focus:bg-white text-[10px] font-bold text-on-surface placeholder:text-outline-variant/30"
                                placeholder="Instagram Link" 
                              />
                            </div>
                            <div className="relative group">
                              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary scale-75">video_library</span>
                              <input 
                                type="url" name="youtubeLink" value={formData.youtubeLink} onChange={handleChange}
                                className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border-2 border-transparent rounded-xl focus:border-primary/30 focus:bg-white text-[10px] font-bold text-on-surface placeholder:text-outline-variant/30"
                                placeholder="YouTube Channel" 
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-on-surface-variant ml-2 uppercase tracking-widest">Content Intent</label>
                          <div className="flex flex-col gap-2">
                            {['RECIPE_SHARING', 'BRAND_BUILDING', 'HEALTH_COACHING'].map((intent) => (
                              <button
                                key={intent} type="button"
                                onClick={() => setFormData({...formData, contentIntent: intent})}
                                className={`flex items-center gap-2 px-6 py-2 rounded-xl text-[10px] font-black transition-all ${formData.contentIntent === intent ? 'bg-primary/10 text-primary border-primary/20' : 'bg-surface-container-low text-on-surface-variant'}`}
                                style={{ borderWidth: '1px' }}
                              >
                                {intent.replace('_', ' ')}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <MagneticWrapper>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full vibrant-gradient text-white font-headline font-black py-5 rounded-3xl shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex justify-center items-center gap-3 text-xl disabled:opacity-50"
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
              </MagneticWrapper>
            </form>
            
            <p className="mt-8 text-center font-bold text-on-surface-variant text-sm">
              Already have an account? 
              <Link to="/login" className="text-primary hover:underline ml-2">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
