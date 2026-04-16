import React, { useState, useEffect } from 'react';
import StarRating from './StarRating';
import apiClient from '../../utils/apiClient';
import toast from 'react-hot-toast';

const ReviewForm = ({ recipeId, existingReview, onReviewSubmitted, onCancel }) => {
    const [rating, setRating] = useState(existingReview?.rating || 0);
    const [reviewText, setReviewText] = useState(existingReview?.reviewText || '');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (rating === 0) {
            toast.error('Please select a rating');
            return;
        }

        if (reviewText.trim().length < 10) {
            toast.error('Please write at least 10 characters');
            return;
        }

        setLoading(true);
        try {
            const reviewData = { rating, reviewText };

            if (existingReview) {
                // Update existing review
                await apiClient.post(`/reviews/recipe/${recipeId}`, reviewData);
                toast.success('Review updated successfully!');
            } else {
                // Create new review
                await apiClient.post(`/reviews/recipe/${recipeId}`, reviewData);
                toast.success('Review submitted successfully!');
            }

            onReviewSubmitted();
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to submit review';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-outline-variant/10 p-6 shadow-sm">
            <h3 className="text-lg font-headline font-black text-on-surface mb-4">
                {existingReview ? 'Update Your Review' : 'Write a Review'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Rating */}
                <div>
                    <label className="text-sm font-bold text-on-surface-variant mb-2 block">
                        Your Rating
                    </label>
                    <StarRating
                        rating={rating}
                        onRatingChange={setRating}
                        size={28}
                    />
                </div>

                {/* Review Text */}
                <div>
                    <label className="text-sm font-bold text-on-surface-variant mb-2 block">
                        Your Review
                    </label>
                    <textarea
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder="Share your experience with this recipe..."
                        className="w-full min-h-[120px] p-4 rounded-xl border border-outline-variant/20 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 bg-surface-container-low text-on-surface placeholder:text-on-surface-variant/50 resize-none"
                        maxLength={1000}
                    />
                    <div className="text-xs text-on-surface-variant mt-1">
                        {reviewText.length}/1000 characters
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-3 rounded-xl vitality-gradient text-white font-black shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Submitting...' : (existingReview ? 'Update Review' : 'Submit Review')}
                    </button>

                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-6 py-3 rounded-xl bg-surface-container-high text-on-surface font-bold hover:bg-surface-container-highest transition-all"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default ReviewForm;