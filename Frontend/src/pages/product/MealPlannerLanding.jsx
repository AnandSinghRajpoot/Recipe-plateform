import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../utils/apiClient";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { IoAddCircleOutline, IoLibraryOutline, IoTrashOutline, IoChevronForwardOutline } from "react-icons/io5";

const MealPlannerLanding = ({ isTab = false }) => {
    const navigate = useNavigate();
    const [view, setView] = useState("select"); // "select", "existing", "create"
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newPlan, setNewPlan] = useState({ name: "", description: "" });

    useEffect(() => {
        if (view === "existing") {
            fetchPlans();
        }
    }, [view]);

    const fetchPlans = async () => {
        setLoading(true);
        try {
            const res = await apiClient.get("/meal-planner/plans");
            setPlans(res.data.data || []);
        } catch (err) {
            toast.error("Failed to fetch plans");
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePlan = async (e) => {
        e.preventDefault();
        if (!newPlan.name) return toast.error("Plan name is required");
        
        try {
            const res = await apiClient.post("/meal-planner/plans", newPlan);
            toast.success("Plan created successfully");
            navigate(`/meal-planner/${res.data.data.id}`);
        } catch (err) {
            toast.error("Failed to create plan");
        }
    };

    const deletePlan = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm("Are you sure you want to delete this plan?")) return;
        try {
            await apiClient.delete(`/meal-planner/plans/${id}`);
            toast.success("Plan deleted");
            fetchPlans();
        } catch (err) {
            toast.error("Failed to delete plan");
        }
    };

    return (
        <div className={`${isTab ? '' : 'bg-surface min-h-screen pt-24 pb-32'} px-4 lg:px-12 relative overflow-hidden`}>
             {/* Background Ambience */}
             {!isTab && (
                <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
                    <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[150px]"></div>
                    <div className="absolute top-[40%] -right-[10%] w-[60%] h-[60%] rounded-full bg-tertiary-container/10 blur-[120px]"></div>
                </div>
             )}

            <div className={`${isTab ? 'w-full' : 'max-w-5xl mx-auto'} relative z-10`}>
                {!isTab && (
                    <header className="text-center mb-16">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest mb-6"
                        >
                            <span className="material-symbols-outlined text-xs">smart_toy</span>
                            AI-Enhanced Planning Module
                        </motion.div>
                        <motion.h1 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-5xl md:text-7xl font-headline font-black tracking-tighter text-on-surface mb-6"
                        >
                            Meal <span className="text-primary">Planner</span>
                        </motion.h1>
                        <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-on-surface-variant max-w-2xl mx-auto font-medium opacity-70"
                        >
                            Architect your nutritional future. Select a pathway below to begin your metabolic optimization.
                        </motion.p>
                    </header>
                )}

                <AnimatePresence mode="wait">
                    {view === "select" && (
                        <motion.div 
                            key="select"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-8"
                        >
                            {/* Create New Plan Card */}
                            <button 
                                onClick={() => setView("create")}
                                className="group relative bg-white/60 backdrop-blur-xl p-10 rounded-[3.5rem] border border-white hover:border-primary/30 transition-all text-left botanical-shadow overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <IoAddCircleOutline className="w-40 h-40" />
                                </div>
                                <div className="w-16 h-16 rounded-3xl bg-primary text-white flex items-center justify-center mb-8 shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                                    <IoAddCircleOutline className="w-8 h-8" />
                                </div>
                                <h3 className="text-3xl font-headline font-black text-on-surface mb-4">Create New Plan</h3>
                                <p className="text-on-surface-variant font-medium opacity-60 mb-8">Initiate a fresh weekly roadmap from zero. Ideal for new dietary protocols.</p>
                                <div className="flex items-center gap-2 text-primary font-black uppercase text-xs tracking-widest">
                                    Inception <IoChevronForwardOutline />
                                </div>
                            </button>

                            {/* View Existing Plans Card */}
                            <button 
                                onClick={() => setView("existing")}
                                className="group relative bg-white/60 backdrop-blur-xl p-10 rounded-[3.5rem] border border-white hover:border-primary/30 transition-all text-left botanical-shadow overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <IoLibraryOutline className="w-40 h-40" />
                                </div>
                                <div className="w-16 h-16 rounded-3xl bg-surface-container-high text-on-surface flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 transition-transform">
                                    <IoLibraryOutline className="w-8 h-8" />
                                </div>
                                <h3 className="text-3xl font-headline font-black text-on-surface mb-4">Existing Library</h3>
                                <p className="text-on-surface-variant font-medium opacity-60 mb-8">Access and modify your previously archived nutritional strategies.</p>
                                <div className="flex items-center gap-2 text-on-surface font-black uppercase text-xs tracking-widest opacity-40">
                                    Access <IoChevronForwardOutline />
                                </div>
                            </button>
                        </motion.div>
                    )}

                    {view === "create" && (
                        <motion.div 
                            key="create"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="max-w-2xl mx-auto bg-white/80 backdrop-blur-2xl p-12 rounded-[4rem] border border-white botanical-shadow"
                        >
                            <button onClick={() => setView("select")} className="text-[10px] font-black uppercase tracking-widest text-primary mb-8 flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">arrow_back</span> Back
                            </button>
                            <h2 className="text-4xl font-headline font-black text-on-surface mb-2">Plan Initialization</h2>
                            <p className="text-on-surface-variant font-medium opacity-60 mb-10">Define the metadata for your new nutritional protocol.</p>
                            
                            <form onSubmit={handleCreatePlan} className="space-y-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant px-2">Plan Name (Step 3)</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. Metabolic Shred 2.0"
                                        className="w-full px-8 py-5 rounded-3xl bg-surface-container-low border-none focus:ring-2 focus:ring-primary/20 text-on-surface font-bold placeholder:opacity-30"
                                        value={newPlan.name}
                                        onChange={(e) => setNewPlan({...newPlan, name: e.target.value})}
                                        autoFocus
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant px-2">Description / Notes</label>
                                    <textarea 
                                        placeholder="Outline your primary objectives..."
                                        className="w-full px-8 py-5 rounded-3xl bg-surface-container-low border-none focus:ring-2 focus:ring-primary/20 text-on-surface font-bold placeholder:opacity-30 min-h-[150px]"
                                        value={newPlan.description}
                                        onChange={(e) => setNewPlan({...newPlan, description: e.target.value})}
                                    />
                                </div>
                                <button type="submit" className="w-full py-6 rounded-[2rem] vitality-gradient text-white font-black uppercase tracking-[0.2em] text-sm shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all">
                                    Instantiate Plan
                                </button>
                            </form>
                        </motion.div>
                    )}

                    {view === "existing" && (
                        <motion.div 
                            key="existing"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-8"
                        >
                            <div className="flex justify-between items-center">
                                <button onClick={() => setView("select")} className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm">arrow_back</span> Back
                                </button>
                                <h2 className="text-2xl font-headline font-black text-on-surface">Your Protocols</h2>
                            </div>

                            {loading ? (
                                <div className="py-20 flex justify-center">
                                    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                                </div>
                            ) : plans.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {plans.map(plan => (
                                        <div 
                                            key={plan.id}
                                            onClick={() => navigate(`/meal-planner/${plan.id}`)}
                                            className="group bg-white p-8 rounded-[3rem] border border-white hover:border-primary/20 transition-all cursor-pointer botanical-shadow flex justify-between items-start"
                                        >
                                            <div className="space-y-2">
                                                <h3 className="text-2xl font-headline font-black text-on-surface group-hover:text-primary transition-colors">{plan.name}</h3>
                                                <p className="text-sm text-on-surface-variant font-medium opacity-60 line-clamp-2">{plan.description || "No description provided."}</p>
                                                <p className="text-[9px] font-black uppercase tracking-widest opacity-30 pt-4">Created {new Date(plan.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            <button 
                                                onClick={(e) => deletePlan(plan.id, e)}
                                                className="p-3 rounded-2xl bg-error/10 text-error opacity-0 group-hover:opacity-100 transition-opacity hover:bg-error/20"
                                            >
                                                <IoTrashOutline className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-24 bg-white/40 backdrop-blur-xl rounded-[4rem] border border-white space-y-6">
                                    <div className="w-20 h-20 rounded-full bg-surface-container-high flex items-center justify-center mx-auto mb-6">
                                        <IoLibraryOutline className="w-8 h-8 opacity-20" />
                                    </div>
                                    <h3 className="text-3xl font-headline font-black text-on-surface">No Archived Plans</h3>
                                    <p className="text-on-surface-variant font-medium opacity-60 max-w-xs mx-auto">You haven't instantiated any metabolic protocols yet.</p>
                                    <button 
                                        onClick={() => setView("create")}
                                        className="text-primary font-black uppercase text-xs tracking-widest hover:underline"
                                    >
                                        Initiate Now
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default MealPlannerLanding;
