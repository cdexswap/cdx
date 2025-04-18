export const SocialLinks = () => {
  // Define social media links with descriptions
  const socialLinks = [
    { 
      url: "https://x.com/CdexsOfficial", 
      title: "Main X Account", 
      description: "Official channel for general token information",
      icon: (
        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      )
    },
    { 
      url: "https://x.com/CdexsNews", 
      title: "News X Account", 
      description: "For all news announcements",
      icon: (
        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      )
    },
    { 
      url: "https://x.com/CDXTOKEN", 
      title: "Token X Account", 
      description: "News and events for CDX token",
      icon: (
        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      )
    }
  ];

  return (
    <>
      {/* Desktop Version */}
      <div className="hidden xl:flex flex-col gap-3">
        <h3 className="text-indigo-300 font-medium mb-2">Follow Us</h3>
        {socialLinks.map((link, index) => (
          <a 
            key={index}
            href={link.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-dark/40 hover:bg-primary/20 rounded-lg p-3 transition-all duration-200 backdrop-blur-md border border-white/10 hover:border-primary/30 flex items-center gap-3 group"
            title={link.title}
          >
            <div className="bg-indigo-500/20 p-2 rounded-full group-hover:bg-indigo-500/30 transition-colors">
              {link.icon}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">{link.title}</p>
              <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">{link.description}</p>
            </div>
          </a>
        ))}
      </div>

      {/* Mobile Version - More compact */}
      <div className="flex xl:hidden flex-col gap-2 backdrop-blur-md bg-dark/20 p-3 rounded-lg border border-white/10">
        <h3 className="text-indigo-300 text-sm font-medium mb-1">Follow Us</h3>
        <div className="flex flex-wrap gap-2">
          {socialLinks.map((link, index) => (
            <a 
              key={index}
              href={link.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-dark/40 hover:bg-primary/20 rounded-lg p-2 transition-all duration-200 border border-white/10 hover:border-primary/30 flex items-center gap-2"
              title={link.title}
            >
              <div className="bg-indigo-500/20 p-1.5 rounded-full">
                {link.icon}
              </div>
              <span className="text-xs font-medium text-gray-300">
                {link.title.replace(' X Account', '')}
              </span>
            </a>
          ))}
        </div>
      </div>
    </>
  );
};