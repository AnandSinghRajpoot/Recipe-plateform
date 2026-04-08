import React from 'react'

const AboutSection = () => {
  return (
    <div className='relative overflow-hidden flex md:flex-row flex-col justify-between items-center my-32 md:gap-20 gap-16 px-6 lg:px-20'>
      
      {/* Visual Ambience */}
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 -z-10"></div>
      
      <div className='text-start md:w-1/2 space-y-8 relative z-10'>
        <div className="space-y-4">
            <span className="text-primary font-black uppercase tracking-widest text-[10px] px-5 py-2 bg-white/60 backdrop-blur-md rounded-full border border-primary/10 shadow-sm inline-block">
                Our Philosophy
            </span>
            <h2 className='text-4xl md:text-6xl font-headline font-black text-on-surface tracking-tighter leading-[1.1]'>
                Cultivating <span className="text-primary italic">Vitality</span> through Botanical Intelligence
            </h2>
        </div>
        
        <p className='text-xl text-on-surface-variant font-medium leading-relaxed opacity-80'>
            RecipeHub isn't just a collection of ingredients; it's a digital greenhouse where culinary art meets metabolic science. We believe that every meal is an opportunity to fuel your biological potential.
            <br/><br/>
            Whether you're exploring plant-based traditions or modern nutritional avant-garde, our platform provides the intelligence to help you grow.
        </p>
        
        <div className='pt-6 flex flex-wrap gap-6'>
            <button className="vitality-gradient text-white px-10 py-5 rounded-[2rem] font-black text-lg shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-4">
                Explore the Compendium
                <span className="material-symbols-outlined">arrow_forward</span>
            </button>
            <div className="flex -space-x-4 items-center">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-surface-container-high overflow-hidden shadow-sm">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=chef${i}`} alt="Chef" className="w-full h-full object-cover" />
                    </div>
                ))}
                <div className="pl-8">
                    <p className="text-xs font-black text-on-surface">500+ Experts</p>
                    <p className="text-[10px] uppercase font-bold text-on-surface-variant opacity-60">Verified Chefs</p>
                </div>
            </div>
        </div>
      </div>

      <div className="md:w-1/2 relative group">
        <div className="absolute inset-0 vitality-gradient rounded-[4rem] blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-700"></div>
        <div className="relative rounded-[4rem] overflow-hidden border-8 border-white botanical-shadow aspect-square md:aspect-auto md:h-[600px] transform -rotate-3 group-hover:rotate-0 transition-transform duration-1000">
            <img 
                src="https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&q=80&w=1200" 
                alt="Botanical Culinary Art"  
                className='w-full h-full object-cover hover:scale-110 transition-transform duration-1000'
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent"></div>
            <div className="absolute bottom-10 left-10 right-10 p-8 glass-card rounded-[2.5rem] border-white/40 text-white">
                <p className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-80">Featured Insight</p>
                <h4 className="text-xl font-headline font-black leading-tight">"The synergy of fresh components is the foundation of high-metabolic living."</h4>
            </div>
        </div>
      </div>
    </div>
  )
}

export default AboutSection
