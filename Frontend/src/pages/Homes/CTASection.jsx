import React from 'react';
import { useNavigate } from "react-router-dom";

const CTASection = () => {
    const navigate = useNavigate();

    return (
        <section className="max-w-7xl mx-auto px-6 py-24">
            <div className="bg-on-surface rounded-[4rem] p-12 md:p-24 text-center relative overflow-hidden shadow-[0_48px_96px_rgba(0,0,0,0.2)]">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -z-0"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-tertiary/10 rounded-full blur-[100px] -z-0"></div>
                <div className="relative z-10 space-y-10">
                    <h2 className="text-4xl md:text-7xl font-headline font-black text-white tracking-tight leading-tight">Ready to grow your <span className="text-primary-fixed">potential?</span></h2>
                    <p className="text-white/60 text-xl max-w-2xl mx-auto font-medium leading-relaxed">Start your healthy lifestyle journey today. No barriers, just a hunger for better living and vibrant energy.</p>
                    <div className="flex flex-col sm:flex-row justify-center gap-6 pt-4">
                        <button 
                          onClick={() => navigate("/signup")}
                          className="vitality-gradient text-white px-12 py-5 rounded-2xl font-black text-xl hover:scale-105 active:scale-[0.98] transition-all shadow-2xl"
                        >
                            Begin Your Journey
                        </button>
                        <button 
                          onClick={() => navigate("/contact")}
                          className="bg-white/10 hover:bg-white/20 text-white px-12 py-5 rounded-2xl font-black text-xl backdrop-blur-md transition-all border border-white/10 hover:scale-105 active:scale-[0.98]"
                        >
                            Talk to an Expert
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CTASection;
