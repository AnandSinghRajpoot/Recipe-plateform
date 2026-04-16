import React from 'react';
import StarRating from './StarRating';
import { formatDistanceToNow } from 'date-fns';

const ReviewCard = ({ review, onEdit, onDelete }) => {
    const formatDate = (dateString) => {
        try {
            return formatDistanceToNow(new Date(dateString), { addSuffix: true });
        } catch (e) {
            return 'Recently';
        }
    };

    return (
        <div className="bg-white rounded-[2rem] border-[4px] border-white p-8 botanical-shadow hover:-translate-y-1 transition-all duration-300 relative group mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-surface-container-low/50 to-transparent rounded-[1.8rem] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
            <div className="relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-6 gap-4">
                    <div className="flex items-center gap-4">
                        {review.author?.profilePhoto ? (
                            <img
                                src={review.author.profilePhoto}
                                alt={review.author.name}
                                className="w-14 h-14 rounded-[1rem] object-cover shadow-sm bg-surface-container-high"
                            />
                        ) : (
                            <div className="w-14 h-14 rounded-[1rem] bg-primary/10 flex items-center justify-center text-primary font-black text-xl shadow-sm">
                                {(review.author?.name || 'A').charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div>
                            <div className="font-headline font-black text-lg text-on-surface">{review.author?.name || 'Anonymous User'}</div>
                            <div className="text-xs font-bold uppercase tracking-widest text-on-surface-variant opacity-70 mt-1">
                                {review.author?.role || 'Community Member'} • {formatDate(review.createdAt)}
                            </div>
                        </div>
                    </div>

                    {review.isOwner && (
                        <div className="flex gap-2">
                            <button
                                onClick={() => onEdit(review)}
                                className="px-4 py-2 text-xs font-black text-primary bg-primary/5 hover:bg-primary/20 rounded-xl transition-all"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => onDelete(review.id)}
                                className="px-4 py-2 text-xs font-black text-error bg-error/5 hover:bg-error/20 rounded-xl transition-all"
                            >
                                Delete
                            </button>
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <StarRating rating={review.rating} readonly size={20} />

                    {review.reviewText && (
                        <p className="text-on-surface leading-loose text-lg font-medium opacity-90">{review.reviewText}</p>
                    )}
                </div>

                {review.updatedAt && review.updatedAt !== review.createdAt && (
                    <div className="mt-6 text-[10px] uppercase font-bold tracking-widest text-on-surface-variant opacity-50">
                        Updated {formatDate(review.updatedAt)}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReviewCard;