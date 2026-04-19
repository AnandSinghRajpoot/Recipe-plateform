import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { resolveImageUrl, handleImageError } from "../../utils/imageUtils";
import VanillaTilt from 'vanilla-tilt';
import apiClient from '../../utils/apiClient';
import toast from 'react-hot-toast';
import generalProfilePic from '../../assets/general-profile-pic.png';
import StarRating from '../common/StarRating';
import { useShopping } from '../../context/ShoppingContext';

const HorizontalCard = ({ item }) => {
    const cardRef = useRef(null);
    const [saving, setSaving] = useState(false);
    const [liked, setLiked] = useState(item?.isLiked || false);
    const [likesCount, setLikesCount] = useState(item?.likesCount || 0);
    const [saved, setSaved] = useState(item?.isSaved || false);
    
    const { selectedRecipes, toggleRecipeSelection } = useShopping();
    const isSelectedForShopping = selectedRecipes.includes(item?.id || item?._id);

    const title = item?.title || item?.name || "Untitled Recipe";

    useEffect(() => {
        if (cardRef.current) {
            VanillaTilt.init(cardRef.current, {
                max: 5,
                speed: 400,
                glare: true,
                "max-glare": 0.1,
            });
        }
    }, []);
    const description = item?.description || "No description available.";
    const difficulty = item?.difficulty || "Medium";
    const totalTime = (Number(item?.prepTime) || 0) + (Number(item?.cookTime) || 0);
    const displayTime = totalTime > 0 ? totalTime : (item?.more?.[0]?.prep_time || "N/A");
    const id = item?.id || item?._id;
    const imageUrl = resolveImageUrl(item?.coverImageUrl || item?.thumbnail_image);

    const getDifficultyStyles = (diff) => {
        switch (diff?.toUpperCase()) {
            case 'EASY': return 'bg-primary/10 text-primary border-primary/20';
            case 'MEDIUM': return 'bg-tertiary-container/20 text-tertiary-container border-tertiary-container/30';
            case 'HARD': return 'bg-error-container/20 text-on-error-container border-error-container/30';
            default: return 'bg-surface-container-high text-on-surface-variant border-outline-variant/30';
        }
    };

    const handleLike = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error("Please login to like recipes");
            return;
        }

        try {
            const res = await apiClient.post(`/recipes/${id}/like`);
            setLiked(res.data.data);
            setLikesCount(prev => res.data.data ? prev + 1 : prev - 1);
        } catch (err) {
            toast.error("Failed to like recipe");
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) return toast.error("Please login to save recipes!");
        
        setSaving(true);
        
        // If already saved, unsave it
        if (saved) {
            try {
                await apiClient.delete(`/saved-recipes/${id}`);
                setSaved(false);
                toast.success("Recipe removed from saved!");
            } catch (err) {
                toast.error("Failed to remove recipe from saved");
            }
        } else {
            // If not saved, save it
            try {
                await apiClient.post(`/saved-recipes/${id}`);
                setSaved(true);
                toast.success("Recipe saved successfully!");
            } catch (err) {
                // Check if it's already saved due to race condition
                if (err.response?.status === 409 || err.response?.status === 400) {
                    try {
                        await apiClient.delete(`/saved-recipes/${id}`);
                        setSaved(false);
                        toast.success("Recipe removed from saved!");
                    } catch (deleteErr) {
                        toast.error("Failed to update save status");
                    }
                } else {
                    toast.error("Failed to save recipe");
                }
            }
        }
        
        setSaving(false);
    };

    return (
        <div 
            ref={cardRef}
            className="group bg-white/60 backdrop-blur-xl rounded-[2.5rem] botanical-shadow hover:shadow-[0_32px_64px_rgba(0,110,28,0.12)] transition-all duration-700 border border-white overflow-hidden flex flex-col md:flex-row h-full md:h-[22rem]"
        >
            
            {/* Image Section - Botanical Presentation */}
            <div className="relative w-full h-64 md:h-auto md:w-[26rem] flex-shrink-0 overflow-hidden">
                <Link 
                    to={`/items/${id}`}
                    onClick={() => sessionStorage.setItem('recipesScrollPos', window.scrollY.toString())}
                    className="absolute inset-0 w-full h-full z-0 block"
                >
                    <img 
                        src={imageUrl} 
                        alt={title} 
                        onError={handleImageError}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                    />
                </Link>
                <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent pointer-events-none z-10"></div>
                <div className="absolute top-5 left-5 z-20">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border backdrop-blur-md shadow-lg ${getDifficultyStyles(difficulty)}`}>
                        {difficulty}
                    </span>
                </div>
            </div>

            {/* Content Section - High-Fidelity Typography */}
            <div className="flex-grow p-8 flex flex-col justify-between relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-primary/10 transition-all duration-700"></div>
                
                <div>
                    <div className="flex justify-between items-start mb-4">
                        <Link to={`/chef/${item?.author?.id}`} className="group/author flex items-center gap-2 hover:bg-primary/5 px-2 py-1 rounded-full transition-colors">
                            <img 
                                src={item?.author?.profilePhoto || generalProfilePic} 
                                className="w-6 h-6 rounded-full object-cover border border-primary/20"
                                alt={item?.author?.name}
                                onError={(e) => { e.target.src = generalProfilePic; }}
                            />
                            <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-60 group-hover/author:text-primary">{item?.author?.name || "Member"}</span>
                        </Link>
                    </div>
                    
                    <Link 
                        to={`/items/${id}`}
                        onClick={() => sessionStorage.setItem('recipesScrollPos', window.scrollY.toString())}
                    >
                        <h3 className="text-3xl font-headline font-black text-on-surface mb-2 group-hover:text-primary transition-colors tracking-tight leading-tight line-clamp-2">
                            {title}
                        </h3>
                    </Link>
                    
                    <p className="text-on-surface-variant text-base font-medium leading-relaxed opacity-80 line-clamp-2 mb-3">
                        {description}
                    </p>

                    {/* Rating Display */}
                    <div className="flex items-center gap-2 mb-4">
                        <StarRating rating={item?.averageRating || 0} readonly size={16} />
                        <span className="text-sm font-bold text-on-surface">{(item?.averageRating || 0).toFixed(1)}</span>
                        <span className="text-xs text-on-surface-variant">({item?.reviewCount || 0} review{(item?.reviewCount || 0) !== 1 ? 's' : ''})</span>
                    </div>
                </div>

                <div className="flex items-center gap-8 mt-auto pt-6 border-t border-outline-variant/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined text-xl">schedule</span>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Time</p>
                            <p className="text-sm font-black text-on-surface">{displayTime} {typeof displayTime === 'number' || !isNaN(displayTime) ? 'mins' : ''}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-tertiary">
                            <span className="material-symbols-outlined text-xl">nutrition</span>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Ingredients</p>
                            <p className="text-sm font-black text-on-surface">{item?.ingredients?.length || 0} items</p>
                        </div>
                    </div>
                    
                    <div className="ml-auto flex items-center gap-3">
                        <button 
                            onClick={handleLike}
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all active:scale-90 duration-200 bg-surface-container-low relative ${liked ? 'text-green-600' : 'text-on-surface-variant hover:text-green-600'}`}
                            title={liked ? "Unlike" : "Like"}
                        >
                            <span className={`material-symbols-outlined text-xl ${liked ? '' : 'font-variation-settings: "FILL" 0'}`} style={liked ? { fontVariationSettings: '"FILL" 1' } : {}}>{liked ? 'favorite' : 'favorite_border'}</span>
                            {likesCount > 0 && <span className="absolute -top-1 -right-1 bg-white text-green-600 text-[8px] font-black w-5 h-5 rounded-full flex items-center justify-center border border-green-600/20 shadow-sm">{likesCount}</span>}
                        </button>
                        <button 
                            onClick={handleSave}
                            disabled={saving}
                            className={`w-12 h-12 rounded-2xl bg-surface-container-low flex items-center justify-center transition-all active:scale-90 duration-200 disabled:opacity-50 ${saved ? 'text-green-600' : 'text-on-surface-variant hover:text-green-600'}`}
                            title={saved ? "Remove from Saved" : "Save Recipe"}
                        >
                            <span className={`material-symbols-outlined text-xl`} style={saved ? { fontVariationSettings: '"FILL" 1' } : {}}>{saving ? 'hourglass_empty' : (saved ? 'bookmark' : 'bookmark_border')}</span>
                        </button>
                        <button 
                            onClick={(e) => { e.preventDefault(); toggleRecipeSelection(id); }}
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all active:scale-90 duration-200 bg-surface-container-low ${isSelectedForShopping ? 'text-blue-600' : 'text-on-surface-variant hover:text-blue-600'}`}
                            title={isSelectedForShopping ? "Remove from Shopping Bag" : "Add to Shopping Bag"}
                        >
                            <span className={`material-symbols-outlined text-xl`} style={isSelectedForShopping ? { fontVariationSettings: '"FILL" 1' } : {}}>{isSelectedForShopping ? 'shopping_bag' : 'add_shopping_cart'}</span>
                        </button>
                        <Link 
                            to={`/items/${id}`}
                            onClick={() => sessionStorage.setItem('recipesScrollPos', window.scrollY.toString())}
                            className="w-12 h-12 rounded-2xl vitality-gradient text-white flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-110 active:scale-95 transition-all"
                            title="View Recipe"
                        >
                            <span className="material-symbols-outlined font-black">arrow_forward</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HorizontalCard;
