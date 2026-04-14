import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../utils/apiClient';
import HorizontalCard from '../components/Headers/HorizontalCard';
import { HorizontalRecipeListSkeleton } from '../components/common/LoadingSkeleton';
import generalProfilePic from '../assets/general-profile-pic.png';

const ChefProfile = () => {
    const { id } = useParams();
    const [chef, setChef] = useState(null);
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChefData = async () => {
            try {
                setLoading(true);
                const chefRes = await apiClient.get(`/auth/profile/${id}`);
                const chefData = chefRes.data.data || chefRes.data;
                setChef(chefData);

                const recipesRes = await apiClient.get(`/recipes?authorId=${id}`);
                setRecipes(recipesRes.data.data);
            } catch (err) {
                console.error("Error fetching chef profile:", err);
                setChef(null);
            } finally {
                setLoading(false);
            }
        };
        fetchChefData();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white py-12 px-4">
                <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
                    <div className="flex gap-8">
                        <div className="w-32 h-32 rounded-full bg-gray-200"></div>
                        <div className="flex-1 space-y-4">
                            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="aspect-square bg-gray-200"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!chef) return <div className="min-h-screen bg-white flex items-center justify-center text-xl font-medium text-gray-600">Chef not found.</div>;

    const totalLikes = recipes.reduce((sum, r) => sum + (r.likesCount || 0), 0);
    const totalSaves = recipes.reduce((sum, r) => sum + (r.savedCount || 0), 0);

    return (
        <div className="min-h-screen bg-white font-sans">
            <div className="max-w-4xl mx-auto py-12 px-4">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row gap-8 mb-8">
                    {/* Profile Picture */}
                    <div className="flex-shrink-0">
                        <img
                            src={chef.profilePhoto || generalProfilePic}
                            className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border border-gray-300"
                            alt={chef.name}
                            onError={(e) => { e.target.src = generalProfilePic; }}
                        />
                    </div>

                    {/* Info Section */}
                    <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                            <h1 className="text-2xl font-light">{chef.name}</h1>
                            <button className="px-4 py-1.5 bg-primary text-white rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors">
                                Follow
                            </button>
                        </div>

                        {/* Stats */}
                        <div className="flex gap-8 mb-4 text-sm">
                            <div>
                                <span className="font-semibold">{recipes.length}</span> posts
                            </div>
                            <div>
                                <span className="font-semibold">{totalLikes}</span> likes
                            </div>
                            <div>
                                <span className="font-semibold">{totalSaves}</span> saves
                            </div>
                        </div>

                        {/* Bio */}
                        <div className="text-sm">
                            <p className="font-semibold">{chef.name}</p>
                            {chef.bio && <p className="mt-1 whitespace-pre-line">{chef.bio}</p>}
                            {chef.websiteLink && (
                                <a href={chef.websiteLink} target="_blank" rel="noreferrer" className="text-blue-900 hover:underline mt-1 block">
                                    {chef.websiteLink}
                                </a>
                            )}
                            {chef.instagramLink && (
                                <a href={chef.instagramLink} target="_blank" rel="noreferrer" className="text-blue-900 hover:underline mt-1 block">
                                    Instagram
                                </a>
                            )}
                            {chef.youtubeLink && (
                                <a href={chef.youtubeLink} target="_blank" rel="noreferrer" className="text-blue-900 hover:underline mt-1 block">
                                    YouTube
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-300 mb-4"></div>

                {/* Tabs */}
                <div className="flex justify-center mb-4">
                    <div className="flex gap-8">
                        <button className="text-sm font-semibold border-t border-black pt-3 px-4">
                            <span className="material-symbols-outlined text-sm">grid_view</span>
                            POSTS
                        </button>
                        <button className="text-sm text-gray-500 pt-3 px-4">
                            <span className="material-symbols-outlined text-sm">movie</span>
                            REELS
                        </button>
                        <button className="text-sm text-gray-500 pt-3 px-4">
                            <span className="material-symbols-outlined text-sm">bookmark</span>
                            SAVED
                        </button>
                    </div>
                </div>

                {/* Recipe Grid */}
                {recipes.length > 0 ? (
                    <div className="grid grid-cols-3 gap-1">
                        {recipes.map((recipe) => (
                            <Link
                                key={recipe.id}
                                to={`/items/${recipe.id}`}
                                className="aspect-square relative group"
                            >
                                <img
                                    src={recipe.coverImageUrl}
                                    alt={recipe.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white">
                                    <span className="material-symbols-outlined">favorite</span>
                                    <span className="text-sm font-semibold">{recipe.likesCount || 0}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <span className="material-symbols-outlined text-6xl text-gray-300">grid_view</span>
                        <p className="mt-4 text-gray-600">No posts yet</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChefProfile;
