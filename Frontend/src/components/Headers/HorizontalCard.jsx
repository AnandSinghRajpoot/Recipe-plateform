import React from 'react';
import { Link } from 'react-router-dom';
import { resolveImageUrl } from "../../utils/imageUtils";

const HorizontalCard = ({ item }) => {
    const title = item?.title || item?.name || "Untitled Recipe";
    const description = item?.description || "No description available.";
    const difficulty = item?.difficulty || "Medium";
    const prepTime = item?.prepTime !== undefined ? item?.prepTime : (item?.more?.[0]?.prep_time || "N/A");
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

    return (
        <div className="group bg-white/60 backdrop-blur-xl rounded-[2.5rem] botanical-shadow hover:shadow-[0_32px_64px_rgba(0,110,28,0.12)] transition-all duration-700 border border-white hover:scale-[1.02] active:scale-[0.98] overflow-hidden flex flex-col md:flex-row h-full md:h-72">
            
            {/* Image Section - Botanical Presentation */}
            <div className="relative w-full md:w-96 flex-shrink-0 overflow-hidden">
                <img 
                    src={imageUrl} 
                    alt={title} 
                    className="w-full h-56 md:h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>
                <div className="absolute top-5 left-5">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border backdrop-blur-md shadow-lg ${getDifficultyStyles(difficulty)}`}>
                        {difficulty}
                    </span>
                </div>
            </div>

            {/* Content Section - High-Fidelity Typography */}
            <div className="flex-grow p-8 flex flex-col justify-between relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-primary/10 transition-all duration-700"></div>
                
                <div>
                    <div className="flex justify-between items-start mb-3">
                        <span className="text-primary text-[10px] font-black uppercase tracking-[0.2em] opacity-70">
                            {item?.category || "General Nutrition"}
                        </span>
                    </div>
                    
                    <Link to={`/items/${id}`}>
                        <h3 className="text-3xl font-headline font-black text-on-surface mb-3 group-hover:text-primary transition-colors tracking-tight leading-tight">
                            {title}
                        </h3>
                    </Link>
                    
                    <p className="text-on-surface-variant text-base font-medium leading-relaxed opacity-80 line-clamp-2 mb-6">
                        {description}
                    </p>
                </div>

                <div className="flex items-center gap-8 mt-auto pt-6 border-t border-outline-variant/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined text-xl">schedule</span>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Time</p>
                            <p className="text-sm font-black text-on-surface">{prepTime} {typeof prepTime === 'number' ? 'mins' : ''}</p>
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
                    
                    <Link 
                        to={`/items/${id}`}
                        className="ml-auto w-12 h-12 rounded-2xl vitality-gradient text-white flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-110 active:scale-95 transition-all"
                        title="View Recipe"
                    >
                        <span className="material-symbols-outlined font-black">arrow_forward</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default HorizontalCard;
