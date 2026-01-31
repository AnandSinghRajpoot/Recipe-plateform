import React from 'react';
import { Link } from 'react-router-dom';
import { GoClock } from "react-icons/go";
import { HiOutlineChartBar } from "react-icons/hi";

const HorizontalCard = ({ item }) => {
    const title = item?.title || item?.name || "Untitled Recipe";
    const description = item?.description || "No description available.";
    const difficulty = item?.difficulty || "Medium";
    const prepTime = item?.prepTime !== undefined ? item?.prepTime : (item?.more?.[0]?.prep_time || "N/A");
    const id = item?.id || item?._id;
    const imageUrl = item?.coverImageUrl || item?.thumbnail_image || "https://images.unsplash.com/photo-1495521821757-a1efb6729352?q=80&w=2000&auto=format&fit=crop";

    const getDifficultyColor = (diff) => {
        switch (diff?.toUpperCase()) {
            case 'EASY': return 'text-green-600 bg-green-50';
            case 'MEDIUM': return 'text-orange-600 bg-orange-50';
            case 'HARD': return 'text-red-600 bg-red-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    return (
        <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col md:flex-row h-full md:h-64">
            {/* Image Container */}
            <div className="relative w-full md:w-80 flex-shrink-0 overflow-hidden">
                <img 
                    src={imageUrl} 
                    alt={title} 
                    className="w-full h-48 md:h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getDifficultyColor(difficulty)}`}>
                        {difficulty}
                    </span>
                </div>
            </div>

            {/* Content Container */}
            <div className="flex-grow p-6 flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-orange-500 text-xs font-bold uppercase tracking-widest">
                            {item?.category || "General"}
                        </span>
                    </div>
                    
                    <Link to={`/items/${id}`}>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-orange-500 transition-colors">
                            {title}
                        </h3>
                    </Link>
                    
                    <p className="text-gray-600 text-sm line-clamp-2 mb-4 leading-relaxed">
                        {description}
                    </p>
                </div>

                <div className="flex items-center gap-6 mt-auto">
                    <div className="flex items-center text-gray-500 text-sm">
                        <GoClock className="mr-2 text-orange-400" size={18} />
                        <span className="font-medium">{prepTime} {typeof prepTime === 'number' ? 'mins' : ''}</span>
                    </div>
                    <div className="flex items-center text-gray-500 text-sm">
                        <HiOutlineChartBar className="mr-2 text-orange-400" size={18} />
                        <span className="font-medium">{item?.ingredients?.length || 0} Ingredients</span>
                    </div>
                    
                    <Link 
                        to={`/items/${id}`}
                        className="ml-auto text-orange-500 font-bold text-sm hover:translate-x-1 transition-transform flex items-center"
                    >
                        View Recipe <span className="ml-1">→</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default HorizontalCard;
