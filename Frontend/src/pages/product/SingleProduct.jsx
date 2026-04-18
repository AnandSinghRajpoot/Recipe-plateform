import React, { useEffect, useState } from 'react'
import { useLoaderData, Link, useParams } from 'react-router-dom'
import { resolveImageUrl } from '../../utils/imageUtils'
import apiClient from '../../utils/apiClient'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import generalProfilePic from '../../assets/general-profile-pic.png'
import ReviewsSection from '../../components/common/ReviewsSection'

const SingleProduct = () => {
    const { id } = useParams();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState("");
    const [isLiking, setIsLiking] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const fetchRecipe = async () => {
        try {
            const res = await apiClient.get(`/recipes/${id}`);
            setItem(res.data.data);
        } catch (err) {
            console.error("Error fetching recipe:", err);
            toast.error("Failed to load recipe details");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecipe();
    }, [id]);

    const handleLike = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error("Please login to like recipes");
            return;
        }
        setIsLiking(true);
        try {
            const res = await apiClient.post(`/recipes/${id}/like`);
            setItem(prev => ({
                ...prev,
                isLiked: res.data.data,
                likesCount: res.data.data ? prev.likesCount + 1 : prev.likesCount - 1
            }));
        } catch (err) {
            toast.error("Action failed");
        } finally {
            setIsLiking(false);
        }
    };

    const handleSave = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error("Please login to save recipes");
            return;
        }
        setIsSaving(true);
        
        // If already saved, unsave it
        if (item?.isSaved) {
            try {
                await apiClient.delete(`/saved-recipes/${id}`);
                setItem(prev => ({
                    ...prev,
                    isSaved: false
                }));
                toast.success("Recipe removed from saved!");
            } catch (err) {
                toast.error("Failed to remove recipe from saved");
            }
        } else {
            // If not saved, save it
            try {
                await apiClient.post(`/saved-recipes/${id}`);
                setItem(prev => ({
                    ...prev,
                    isSaved: true
                }));
                toast.success("Recipe saved successfully!");
            } catch (err) {
                // Check if it's already saved due to race condition
                if (err.response?.status === 409 || err.response?.status === 400) {
                    try {
                        await apiClient.delete(`/saved-recipes/${id}`);
                        setItem(prev => ({
                            ...prev,
                            isSaved: false
                        }));
                        toast.success("Recipe removed from saved!");
                    } catch (deleteErr) {
                        toast.error("Failed to update save status");
                    }
                } else {
                    toast.error("Failed to save recipe");
                }
            }
        }
        
        setIsSaving(false);
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error("Please login to comment");
            return;
        }

        try {
            const res = await apiClient.post(`/recipes/${id}/comments`, { content: newComment });
            setItem(prev => ({
                ...prev,
                comments: [res.data.data, ...(prev.comments || [])]
            }));
            setNewComment("");
            toast.success("Comment added");
        } catch (err) {
            toast.error("Failed to add comment");
        }
    };

    if (loading) return <div className="min-h-screen bg-surface flex items-center justify-center"><div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
    if (!item) return <div className="min-h-screen bg-surface flex items-center justify-center">Recipe not found.</div>;

    const title = item?.title || item?.name || "Untitled Recipe";
    const description = item?.description || "A meticulously crafted recipe.";
    const instructions = item?.instructions || "";
    const imageUrl = resolveImageUrl(item?.coverImageUrl || item?.thumbnail_image);
    const difficulty = item?.difficulty || "Medium";
    const dietType = item?.dietType;
    const mealType = item?.mealType;
    
    const prepTime = item?.prepTime || 0;
    const cookTime = item?.cookTime || 0;
    const totalTime = prepTime + cookTime;
    const calories = item?.nutrition?.calories || 450;
    const servants = item?.servings || 2;

    const steps = typeof instructions === "string"
        ? instructions.split(/\d+\.\s*|\n/).filter(s => s.trim() !== "")
        : [];

    const allergens = item?.containsAllergens || [];
    const safeDiseases = item?.safeForDiseases || [];

    return (
        <div className="bg-surface font-body text-on-surface min-h-screen selection:bg-primary/20 py-12 md:py-20 px-4 md:px-8">
            
            <div className="max-w-4xl mx-auto bg-white rounded-[3.5rem] shadow-[0_40px_100px_rgba(0,110,28,0.08)] border border-white overflow-hidden">
                
                {/* Visual Header */}
                <div className="relative h-[400px] md:h-[550px] w-full group">
                    <img 
                        src={imageUrl} 
                        alt={title} 
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                        onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1495521821757-a1efb6729352?q=80&w=2000&auto=format&fit=crop"; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                    
                    <Link to="/recipes" 
                        className="absolute top-8 left-8 flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-primary transition-all group/back">
                        <span className="material-symbols-outlined text-sm group-hover/back:-translate-x-1 transition-transform">arrow_back</span>
                        Back
                    </Link>

                    {/* Like and Save Floating Buttons */}
                    <div className="absolute top-8 right-8 flex flex-col gap-3">
                        <button 
                            onClick={handleLike}
                            disabled={isLiking}
                            className="w-14 h-14 rounded-3xl backdrop-blur-md flex flex-col items-center justify-center transition-all shadow-xl group/like bg-white/20 text-white border border-white/40 hover:bg-white active:scale-90 duration-200"
                        >
                            <span className={`material-symbols-outlined text-2xl group-active/like:scale-150 transition-transform ${item.isLiked ? 'text-green-600' : 'text-white group-hover/like:text-green-600'}`} style={item.isLiked ? { fontVariationSettings: '"FILL" 1' } : {}}>
                                {item.isLiked ? 'favorite' : 'favorite_border'}
                            </span>
                            <span className="text-[9px] font-black">{item.likesCount || 0}</span>
                        </button>
                        <button 
                            onClick={handleSave}
                            disabled={isSaving}
                            className="w-14 h-14 rounded-3xl backdrop-blur-md flex flex-col items-center justify-center transition-all shadow-xl group/save bg-white/20 text-white border border-white/40 hover:bg-white active:scale-90 duration-200"
                        >
                            <span className={`material-symbols-outlined text-2xl group-active/save:scale-150 transition-transform ${item.isSaved ? 'text-green-600' : 'text-white group-hover/save:text-green-600'}`} style={item.isSaved ? { fontVariationSettings: '"FILL" 1' } : {}}>
                                {isSaving ? 'hourglass_empty' : (item.isSaved ? 'bookmark' : 'bookmark_border')}
                            </span>
                            <span className="text-[9px] font-black">Save</span>
                        </button>
                    </div>

                    <div className="absolute bottom-10 left-10 right-10 flex flex-col items-start gap-4">
                        <div className="flex gap-2">
                             {dietType && <span className="px-3 py-1 bg-primary text-white text-[9px] font-black uppercase tracking-widest rounded-full">{dietType}</span>}
                             {mealType && <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest rounded-full border border-white/30">{mealType}</span>}
                        </div>
                        <h1 className="text-4xl md:text-6xl font-headline font-black text-white tracking-tighter leading-none">
                            {title}
                        </h1>
                    </div>
                </div>

                {/* Body Content */}
                <div className="p-8 md:p-16 space-y-16">
                    
                    {/* Author & Intro Row */}
                    <div className="flex flex-col md:flex-row gap-10 items-start md:items-center justify-between">
                        <div className="flex-grow max-w-xl space-y-6">
                            <Link to={`/chef/${item.author?.id}`} className="inline-flex items-center gap-4 group/author bg-surface-container-low/50 pr-6 pl-2 py-2 rounded-full border border-outline-variant/10 hover:border-primary/40 transition-all">
                                <img 
                                    src={item.author?.profilePhoto || generalProfilePic} 
                                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                                    alt={item.author?.name}
                                    onError={(e) => { e.target.src = generalProfilePic; }}
                                />
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-primary">Curated BY</p>
                                    <p className="font-headline font-black text-on-surface text-lg group-hover/author:text-primary transition-colors">{item.author?.name || "Botanical Guru"}</p>
                                </div>
                            </Link>

                            <p className="text-xl md:text-2xl text-on-surface-variant font-medium leading-relaxed opacity-80 italic">
                                "{description}"
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-6 shrink-0 bg-surface-container-low rounded-[2.5rem] p-8 border border-white">
                            <div className="text-center">
                                <p className="text-2xl font-black text-primary">{totalTime}m</p>
                                <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Total Time</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-black text-secondary">{calories}</p>
                                <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Calories</p>
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-outline-variant/10" />

                    {/* Ingredients & Steps Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                        <div className="lg:col-span-12 xl:col-span-5 space-y-8">
                            <h3 className="text-2xl font-headline font-black text-on-surface flex items-center gap-3">
                                <span className="w-8 h-8 rounded-lg vitality-gradient flex items-center justify-center text-white text-sm">
                                    <span className="material-symbols-outlined text-base">grocery</span>
                                </span>
                                Ingredients
                            </h3>
                            <ul className="space-y-4">
                                {item?.ingredients?.map((ing, idx) => (
                                    <li key={idx} className="flex items-center gap-4 pb-4 border-b border-outline-variant/5 last:border-0 group">
                                        <div className="w-2 h-2 rounded-full vitality-gradient opacity-30 group-hover:opacity-100 transition-opacity" />
                                        <div className="flex-grow">
                                            <p className="font-bold text-on-surface group-hover:text-primary transition-colors">{ing.name}</p>
                                            <p className="text-xs font-black text-on-surface-variant opacity-50">{ing.quantity} {ing.unit}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="lg:col-span-12 xl:col-span-7 space-y-8">
                            <h3 className="text-2xl font-headline font-black text-on-surface flex items-center gap-3">
                                <span className="w-8 h-8 rounded-lg vitality-gradient flex items-center justify-center text-white text-sm">
                                    <span className="material-symbols-outlined text-base">auto_stories</span>
                                </span>
                                Preparation
                            </h3>
                            <div className="space-y-10">
                                {steps.map((step, index) => (
                                    <div key={index} className="flex gap-6 group">
                                        <span className="text-4xl font-headline font-black text-primary/10 group-hover:text-primary/30 transition-colors">
                                            {(index + 1).toString().padStart(2, '0')}
                                        </span>
                                        <p className="text-on-surface-variant font-medium text-lg leading-relaxed pt-1 group-hover:text-on-surface transition-colors">
                                            {step.trim()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Reviews & Ratings */}
                    <div className="pt-20">
                        <ReviewsSection recipeId={id} />
                    </div>
                </div>

                {/* Footer Link */}
                <div className="bg-surface-container-high/30 p-8 text-center">
                     <Link to="/recipes" className="inline-flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.2em] hover:gap-4 transition-all group">
                        <span className="material-symbols-outlined">arrow_back</span>
                        Explore more botanical delicacies
                     </Link>
                </div>
            </div>
            <style dangerouslySetInnerHTML={{ __html: `
                .font-headline { font-family: 'Manrope', sans-serif; }
                .bg-surface { background-color: #f5fced; }
            `}} />
        </div>
    );
};

export default SingleProduct;
