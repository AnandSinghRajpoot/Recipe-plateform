import React from 'react';
import { Link } from "react-router-dom";

const Footer = () => {
    return (
        <footer className="bg-surface-container-low w-full py-20 px-8 border-t border-outline-variant/10">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-16">
                    {/* Brand & Description */}
                    <div className="md:col-span-2 space-y-8">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg vitality-gradient shadow-lg"></div>
                            <span className="text-3xl font-headline font-black text-on-surface tracking-tighter">RecipeHub</span>
                        </div>
                        <p className="text-md text-on-surface-variant font-medium leading-relaxed max-w-sm opacity-80">
                            Synthesizing ancient culinary wisdom with modern intelligence to create your ultimate personal nutrition guide. Fueling your vibrant lifestyle through science and gastronomy.
                        </p>
                        <div className="flex gap-6">
                            <a href="#" className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-on-surface-variant hover:text-primary hover:shadow-lg transition-all">
                                <span className="material-symbols-outlined text-lg">social_leaderboard</span>
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-on-surface-variant hover:text-primary hover:shadow-lg transition-all">
                                <span className="material-symbols-outlined text-lg">camera</span>
                            </a>
                        </div>
                    </div>

                    {/* Navigation Columns */}
                    <div className="grid grid-cols-2 gap-10 md:col-span-2">
                        <div className="space-y-6">
                            <p className="text-xs font-black uppercase tracking-widest text-primary">Platform</p>
                            <ul className="space-y-4">
                                <li><Link className="text-on-surface-variant font-bold hover:text-primary transition-all text-sm" to="/about">About</Link></li>
                                <li><Link className="text-on-surface-variant font-bold hover:text-primary transition-all text-sm" to="/recipes">Our Science</Link></li>
                                <li><Link className="text-on-surface-variant font-bold hover:text-primary transition-all text-sm" to="/resources">Curated Plans</Link></li>
                                <li><Link className="text-on-surface-variant font-bold hover:text-primary transition-all text-sm" to="/contact">Expert Advice</Link></li>
                            </ul>
                        </div>
                        <div className="space-y-6">
                            <p className="text-xs font-black uppercase tracking-widest text-primary">Legal</p>
                            <ul className="space-y-4">
                                <li><Link className="text-on-surface-variant font-bold hover:text-primary transition-all text-sm" to="#">Privacy Strategy</Link></li>
                                <li><Link className="text-on-surface-variant font-bold hover:text-primary transition-all text-sm" to="#">Terms of Vitality</Link></li>
                                <li><Link className="text-on-surface-variant font-bold hover:text-primary transition-all text-sm" to="#">Cookie Ethics</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-20 pt-10 border-t border-outline-variant/10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-xs text-on-surface-variant font-bold opacity-60">© {new Date().getFullYear()} RecipeHub Ecosystem. All rights reserved.</p>
                    <div className="flex gap-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary opacity-50 px-3 py-1 bg-primary/5 rounded-full italic animate-pulse">Intelligently Organic</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
