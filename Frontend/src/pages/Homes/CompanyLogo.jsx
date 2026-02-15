
import React from "react";

const companies = [
  {
    name: "Veg Delight",
    icon: "https://cdn-icons-png.flaticon.com/512/1046/1046784.png",
  },
  {
    name: "Spice Route",
    icon: "https://cdn-icons-png.flaticon.com/512/857/857681.png",
  },
  {
    name: "Healthy Bowl",
    icon: "https://cdn-icons-png.flaticon.com/512/2921/2921822.png",
  },
  {
    name: "Quick Bites",
    icon: "https://cdn-icons-png.flaticon.com/512/3075/3075977.png",
  },
  {
    name: "Home Kitchen",
    icon: "https://cdn-icons-png.flaticon.com/512/135/135620.png",
  },
];

const CompanyLogo = () => {
  return (
    <div className="py-24 sm:py-32 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <h2 className="text-center text-lg font-semibold text-gray-900 mb-10">
          Trusted by top recipe creators & home chefs
        </h2>

        {/* SLIDER */}
        <div className="relative w-full overflow-hidden">
          <div className="flex gap-16 animate-slide">
            {[...companies, ...companies].map((company, index) => (
              <div
                key={index}
                className="flex flex-col items-center min-w-[160px]"
              >
                <img
                  src={company.icon}
                  alt={company.name}
                  className="h-12 object-contain"
                />
                <span className="mt-2 text-sm font-semibold text-gray-700">
                  {company.name}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* CSS Animation */}
      <style>
        {`
          @keyframes slide {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }

          .animate-slide {
            animation: slide 20s linear infinite;
          }
        `}
      </style>
    </div>
  );
};

export default CompanyLogo;
