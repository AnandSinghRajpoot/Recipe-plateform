import React, { useState } from 'react';
import { IoStar, IoStarOutline } from 'react-icons/io5';

const StarRating = ({ rating, onRatingChange, readonly = false, size = 24 }) => {
    const [hoverRating, setHoverRating] = useState(0);

    const handleClick = (value) => {
        if (!readonly && onRatingChange) {
            onRatingChange(value);
        }
    };

    const handleMouseEnter = (value) => {
        if (!readonly) {
            setHoverRating(value);
        }
    };

    const handleMouseLeave = () => {
        if (!readonly) {
            setHoverRating(0);
        }
    };

    const displayRating = hoverRating || rating || 0;

    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => handleClick(star)}
                    onMouseEnter={() => handleMouseEnter(star)}
                    onMouseLeave={handleMouseLeave}
                    className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-all duration-150`}
                    disabled={readonly}
                >
                    {star <= displayRating ? (
                        <IoStar
                            size={size}
                            className="text-yellow-400 fill-yellow-400 drop-shadow-sm"
                        />
                    ) : (
                        <IoStarOutline
                            size={size}
                            className="text-yellow-400"
                        />
                    )}
                </button>
            ))}
            {rating > 0 && (
                <span className="ml-2 text-sm text-on-surface-variant font-medium">
                    {rating.toFixed(1)}
                </span>
            )}
        </div>
    );
};

export default StarRating;