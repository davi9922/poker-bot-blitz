
import React from 'react';
import CasinoChip from './CasinoChip';

interface ChipStackProps {
  totalChips: number;
  size?: 'sm' | 'md' | 'lg';
  showTotal?: boolean;
}

const ChipStack = ({ totalChips, size = 'md', showTotal = true }: ChipStackProps) => {
  const getChipBreakdown = (total: number) => {
    const denominations = [1000, 500, 100, 50, 25, 10, 5, 1];
    const breakdown: { value: number; count: number }[] = [];
    let remaining = total;

    denominations.forEach(denom => {
      if (remaining >= denom) {
        const count = Math.floor(remaining / denom);
        if (count > 0) {
          breakdown.push({ value: denom, count });
          remaining -= count * denom;
        }
      }
    });

    return breakdown.slice(0, 4); // Show only top 4 denominations
  };

  const chipBreakdown = getChipBreakdown(totalChips);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex gap-1 items-end">
        {chipBreakdown.map(({ value, count }, index) => (
          <div key={value} className="relative">
            {/* Stack effect */}
            {count > 1 && (
              <>
                <div className={`absolute -z-10 ${size === 'sm' ? 'top-0.5 left-0.5' : size === 'lg' ? 'top-1 left-1' : 'top-0.5 left-0.5'} opacity-60`}>
                  <CasinoChip value={value} size={size} />
                </div>
                {count > 2 && (
                  <div className={`absolute -z-20 ${size === 'sm' ? 'top-1 left-1' : size === 'lg' ? 'top-2 left-2' : 'top-1 left-1'} opacity-40`}>
                    <CasinoChip value={value} size={size} />
                  </div>
                )}
              </>
            )}
            <CasinoChip value={value} size={size} count={count > 5 ? count : undefined} />
          </div>
        ))}
      </div>
      {showTotal && (
        <div className="bg-black/70 text-white px-2 py-1 rounded text-xs font-bold">
          {totalChips.toLocaleString()}
        </div>
      )}
    </div>
  );
};

export default ChipStack;
