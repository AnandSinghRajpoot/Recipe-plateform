import React, { useEffect, useState } from 'react'
import { useLoaderData, Link } from 'react-router-dom'
import { resolveImageUrl } from '../../utils/imageUtils'

const SingleProduct = () => {
    const loaderData = useLoaderData()
    const item = loaderData?.data || loaderData;

    const title = item?.title || item?.name || "Untitled Recipe";
    const description = item?.description || "A meticulously crafted recipe.";
    const instructions = item?.instructions || "";
    const imageUrl = resolveImageUrl(item?.coverImageUrl || item?.thumbnail_image);
    const difficulty = item?.difficulty || "Medium";
    const dietType = item?.dietType;
    const mealType = item?.mealType;
    const cuisineType = item?.cuisineType;
    const more = Array.isArray(item?.more) ? item.more[0] : item?.more || {};

    const extractNumber = (v) => {
        if (typeof v === 'number') return v;
        if (!v || typeof v !== 'string') return 0;
        return parseInt(v.split(" ")[0]) || 0;
    };

    const prepTime = item?.prepTime !== undefined ? item.prepTime : extractNumber(more.prep_time);
    const cookTime = item?.cookTime !== undefined ? item.cookTime : extractNumber(more.cook_time);
    const totalTime = prepTime + cookTime;
    const calories = item?.calories || more.calories;
    const protein = item?.protein || more.protein;
    const carbs = item?.carbs || more.carbs;
    const fat = item?.fat || more.fat;
    const servings = item?.servings || more.servings || 2;

    const steps = typeof instructions === "string"
        ? instructions.split(/\d+\.\s*|\n/).filter(s => s.trim() !== "")
        : [];

    const allergens = item?.containsAllergens || [];
    const safeDiseases = item?.safeForDiseases || [];

    return (
        <div className="bg-surface font-body text-on-surface min-h-screen selection:bg-primary/20 py-12 md:py-20 px-4 md:px-8">
            
            {/* The "Recipe Card" — Centered and constrained */}
            <div className="max-w-4xl mx-auto bg-white rounded-[3.5rem] shadow-[0_40px_100px_rgba(0,110,28,0.08)] border border-white overflow-hidden overflow-y-auto">
                
                {/* Visual Header / Image Area */}
                <div className="relative h-[400px] md:h-[550px] w-full group">
                    <img 
                        src={imageUrl} 
                        alt={title} 
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                        onError={(e) => {
                            e.target.src = "https://images.unsplash.com/photo-1495521821757-a1efb6729352?q=80&w=2000&auto=format&fit=crop";
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                    
                    {/* Floating Back Button */}
                    <Link to="/recipes" 
                        className="absolute top-8 left-8 flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-primary transition-all group/back">
                        <span className="material-symbols-outlined text-sm group-hover/back:-translate-x-1 transition-transform">arrow_back</span>
                        Back
                    </Link>

                    {/* Content Overlay */}
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
                    
                    {/* Intro & Stats */}
                    <div className="flex flex-col md:flex-row gap-10 items-start md:items-center justify-between">
                        <div className="flex-grow max-w-xl">
                            <p className="text-xl md:text-2xl text-on-surface-variant font-medium leading-relaxed opacity-80 italic">
                                "{description}"
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-6 shrink-0">
                            <div className="text-center">
                                <p className="text-2xl font-black text-primary">{totalTime}m</p>
                                <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Total Time</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-black text-secondary">{calories || 450}</p>
                                <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Calories</p>
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-outline-variant/10" />

                    {/* Ingredients & Steps Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                        
                        {/* Ingredients (4 Cols) */}
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

                             {/* Nutrition Tiny Bar */}
                            <div className="bg-surface-container-low rounded-3xl p-6 mt-10 grid grid-cols-3 gap-2">
                                <div className="text-center">
                                    <p className="font-black text-primary text-sm">{protein || '24'}g</p>
                                    <p className="text-[8px] font-black uppercase opacity-40">Protein</p>
                                </div>
                                <div className="text-center">
                                    <p className="font-black text-secondary text-sm">{carbs || '42'}g</p>
                                    <p className="text-[8px] font-black uppercase opacity-40">Carbs</p>
                                </div>
                                <div className="text-center">
                                    <p className="font-black text-tertiary text-sm">{fat || '18'}g</p>
                                    <p className="text-[8px] font-black uppercase opacity-40">Fat</p>
                                </div>
                            </div>
                        </div>

                        {/* Instructions (7 Cols) */}
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

                            {/* Tags Section */}
                            {(allergens.length > 0 || safeDiseases.length > 0) && (
                                <div className="pt-10 flex flex-wrap gap-4">
                                     {allergens.map((a, i) => (
                                         <span key={i} className="px-4 py-2 bg-error/5 text-error text-[10px] font-black uppercase tracking-widest rounded-xl border border-error/10">Allergen: {a.name || a}</span>
                                     ))}
                                     {safeDiseases.map((d, i) => (
                                         <span key={i} className="px-4 py-2 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest rounded-xl border border-primary/10">Safe for: {d.name || d}</span>
                                     ))}
                                </div>
                            )}
                        </div>
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

export default SingleProduct
