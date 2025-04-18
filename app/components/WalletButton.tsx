"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useCallback, useState, useRef, useEffect } from "react";

export const WalletButton = () => {
  const { connected, publicKey } = useWallet();
  const { setVisible } = useWalletModal();

  const handleClick = () => {
    setVisible(true);
  };

  if (connected) {
    return null; // Don't render anything when connected
  }

  return (
    <button 
      onClick={handleClick}
      className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg py-4 font-semibold hover:shadow-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 flex items-center justify-center"
    >
      Connect Wallet
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
    </button>
  );
};

// Add a new component to display wallet address with disconnect option
export const WalletDisplay = () => {
  const { publicKey, disconnect, wallet } = useWallet();
  const { setVisible } = useWalletModal();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  const handleDisconnect = useCallback(async () => {
    try {
      await disconnect();
      setIsDropdownOpen(false);
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
    }
  }, [disconnect]);
  
  const handleChangeWallet = useCallback(() => {
    setVisible(true);
    setIsDropdownOpen(false);
  }, [setVisible]);
  
  if (!publicKey) return null;
  
  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center bg-dark/60 px-3 py-1.5 rounded-lg border border-indigo-500/20 hover:bg-dark/80 transition-colors"
      >
        <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
        <span className="text-sm text-gray-300 mr-1">
          <span className="hidden sm:inline mr-1">Connected:</span>
          <span className="text-indigo-300 font-mono">{publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}</span>
        </span>
        <svg className="w-4 h-4 text-gray-400 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-dark/90 backdrop-blur-lg rounded-lg shadow-lg border border-indigo-500/20 py-2 z-50">
          <div className="px-4 py-2 border-b border-indigo-500/20">
            <p className="text-xs text-gray-400">Connected wallet</p>
            <p className="text-sm font-medium text-indigo-300 font-mono truncate">
              {publicKey.toString().slice(0, 6)}...{publicKey.toString().slice(-4)}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {wallet?.adapter.name || 'Unknown Wallet'}
            </p>
          </div>
          
          <button
            onClick={handleChangeWallet}
            className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-indigo-500/20 transition-colors flex items-center"
          >
            <svg className="w-4 h-4 mr-2 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m-4 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            Change Wallet
          </button>
          
          <button
            onClick={handleDisconnect}
            className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-indigo-500/20 transition-colors flex items-center"
          >
            <svg className="w-4 h-4 mr-2 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Disconnect
          </button>
          
          <a
            href={`https://solscan.io/account/${publicKey.toString()}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-indigo-500/20 transition-colors flex items-center"
          >
            <svg className="w-4 h-4 mr-2 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            View on Explorer
          </a>
        </div>
      )}
    </div>
  );
};