import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import apiClient from "../../utils/apiClient";
import { extractErrorMessage } from "../../utils/errorHandler";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import MagneticWrapper from "../../components/common/MagneticWrapper";

const Login = () => {
  const [user, setUser] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState("USER");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
    if (errors[e.target.name] || errors.form) {
      setErrors({ ...errors, [e.target.name]: "", form: "" });
    }
  };

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!user.email || !emailRegex.test(user.email)) {
      newErrors.email = "Please enter a valid email format";
    }
    if (!user.password) {
      newErrors.password = "Password is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      const res = await apiClient.post("/auth/login", { ...user, role: activeTab });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      toast.success("Login successful! Redirecting...");
      
      setTimeout(() => {
        if (res.data.role === "CHEF" || res.data.role === "ADMIN") {
          navigate("/chef-dashboard");
        } else {
          navigate("/");
        }
      }, 1500);
    } catch (err) {
      const errorMsg = extractErrorMessage(err);
      setErrors({ form: errorMsg });
      if (err.response?.status === 400) {
        toast.error(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface font-body text-on-surface min-h-[calc(100vh-136px)] flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* Simplified Botanical Background Layer for Performance */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-30">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/15 blur-[100px]" />
        <div className="absolute top-[60%] -right-[10%] w-[40%] h-[40%] rounded-full bg-secondary-container/15 blur-[80px]" />
      </div>
      
      <main className="relative z-10 w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-0 overflow-hidden rounded-[3rem] shadow-[0_32px_64px_rgba(0,110,28,0.08)] bg-white/90 backdrop-blur-xl border border-white my-12">
        
        {/* Back Button */}
        <Link 
          to="/" 
          className="absolute top-8 left-8 z-50 flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-black uppercase tracking-widest text-[10px] bg-white/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/50"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to Home
        </Link>

        {/* Left Visual Column */}
        <div className="hidden md:block relative overflow-hidden group">
          <AnimatePresence mode="wait">
             <motion.div 
               key={activeTab}
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               transition={{ duration: 0.5 }}
               className="absolute inset-0"
             >
                <img 
                  alt={activeTab === 'USER' ? "Enthusiast kitchen" : "Chef kitchen"} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-105" 
                  src={activeTab === 'USER' 
                    ? "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=1200"
                    : "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=1200"
                  } 
                />
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[0.5px]"></div>
             </motion.div>
          </AnimatePresence>
          
          <div className="absolute bottom-12 left-12 right-12 text-white space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              key={activeTab + "text"}
            >
              <h2 className="text-3xl font-headline font-black leading-tight tracking-tighter">
                {activeTab === 'USER' ? 'Discover Healthy Adventures.' : 'Share Your Culinary Genius.'}
              </h2>
              <p className="text-base opacity-80 font-medium">
                {activeTab === 'USER' 
                  ? 'Access thousands of balanced recipes tailored to your lifestyle.' 
                  : 'Join 500+ professionals and reach thousands of healthy eaters.'}
              </p>
            </motion.div>
          </div>
        </div>

        {/* Right Form Column */}
        <div className="p-8 md:p-14 md:py-20 flex flex-col justify-center bg-white/40">
          <div className="mb-8 text-center md:text-left">
            <div className="w-14 h-14 rounded-2xl vitality-gradient flex items-center justify-center text-white shadow-lg mb-6 mx-auto md:mx-0">
              <span className="material-symbols-outlined text-2xl">restaurant</span>
            </div>
            <h1 className="font-headline font-black text-3xl text-on-surface tracking-tighter mb-1">Welcome Back</h1>
            <p className="text-on-surface-variant font-medium text-sm">Continue your wellness journey.</p>
          </div>
          
          <div className="mb-8">
            <div className="inline-flex p-1 bg-surface-container-high rounded-full border border-outline-variant/10 shadow-inner items-center relative overflow-hidden">
              <div 
                className="absolute top-1 bottom-1 bg-primary rounded-full transition-all duration-500 ease-[0.16, 1, 0.3, 1] shadow-lg shadow-primary/20"
                style={{ 
                  left: activeTab === 'USER' ? '4px' : 'calc(50% + 2px)',
                  width: 'calc(50% - 6px)'
                }}
              />
              <button 
                className={`relative z-10 px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors duration-500 flex items-center justify-center gap-2 w-32 ${activeTab === 'USER' ? 'text-white' : 'text-on-surface-variant hover:text-primary'}`} 
                onClick={() => setActiveTab('USER')}
              >
                Enthusiast
              </button>
              <button 
                className={`relative z-10 px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors duration-500 flex items-center justify-center gap-2 w-32 ${activeTab === 'CHEF' ? 'text-white' : 'text-on-surface-variant hover:text-primary'}`} 
                onClick={() => setActiveTab('CHEF')}
              >
                Chef
              </button>
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

          <form className="space-y-8" onSubmit={handleSubmit} noValidate>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-2">Endpoint Identity</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">alternate_email</span>
                <input 
                  className={`w-full pl-14 pr-6 py-5 bg-surface-container-low border-2 border-transparent rounded-3xl focus:border-primary/30 focus:bg-white transition-all text-on-surface font-black placeholder:text-outline-variant/50 ${errors.email ? 'border-error/40 ring-error/10 ring-4' : ''}`} 
                  name="email"
                  value={user.email}
                  onChange={handleChange}
                  placeholder="Enter your email or phone" 
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center px-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Security Protocol</label>
                <Link className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline" to="/forgot-password">Forgot?</Link>
              </div>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">lock</span>
                <input 
                  className={`w-full pl-14 pr-14 py-5 bg-surface-container-low border-2 border-transparent rounded-3xl focus:border-primary/30 focus:bg-white transition-all text-on-surface font-black placeholder:text-outline-variant/50 ${errors.password ? 'border-error/40 ring-error/10 ring-4' : ''}`} 
                  name="password"
                  value={user.password}
                  onChange={handleChange}
                  placeholder="••••••••" 
                  type={showPassword ? "text" : "password"} 
                />
                <button 
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-outline-variant hover:text-primary transition-colors" 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined text-xl">{showPassword ? "visibility_off" : "visibility"}</span>
                </button>
              </div>
            </div>
            
            <MagneticWrapper>
              <button 
                className={`w-full vitality-gradient text-white py-5 px-8 rounded-3xl font-black text-xl shadow-[0_24px_48px_rgba(0,110,28,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 ${loading ? 'opacity-70' : ''}`} 
                type="submit"
                disabled={loading}
              >
                {loading ? <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div> : "Unlock Kitchen"}
                {!loading && <span className="material-symbols-outlined font-black">arrow_forward</span>}
              </button>
            </MagneticWrapper>
          </form>
          
          <div className="mt-12 text-center">
            <p className="text-on-surface-variant font-bold">New to the greenhouse? <Link className="text-primary hover:underline ml-2" to="/signup">Create account</Link></p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
