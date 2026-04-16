import React, { useState, useEffect } from 'react';
import StarRating from './StarRating';
import ReviewForm from './ReviewForm';
import ReviewCard from './ReviewCard';
import apiClient from '../../utils/apiClient';
import toast from 'react-hot-toast';

const ReviewsSection = ({ recipeId }) => {
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState({ averageRating: 0, reviewCount: 0 });
    const [userReview, setUserReview] = useState(null);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [editingReview, setEditingReview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('token'));

    useEffect(() => {
        fetchReviews();
        fetchStats();
        if (token) {
            fetchUserReview();
        }
    }, [recipeId, token]);

    const fetchReviews = async () => {
        try {
            const response = await apiClient.get(`/reviews/recipe/${recipeId}`);
            setReviews(response.data.data || []);
        } catch (err) {
            console.error('Failed to fetch reviews');
        } finally {
            setLoading(false);
        }
    };

    const updateGridCache = (avg, count) => {
        try {
            const cached = sessionStorage.getItem('recipesDataCache');
            if (cached) {
                const parsed = JSON.parse(cached);
                if (parsed.items) {
                    parsed.items = parsed.items.map(item => {
                        if (String(item.id) === String(recipeId) || String(item._id) === String(recipeId)) {
                            return { ...item, averageRating: avg, reviewCount: count };
                        }
                        return item;
                    });
                    sessionStorage.setItem('recipesDataCache', JSON.stringify(parsed));
                }
            }
        } catch (e) {}
    };

    const fetchStats = async () => {
        try {
            const response = await apiClient.get(`/reviews/recipe/${recipeId}/stats`);
            const data = response.data.data || { averageRating: 0, reviewCount: 0 };
            setStats(data);
            updateGridCache(data.averageRating, data.reviewCount);
        } catch (err) {
            console.error('Failed to fetch stats');
        }
    };

    const fetchUserReview = async () => {
        try {
            const response = await apiClient.get(`/reviews/recipe/${recipeId}/my-review`);
            if (response.data.data) {
                setUserReview(response.data.data);
            }
        } catch (err) {
            // User hasn't reviewed this recipe
        }
    };

    const handleReviewSubmitted = () => {
        setShowReviewForm(false);
        setEditingReview(null);
        fetchReviews();
        fetchStats();
        fetchUserReview();
    };

    const handleEditReview = (review) => {
        setEditingReview(review);
        setShowReviewForm(true);
    };

    const handleDeleteReview = async (reviewId) => {
        if (!confirm('Are you sure you want to delete your review?')) return;

        try {
            await apiClient.delete(`/reviews/${reviewId}`);
            toast.success('Review deleted successfully');
            setUserReview(null);
            fetchReviews();
            fetchStats();
        } catch (err) {
            toast.error('Failed to delete review');
        }
    };

    const handleCancel = () => {
        setShowReviewForm(false);
        setEditingReview(null);
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-12">
            {/* Rating Stats */}
            <div className="bg-white rounded-[2.5rem] border-[4px] border-white p-8 md:p-12 botanical-shadow relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none group-hover:bg-primary/10 transition-colors"></div>
                <h3 className="text-3xl font-headline font-black text-on-surface mb-8 relative z-10">
                    Reviews & Ratings
                </h3>

                <div className="flex flex-col md:flex-row items-center gap-10 mb-8 relative z-10">
                    <div className="text-center md:text-left bg-surface-container-low px-8 py-6 rounded-[2rem] min-w-[200px]">
                        <div className="text-5xl font-black text-primary mb-2 font-headline leading-none">
                            {stats.averageRating.toFixed(1)}
                        </div>
                        <StarRating rating={stats.averageRating} readonly size={24} />
                        <div className="text-sm font-bold text-on-surface-variant mt-3 uppercase tracking-widest">
                            {stats.reviewCount} review{stats.reviewCount !== 1 ? 's' : ''}
                        </div>
                    </div>

                    {token && (
                        <div className="flex-1 w-full">
                            {userReview ? (
                                <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-primary/5 p-6 rounded-[2rem] border border-primary/10">
                                    <div className="text-center md:text-left">
                                        <div className="text-[10px] uppercase tracking-widest font-black text-primary mb-2">Your Rating</div>
                                        <StarRating rating={userReview.rating} readonly size={20} />
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEditReview(userReview)}
                                            className="px-6 py-3 text-sm font-black bg-white shadow-sm text-primary hover:scale-[1.02] active:scale-[0.98] rounded-2xl transition-all"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteReview(userReview.id)}
                                            className="px-6 py-3 text-sm font-black text-error bg-error/10 hover:bg-error/20 active:scale-[0.98] rounded-2xl transition-all"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowReviewForm(true)}
                                    className="w-full py-5 rounded-[2rem] vitality-gradient text-white font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                >
                                    Write a Review
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {!token && (
                    <div className="text-center py-4 border-t border-outline-variant/10">
                        <p className="text-on-surface-variant text-sm">
                            <a href="/login" className="text-primary font-bold hover:underline">Login</a> to leave a review
                        </p>
                    </div>
                )}
            </div>

            {/* Review Form */}
            {(showReviewForm && token) && (
                <ReviewForm
                    recipeId={recipeId}
                    existingReview={editingReview}
                    onReviewSubmitted={handleReviewSubmitted}
                    onCancel={handleCancel}
                />
            )}

            {/* Reviews List */}
            {reviews.length > 0 && (
                <div className="space-y-6 pt-8">
                    <h4 className="text-2xl font-headline font-black text-on-surface flex items-center gap-4">
                        Community Insights
                        <span className="text-sm font-bold bg-primary/10 text-primary px-4 py-1.5 rounded-full">{reviews.length}</span>
                    </h4>

                    {reviews.map((review) => (
                        <ReviewCard
                            key={review.id}
                            review={review}
                            onEdit={handleEditReview}
                            onDelete={handleDeleteReview}
                        />
                    ))}
                </div>
            )}

            {reviews.length === 0 && (
                <div className="text-center py-16 bg-white/40 backdrop-blur-md rounded-[2.5rem] border border-white/60 space-y-4">
                    <div className="w-20 h-20 bg-white rounded-[1.5rem] shadow-sm flex items-center justify-center mx-auto mb-6 text-on-surface-variant transition-colors">
                        <span className="material-symbols-outlined text-4xl">rate_review</span>
                    </div>
                    <h4 className="text-2xl font-headline font-black text-on-surface mb-2">No Reviews Yet</h4>
                    <p className="text-on-surface-variant font-medium text-lg opacity-60">Be the first to share your experience with this composition!</p>
                </div>
            )}
        </div>
    );
};

export default ReviewsSection;