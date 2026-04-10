import React from "react";

const About = () => {
  return (
    <div className="bg-surface font-body text-on-surface min-h-[calc(100vh-136px)] relative overflow-hidden py-20 px-6">
      {/* Background Ambience Layers */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] rounded-full bg-primary/20 blur-[150px]"></div>
        <div className="absolute top-[60%] -right-[10%] w-[50%] h-[50%] rounded-full bg-secondary-container/20 blur-[120px]"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-24">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest mb-6 animate-fade-in">
            <span className="material-symbols-outlined text-xs">info</span>
            Our Digital Greenhouse
          </div>
          <h1 className="font-headline text-5xl md:text-7xl font-black text-on-surface mb-8 tracking-tighter leading-tight">
            Cultivating a <br />
            <span className="text-primary-fixed">Vibrant Future</span> Together.
          </h1>
          <p className="max-w-2xl mx-auto text-on-surface-variant text-lg md:text-xl font-medium leading-relaxed">
            RecipeHub is your all-in-one destination for discovering healthy recipes, balanced nutrition, 
            and mindful eating — made simple, delicious, and sustainable.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32">
          {/* Left: Interactive Image Card */}
          <div className="relative group">
            <div className="absolute -inset-4 bg-primary/5 rounded-[3rem] blur-2xl group-hover:bg-primary/10 transition-all duration-700"></div>
            <div className="relative aspect-square md:aspect-video lg:aspect-square rounded-[3rem] overflow-hidden shadow-2xl border border-white">
              <img
                src="https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1200&q=80"
                alt="Healthy food preparation"
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              <div className="absolute bottom-10 left-10">
                <div className="text-white">
                  <p className="text-xs font-black uppercase tracking-widest opacity-80 mb-2">Since 2026</p>
                  <h3 className="text-3xl font-black font-headline tracking-tight">Rooted in Health.</h3>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Mission & Vision */}
          <div className="space-y-12">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl vitality-gradient flex items-center justify-center text-white shadow-lg mb-6">
                <span className="material-symbols-outlined">eco</span>
              </div>
              <h2 className="font-headline text-3xl font-black text-on-surface tracking-tight">🥗 Our Mission</h2>
              <p className="text-on-surface-variant font-medium leading-relaxed text-lg">
                At <span className="text-primary font-black">RecipeHub</span>, our goal is to help people
                make healthier food choices without compromising on taste.
                We combine the joy of cooking with the science of nutrition to bring you
                recipes that are balanced, simple, and packed with flavor.
              </p>
            </div>

            <div className="space-y-6">
              <h2 className="font-headline text-3xl font-black text-on-surface tracking-tight">🍴 What We Offer</h2>
              <ul className="space-y-4">
                {[
                  { icon: 'restaurant_menu', text: 'Hundreds of curated recipes for all diets and goals.' },
                  { icon: 'calculate', text: 'Detailed nutrition breakdown — calories, proteins, and fats.' },
                  { icon: 'filter_alt', text: 'Smart filters for Vegan, Gluten-free, and Keto meals.' },
                  { icon: 'menu_book', text: 'Cooking tips, meal plans, and ingredient substitutions.' }
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-4 p-4 rounded-2xl bg-white/50 backdrop-blur-sm border border-white/50 hover:border-primary/20 transition-all hover:translate-x-2">
                    <span className="material-symbols-outlined text-primary">{item.icon}</span>
                    <span className="font-bold text-on-surface-variant">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Philosophy CTA */}
        <div className="bg-surface-container-high rounded-[4rem] p-12 md:p-20 relative overflow-hidden text-center border border-white shadow-xl">
          <div className="absolute top-0 right-0 p-10 opacity-5">
             <span className="material-symbols-outlined text-[200px]">format_quote</span>
          </div>
          <p className="text-3xl md:text-4xl font-headline font-black text-on-surface mb-10 leading-tight tracking-tight relative z-10">
            “Good nutrition isn’t about restriction — it’s about balance, creativity, and joy in every bite.”
          </p>
          <div className="h-1 w-20 vitality-gradient mx-auto mb-10 rounded-full"></div>
          <p className="font-black text-primary uppercase tracking-widest text-sm">The RecipeHub Philosophy</p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}} />
    </div>
  );
};

export default About;
