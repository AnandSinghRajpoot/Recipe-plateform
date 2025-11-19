import React from "react";

const About = () => {
  return (
    <div className="min-h-screen bg-[#fffaf5] py-16 px-6 flex flex-col items-center">
      {/* Header */}
      <div className="text-center max-w-3xl mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-[#2A3342] mb-4">
          About <span className="text-orange-500">RecipeHub</span>
        </h1>
        <p className="text-gray-600 text-base md:text-lg">
          Your all-in-one destination for discovering healthy recipes, balanced nutrition, 
          and mindful eating — made simple, delicious, and sustainable.
        </p>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
        {/* Left: Image */}
        <img
          src="https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=80"
          alt="Healthy food"
          className="rounded-2xl shadow-md w-full object-cover"
        />

        {/* Right: Description */}
        <div>
          <h2 className="text-2xl font-semibold text-[#2A3342] mb-3">
            🥗 Our Mission
          </h2>
          <p className="text-gray-700 mb-6 leading-relaxed">
            At <span className="font-semibold text-orange-500">RecipeHub</span>, our goal is to help people
            make healthier food choices without compromising on taste.
            We combine the joy of cooking with the science of nutrition to bring you
            recipes that are balanced, simple, and packed with flavor.
          </p>

          <h2 className="text-2xl font-semibold text-[#2A3342] mb-3">
            🍴 What We Offer
          </h2>
          <ul className="list-disc list-inside text-gray-700 leading-relaxed">
            <li>Hundreds of curated recipes for all diets and goals.</li>
            <li>Detailed nutrition breakdown — calories, proteins, carbs, and fats.</li>
            <li>Smart filters for vegetarian, vegan, gluten-free, and keto meals.</li>
            <li>Cooking tips, meal plans, and ingredient substitutions.</li>
          </ul>

          <h2 className="text-2xl font-semibold text-[#2A3342] mt-6 mb-3">
            🌍 Why Choose Us?
          </h2>
          <p className="text-gray-700 leading-relaxed">
            We believe eating healthy should be fun, creative, and achievable for everyone.
            Whether you’re a beginner in the kitchen or a nutrition enthusiast,
            <span className="font-semibold text-orange-500">RecipeHub</span> gives you
            everything you need to cook smart, eat healthy, and live better.
          </p>
        </div>
      </div>

      {/* Footer Quote */}
      <div className="text-center mt-16 max-w-2xl">
        <p className="text-xl italic text-gray-600">
          “Good nutrition isn’t about restriction — it’s about balance, creativity, and joy in every bite.”
        </p>
      </div>
    </div>
  );
};

export default About;
