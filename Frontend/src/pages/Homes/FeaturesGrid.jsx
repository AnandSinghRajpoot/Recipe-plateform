import React from 'react';

const FeaturesGrid = () => {
    return (
        <section className="bg-surface-container-low py-24 px-6 md:px-12 border-y border-outline-variant/5">
            <div className="max-w-7xl mx-auto">
                <div className="mb-20 text-center md:text-left">
                    <h2 className="text-4xl md:text-5xl font-headline font-black text-on-surface mb-6 tracking-tight">Intelligence <span className="italic text-primary">Grown Locally</span></h2>
                    <p className="text-on-surface-variant max-w-2xl text-lg font-medium opacity-80">We don't just count calories; we understand the biological synergy of your food and how it fuels your specific metabolic needs.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Feature 1: Smart Recommendations */}
                    <div className="md:col-span-2 bg-white/60 backdrop-blur-sm p-10 rounded-[2.5rem] botanical-shadow flex flex-col md:flex-row gap-10 items-center overflow-hidden border border-white">
                        <div className="flex-1 space-y-6">
                            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                            </div>
                            <h3 className="text-3xl font-headline font-black text-on-surface">Smart Recommendations</h3>
                            <p className="text-on-surface-variant leading-relaxed font-medium">Our metabolic logic learns your palate and health needs to suggest meals that don't just taste good—they perform for your body.</p>
                            <ul className="space-y-3">
                                <li className="flex items-center gap-3 text-sm font-black text-on-surface opacity-80">
                                    <span className="material-symbols-outlined text-primary text-xl">check_circle</span>
                                    Adaptive flavor profiles
                                </li>
                                <li className="flex items-center gap-3 text-sm font-black text-on-surface opacity-80">
                                    <span className="material-symbols-outlined text-primary text-xl">check_circle</span>
                                    Seasonal ingredient focus
                                </li>
                            </ul>
                        </div>
                        <div className="flex-1 -mr-20 -mb-20 mt-10 md:mt-0">
                            <img className="rounded-3xl shadow-2xl transition hover:scale-[1.03] duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAP0YCsWabAzsqz84CqDQEpOjP5yTH4XTg0JyoqqNP83UgeRomwP8TIhR2O7GdMkVDgPOvMv0l9cEFghd5l7QSbWvxHYQy4uZMc8wllvk9J2ITtaHt6HkjYR8ZiBqc0zQSWhNsTRAgKdnoV5C11U5JlVBAayZO_ATXd8QNNC0CsE8I4z_OeSk3xDV_dKKh7BP9WMvixlkJQfT4bQCuHHGooTxmgessVRZCYTPGSwkdht5Bq40XWKGmN3oDHZ6y0Lo3zSO7k3_Ggn3c" alt="Nutrition Logic Interface"/>
                        </div>
                    </div>

                    {/* Feature 2: Meal Planning */}
                    <div className="vitality-gradient p-10 rounded-[2.5rem] text-white flex flex-col justify-between shadow-xl shadow-primary/10 hover:scale-[1.02] transition-all">
                        <div className="space-y-6">
                            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                                <span className="material-symbols-outlined text-3xl">calendar_today</span>
                            </div>
                            <h3 className="text-3xl font-headline font-black leading-tight">Vibrant Meal <br/>Planning</h3>
                            <p className="text-white/80 leading-relaxed font-medium">Visual weekly calendars that sync with your grocery list and culinary schedule effortlessly.</p>
                        </div>
                        <div className="mt-8 pt-8 border-t border-white/20">
                            <div className="flex justify-between items-center group cursor-pointer">
                                <span className="text-sm font-black uppercase tracking-widest group-hover:mr-2 transition-all">View Calendar</span>
                                <span className="material-symbols-outlined group-hover:scale-110 transition-transform">arrow_forward</span>
                            </div>
                        </div>
                    </div>

                    {/* Feature 3: Nutrition Tracking */}
                    <div className="bg-surface-container-highest p-10 rounded-[2.5rem] flex flex-col justify-between border border-outline-variant/10">
                        <div className="space-y-6">
                            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                <span className="material-symbols-outlined text-3xl">insights</span>
                            </div>
                            <h3 className="text-3xl font-headline font-black text-on-surface">Deep Insights</h3>
                            <p className="text-on-surface-variant leading-relaxed font-medium">Deep dive into macronutrients, bio-availability, and long-term vitality trends with our analytics.</p>
                        </div>
                        <div className="mt-10 grid grid-cols-2 gap-4">
                            <div className="bg-white p-4 rounded-3xl text-center shadow-sm">
                                <p className="text-[10px] font-black text-outline-variant uppercase tracking-widest mb-1">Protein</p>
                                <p className="text-2xl font-black text-primary">84g</p>
                            </div>
                            <div className="bg-white p-4 rounded-3xl text-center shadow-sm">
                                <p className="text-[10px] font-black text-outline-variant uppercase tracking-widest mb-1">Fiber</p>
                                <p className="text-2xl font-black text-tertiary">32g</p>
                            </div>
                        </div>
                    </div>

                    {/* Feature 4: Sustainable Sourcing */}
                    <div className="md:col-span-2 bg-surface-container-lowest rounded-[2.5rem] overflow-hidden relative group border border-outline-variant/10">
                        <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD5u9C1PduHh8_3GFh4O2JKtAI-Mst4ipxjHpDmGNH1AT36EBYG95UPeCFAilfNm9E9TFUq5R9PZeY1FzK83GBfYf4EM1CczbuBmT7jZm2ke_kWWTCA7a9uLtdMNUzi-BUV452k1vvHlEHsiFa_65nLOI9gGX6ACHe55ETtYDSzdxr5fQdUtMYihQdAGBQzGExqfVmBOHKEx5LgWfVFzGs5POxiw_CsJPvtnHj-62a_S_UGUo83V2XrElxtK_mPXsCWRM-JjFozqW0" alt="Sustainable Ingredients"/>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-12">
                            <h3 className="text-4xl font-headline font-black text-white mb-4">Ethical Gastronomy</h3>
                            <p className="text-white/70 max-w-md text-lg font-medium">We track the origin of every ingredient to ensure your personal health doesn't cost the earth's vitality.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FeaturesGrid;
