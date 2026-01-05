import { Metadata } from 'next';
import { ReactNode } from 'react';

import Navbar from '../_components/Navbar';
import Sidebar from '../_components/Sidebar';
import ErrorBoundary from '../_components/ErrorBoundary';

// Add custom animations
const customStyles = `
  @keyframes fade-in {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-fade-in {
    animation: fade-in 0.6s ease-out;
  }
  
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
`;

// import ModeToggle from "@/components/ModeToggle"; // Remove this import


export const metadata: Metadata = {
  title: "CraftCodeSloutions || Startup & SME Investment Studio",
  description:
    "A Startup & SME Investment Studio. 360 degree Marketing Agency.Your growth team. We build, market & invest in startups.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "CraftCodeSloutions || Startup & SME Investment Studio",
    description:
      "A Startup & SME Investment Studio. 360 degree Marketing Agency.Your growth team. We build, market & invest in startups.",
    url: "https://www.craftcodesolutions.com",
    siteName: "CraftCodeSloutions",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "CraftCodeSloutions",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CraftCodeSloutions || Startup & SME Investment Studio",
    description:
      "A Startup & SME Investment Studio. 360 degree Marketing Agency.Your growth team. We build, market & invest in startups.",
    images: ["/og-image.jpg"],
  },
};

if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = customStyles;
  document.head.appendChild(styleElement);
}


const RootLayout = ({ children }: Readonly<{ children: ReactNode }>) => {
  return (
    <div className="relative bg-gradient-to-br from-dark-1 via-dark-2 to-dark-1 min-h-screen">
      {/* Enhanced background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-tr from-purple-500/5 to-pink-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-gradient-to-r from-cyan-500/3 to-blue-500/3 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      {/* Meeting-specific navbar positioned below admin header */}
      <div className="relative z-0 pt-0">
        <Navbar />
      </div>

      <div className="relative z-0 flex min-h-[calc(100vh-160px)] sm:min-h-[calc(100vh-192px)]">
        {/* Enhanced Sidebar - Hidden on small and medium devices */}
        <div className="hidden xl:block">
          <Sidebar />
        </div>
        
        <section className="flex flex-1 flex-col overflow-hidden">
          {/* Enhanced Content Area with proper scroll handling and responsive padding */}
          <div className="flex-1 overflow-y-auto px-2 pb-4 pr-2 sm:px-4 md:px-6 sm:pr-4 max-md:pb-8 scrollbar-hide">
            <div className="w-full max-w-none min-h-full">
              <ErrorBoundary>
                <div className="animate-fade-in">
                  {children}
                </div>
              </ErrorBoundary>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default RootLayout;