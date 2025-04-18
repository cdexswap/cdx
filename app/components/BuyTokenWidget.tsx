import { useState } from 'react';
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';

interface BuyTokenWidgetProps {
  solPrice: number;
  remainingTokens: number;
  onSuccess?: () => void;
}

export default function BuyTokenWidget({ solPrice, remainingTokens, onSuccess }: BuyTokenWidgetProps) {
  const { connected, publicKey, sendTransaction } = useWallet();
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cdxAmount, setCdxAmount] = useState('0');
  const [status, setStatus] = useState('');

  // Fixed price for CDX token in USDT - always 0.01 USDT
  const CDX_PRICE_IN_USDT = 0.01;

  // Calculate CDX amount when amount changes
  const calculateCdxAmount = (solAmount: number) => {
    const solValueInUSD = solAmount * solPrice;
    const calculatedCdx = Math.floor((solValueInUSD / CDX_PRICE_IN_USDT));
    return calculatedCdx;
  };

  const handleBuyToken = async () => {
    if (!publicKey || !amount) return;
    
    const solAmount = parseFloat(amount);
    const minPurchase = parseFloat(process.env.NEXT_PUBLIC_MIN_PURCHASE_SOL || '0.001');
    const maxPurchase = parseFloat(process.env.NEXT_PUBLIC_MAX_PURCHASE_SOL || '50');
    
    if (solAmount < minPurchase || solAmount > maxPurchase) {
      alert(`Please enter an amount between ${minPurchase} and ${maxPurchase} SOL`);
      return;
    }

    try {
      setIsProcessing(true);
      setStatus('Initializing purchase...');
      console.log('Starting purchase process...');
      const connection = new Connection(process.env.NEXT_PUBLIC_ALCHEMY_API_KEY!, 'confirmed');

      // 1. Create SOL transfer transaction
      setStatus('Creating SOL transfer...');
      console.log('Creating SOL transfer transaction...');
      const recipientWallet = new PublicKey(process.env.NEXT_PUBLIC_RECIPIENT_WALLET_ADDRESS!);
      
      const transaction = new Transaction();
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: recipientWallet,
          lamports: solAmount * LAMPORTS_PER_SOL
        })
      );

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      // Rest of your existing function...
      // (Code omitted for brevity)
    } catch (error) {
      setIsProcessing(false);
      setStatus('');
      console.error('Purchase error:', error);
      
      // Error handling (omitted for brevity)
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-gray-300 text-sm mb-2">Amount (SOL)</label>
        <div className="relative">
          {/* Fixed input styling for better visibility */}
          <input
            type="text"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              const solAmount = parseFloat(e.target.value) || 0;
              const calculatedCdx = calculateCdxAmount(solAmount);
              setCdxAmount(calculatedCdx.toLocaleString('en-US', { maximumFractionDigits: 0 }));
            }}
            className="w-full bg-white/5 border border-indigo-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/20 transition-all duration-300"
            placeholder="0.0"
            disabled={isProcessing}
            style={{color: 'white'}}
          />
          <button 
            className="absolute right-2 top-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded text-sm hover:bg-indigo-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isProcessing}
            onClick={() => {
              // You would implement MAX functionality here
              // For example, fetching the user's SOL balance
            }}
          >
            MAX
          </button>
        </div>
        <div className="space-y-2 mt-4">
          <div className="flex justify-between text-sm text-gray-400 px-1">
            <span>You will receive:</span>
            <span className="text-indigo-300">{Number(cdxAmount.replace(/,/g, '')).toLocaleString()} CDX</span>
          </div>
          <div className="flex justify-between text-sm text-gray-400 px-1">
            <span>Price per CDX:</span>
            <span className="text-indigo-300 font-bold">0.01 USDT</span>
          </div>
          {amount && solPrice > 0 && (
            <div className="flex justify-between text-sm text-gray-400 px-1">
              <span>Value in USDT:</span>
              <span className="text-indigo-300">
                ${(parseFloat(amount || '0') * solPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          )}
          {status && (
            <div className="mt-4 p-4 bg-dark/50 rounded-lg border border-indigo-500/30">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="animate-spin h-5 w-5">
                    <svg className="h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-indigo-300">
                    {status}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Please keep this window open
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <button 
        onClick={handleBuyToken}
        disabled={!connected || !amount || isNaN(parseFloat(amount)) || isProcessing}
        className="mt-4 w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg py-4 font-semibold hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? (
          <div className="flex items-center justify-center space-x-2">
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Processing...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <span>Buy $CDX Tokens</span>
            <svg 
              className="w-5 h-5 ml-2" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M13 7l5 5m0 0l-5 5m5-5H6" 
              />
            </svg>
          </div>
        )}
      </button>
      
      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        {[
          { icon: "🔒", title: "Secure Purchase", description: "Transactions processed on Solana blockchain with high-level security" },
          { icon: "💰", title: "Fixed Price", description: "Each CDX token priced at $0.01 USDT" },
          { icon: "🚀", title: "Growth Potential", description: "Early access to tokens before exchange listings" }
        ].map((feature, index) => (
          <div key={index} className="bg-dark/50 p-4 rounded-xl text-center border border-indigo-500/20">
            <div className="text-2xl mb-2">{feature.icon}</div>
            <h3 className="text-base font-semibold mb-1 text-indigo-300">{feature.title}</h3>
            <p className="text-xs text-gray-400">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}