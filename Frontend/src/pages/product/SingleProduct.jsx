import React from 'react'
import { useLoaderData, Link } from 'react-router-dom'
import { resolveImageUrl } from '../../utils/imageUtils'

const SingleProduct = () => {
  const loaderData = useLoaderData()
  const item = loaderData?.data || loaderData;
  
  const title = item?.title || item?.name || "Untitled Recipe";
  const description = item?.description || "A meticulously crafted botanical recipe designed for metabolic harmony.";
  const instructions = item?.instructions || "";
  const imageUrl = resolveImageUrl(item?.coverImageUrl || item?.thumbnail_image);
  const difficulty = item?.difficulty || "Medium";
  const category = item?.category || "General Nutrition";
  
  const more = Array.isArray(item?.more) ? item.more[0] : item.more || {}
  
  const extractNumber = (timeString) => {
    if (typeof timeString === 'number') return timeString;
    if (!timeString || typeof timeString !== 'string') return 0
    const timeArray = timeString.split(" ")
    return parseInt(timeArray[0]) || 0
  }

  const prepTime = item?.prepTime !== undefined ? item.prepTime : extractNumber(more.prep_time);
  const cookTime = item?.cookTime !== undefined ? item.cookTime : extractNumber(more.cook_time);
  const totalTime = prepTime + cookTime;

  const steps =
    typeof instructions === "string"
      ? instructions.split(/\d+\.\s*|\n/).filter((s) => s.trim() !== "")
      : []

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen pb-24 selection:bg-primary/20">
      
      {/* Hero Header Section */}
      <section className="relative h-[60vh] md:h-[75vh] w-full overflow-hidden">
        <img 
          src={imageUrl} 
          alt={title} 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-black/20"></div>
        
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-16 max-w-7xl mx-auto flex flex-col md:flex-row items-end justify-between gap-8 translate-y-12 md:translate-y-20">
            <div className="space-y-6 max-w-3xl">
                <div className="flex flex-wrap gap-3">
                    <span className="px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-white text-primary text-[10px] font-black uppercase tracking-widest shadow-lg">
                        {category}
                    </span>
                    <span className="px-4 py-1.5 rounded-full bg-primary/10 backdrop-blur-md border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest shadow-lg">
                        {difficulty} Difficulty
                    </span>
                </div>
                <h1 className="text-5xl md:text-8xl font-headline font-black text-on-surface tracking-tighter leading-tight drop-shadow-sm">
                    {title}
                </h1>
                <p className="text-xl md:text-2xl text-on-surface-variant font-medium opacity-80 leading-relaxed italic">
                    "{description}"
                </p>
            </div>
            
            <div className="hidden lg:flex gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white shadow-xl flex items-center justify-center text-primary hover:scale-110 transition-transform cursor-pointer">
                    <span className="material-symbols-outlined text-3xl font-black">favorite</span>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-white shadow-xl flex items-center justify-center text-primary hover:scale-110 transition-transform cursor-pointer">
                    <span className="material-symbols-outlined text-3xl font-black">share</span>
                </div>
            </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 pt-16 md:pt-32 grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* Left Column: Ingredients & Metrics */}
        <div className="lg:col-span-4 space-y-12">
            
            {/* Quick Metrics Card */}
            <div className="bg-white/60 backdrop-blur-2xl rounded-[3rem] p-10 botanical-shadow border border-white space-y-8">
                <h3 className="text-xs font-black uppercase tracking-widest text-primary text-center">Vitality Metrics</h3>
                <div className="grid grid-cols-2 gap-8">
                    <div className="text-center space-y-1">
                        <span className="material-symbols-outlined text-primary text-3xl">schedule</span>
                        <p className="text-2xl font-black text-on-surface">{totalTime}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Mins Total</p>
                    </div>
                    <div className="text-center space-y-1">
                        <span className="material-symbols-outlined text-tertiary text-3xl">restaurant</span>
                        <p className="text-2xl font-black text-on-surface">{more.servings || '2'}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Servings</p>
                    </div>
                    <div className="text-center space-y-1">
                        <span className="material-symbols-outlined text-secondary text-3xl">fireplace</span>
                        <p className="text-2xl font-black text-on-surface">{more.calories || '450'}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Kcal Per Serve</p>
                    </div>
                    <div className="text-center space-y-1">
                        <span className="material-symbols-outlined text-primary text-3xl">nutrition</span>
                        <p className="text-2xl font-black text-on-surface">{item?.ingredients?.length || '0'}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Ingredients</p>
                    </div>
                </div>
            </div>

            {/* Ingredients Section */}
            <div className="space-y-8 pl-4">
                <h3 className="text-3xl font-headline font-black text-on-surface flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl vitality-gradient flex items-center justify-center text-white shadow-lg shadow-primary/20">
                        <span className="material-symbols-outlined text-xl">grocery</span>
                    </div>
                    The Harvest
                </h3>
                <ul className="space-y-4">
                    {item?.ingredients?.map((ing, idx) => (
                        <li key={idx} className="flex items-center gap-5 group cursor-pointer border-b border-outline-variant/5 pb-4 last:border-0">
                            <div className="w-6 h-6 rounded-lg border-2 border-primary/20 group-hover:border-primary transition-all flex items-center justify-center bg-white">
                                <div className="w-3 h-3 rounded-sm vitality-gradient opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                            <div className="flex-grow">
                                <p className="font-extrabold text-on-surface group-hover:text-primary transition-colors">{ing.name}</p>
                                <p className="text-xs font-bold text-on-surface-variant opacity-60">{ing.quantity} {ing.unit}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Nutrition Facts - Small Table */}
            {(more.protein || more.carbs || more.fat) && (
                <div className="bg-on-surface rounded-[2.5rem] p-8 text-white space-y-6">
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary-fixed italic">Nutritional Synergy</p>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center bg-white/10 p-4 rounded-2xl">
                            <span className="font-bold opacity-60">Protein</span>
                            <span className="font-black text-xl">{more.protein || '24g'}</span>
                        </div>
                        <div className="flex justify-between items-center bg-white/10 p-4 rounded-2xl">
                            <span className="font-bold opacity-60">Carbs</span>
                            <span className="font-black text-xl">{more.carbs || '42g'}</span>
                        </div>
                        <div className="flex justify-between items-center bg-white/10 p-4 rounded-2xl">
                            <span className="font-bold opacity-60">Healthy Fats</span>
                            <span className="font-black text-xl">{more.fat || '18g'}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* Right Column: Steps & Philosophy */}
        <div className="lg:col-span-8 space-y-16">
            
            {/* Instructions Section */}
            <div className="space-y-10">
                <h3 className="text-4xl md:text-5xl font-headline font-black text-on-surface tracking-tighter">
                    Culinary <span className="text-primary italic animate-pulse">Orchestration</span>
                </h3>
                <div className="space-y-12 relative">
                    <div className="absolute left-6 top-8 bottom-8 w-1 bg-primary/5 rounded-full z-0"></div>
                    {steps.map((step, index) => (
                        <div key={index} className="relative z-10 flex gap-8 group">
                            <div className="w-12 h-12 rounded-2xl bg-white shadow-xl border border-primary/10 flex items-center justify-center font-headline font-black text-primary group-hover:vitality-gradient group-hover:text-white transition-all duration-500 shrink-0">
                                {index + 1}
                            </div>
                            <div className="pt-2 text-on-surface-variant font-medium text-lg leading-relaxed group-hover:text-on-surface transition-colors">
                                {step.trim()}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="h-px w-full bg-outline-variant/10"></div>

            {/* AI Insights / Philosophy Section */}
            <div className="bg-primary/5 rounded-[4rem] p-12 md:p-20 flex flex-col md:flex-row gap-12 items-center border border-primary/5 border-dashed">
                <div className="shrink-0 w-32 h-32 rounded-full vitality-gradient flex items-center justify-center text-white shadow-2xl">
                    <span className="material-symbols-outlined text-6xl">auto_awesome</span>
                </div>
                <div className="space-y-6">
                    <h4 className="text-3xl font-headline font-black text-on-surface tracking-tight">Ecosystem Insights</h4>
                    <p className="text-on-surface-variant font-medium text-lg leading-relaxed opacity-80">
                        This recipe is optimized for steady glycemic release. We recommend local organic sourcing for the {item?.ingredients?.[0]?.name || 'primary components'} to maximize bio-availability. Perfect for recovery or high-focus metabolic states.
                    </p>
                    <div className="flex gap-4">
                        <span className="px-5 py-2 bg-white rounded-full text-[10px] font-black uppercase tracking-widest text-primary shadow-sm border border-primary/10 inline-block">Low Glycemic</span>
                        <span className="px-5 py-2 bg-white rounded-full text-[10px] font-black uppercase tracking-widest text-secondary shadow-sm border border-secondary/10 inline-block">High Bio-Availability</span>
                    </div>
                </div>
            </div>

            {/* Back Link */}
            <div className="pt-8 text-center md:text-left">
                <Link to="/recipes" className="inline-flex items-center gap-3 text-primary font-black uppercase tracking-[0.2em] text-xs hover:gap-5 transition-all group">
                    <span className="material-symbols-outlined font-black">arrow_back</span>
                    Return to Compendium
                </Link>
            </div>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .font-headline { font-family: 'Manrope', sans-serif; }
        .bg-surface { background-color: #f5fced; }
      `}} />
    </div>
  )
}

export default SingleProduct
