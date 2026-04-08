import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const [user, setUser] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
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
      const res = await axios.post("http://localhost:8080/api/v1/auth/login", user);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      setSuccess("Login successful! Redirecting...");
      setErrors({});
      setTimeout(() => {
        if (res.data.role === "CHEF" || res.data.role === "ADMIN") {
          navigate("/chef-dashboard");
        } else {
          navigate("/");
        }
      }, 1500);
    } catch (err) {
      setErrors({ form: err.response?.data?.message || err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface font-body text-on-surface min-h-[calc(100vh-136px)] flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* Botanical Background Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] rounded-full bg-primary/20 blur-[150px]"></div>
        <div className="absolute top-[60%] -right-[10%] w-[50%] h-[50%] rounded-full bg-secondary-container/20 blur-[120px]"></div>
      </div>
      
      <main className="relative z-10 w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-0 overflow-hidden rounded-[4rem] shadow-[0_48px_96px_rgba(0,110,28,0.12)] bg-white/80 backdrop-blur-2xl border border-white my-12">
        
        {/* Left Visual Column */}
        <div className="hidden md:block relative overflow-hidden group">
          {/* Enthusiast Image Layer */}
          <div className="absolute inset-0 transition-opacity duration-700 ease-in-out" style={{ opacity: activeTab === 'USER' ? 1 : 0, zIndex: activeTab === 'USER' ? 1 : 0 }}>
            <img 
              alt="Enthusiast kitchen" 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
              src="https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=1200" 
            />
            <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"></div>
          </div>
          
          {/* Chef Image Layer */}
          <div className="absolute inset-0 transition-opacity duration-700 ease-in-out" style={{ opacity: activeTab === 'CHEF' ? 1 : 0, zIndex: activeTab === 'CHEF' ? 1 : 0 }}>
            <img 
              alt="Chef kitchen" 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
              src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=1200" 
            />
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]"></div>
          </div>
          
          {/* Dynamic Content Overlay */}
          <div className="absolute bottom-16 left-16 right-16 text-white space-y-6">
            <div className="w-16 h-1 bg-white/40 rounded-full"></div>
            <h1 
              key={activeTab + "-title"}
              className="font-headline font-black text-6xl tracking-tighter leading-none text-white animate-fade-in"
            >
              {activeTab === 'CHEF' ? <>Cultivate <br/>Influence.</> : <>Cultivate <br/>Vitality.</>}
            </h1>
            <p 
              key={activeTab + "-desc"}
              className="font-body text-xl opacity-90 leading-relaxed font-medium animate-fade-in"
            >
              {activeTab === 'CHEF' 
                ? "Unlock your culinary expertise. Share your recipes with thousands of food enthusiasts." 
                : "Experience the synergy of culinary art and health science in our digital greenhouse."}
            </p>
          </div>
        </div>
        
        {/* Right Form Column */}
        <div className="p-12 md:p-20 flex flex-col justify-center">
          <div className="mb-12 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl vitality-gradient flex items-center justify-center text-white shadow-lg">
                <span className="material-symbols-outlined text-xl">restaurant</span>
              </div>
              <span className="font-headline font-black text-3xl tracking-tighter text-on-surface">RecipeHub</span>
            </div>
            <button 
              onClick={() => navigate("/")} 
              className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-all group px-3 py-1.5 hover:bg-surface-container-low rounded-full border border-outline-variant/10 shadow-sm"
            >
              <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
              <span className="text-[10px] font-black uppercase tracking-widest">Back</span>
            </button>
          </div>
          
          <div className="mb-10">
            <h2 
              key={activeTab + "-header"}
              className="font-headline font-black text-4xl text-on-surface mb-3 tracking-tight animate-fade-in"
            >
              {activeTab === 'CHEF' ? 'Chef Login' : 'Welcome back'}
            </h2>
            <p className="text-on-surface-variant font-medium opacity-60">
              {activeTab === 'CHEF' 
                ? 'Access your professional kitchen dashboard.' 
                : 'Enter your credentials to continue your journey.'}
            </p>
          </div>
          
          {/* Workspace Toggle */}
          <div className="mb-10">
            <div className="inline-flex p-1.5 bg-surface-container-high rounded-full border border-outline-variant/10 shadow-inner items-center">
              <button 
                className={`px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'USER' ? 'vitality-gradient text-white shadow-xl scale-105' : 'bg-transparent text-on-surface-variant hover:text-primary'}`} 
                onClick={() => setActiveTab('USER')}
              >
                <span className="material-symbols-outlined text-sm">home</span>
                Enthusiast
              </button>
              <button 
                className={`px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'CHEF' ? 'vitality-gradient text-white shadow-xl scale-105' : 'bg-transparent text-on-surface-variant hover:text-primary'}`} 
                onClick={() => setActiveTab('CHEF')}
              >
                <span className="material-symbols-outlined text-sm">restaurant</span>
                Chef
              </button>
            </div>
            {activeTab === 'USER' && (
              <p className="mt-3 text-xs text-on-surface-variant flex items-center gap-2">
                <span>Want to share recipes as a Chef?</span>
                <Link to="/signup?role=chef" className="text-primary font-black hover:underline">Upgrade</Link>
              </p>
            )}
          </div>
          
          {success && (
            <div className="mb-8 p-5 bg-primary/10 border border-primary/20 text-primary rounded-2xl text-center font-black animate-fade-in">
              {success}
            </div>
          )}
          {errors.form && (
            <div className="mb-8 p-5 bg-error-container text-on-error-container rounded-2xl text-center font-black animate-shake border border-error/10 text-sm">
              {errors.form}
            </div>
          )}

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
                <Link className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline" to="#">Forgot?</Link>
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
            
            <button 
              className={`w-full vitality-gradient text-white py-5 px-8 rounded-3xl font-black text-xl shadow-[0_24px_48px_rgba(0,110,28,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 ${loading ? 'opacity-70' : ''}`} 
              type="submit"
              disabled={loading}
            >
              {loading ? <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div> : "Unlock Kitchen"}
              {!loading && <span className="material-symbols-outlined font-black">arrow_forward</span>}
            </button>
          </form>
          
          <div className="mt-12 text-center">
            <p className="text-on-surface-variant font-bold">New to the greenhouse? <Link className="text-primary hover:underline ml-2" to="/signup">Create account</Link></p>
          </div>
        </div>
      </main>
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
        .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
      `}} />
    </div>
  );
};

export default Login;
