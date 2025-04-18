"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { WalletButton, WalletDisplay } from './components/WalletButton';
import { useWallet } from "@solana/wallet-adapter-react";
import { PriceWidget } from './components/PriceWidget';
import TokenInfoWidget from './components/TokenInfoWidget';
import RoadmapWidget from './components/RoadmapWidget';
import { SocialLinks } from './components/SocialLinks';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import BuyTokenWidget from './components/BuyTokenWidget';
import Image from 'next/image';
import VIPPartnerWidget from './components/VIPPartnerWidget';

// Navigation tabs
const tabs = [
  { id: 'home', label: 'Home' },
  { id: 'vip', label: 'VIP Partner' },
  { id: 'roadmap', label: 'Roadmap' },
  { id: 'token-info', label: 'Token Info' },
];

const calculateTimeLeft = () => {
  const now = new Date();
  const launchDate = new Date('2025-04-18T12:00:00-04:00'); // <=== กำหนดวันที่ล่วงหน้าแบบตายตัว

  const difference = launchDate.getTime() - now.getTime();

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isUrgent: false };
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((difference % (1000 * 60)) / 1000);

  return {
    days,
    hours,
    minutes,
    seconds,
    isUrgent: days <= 5
  };
};


// Fixed price for CDX token in USDT - always 0.01 USDT
const CDX_PRICE_IN_USDT = 0.01;

export default function Home() {
  const { connected, publicKey } = useWallet();
  const [solPrice, setSolPrice] = useState(95); // Default fallback price
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, isUrgent: false });
  const [lastValues, setLastValues] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, isUrgent: false });
  const [remainingTokens, setRemainingTokens] = useState(9585095);
  const [activeTab, setActiveTab] = useState('home');
  
  const TOTAL_SUPPLY = 50_000_000; // Only for sale tokens

  const fetchTokenBalance = useCallback(async () => {
    if (typeof window === 'undefined') return; // Skip on server-side
    try {
      // Check for required environment variables
      if (!process.env.NEXT_PUBLIC_CDX_WALLET || !process.env.NEXT_PUBLIC_CDX_TOKEN_ADDRESS) {
        console.error('Environment variables not properly configured');
        return;
      }

      const connection = new Connection(process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || 'https://api.mainnet-beta.solana.com');
      const walletAddress = new PublicKey(process.env.NEXT_PUBLIC_CDX_WALLET);
      const tokenMint = new PublicKey(process.env.NEXT_PUBLIC_CDX_TOKEN_ADDRESS);

      try {
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(walletAddress, {
          programId: TOKEN_PROGRAM_ID,
        });

        const tokenAccount = tokenAccounts.value.find(
          (account) => account.account.data.parsed.info.mint === tokenMint.toString()
        );

        if (tokenAccount) {
          const balance = tokenAccount.account.data.parsed.info.tokenAmount.uiAmount || 0;
          setRemainingTokens(balance);
        } else {
          console.error('Token account not found');
          setRemainingTokens(9585095);
        }
      } catch (error) {
        console.error('Error in token account lookup:', error);
        setRemainingTokens(9585095);
      }
    } catch (error) {
      console.error('Error fetching token balance:', error);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return; // Skip on server-side
    
    fetchTokenBalance();
    const interval = setInterval(fetchTokenBalance, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [fetchTokenBalance]);

  // Cache for last successful price
  const lastSuccessfulPrice = useRef(95);

  // Fetch SOL price with simplified error handling
  const fetchSolPrice = useCallback(async () => {
    try {
      const response = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=SOLUSDT', {
        method: 'GET',
        cache: 'no-store',
        next: { revalidate: 0 }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const price = parseFloat(data.price);

      if (!isNaN(price) && price > 0) {
        lastSuccessfulPrice.current = price;
        setSolPrice(price);
      } else {
        console.warn('Invalid price received, using fallback');
        setSolPrice(lastSuccessfulPrice.current);
      }
    } catch (error) {
      console.error('Error fetching SOL price:', error);
      setSolPrice(lastSuccessfulPrice.current);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return; // Skip on server-side
    
    // Fetch initial SOL price
    fetchSolPrice();
    // Set up interval to fetch price every minute
    const priceInterval = setInterval(fetchSolPrice, 60000);
    
    return () => clearInterval(priceInterval);
  }, [fetchSolPrice]);

  useEffect(() => {
    if (typeof window === 'undefined') return; // Skip on server-side
    
    // Update every second
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
      setLastValues(timeLeft); // Store previous values to detect changes
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]); // Update when timeLeft changes

  // Function to check if a value has just changed
  const hasChanged = (type: 'days' | 'hours' | 'minutes' | 'seconds') => {
    return lastValues[type] !== timeLeft[type];
  };

  // Connect wallet when needed
  useEffect(() => {
    if (publicKey) {
      // Simply register the user without referral
      fetch('/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: publicKey.toString()
        }),
      }).catch(err => {
        console.error('Error registering user:', err);
      });
    }
  }, [publicKey]);

  // Render home tab content
  const renderHomeContent = () => (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - Hero Section */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="rounded-3xl p-8 flex flex-col items-center lg:items-start text-center lg:text-left min-h-[500px] justify-center">
            <div className="flex flex-row items-center justify-center lg:justify-start mb-6 gap-4">
              <Image 
                src="/CDX.png" 
                alt="CDX Logo" 
                width={120} 
                height={120}
                className="animate-float"
              />
              <span className="bg-gradient-to-r from-pink-500 to-purple-500 text-white text-2xl sm:text-3xl lg:text-4xl font-bold px-4 py-2 rounded-full">PRESALE</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-gradient glow-text leading-tight">
              CDX Token
            </h1>
            
            <p className="text-base sm:text-lg lg:text-xl text-gray-300 mb-8 max-w-xl">
              Join the future of decentralized finance with CDX — the token powering the next generation of crypto exchange technology.
            </p>
            
            {/* CTA Button for Desktop */}
            <div className="hidden lg:block w-60">
              <button 
                onClick={() => setActiveTab('token-info')}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg py-4 font-semibold hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 flex items-center justify-center"
              >
                Explore more
                <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
            
            {/* Social Icons */}
            <div className="mt-8 flex items-center space-x-3 pt-4 border-t border-indigo-500/20 w-full md:w-auto">
              <span className="text-gray-400 mr-2 text-sm">FOLLOW US</span>
              
              {/* CdexsOfficial - Main Account */}
              <a href="https://x.com/CdexsOfficial" 
                className="rounded-full p-2 transition-all duration-200 relative group"
                title="Official X Account">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-dark/80 text-xs py-1 px-2 rounded text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-indigo-500/20">
                  Main
                </span>
              </a>
              
              {/* CdexsNews - News Account */}
              <a href="https://x.com/CdexsNews" 
                className="rounded-full p-2 transition-all duration-200 relative group"
                title="News X Account">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-dark/80 text-xs py-1 px-2 rounded text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-indigo-500/20">
                  News
                </span>
              </a>
              
              {/* CDXTOKEN - Token Account */}
              <a href="https://x.com/CDXTOKEN" 
                className="rounded-full p-2 transition-all duration-200 relative group"
                title="Token X Account">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-dark/80 text-xs py-1 px-2 rounded text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-indigo-500/20">
                  Token
                </span>
              </a>
            </div>
            
            {/* CTA Button for Mobile */}
            <div className="lg:hidden w-full mt-8">
              <button 
                onClick={() => setActiveTab('token-info')}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg py-4 font-semibold hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 flex items-center justify-center"
              >
                Explore more
                <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* Right Column - Token Info & Buy Widget */}
        <div className="lg:col-span-5 flex flex-col space-y-6">
          {/* Buy Widget */}
          <div className="rounded-3xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-gradient">Buy $CDX Tokens</h2>
              <WalletDisplay />
            </div>
            
            {/* Countdown Timer placed where Token Symbol was */}
            <div className="rounded-xl p-4 mb-6">
              <div className="flex items-center mb-2">
                <h3 className="text-lg font-semibold text-indigo-300">Launch in</h3>
              </div>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {[
                  { label: "Days", value: timeLeft.days, type: 'days' as const },
                  { label: "Hours", value: timeLeft.hours, type: 'hours' as const },
                  { label: "Minutes", value: timeLeft.minutes, type: 'minutes' as const },
                  { label: "Seconds", value: timeLeft.seconds, type: 'seconds' as const },
                ].map((item) => (
                  <div key={item.type} className="text-center">
                    <div className={`transition-transform ${hasChanged(item.type) ? 'scale-105' : ''}`}>
                      <p className="text-xl font-bold mb-1 text-white">
                        {String(item.value).padStart(2, '0')}
                      </p>
                      <p className="text-xs text-indigo-300">
                        {item.label}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {!connected ? (
              <div className="space-y-6">
                {/* Features Grid like in connected state */}
                <div>
                  <p className="text-center text-base sm:text-lg mb-4 text-gray-300">Connect your wallet to purchase CDX tokens and participate in the presale</p>
                  <WalletButton />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  {[
                    { icon: "🔒", title: "Secure Purchase", description: "Transactions processed on Solana blockchain with high-level security" },
                    { icon: "💰", title: "Fixed Price", description: "Each CDX token priced at $0.01 USDT during presale phase" },
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
            ) : (
              <BuyTokenWidget 
                solPrice={solPrice}
                remainingTokens={remainingTokens}
                onSuccess={fetchTokenBalance}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Render token info tab content
  // Token info tab content without referral-related elements
  const renderTokenInfoContent = () => (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Token Info Column */}
        <div className="lg:col-span-6">
          <TokenInfoWidget />
        </div>
        
        {/* Price Widget Column */}
        <div className="lg:col-span-6">
          <PriceWidget remainingTokens={remainingTokens} />
        </div>
      </div>
      
      {/* Why Choose CDX Section - Below the columns */}
      <div className="mt-8">
        <div className="card-glass rounded-2xl p-5">
          <h3 className="text-xl font-bold text-indigo-300 mb-4">Why Choose CDX?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-dark/50 border border-indigo-500/20 rounded-xl">
              <h4 className="font-semibold text-white mb-2">Next Generation Exchange</h4>
              <p className="text-gray-300 text-sm">CDX powers a revolutionary decentralized exchange with enhanced features and security.</p>
            </div>
            <div className="p-4 bg-dark/50 border border-indigo-500/20 rounded-xl">
              <h4 className="font-semibold text-white mb-2">Early Adopter Benefits</h4>
              <p className="text-gray-300 text-sm">Presale participants receive exclusive benefits and priority access to platform features.</p>
            </div>
            <div className="p-4 bg-dark/50 border border-indigo-500/20 rounded-xl">
              <h4 className="font-semibold text-white mb-2">Solana Ecosystem</h4>
              <p className="text-gray-300 text-sm">Built on Solana for lightning-fast transactions and minimal fees.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderVIPPartnerContent = () => (
    <div className="w-full">
      <VIPPartnerWidget />
    </div>
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_center,#111827_0%,#0a0a0f_70%)] relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 -right-40 w-96 h-96 bg-indigo-600/30 rounded-full blur-[120px] opacity-70"></div>
        <div className="absolute bottom-0 -left-40 w-96 h-96 bg-purple-800/30 rounded-full blur-[120px] opacity-70"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,#6366f1_0%,transparent_70%)] rounded-full blur-[80px] opacity-30"></div>
        <div className="absolute inset-0 noise-texture"></div>
      </div>

      {/* Navigation */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-indigo-500/20">
        <div className="w-full px-4 flex justify-center">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 font-medium text-sm transition-colors ${
                activeTab === tab.id 
                  ? 'text-indigo-400 border-b-2 border-indigo-500' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10 pt-24">
        {activeTab === 'home' ? (
          renderHomeContent()
        ) : activeTab === 'vip' ? (
          renderVIPPartnerContent()
        ) : activeTab === 'roadmap' ? (
          <div className="w-full">
            <RoadmapWidget />
          </div>
        ) : (
          renderTokenInfoContent()
        )}
      </div>
        
      {/* Footer */}
      <footer className="border-t border-indigo-500/20 py-6 mt-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <Image 
                src="/CDX.png" 
                alt="CDX Logo" 
                width={40} 
                height={40}
                className="mb-2 mx-auto md:mx-0"
              />
              <p className="text-gray-400 text-sm text-center md:text-left">© 2025 CDX. All rights reserved.</p>
            </div>
            <div className="flex space-x-6">
              <div className="flex flex-col">
                <span className="text-gray-400 text-xs mb-2">Official X Accounts:</span>
                <div className="flex gap-4">
                  <a href="https://x.com/CdexsOfficial" className="text-gray-400 hover:text-indigo-300 transition-colors text-sm" title="Main Account">Main</a>
                  <a href="https://x.com/CdexsNews" className="text-gray-400 hover:text-indigo-300 transition-colors text-sm" title="News Account">News</a>
                  <a href="https://x.com/CDXTOKEN" className="text-gray-400 hover:text-indigo-300 transition-colors text-sm" title="Token Account">Token</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}