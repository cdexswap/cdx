import React from 'react';

interface PriceWidgetProps {
  remainingTokens: number;
}

export const PriceWidget = ({ remainingTokens }: PriceWidgetProps) => {
  const TOTAL_SUPPLY = 50_000_000; // Available for sale
  const soldAmount = TOTAL_SUPPLY - remainingTokens;
  const soldPercentage = Math.min(100, Math.max(0, (soldAmount / TOTAL_SUPPLY) * 100));

  return (
    <div className="w-full rounded-2xl card-glass p-5">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-bold text-indigo-300">Token Sale Progress</h3>
        <div className="bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full text-xs">
          Limited Time Offer
        </div>
      </div>
      
      {/* Price Display */}
      <div className="p-4 bg-dark/50 rounded-xl mb-4 border border-indigo-500/20 text-center">
        <p className="text-indigo-300 mb-1">Fixed Price</p>
        <p className="text-3xl font-bold text-white mb-0.5">$0.01 USDT</p>
        <p className="text-xs text-gray-400">Per CDX Token</p>
      </div>
      
      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-400">Sale Progress</span>
          <span className="text-sm text-indigo-300">
            {soldPercentage.toFixed(2)}%
          </span>
        </div>
        <div className="h-3 bg-dark/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
            style={{ width: `${soldPercentage}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-400">
          <span>{remainingTokens.toLocaleString()} Available</span>
          <span>{TOTAL_SUPPLY.toLocaleString()} Total</span>
        </div>
      </div>
      
      {/* Info Box */}
      <div className="p-3 rounded-xl bg-dark/50 border border-indigo-500/20 text-center">
        <p className="text-indigo-300 font-medium mb-1">Buy CDX at the best price</p>
        <p className="text-xs text-gray-400">
          Purchase now at fixed price of $0.01 USDT
        </p>
      </div>
    </div>
  );
};