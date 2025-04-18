'use client';

import { useState, useEffect } from 'react';
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletButton } from './WalletButton';

export default function HoldWidget() {
  const { connected, publicKey } = useWallet();
  const [amount, setAmount] = useState('100000');
  const [isStaked, setIsStaked] = useState(false);
  const [stakeDate, setStakeDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Reset state when wallet changes
  useEffect(() => {
    // Reset state when connecting or disconnecting
    if (!connected) {
      setIsStaked(false);
      setStakeDate(null);
      setEndDate(null);
      setAmount('100000');
      return;
    }
    
    // Reset and check for existing Holddata when wallet connects or changes
    if (publicKey) {
      // First reset the state
      setIsStaked(false);
      setStakeDate(null);
      setEndDate(null);
      setAmount('100000');
      
      // Then check for existing data
      const key = `staked_${publicKey.toString()}`;
      const existingStake = localStorage.getItem(key);
      
      if (existingStake) {
        try {
          const stakeData = JSON.parse(existingStake);
          setIsStaked(true);
          setAmount(stakeData.amount);
          setStakeDate(new Date(stakeData.stakeDate));
          setEndDate(new Date(stakeData.endDate));
        } catch (error) {
          console.error("Error parsing stake data:", error);
          // Clear invalid data
          localStorage.removeItem(key);
        }
      }
    }
  }, [connected, publicKey]);

  // Function to handle Hold
  const handleStake = () => {
    if (!publicKey || isProcessing) return;
    
    const holdAmount = parseFloat(amount);
    if (isNaN(holdAmount) || holdAmount < 100000) {
      alert('Please enter at least 100,000 CDEX tokens');
      return;
    }
    
    setIsProcessing(true);
    
    // For demo, we'll simulate a stake process
    setTimeout(() => {
      const now = new Date();
      const lockEndDate = new Date(now);
      lockEndDate.setMonth(lockEndDate.getMonth() + 3); // 3 months lock
      
      // Store stake information
      const stakeInfo = {
        amount: amount,
        stakeDate: now.toISOString(),
        endDate: lockEndDate.toISOString()
      };
      
      localStorage.setItem(`staked_${publicKey.toString()}`, JSON.stringify(stakeInfo));
      
      setIsStaked(true);
      setStakeDate(now);
      setEndDate(lockEndDate);
      setIsProcessing(false);
    }, 2000);
  };

  // Format date for display
  const formatDate = (date: Date | null) => {
    if (!date) return '-';
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="w-full card-glass rounded-2xl p-6">
      <div className="flex items-center mb-6">
        <div className="w-2 h-8 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full mr-3"></div>
        <h2 className="text-2xl font-bold text-gradient">VIP Partner System</h2>
      </div>

      <div className="bg-dark/50 rounded-xl p-4 mb-6 border border-indigo-500/20">
        <h3 className="text-lg font-semibold text-indigo-300 mb-2">Hold Requirements</h3>
        <ul className="space-y-2 text-gray-300">
          <li className="flex items-start">
            <span className="text-indigo-400 mr-2">•</span>
            <span>Minimum stake: 100,000 CDEX tokens</span>
          </li>
          <li className="flex items-start">
            <span className="text-indigo-400 mr-2">•</span>
            <span>Lock period: 3 months (tokens cannot be withdrawn early)</span>
          </li>
          <li className="flex items-start">
            <span className="text-indigo-400 mr-2">•</span>
            <span>Receive VIP Partner status for CDEX Swap benefits</span>
          </li>
        </ul>
      </div>

      {!connected ? (
        <div className="bg-dark/50 rounded-xl p-6 mb-6 border border-indigo-500/20 text-center">
          <p className="text-gray-300 mb-4">Connect your wallet to stake CDEX tokens and become a VIP Partner</p>
          <div className="max-w-sm mx-auto">
            <WalletButton />
          </div>
        </div>
      ) : isStaked ? (
        <div className="bg-dark/50 rounded-xl p-6 mb-6 border border-indigo-500/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-green-400">You are a VIP Partner</h3>
            <div className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-xs border border-green-500/30">
              Active
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-black/40 p-3 rounded-lg">
              <p className="text-gray-400 text-sm">Wallet Address</p>
              <p className="text-indigo-300 font-mono text-sm truncate">{publicKey?.toString()}</p>
            </div>
            <div className="bg-black/40 p-3 rounded-lg">
              <p className="text-gray-400 text-sm">Hold Amount</p>
              <p className="text-indigo-300">{Number(amount).toLocaleString()} CDEX</p>
            </div>
            <div className="bg-black/40 p-3 rounded-lg">
              <p className="text-gray-400 text-sm">Hold Date</p>
              <p className="text-indigo-300">{formatDate(stakeDate)}</p>
            </div>
            <div className="bg-black/40 p-3 rounded-lg">
              <p className="text-gray-400 text-sm">Unlock Date</p>
              <p className="text-indigo-300">{formatDate(endDate)}</p>
            </div>
          </div>
          
          <div className="bg-green-900/20 p-4 rounded-lg border border-green-500/20">
            <h4 className="text-md font-semibold text-green-400 mb-3">VIP Benefits</h4>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                <span>Earn <span className="font-semibold text-green-300">0.1%</span> commission on all trades made through CDX SWAP (https://cdexs.com) using your referral code</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                <span>Multi-level earnings: Receive <span className="font-semibold text-green-300">0.1%</span> from trades by users who were referred by your referrals (unlimited levels)</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                <span>Anyone using your referral code during trades on CDX SWAP contributes to your earnings</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                <span>No cap on earnings - grow your network to increase your passive income</span>
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="bg-dark/50 rounded-xl p-6 mb-6 border border-indigo-500/20">
          <h3 className="text-lg font-semibold text-indigo-300 mb-4">Stake CDEX to Become a VIP Partner</h3>
          
          <div className="mb-4">
            <label className="block text-gray-400 text-sm mb-2">Amount to Stake (min 100,000 CDEX)</label>
            <div className="flex">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-black/30 border border-indigo-500/30 rounded-l-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                placeholder="Enter amount"
                min="100000"
              />
              <button 
                className="bg-indigo-900/40 px-4 rounded-r-lg border border-indigo-500/30 border-l-0 text-indigo-300"
                onClick={() => setAmount('100000')}
              >
                MIN
              </button>
            </div>
          </div>
          
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">Lock Period:</span>
              <span className="text-indigo-300">3 Months (Fixed)</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Your Wallet:</span>
              <span className="text-indigo-300 font-mono truncate max-w-[200px]">
                {publicKey?.toString().slice(0, 6)}...{publicKey?.toString().slice(-4)}
              </span>
            </div>
          </div>
          
          <button
            onClick={handleStake}
            disabled={isProcessing}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg py-3 font-semibold hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <div className="flex items-center space-x-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Processing...</span>
              </div>
            ) : (
              <>
                Stake and Become VIP Partner
                <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </>
            )}
          </button>
        </div>
      )}

      <div className="bg-dark/50 rounded-xl p-6 border border-indigo-500/20">
        <h3 className="text-lg font-semibold text-indigo-300 mb-3">Security Features</h3>
        <div className="space-y-3 text-gray-300">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-indigo-400 mt-0.5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Stakes locked in secure system with no early withdrawal</span>
          </div>
          <div className="flex items-start">
            <svg className="w-5 h-5 text-indigo-400 mt-0.5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Transparent verification of VIP status on the platform</span>
          </div>
          <div className="flex items-start">
            <svg className="w-5 h-5 text-indigo-400 mt-0.5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <span>Automatic benefits activation without manual intervention</span>
          </div>
        </div>
      </div>
    </div>
  );
}