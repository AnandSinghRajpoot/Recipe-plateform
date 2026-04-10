import React, { useEffect, useState } from 'react';
import axios from 'axios';
import HomeHero from "../../components/Headers/HomeHero";
import FeaturesGrid from './FeaturesGrid';
import AboutSection from './AboutSection';
import TestimonialsSection from './TestimonialsSection';
import NewsLetter from './NewsLetter';
import CTASection from './CTASection';
import ScrollReveal from '../../components/common/ScrollReveal';

const Home = () => {
    const [profileData, setProfileData] = useState(null);
    const [dismissed, setDismissed] = useState(false);
    const [showReminder, setShowReminder] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

        const saved = localStorage.getItem("profileReminderDismissed");
        if (saved) {
            const hoursSince = (new Date() - new Date(saved)) / (1000 * 60 * 60);
            if (hoursSince < 24) return;
        }

        axios.get("http://localhost:8080/api/v1/auth/profile", {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => {
            const data = res.data;
            if (!data.isProfileCompleted || data.role === "USER") {
                setProfileData(data);
                setTimeout(() => setShowReminder(true), 2000);
            }
        })
        .catch(() => {});
    }, []);

    const handleDismiss = () => {
        setShowReminder(false);
        setDismissed(true);
        localStorage.setItem("profileReminderDismissed", new Date().toISOString());
    };

    const handleAccept = () => {
        window.location.href = "/profile/complete";
    };

    return (
        <div className="bg-surface font-body text-on-surface selection:bg-secondary-fixed selection:text-on-secondary-fixed scroll-smooth">
            {showReminder && profileData && (
                <div className="w-full vitality-gradient border-b border-primary/20">
                    <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white shrink-0">
                                <span className="material-symbols-outlined text-sm">tips_and_updates</span>
                            </div>
                            <div>
                                <p className="font-bold text-white">Complete your profile</p>
                                <p className="text-xs text-white/80">Get personalized recipe recommendations</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={handleAccept} className="px-4 py-2 bg-white text-primary rounded-lg font-bold text-sm hover:bg-white/90 transition-colors">
                                Add Details
                            </button>
                            <button onClick={handleDismiss} className="p-2 text-white/70 hover:text-white">
                                <span className="material-symbols-outlined text-lg">close</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <main className="min-h-screen">
                <ScrollReveal><HomeHero /></ScrollReveal>
                <ScrollReveal delay={0.2}><FeaturesGrid /></ScrollReveal>
                <ScrollReveal delay={0.2}><AboutSection /></ScrollReveal>
                <ScrollReveal delay={0.2}><TestimonialsSection /></ScrollReveal>
                <ScrollReveal delay={0.2}><NewsLetter /></ScrollReveal>
                <ScrollReveal delay={0.2}><CTASection /></ScrollReveal>
            </main>

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes pulse-ring {
                  0% { transform: scale(0.95); opacity: 0.5; }
                  50% { transform: scale(1.05); opacity: 0.8; }
                  100% { transform: scale(0.95); opacity: 0.5; }
                }
                .animate-pulse-ring { animation: pulse-ring 4s ease-in-out infinite; }
                .font-headline { font-family: 'Manrope', sans-serif; }
                .font-body { font-family: 'Plus Jakarta Sans', sans-serif; }
            `}} />
        </div>
    );
};

export default Home;
