import Image from 'next/image';

const RoadmapWidget = () => {
  return (
    <div className="w-full max-w-5xl mx-auto card-glass rounded-3xl p-8">
      <h2 className="text-3xl font-bold text-center mb-8 text-gradient">
        CDX Token Timeline
      </h2>
      
      <div className="relative">
        <div className="mx-auto mb-6 text-center">
          <Image 
            src="/CDX.png" 
            alt="CDX Logo" 
            width={80} 
            height={80}
            className="mx-auto"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* First Row */}
          <div className="col-span-1 md:col-span-3 flex flex-col md:flex-row justify-between">
            <div className="card-glass-darker rounded-xl p-5 mb-4 md:mb-0 md:w-1/3 mx-1 border border-primary/20 hover:border-primary/40 transition-colors">
              <div className="text-center">
                <div className="rounded-full bg-primary/30 inline-block px-5 py-2 mb-3">
                  <span className="text-xl font-bold text-primary-light">1</span>
                </div>
                <h3 className="text-xl font-bold text-accent mb-2">$CDX</h3>
                <div className="text-gray-300 mb-2">1,000,000,000 $CDX Tokens Minting</div>
                <div className="text-gray-300">950,000,000 $CDX Lock</div>
              </div>
            </div>
            
            <div className="card-glass-darker rounded-xl p-5 mb-4 md:mb-0 md:w-1/3 mx-1 border border-primary/20 hover:border-primary/40 transition-colors">
              <div className="text-center">
                <div className="rounded-full bg-primary/30 inline-block px-5 py-2 mb-3">
                  <span className="text-xl font-bold text-primary-light">2</span>
                </div>
                <h3 className="text-xl font-bold text-accent mb-2">Mar</h3>
                <div className="text-gray-300">FIRST CDX LAUNCH</div>
                <div className="text-gray-300">25,000,000 $CDX Presale on www.cdexs.com</div>
                <div className="text-gray-300">25,000,000 $CDX</div>
                <div className="text-gray-300">Launch on Raydium</div>
                <div className="text-gray-300">Launch on DEX</div>
              </div>
            </div>
            
            <div className="card-glass-darker rounded-xl p-5 md:w-1/3 mx-1 border border-primary/20 hover:border-primary/40 transition-colors">
              <div className="text-center">
                <div className="rounded-full bg-primary/30 inline-block px-5 py-2 mb-3">
                  <span className="text-xl font-bold text-primary-light">3</span>
                </div>
                <h3 className="text-xl font-bold text-accent mb-2">Apr</h3>
                <div className="text-gray-300">$CDX UNLOCK</div>
                <div className="text-gray-300">200,000,000 $CDX UNLOCK</div>
                <div className="text-gray-300">$CDX Program Staking</div>
                <div className="text-gray-300">150% APR Ecosystem</div>
              </div>
            </div>
          </div>
          
          {/* Second Row */}
          <div className="col-span-1 md:col-span-3 flex flex-col md:flex-row justify-between">
            <div className="card-glass-darker rounded-xl p-5 mb-4 md:mb-0 md:w-1/3 mx-1 border border-primary/20 hover:border-primary/40 transition-colors">
              <div className="text-center">
                <div className="rounded-full bg-primary/30 inline-block px-5 py-2 mb-3">
                  <span className="text-xl font-bold text-primary-light">4</span>
                </div>
                <h3 className="text-xl font-bold text-accent mb-2">May</h3>
                <div className="text-gray-300">$CDX MOVE</div>
                <div className="text-gray-300">100,000,000 $CDX UNLOCK</div>
                <div className="text-gray-300">Launch on Top tier DEX</div>
              </div>
            </div>
            
            <div className="card-glass-darker rounded-xl p-5 mb-4 md:mb-0 md:w-1/3 mx-1 border border-primary/20 hover:border-primary/40 transition-colors">
              <div className="text-center">
                <div className="rounded-full bg-primary/30 inline-block px-5 py-2 mb-3">
                  <span className="text-xl font-bold text-primary-light">5</span>
                </div>
                <h3 className="text-xl font-bold text-accent mb-2">Q3</h3>
                <div className="text-gray-300">$CDX SPENDING</div>
                <div className="text-gray-300">100,000,000 $CDX UNLOCK</div>
                <div className="text-gray-300">$CDX Spending Ecosystem</div>
              </div>
            </div>
            
            <div className="card-glass-darker rounded-xl p-5 md:w-1/3 mx-1 border border-primary/20 hover:border-primary/40 transition-colors">
              <div className="text-center">
                <div className="rounded-full bg-primary/30 inline-block px-5 py-2 mb-3">
                  <span className="text-xl font-bold text-primary-light">6</span>
                </div>
                <h3 className="text-xl font-bold text-accent mb-2">Q4</h3>
                <div className="text-gray-300">$CDX GOAL</div>
                <div className="text-gray-300">450,000,000 $CDX UNLOCK</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center mt-6">
          <a 
            href="https://www.cdexs.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-accent hover:text-accent/80 transition-colors inline-flex items-center gap-2"
          >
            <span>WWW.CDEXS.COM</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};

export default RoadmapWidget;