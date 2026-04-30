import React from "react";

const About = () => {
  return (
    <>
      <div className="bg-surface font-body text-on-surface min-h-[calc(100vh-136px)] relative overflow-hidden py-24 px-6">
        {/* Background Ambience Layers */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
          <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] rounded-full bg-primary/10 blur-[150px]"></div>
          <div className="absolute top-[60%] -right-[10%] w-[50%] h-[50%] rounded-full bg-secondary-container/10 blur-[120px]"></div>
        </div>

        <div className="max-w-4xl mx-auto relative z-10 text-center">
          {/* Main Heading */}
          <div className="mb-16">
            <h1 className="font-headline text-5xl md:text-7xl font-black text-on-surface mb-6 tracking-tight">
              About Us
            </h1>
            <div className="h-1.5 w-24 bg-primary mx-auto rounded-full mb-10"></div>
            <p className="text-primary text-xl md:text-2xl font-black uppercase tracking-[0.2em] mb-4">
              RecipeHub
            </p>
            <h2 className="text-2xl md:text-3xl font-headline font-bold text-on-surface-variant leading-tight max-w-2xl mx-auto">
              Empowering your journey toward a healthier, more balanced lifestyle through the art of cooking.
            </h2>
          </div>

          {/* Detailed Narrative Section */}
          <div className="space-y-16 mb-24">
            <section className="prose prose-lg max-w-none mx-auto">
              <p className="text-on-surface-variant text-lg md:text-xl leading-relaxed font-medium">
                Welcome to <span className="text-primary font-black">RecipeHub</span>, your premier destination for culinary inspiration and nutritional wellness. Founded with a vision to bridge the gap between "healthy" and "delicious," we believe that eating well should never feel like a chore or a restriction.
              </p>
              <p className="text-on-surface-variant text-lg md:text-xl leading-relaxed font-medium">
                In today's fast-paced world, finding the time and knowledge to prepare nutritious meals can be challenging. RecipeHub was built to simplify that process. We provide a comprehensive ecosystem where food enthusiasts, health-conscious individuals, and home cooks can discover hundreds of curated recipes, detailed nutritional data, and personalized meal planning tools.
              </p>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-12 border-y border-outline-variant/30">
              <div>
                <h3 className="text-primary font-black text-4xl mb-2">500+</h3>
                <p className="text-on-surface-variant font-bold uppercase tracking-widest text-xs">Healthy Recipes</p>
              </div>
              <div>
                <h3 className="text-primary font-black text-4xl mb-2">100%</h3>
                <p className="text-on-surface-variant font-bold uppercase tracking-widest text-xs">Nutritional Accuracy</p>
              </div>
              <div>
                <h3 className="text-primary font-black text-4xl mb-2">24/7</h3>
                <p className="text-on-surface-variant font-bold uppercase tracking-widest text-xs">Community Support</p>
              </div>
            </div>

            <section className="space-y-8">
              <h2 className="font-headline text-3xl font-black text-on-surface">Our Core Values</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
                <div className="p-8 rounded-[2rem] bg-white border border-outline-variant/20 shadow-sm">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6">
                    <span className="material-symbols-outlined">verified</span>
                  </div>
                  <h4 className="text-xl font-black text-on-surface mb-3">Integrity</h4>
                  <p className="text-on-surface-variant text-sm leading-relaxed font-medium">
                    We prioritize health safety. Every recipe and recommendation is cross-referenced with your dietary profile to ensure a safe and beneficial experience.
                  </p>
                </div>
                <div className="p-8 rounded-[2rem] bg-white border border-outline-variant/20 shadow-sm">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6">
                    <span className="material-symbols-outlined">auto_awesome</span>
                  </div>
                  <h4 className="text-xl font-black text-on-surface mb-3">Innovation</h4>
                  <p className="text-on-surface-variant text-sm leading-relaxed font-medium">
                    Using smart algorithms, we personalize your meal plans based on your specific health goals, whether it's managing diabetes or improving heart health.
                  </p>
                </div>
              </div>
            </section>

            <section className="max-w-2xl mx-auto py-10">
              <h2 className="font-headline text-3xl font-black text-on-surface mb-6">Our Commitment</h2>
              <p className="text-on-surface-variant text-lg leading-relaxed font-medium italic">
                "We are committed to providing you with the tools, knowledge, and inspiration you need to transform your kitchen into a center for health and happiness. Your wellbeing is our ultimate recipe for success."
              </p>
            </section>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}} />
    </>
  );
};

export default About;
