import React, { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { resolveImageUrl } from "../../utils/imageUtils";
import VanillaTilt from 'vanilla-tilt';

const Card = ({ item }) => {
    const cardRef = useRef(null);
    const title = item?.title || item?.name || "Untitled Recipe";
    const difficulty = item?.difficulty || "Medium";
    const prepTime = item?.prepTime !== undefined ? item?.prepTime : (item?.more?.[0]?.prep_time || "N/A");
    const id = item?.id || item?._id;
    const imageUrl = resolveImageUrl(item?.coverImageUrl || item?.thumbnail_image);

    useEffect(() => {
        if (cardRef.current) {
            VanillaTilt.init(cardRef.current, {
                max: 10,
                speed: 400,
                glare: true,
                "max-glare": 0.2,
                scale: 1.02
            });
        }
    }, []);

    return (
        <div 
            ref={cardRef}
            className="group bg-white/60 backdrop-blur-xl rounded-[2.5rem] botanical-shadow border border-white hover:shadow-[0_32px_64px_rgba(0,110,28,0.08)] transition-all duration-700 overflow-hidden flex flex-col h-full"
        >
            {/* Image Container */}
            <div className="relative aspect-[4/3] overflow-hidden">
                <img 
                    src={imageUrl} 
                    alt={title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                <div className="absolute top-4 right-4">
                    <div className="bg-white/80 backdrop-blur-md px-3 py-1 rounded-xl shadow-lg border border-white/50">
                        <span className="text-[10px] font-black text-on-surface uppercase tracking-widest">{difficulty}</span>
                    </div>
                </div>
            </div>

            {/* Content Container */}
            <div className="p-6 flex flex-col flex-grow relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-primary/10 transition-all duration-700"></div>
                
                <div className="mb-4">
                    <span className="text-primary text-[10px] font-black uppercase tracking-[0.2em] opacity-60 block mb-2">
                        {item?.category || "Nutrition"}
                    </span>
                    <Link to={`/items/${id}`}>
                        <h3 className="text-xl font-headline font-black text-on-surface leading-tight hover:text-primary transition-colors line-clamp-2">
                            {title}
                        </h3>
                    </Link>
                </div>

                <div className="mt-auto flex justify-between items-center pt-4 border-t border-outline-variant/5">
                    <div className="flex items-center gap-2 text-on-surface-variant opacity-60">
                        <span className="material-symbols-outlined text-lg">schedule</span>
                        <span className="text-xs font-bold">{prepTime} {typeof prepTime === 'number' ? 'min' : ''}</span>
                    </div>
                    <Link 
                        to={`/items/${id}`}
                        className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-primary hover:vitality-gradient hover:text-white transition-all duration-500 shadow-sm"
                    >
                        <span className="material-symbols-outlined text-lg font-black">arrow_forward</span>
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default Card;