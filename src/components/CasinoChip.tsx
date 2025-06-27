
import React from 'react';

interface CasinoChipProps {
  value: number;
  size?: 'sm' | 'md' | 'lg';
  count?: number;
}

const CasinoChip = ({ value, size = 'md', count }: CasinoChipProps) => {
  const getChipColor = (value: number) => {
    if (value >= 1000) return 'from-purple-600 to-purple-800 border-purple-400';
    if (value >= 500) return 'from-pink-600 to-pink-800 border-pink-400';
    if (value >= 100) return 'from-black to-gray-800 border-gray-600';
    if (value >= 50) return 'from-blue-600 to-blue-800 border-blue-400';
    if (value >= 25) return 'from-green-600 to-green-800 border-green-400';
    if (value >= 10) return 'from-yellow-500 to-yellow-700 border-yellow-300';
    if (value >= 5) return 'from-red-600 to-red-800 border-red-400';
    return 'from-gray-400 to-gray-600 border-gray-300';
  };

  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'sm': return 'w-8 h-8 text-xs';
      case 'lg': return 'w-16 h-16 text-lg';
      default: return 'w-12 h-12 text-sm';
    }
  };

  const chipColor = getChipColor(value);
  const sizeClasses = getSizeClasses(size);

  return (
    <div className="relative inline-block">
      <div className={`
        ${sizeClasses}
        bg-gradient-to-br ${chipColor}
        rounded-full
        border-4
        shadow-lg
        flex items-center justify-center
        font-bold text-white
        relative
        transform hover:scale-105 transition-transform
      `}>
        {/* Chip pattern */}
        <div className="absolute inset-2 border border-white/30 rounded-full"></div>
        <div className="absolute inset-3 border border-white/20 rounded-full"></div>
        
        {/* Value text */}
        <span className="relative z-10 drop-shadow-lg">
          {value >= 1000 ? `${value/1000}K` : value}
        </span>
        
        {/* Inner highlight */}
        <div className="absolute top-1 left-1 w-2 h-2 bg-white/40 rounded-full blur-sm"></div>
      </div>
      
      {/* Count indicator */}
      {count && count > 1 && (
        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
          {count > 99 ? '99+' : count}
        </div>
      )}
    </div>
  );
};

export default CasinoChip;
