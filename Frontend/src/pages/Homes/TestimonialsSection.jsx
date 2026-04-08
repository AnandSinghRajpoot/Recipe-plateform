import React from 'react';

const TestimonialsSection = () => {
    const testimonials = [
        {
            name: "Marcus Thorne",
            role: "Software Architect",
            text: "RecipeHub changed how I view my morning fuel. No more brain fog, just clean energy that lasts all day through intensive coding sessions.",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA-CEVtajgIx1qV8tYWORCmo_dCAE-Te6OZ9_T14n1fDeYcZL9eZMcbrHEIvaCEtWNUg2CULk99D1cw00d0mTOh5VkFGbZBLLjx7GZMbBRU4fi2GTL02SbfcwXh7qf76E3Syi6x6HtXWbTMLdY5kEoBZGk0mWDM4aEWkW4dHCA1zrmKcBXnlJSdvtdQrcfm1vbupWLUhZCPXmrpifdNraq4gRQc6x4z9PQ8fMzNNdktciIJfUtrrUNADdFrCl-Upv3rgw4pWm6XhZM"
        },
        {
            name: "Elena Rodriguez",
            role: "Yoga Instructor",
            text: "Finally, an app that understands I'm human. The recipes are gourmet level but simple enough for my busy weekdays and mindful practice.",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAMMWYWbFanpK3XOwVIyPBjwLNxYd7idabBC4GKPE4EPfn7htZsBZZ3WSuREm7ATwBqKUfZok-XKD5fJHaHAYEqYoxCozCdqdKZqJXuQIedH0OSgZ8Dno6pm8K-S4HAMyVpO9x7a5fn4bApMwkGYAUTuEvIOy_O0stjJY8LdIO2k0OUn7tV00DfYyRrzVL7ZPtRL-Bx36n0kXe1Mv6ZycbH5q_xDlt4TrmDYk-fR4ifM7Eg_PBfgcxZO1kXPr25Ki-hp_DY9g8zOAY",
            featured: true
        },
        {
            name: "Dr. Julian Vance",
            role: "Clinical Researcher",
            text: "The science-first philosophy is incredible. I'm actually learning why certain foods make me feel better, not just following a restrictive list.",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCSJklYClSJq9vNWbYFX22ypaY8C834NmOljmvWgfmwHKOG1L83VtxeC975gvUeU2JuMRKytZ5lsOS_dPKjO7uBn3scLzUnXGhtxlpRAJyRLXbxY_AJa20ueG7_Y2GV_nhdrrH7CkHJ9EqLTdacb6iWtF0PrpPTBgqgKv0dgZtaI_PE4ljTWy39bhc2w8gLAgV14fWuBdTNByqcOB0rLUcmHAglu9Xa617otdKnXNjDPWWg-FVYpbiv_StCPQlmWQcIc6UIHLpiG2I"
        }
    ];

    return (
        <section className="py-24 px-6 max-w-7xl mx-auto">
            <div className="text-center mb-20">
                <span className="text-primary font-black tracking-widest uppercase text-xs">Community Voices</span>
                <h2 className="text-4xl md:text-5xl font-headline font-black text-on-surface mt-4 tracking-tight">Loved by thousands of <span className="text-primary">Optimizers</span></h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {testimonials.map((t, index) => (
                    <div 
                      key={index} 
                      className={`bg-surface-container p-10 rounded-[2.5rem] space-y-8 relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] border border-outline-variant/10 ${t.featured ? 'md:translate-y-12' : ''}`}
                    >
                        {t.featured && <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-8 -mt-8"></div>}
                        <div className="flex gap-1 text-primary">
                            {[...Array(5)].map((_, i) => (
                                <span key={i} className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                            ))}
                        </div>
                        <p className="text-xl italic text-on-surface-variant leading-relaxed font-medium">
                            "{t.text}"
                        </p>
                        <div className="flex items-center gap-5 pt-4 border-t border-outline-variant/10">
                            <img className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md" src={t.image} alt={t.name}/>
                            <div>
                                <p className="font-black text-on-surface">{t.name}</p>
                                <p className="text-[10px] text-primary uppercase font-black tracking-widest">{t.role}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default TestimonialsSection;
