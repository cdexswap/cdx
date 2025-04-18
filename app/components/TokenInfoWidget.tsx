import React from 'react';

const TokenInfoWidget = () => {
  return (
    <div className="w-full rounded-2xl card-glass p-5">
      <h3 className="text-xl font-bold text-indigo-300 mb-4">CDX Token Info</h3>
      
      {/* Total Supply */}
      <div className="p-3 rounded-xl bg-dark/50 border border-indigo-500/20 mb-3 hover:bg-dark/70 transition-colors">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-white">Total Supply</span>
          </div>
          <span className="font-mono text-indigo-300">1,000,000,000</span>
        </div>
        <div className="flex justify-end mt-2">
          <a 
            href="https://solscan.io/token/8gTpdfq4csSNRiRKFD2cSzP8ema1D8w8QcefCkYiZZRF"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs flex items-center gap-1 text-indigo-400 hover:text-indigo-300"
          >
            View on Solscan
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
      
      {/* LOCK Amount */}
      <div className="p-3 rounded-xl bg-dark/50 border border-amber-500/20 mb-3 hover:bg-dark/70 transition-colors">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="text-white">LOCK Amount</span>
          </div>
          <span className="font-mono text-amber-300">950,000,000</span>
        </div>
        <div className="flex justify-between items-center mt-2 text-xs">
          <span className="text-gray-400">95% of Total Supply</span>
          <a 
            href="https://solscan.io/tx/47wKRD2UxkCcPx3rRsRoChiV35wm7r4oGebnzv1TjrCF9dWsoDX1xpoxcBJy6cYZCTLNCbbcvCNqr4CNjYKibQzA"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-amber-400 hover:text-amber-300"
          >
            View Proof
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
      
      {/* Price - Changed from Presale Amount */}
      <div className="p-3 rounded-xl bg-dark/50 border border-green-500/20 mb-3 hover:bg-dark/70 transition-colors">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-white">Price</span>
          </div>
          <span className="font-mono text-green-300">$0.01 USDT</span>
        </div>
        <div className="text-xs text-gray-400 mt-2">
          Fixed price during presale
        </div>
      </div>
      
      {/* Contract Address */}
      <div className="p-3 rounded-xl bg-dark/50 border border-indigo-500/20 hover:bg-dark/70 transition-colors">
        <p className="text-xs text-gray-400 mb-2">Token Contract Address</p>
        <div className="flex items-center justify-between">
          <p className="text-sm font-mono text-indigo-300 truncate">8gTpd...iZZRF</p>
          <button 
            className="p-1.5 rounded-full bg-indigo-500/20 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/30 transition-colors"
            onClick={() => {
              navigator.clipboard.writeText("8gTpdfq4csSNRiRKFD2cSzP8ema1D8w8QcefCkYiZZRF");
              // You could add a toast notification here
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TokenInfoWidget;