import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import VanillaTilt from "vanilla-tilt";
import MagneticWrapper from "../../components/common/MagneticWrapper";

const resources = [
  {
    id: 1,
    title: "Balanced Nutrition 101",
    category: "Metabolic Basics",
    description:
      "Learn how to create balanced meals with the right mix of carbs, proteins, and fats for optimal energy.",
    image:
      "https://images.unsplash.com/photo-1510626176961-4b57d4fbad03?auto=format&fit=crop&w=800&q=80",
    link: "#",
  },
  {
    id: 2,
    title: "Meal Prep for Busy People",
    category: "Lifestyle Prep",
    description:
      "Discover easy meal prep strategies to save time and eat healthy even on your busiest days.",
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
    link: "#",
  },
  {
    id: 3,
    title: "Top 10 Superfoods",
    category: "Ingredient Intelligence",
    description:
      "Boost your health with these nutrient-rich superfoods — perfect for smoothies, snacks, and meals.",
    image:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
    link: "#",
  },
  {
    id: 4,
    title: "Understanding Food Labels",
    category: "Conscious Eating",
    description:
      "Decode nutrition facts and ingredients so you can make smarter choices at the grocery store.",
    image:
      "https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&w=800&q=80",
    link: "#",
  },
];

const ResourceCard = ({ item }) => {
  const cardRef = useRef(null);

  useEffect(() => {
    if (cardRef.current) {
      VanillaTilt.init(cardRef.current, {
        max: 8,
        speed: 400,
        glare: true,
        "max-glare": 0.1,
      });
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group bg-white/60 backdrop-blur-xl rounded-[2.5rem] botanical-shadow border border-white overflow-hidden flex flex-col h-full"
      ref={cardRef}
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={item.image}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
        />
        <div className="absolute top-5 left-5">
           <span className="px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-[10px] font-black uppercase tracking-widest text-white shadow-lg">
             {item.category}
           </span>
        </div>
      </div>
      <div className="p-8 flex flex-col flex-grow">
        <h2 className="text-2xl font-headline font-black text-on-surface mb-3 tracking-tight leading-tight group-hover:text-primary transition-colors">
          {item.title}
        </h2>
        <p className="text-on-surface-variant font-medium text-sm leading-relaxed opacity-70 mb-8 line-clamp-3">
          {item.description}
        </p>
        <div className="mt-auto">
          <a
            href={item.link}
            className="inline-flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px] hover:gap-3 transition-all"
          >
            Read Expert Insight
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </a>
        </div>
      </div>
    </motion.div>
  );
};

const Resources = () => {
  return (
    <div className="min-h-screen bg-surface font-body text-on-surface py-24 px-6 relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-30">
        <div className="absolute top-0 right-0 w-[60%] h-[60%] rounded-full bg-primary/10 blur-[150px]"></div>
        <div className="absolute bottom-0 left-0 w-[50%] h-[50%] rounded-full bg-secondary-container/10 blur-[120px]"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto mb-24 space-y-6"
        >
          <span className="inline-block px-5 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-black uppercase tracking-widest text-[10px]">
            Knowledge Repository
          </span>
          <h1 className="text-5xl md:text-7xl font-headline font-black text-on-surface tracking-tighter leading-tight">
            Nutrition & <br/><span className="text-primary italic animate-pulse">Wellness Insights</span>
          </h1>
          <p className="text-xl text-on-surface-variant font-medium leading-relaxed opacity-70">
            Explore curated intelligence, botanical guides, and metabolic strategies to help you cultivate a vibrant relationship with food.
          </p>
        </motion.div>

        {/* Resource Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {resources.map((item) => (
            <ResourceCard key={item.id} item={item} />
          ))}
        </div>

        {/* Global CTA Section */}
        <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="mt-32 p-12 md:p-20 rounded-[4rem] vitality-gradient text-white text-center space-y-8 shadow-[0_48px_96px_rgba(0,110,28,0.2)] overflow-hidden relative"
        >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 animate-pulse"></div>
            <div className="relative z-10 space-y-6">
                <h3 className="text-4xl md:text-6xl font-headline font-black tracking-tighter">Ready to optimize?</h3>
                <p className="text-xl opacity-80 font-medium max-w-xl mx-auto">
                    Join our newsletter to receive weekly metabolic intelligence and seasonal harvest alerts.
                </p>
                <div className="pt-6">
                    <MagneticWrapper>
                        <button className="bg-white text-primary px-12 py-5 rounded-2xl font-black text-xl shadow-xl hover:scale-105 active:scale-95 transition-all">
                            Join the Greenhouse
                        </button>
                    </MagneticWrapper>
                </div>
            </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Resources;
