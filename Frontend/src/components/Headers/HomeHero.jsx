import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import MagneticWrapper from '../common/MagneticWrapper';

const HomeHero = () => {
    const navigate = useNavigate();
    const [displayText1, setDisplayText1] = useState("");
    const [displayText2, setDisplayText2] = useState("");
    const [showCursor, setShowCursor] = useState(true);

    const fullText1 = "Eat Smart,";
    const fullText2 = "Live Better";

    useEffect(() => {
        let i = 0;
        let j = 0;
        const typingSpeed = 100;

        const typeNextChar = () => {
            if (i < fullText1.length) {
                setDisplayText1(fullText1.substring(0, i + 1));
                i++;
                setTimeout(typeNextChar, typingSpeed);
            } else if (j < fullText2.length) {
                setDisplayText2(fullText2.substring(0, j + 1));
                j++;
                setTimeout(typeNextChar, typingSpeed + 50);
            }
        };

        const timeoutId = setTimeout(typeNextChar, 500);

        const cursorInterval = setInterval(() => {
            setShowCursor(prev => !prev);
        }, 500);

        return () => {
            clearTimeout(timeoutId);
            clearInterval(cursorInterval);
        };
    }, []);

    return (
        <section className="max-w-7xl mx-auto px-6 py-12 md:py-24 grid md:grid-cols-2 gap-12 items-center">
            <motion.div 
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-8"
            >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold uppercase tracking-wider">
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                    Scientifically Backed Nutrition
                </div>
                <h1 className="text-5xl md:text-7xl font-headline font-black text-on-surface tracking-tighter leading-none min-h-[2.2em] md:min-h-[2.2em]">
                    {displayText1} <br/>
                    <span className="text-primary italic">
                        {displayText2}
                        <span className={`inline-block w-[3px] h-[0.8em] bg-primary ml-1 align-middle transition-opacity duration-100 ${showCursor ? 'opacity-100' : 'opacity-0'}`}></span>
                    </span>
                </h1>
                <p className="text-xl text-on-surface-variant max-w-lg leading-relaxed font-medium">
                    Personalized nutrition planning for your unique goals. We combine metabolic logic with culinary wisdom to fuel your journey.
                </p>
                <div className="flex flex-wrap gap-6">
                    <MagneticWrapper>
                        <button 
                          onClick={() => navigate("/signup")}
                          className="vitality-gradient text-white px-8 py-4 rounded-xl font-bold text-lg botanical-shadow hover:opacity-90 transition-all active:scale-[0.98]"
                        >
                            Get Started
                        </button>
                    </MagneticWrapper>
                    <MagneticWrapper strength={0.3}>
                        <button 
                          onClick={() => navigate("/recipes")}
                          className="bg-secondary-container text-on-secondary-container px-8 py-4 rounded-xl font-bold text-lg hover:bg-surface-container-highest transition-all active:scale-[0.98]"
                        >
                            Explore Recipes
                        </button>
                    </MagneticWrapper>
                </div>
                <div className="flex items-center gap-4 pt-4">
                    <div className="flex -space-x-3">
                        <img className="w-10 h-10 rounded-full border-2 border-background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDVLjR8KrzgUfNl2sxjzmDlTQRQdl30ZPjruJmRJSlPEihUx1m50sY6AvN6lmpjYun15ruVUix0TkxvRQZSqq-OV8jkwiUI4bZ0fsiYcnZtm9BvNqQtsLpECBOpYttm2jHzqFvsHehBBo2aPcOJb8KmJ4I7ro2GwbN76gXXNv_nJJAb_htcJ3s2kBiFo6TJlgbBs46bKte3MX4dz4qzBrmF9E2siyS8eo_jtl79-9UEotR_EaC6D3GBR57ILLUQXz7JQFH2IEUw6mE" alt="Community member 1"/>
                        <img className="w-10 h-10 rounded-full border-2 border-background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCEpQLHHAVCYWWoUoK6SVu-LFmrFY9s44FAlCT3dQKzkyfAYYyew0HFC1jsdx19H6IuUor6qAs4cyzRBfs46cEtjiCKxXNc51iIFs5d4BQdRSuc-Wf5JEU2KLsQOO6WPH4_aYsBfQD6PXI8ifF3FovurTZqAb5AmkdYhtV2LgWtGeWe31uUhDMBsauIeY5AiaFZeXosZF2_InrR0B1gyhj-nmtTXJAlIJrWTGVCzQNJZRumRgWa4X8EEuA_R89fSu2hz8z4Kr_KP9g" alt="Community member 2"/>
                        <img className="w-10 h-10 rounded-full border-2 border-background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBbRdatt3lZgHLA1q_GtAMBIxP7hU5to8S6_4qnjnZuYnCaqULgtfc6NxtOtifucNvg1l3t4Fs3kRuijHrgixSOXfgcOi-WMcO35Xcqnqc86At2FIL8jJfUTM91lrDE-4lQr3DAh_7t8EX96tkNFDhlb9CsfEiDFDkY2Y7khoVwCHZY2YrmPmKNDW6-lZeDMmKs1He7teqA3dxSBmnMJS2558xyOz-FAIZFeGsjhS9UbNxoZp6VoKPocGB2Wix9L0SpWa6QI83JtxI" alt="Community member 3"/>
                    </div>
                    <p className="text-sm text-on-surface-variant font-bold opacity-80">Joined by 12,000+ healthy eaters</p>
                </div>
            </motion.div>
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, rotate: 5 }}
                animate={{ opacity: 1, scale: 1, rotate: 2 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="relative group"
            >
                <div className="absolute -top-12 -left-12 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -z-10 group-hover:bg-primary/20 transition-all duration-700"></div>
                
                {/* Floating Animation for the Card */}
                <motion.div 
                    animate={{ y: [0, -15, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="relative rounded-[2rem] overflow-hidden botanical-shadow transition-all duration-700 hover:scale-[1.02]"
                >
                    <img className="w-full aspect-[4/5] object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDBM6J1PPtTHLR0f8iqcpHxvf-h2miMDp9FfOHPO-vPPPKx0Vt1Uc5gpEm-OxyZ-a8RE9VQRe42gt6_E8J8hxHOGxdTihxKCy7fMYmEk7qDA9J9lNbnmYU3HWxHuMfFboaIdYUxh8j5G-ReXKwZczk73Lv-6eRHN1HejgU-_-2Csldk9vAAgOndOMj1XYlM7_sX_65lE1oXQnHq5A9lf9lQqtkEQWzBtC-CbYmnVqD79cwcY2vT1ji9mtOJS8nb2VUPn-KHzkVMgbA" alt="Healthy Vitality Bowl"/>
                    <div className="absolute bottom-6 left-6 right-6 p-6 bg-white/70 backdrop-blur-xl rounded-2xl border border-white/40">
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-xs font-black text-primary uppercase tracking-widest mb-1">Recipe of the day</p>
                                <h3 className="text-xl font-headline font-black text-on-surface">Avocado Vitality Bowl</h3>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-black text-on-surface">420</p>
                                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter">Kcal</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </section>
    );
};

export default HomeHero;
