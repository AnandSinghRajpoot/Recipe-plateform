import React, { useEffect, useState } from 'react'
import { useLoaderData, Link, useParams, useNavigate } from 'react-router-dom'
import { resolveImageUrl } from '../../utils/imageUtils'
import apiClient from '../../utils/apiClient'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import generalProfilePic from '../../assets/general-profile-pic.png'
import ReviewsSection from '../../components/common/ReviewsSection'
import { useShopping } from '../../context/ShoppingContext';

const SingleProduct = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState("");
    const [isLiking, setIsLiking] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const { selectedRecipes, toggleRecipeSelection } = useShopping();
    const isSelectedForShopping = selectedRecipes.includes(parseInt(id));
    const userRole = localStorage.getItem('role');
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [reportError, setReportError] = useState('');
    const [showModerateModal, setShowModerateModal] = useState(false);
    const [moderateReason, setModerateReason] = useState('');
    const [moderateError, setModerateError] = useState('');

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

    const handleReport = async () => {
        if (!reportReason.trim()) { setReportError('Please provide a reason for reporting'); return; }
        try {
            await apiClient.post(`/reports?type=RECIPE&targetId=${id}&reason=${encodeURIComponent(reportReason)}`);
            toast.success('Report submitted. Our team will review it.');
            setShowReportModal(false);
            setReportReason('');
            setReportError('');
        } catch (err) { toast.error('Failed to submit report'); }
    };

    const handleAdminModerateAction = async () => {
        if (!moderateReason.trim()) { setModerateError('Please provide a moderation reason'); return; }
        try {
            await apiClient.patch(`/admin/recipes/${id}/moderate?moderated=true&reason=${encodeURIComponent(moderateReason)}`);
            toast.success('Recipe taken down');
            setShowModerateModal(false);
            setModerateReason('');
            setModerateError('');
            fetchRecipe();
        } catch (err) { toast.error('Moderation failed'); }
    };

    const handleRestore = async () => {
        try {
            await apiClient.patch(`/admin/recipes/${id}/moderate?moderated=false&reason=`);
            toast.success('Recipe restored');
            fetchRecipe();
        } catch (err) { toast.error('Restore failed'); }
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
    const steps = typeof instructions === "string"
        ? instructions.split(/\d+\.\s*|\n/).filter(s => s.trim() !== "")
        : [];

    return (
        <>
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
                    
                    <button 
                        onClick={() => navigate(-1)}
                        className="absolute top-8 left-8 flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-primary transition-all group/back"
                    >
                        <span className="material-symbols-outlined text-sm group-hover/back:-translate-x-1 transition-transform">arrow_back</span>
                        Back
                    </button>

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
                        <button 
                            onClick={() => toggleRecipeSelection(parseInt(id))}
                            className={`w-14 h-14 rounded-3xl backdrop-blur-md flex flex-col items-center justify-center transition-all shadow-xl group/bag border border-white/40 active:scale-90 duration-200 ${isSelectedForShopping ? 'bg-white text-blue-600' : 'bg-white/20 text-white hover:bg-white hover:text-blue-600'}`}
                        >
                            <span className={`material-symbols-outlined text-2xl group-active/bag:scale-150 transition-transform`} style={isSelectedForShopping ? { fontVariationSettings: '"FILL" 1' } : {}}>
                                {isSelectedForShopping ? 'shopping_bag' : 'add_shopping_cart'}
                            </span>
                            <span className="text-[9px] font-black">{isSelectedForShopping ? 'Added' : 'Bag'}</span>
                        </button>
                        {localStorage.getItem('token') && userRole !== 'ADMIN' && (
                            <button 
                                onClick={() => setShowReportModal(true)}
                                className="w-14 h-14 rounded-3xl backdrop-blur-md flex flex-col items-center justify-center transition-all shadow-xl bg-white/20 text-white border border-white/40 hover:bg-red-500 active:scale-90 duration-200 group/report"
                                title="Report this recipe"
                            >
                                <span className="material-symbols-outlined text-2xl group-hover/report:scale-110 transition-transform">flag</span>
                                <span className="text-[9px] font-black">Report</span>
                            </button>
                        )}
                    </div>

                    <div className="absolute bottom-10 left-10 right-10 flex flex-col items-start gap-4">
                        <div className="flex gap-2">
                             {dietType && <span className="px-3 py-1 bg-primary text-white text-[9px] font-black uppercase tracking-widest rounded-full">{dietType}</span>}
                             {mealType && <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest rounded-full border border-white/30">{mealType}</span>}
                             {item?.cuisineType && <span className="px-3 py-1 bg-secondary text-on-secondary text-[9px] font-black uppercase tracking-widest rounded-full">{item.cuisineType}</span>}
                        </div>
                        <h1 className="text-4xl md:text-6xl font-headline font-black text-white tracking-tighter leading-none">
                            {title}
                        </h1>
                    </div>
                </div>

                {/* Body Content */}
                <div className="p-8 md:p-16 space-y-16">
                    
                    {/* Header: Interaction Row (Chef, Nutrition, Description) */}
                    <div className="flex flex-col lg:flex-row gap-12 items-start">
                        
                        {/* Left: Engagement Column */}
                        <div className="flex-grow space-y-8">
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

                            <p className="text-2xl md:text-3xl text-on-surface font-medium leading-relaxed opacity-90 italic">
                                "{description}"
                            </p>
                        </div>

                        {/* Right: Metabolic Signature Box */}
                        <div className="w-full lg:w-[320px] shrink-0 p-8 rounded-[3rem] bg-surface-container-low/40 border border-white shadow-inner space-y-8">
                            <div className="flex items-center justify-between">
                                <div className="text-center flex-1 border-r border-outline-variant/10">
                                    <p className="text-3xl font-black text-primary">{totalTime}m</p>
                                    <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Duration</p>
                                </div>
                                <div className="text-center flex-1">
                                    <p className="text-3xl font-black text-secondary">{Math.round(calories)}</p>
                                    <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Calories</p>
                                </div>
                            </div>

                            <div className="h-px bg-outline-variant/10" />

                            <div className="grid grid-cols-3 gap-4">
                                <div className="text-center">
                                    <p className="text-xl font-headline font-black text-on-surface">{Math.round(item?.nutrition?.protein || 0)}g</p>
                                    <p className="text-[8px] font-black uppercase tracking-widest text-primary">Protein</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xl font-headline font-black text-on-surface">{Math.round(item?.nutrition?.carbs || 0)}g</p>
                                    <p className="text-[8px] font-black uppercase tracking-widest text-primary">Carbs</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xl font-headline font-black text-on-surface">{Math.round(item?.nutrition?.fat || 0)}g</p>
                                    <p className="text-[8px] font-black uppercase tracking-widest text-primary">Fat</p>
                                </div>
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
                     <button 
                        onClick={() => navigate(-1)} 
                        className="inline-flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.2em] hover:gap-4 transition-all group"
                     >
                        <span className="material-symbols-outlined">arrow_back</span>
                        Explore more botanical delicacies
                     </button>
                </div>
            </div>
            <style dangerouslySetInnerHTML={{ __html: `
                .font-headline { font-family: 'Manrope', sans-serif; }
                .bg-surface { background-color: #f5fced; }
            `}} />
        </div>

        {/* Admin Moderation Bar */}
        {userRole === 'ADMIN' && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-gray-900/95 backdrop-blur-md text-white px-6 py-3 rounded-2xl shadow-2xl border border-white/10">
                <span className="material-symbols-outlined text-violet-400">admin_panel_settings</span>
                <span className="text-xs font-black uppercase tracking-widest text-violet-300">Admin Control</span>
                <div className="w-px h-5 bg-white/20 mx-1" />
                {!item?.isModerated ? (
                    <button onClick={() => setShowModerateModal(true)}
                        className="px-4 py-1.5 bg-red-600 text-white rounded-xl text-xs font-black hover:bg-red-700 transition-colors">
                        Take Down Recipe
                    </button>
                ) : (
                    <button onClick={handleRestore}
                        className="px-4 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-black hover:bg-emerald-700 transition-colors">
                        Restore Recipe
                    </button>
                )}
            </div>
        )}

        {/* Report Modal */}
        {showReportModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl animate-fade-in-up">
                    <h2 className="font-headline font-black text-2xl mb-1 text-on-surface">Report Recipe</h2>
                    <p className="text-on-surface-variant font-medium text-sm mb-6">Describe the issue with this recipe. Our team will review it within 24 hours.</p>
                    <div className="space-y-1 mb-6">
                        <textarea
                            value={reportReason}
                            onChange={e => { setReportReason(e.target.value); setReportError(''); }}
                            placeholder="E.g. Contains false nutritional info, inappropriate content..."
                            rows={4}
                            className={`w-full bg-surface-container-low border-2 rounded-2xl px-4 py-3 text-sm focus:outline-none resize-none text-on-surface font-bold placeholder-on-surface-variant/40 ${reportError ? 'border-error/50' : 'border-transparent focus:border-primary/30'}`}
                        />
                        {reportError && <p className="text-[10px] font-black text-error uppercase tracking-widest ml-2">{reportError}</p>}
                    </div>
                    <div className="flex gap-3">
                        <button onClick={handleReport}
                            className="flex-1 py-4 bg-error text-white rounded-2xl font-black text-sm hover:scale-[1.02] transition-all shadow-lg shadow-error/20">
                            Submit Report
                        </button>
                        <button onClick={() => setShowReportModal(false)}
                            className="flex-1 py-4 bg-surface-container text-on-surface-variant rounded-2xl font-black text-sm hover:bg-surface-container-highest transition-all">
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Admin Moderation Modal */}
        {showModerateModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl animate-fade-in-up">
                    <h2 className="font-headline font-black text-2xl mb-1 text-error">Take Down Recipe</h2>
                    <p className="text-on-surface-variant font-medium text-sm mb-6">Provide a reason for removing <span className="font-black text-on-surface">{title}</span> from the platform.</p>
                    <div className="space-y-1 mb-6">
                        <textarea
                            value={moderateReason}
                            onChange={e => { setModerateReason(e.target.value); setModerateError(''); }}
                            placeholder="Reason for taking down..."
                            rows={3}
                            className={`w-full bg-surface-container-low border-2 rounded-2xl px-4 py-3 text-sm focus:outline-none resize-none text-on-surface font-bold placeholder-on-surface-variant/40 ${moderateError ? 'border-error/50' : 'border-transparent focus:border-error/30'}`}
                        />
                        {moderateError && <p className="text-[10px] font-black text-error uppercase tracking-widest ml-2">{moderateError}</p>}
                    </div>
                    <div className="flex gap-3">
                        <button onClick={handleAdminModerateAction}
                            className="flex-1 py-4 bg-error text-white rounded-2xl font-black text-sm hover:scale-[1.02] transition-all shadow-lg shadow-error/20">
                            Confirm Take Down
                        </button>
                        <button onClick={() => setShowModerateModal(false)}
                            className="flex-1 py-4 bg-surface-container text-on-surface-variant rounded-2xl font-black text-sm hover:bg-surface-container-highest transition-all">
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        )}
        </>
    );
};

export default SingleProduct;
