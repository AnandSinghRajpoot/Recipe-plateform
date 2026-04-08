import React from "react";

const resources = [
  {
    id: 1,
    title: "Balanced Nutrition 101",
    description:
      "Learn how to create balanced meals with the right mix of carbs, proteins, and fats for optimal energy.",
    image:
      "https://images.unsplash.com/photo-1510626176961-4b57d4fbad03?auto=format&fit=crop&w=800&q=80",
    link: "#",
  },
  {
    id: 2,
    title: "Meal Prep for Busy People",
    description:
      "Discover easy meal prep strategies to save time and eat healthy even on your busiest days.",
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
    link: "#",
  },
  {
    id: 3,
    title: "Top 10 Superfoods",
    description:
      "Boost your health with these nutrient-rich superfoods — perfect for smoothies, snacks, and meals.",
    image:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
    link: "#",
  },
  {
    id: 4,
    title: "Understanding Food Labels",
    description:
      "Decode nutrition facts and ingredients so you can make smarter choices at the grocery store.",
    image:
      "https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&w=800&q=80",
    link: "#",
  },
];

const Resources = () => {
  return (
    <div className="min-h-screen bg-[#fffaf5] py-16 px-6">
      {/* Header Section */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-[#2A3342] mb-4">
          Nutrition & Wellness Resources
        </h1>
        <p className="text-lg text-gray-600">
          Explore expert articles, guides, and tips to help you cook smarter,
          eat healthier, and live better.
        </p>
      </div>

      {/* Resource Cards */}
      <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {resources.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl shadow hover:shadow-lg transition duration-300 overflow-hidden"
          >
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-5">
              <h2 className="text-xl font-semibold text-[#2A3342] mb-2">
                {item.title}
              </h2>
              <p className="text-gray-600 text-sm mb-4">{item.description}</p>
              <a
                href={item.link}
                className="text-orange-500 font-medium hover:underline"
              >
                Read More →
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Resources;
