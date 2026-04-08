import React from 'react'

const NewsLetter = () => {
  return (
    <section className='max-w-6xl mx-auto px-6 mb-32'>
      <div className='relative overflow-hidden bg-on-surface rounded-[4rem] p-12 md:p-24 text-center space-y-12 shadow-2xl'>
        
        {/* Decorative Growth Layer */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/10 rounded-full blur-[80px] -ml-24 -mb-24"></div>
        
        <div className='relative z-10 space-y-6 max-w-2xl mx-auto'>
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mx-auto text-primary-fixed mb-8">
                <span className="material-symbols-outlined text-4xl">energy_savings_leaf</span>
            </div>
            <h3 className='text-white font-headline font-black text-4xl md:text-6xl tracking-tighter leading-tight'>
                Weekly <span className="text-primary-fixed italic font-medium">Metabolic</span> Insights
            </h3>
            <p className='text-white/60 text-lg md:text-xl font-medium leading-relaxed'>
                Join 50,000+ botanists receiving our curated intelligence on seasonal ingredients, metabolic optimization, and revolutionary plant-based gastronomy.
            </p>
        </div>

        <form onSubmit={(e) => e.preventDefault()} className='relative z-10 flex flex-col md:flex-row items-stretch justify-center w-full max-w-3xl mx-auto gap-4'>
            <div className="flex-grow relative group">
                <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-primary-fixed transition-colors">person</span>
                <input 
                    type="text" 
                    placeholder='First Name' 
                    className='w-full pl-14 pr-6 py-6 bg-white/10 border-2 border-transparent rounded-[2rem] text-white outline-none focus:border-primary-fixed/30 focus:bg-white/15 transition-all font-bold placeholder:text-white/30' 
                />
            </div>
            <div className="flex-grow relative group">
                <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-primary-fixed transition-colors">alternate_email</span>
                <input 
                    type="email" 
                    placeholder='Biological Address' 
                    className='w-full pl-14 pr-6 py-6 bg-white/10 border-2 border-transparent rounded-[2rem] text-white outline-none focus:border-primary-fixed/30 focus:bg-white/15 transition-all font-bold placeholder:text-white/30' 
                />
            </div>
            <button className="vitality-gradient text-white px-12 py-6 rounded-[2rem] font-black text-lg shadow-2xl hover:scale-[1.05] active:scale-[0.95] transition-all flex items-center justify-center gap-3 shrink-0">
                Subscribe
                <span className="material-symbols-outlined font-black">join_inner</span>
            </button>
        </form>
        
        <p className="relative z-10 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
            No synthetic filler content. Unsubscribe at your convenience.
        </p>
      </div>
    </section>
  )
}

export default NewsLetter
