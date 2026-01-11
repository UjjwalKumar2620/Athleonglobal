import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: 'sm' | 'md' | 'lg';
}

const StarRating: React.FC<StarRatingProps> = ({ rating, maxStars = 5, size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: maxStars }).map((_, index) => {
        const fillPercentage = Math.min(100, Math.max(0, (rating - index) * 100));
        return (
          <div key={index} className="relative">
            <Star className={`${sizeClasses[size]} text-muted`} />
            <div className="absolute inset-0 overflow-hidden" style={{ width: `${fillPercentage}%` }}>
              <Star className={`${sizeClasses[size]} text-amber-500 fill-amber-500`} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StarRating;
