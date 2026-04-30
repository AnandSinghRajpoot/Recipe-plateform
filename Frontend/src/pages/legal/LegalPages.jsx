import React from "react";
import BackButton from "../../components/common/BackButton";

const LegalPage = ({ title, content }) => {
  return (
    <div className="bg-surface font-body text-on-surface min-h-screen relative overflow-hidden py-32 px-6">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-30">
        <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] rounded-full bg-primary/10 blur-[150px]"></div>
        <div className="absolute top-[60%] -right-[10%] w-[50%] h-[50%] rounded-full bg-secondary-container/10 blur-[120px]"></div>
      </div>

      <div className="max-w-3xl mx-auto relative z-10">
        <div className="mb-12">
            <BackButton />
        </div>
        
        <header className="mb-16 text-center">
          <h1 className="font-headline text-5xl md:text-6xl font-black text-on-surface tracking-tighter mb-6">
            {title}
          </h1>
          <div className="w-20 h-1 vitality-gradient mx-auto rounded-full"></div>
        </header>

        <div className="bg-white/80 backdrop-blur-xl rounded-[3rem] p-8 md:p-16 border border-white botanical-shadow prose prose-slate max-w-none">
          {content}
        </div>
      </div>
    </div>
  );
};

export const PrivacyStrategy = () => (
  <LegalPage 
    title="Privacy Strategy"
    content={
      <div className="space-y-8 text-on-surface-variant font-medium leading-relaxed">
        <section>
          <h2 className="text-2xl font-black text-on-surface mb-4">Data Cultivation</h2>
          <p>At RecipeHub, we view your data as the seed of personalization. We only collect what is necessary to enhance your nutritional journey, ensuring your biological information remains your own.</p>
        </section>
        <section>
          <h2 className="text-2xl font-black text-on-surface mb-4">Metabolic Intelligence</h2>
          <p>Your health profiles and dietary preferences are encrypted and processed to provide tailored recommendations. We do not sell your vitality metrics to third-party data harvesters.</p>
        </section>
        <section>
          <h2 className="text-2xl font-black text-on-surface mb-4">Transparent Ecosystem</h2>
          <p>We believe in absolute transparency regarding how your interactions with our recipes and chefs are tracked to improve the greenhouse of our platform.</p>
        </section>
      </div>
    }
  />
);

export const TermsOfVitality = () => (
  <LegalPage 
    title="Terms of Vitality"
    content={
      <div className="space-y-8 text-on-surface-variant font-medium leading-relaxed">
        <section>
          <h2 className="text-2xl font-black text-on-surface mb-4">Community Conduct</h2>
          <p>By entering the RecipeHub ecosystem, you agree to foster a culture of respect, health, and botanical appreciation. Our platform is a collaborative space for culinary exploration.</p>
        </section>
        <section>
          <h2 className="text-2xl font-black text-on-surface mb-4">Intellectual Gastronomy</h2>
          <p>Recipes and content shared by our verified chefs are protected assets. While we encourage sharing and cooking, the systematic extraction of our culinary intelligence is prohibited.</p>
        </section>
        <section>
          <h2 className="text-2xl font-black text-on-surface mb-4">Nutritional Disclaimer</h2>
          <p>Our intelligence is supplementary. While we provide data-driven insights, always consult with healthcare professionals regarding your specific medical and nutritional needs.</p>
        </section>
      </div>
    }
  />
);

export const CookieEthics = () => (
  <LegalPage 
    title="Cookie Ethics"
    content={
      <div className="space-y-8 text-on-surface-variant font-medium leading-relaxed">
        <section>
          <h2 className="text-2xl font-black text-on-surface mb-4">Purposeful Tracking</h2>
          <p>We use cookies not for surveillance, but for resonance. They help us remember your flavor preferences and ensure your session remains secure as you navigate our greenhouse.</p>
        </section>
        <section>
          <h2 className="text-2xl font-black text-on-surface mb-4">Preference Preservation</h2>
          <p>Essential cookies help maintain your dietary filters and shopping lists. Without these, the personalized experience would lose its biological focus.</p>
        </section>
        <section>
          <h2 className="text-2xl font-black text-on-surface mb-4">Consent Management</h2>
          <p>You have full control over non-essential tracking. You can choose to harvest the benefits of deep personalization or opt for a more anonymous exploration.</p>
        </section>
      </div>
    }
  />
);
