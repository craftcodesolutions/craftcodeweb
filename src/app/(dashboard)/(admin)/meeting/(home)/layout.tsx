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

if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = customStyles;
  document.head.appendChild(styleElement);
}

export const metadata: Metadata = {
  title: 'YOOM',
  description: 'A workspace for your team, powered by Stream Chat and Clerk.',
};

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

      <div className="relative z-0 flex min-h-[calc(100vh-192px)]">
        {/* Enhanced Sidebar - Hidden on small devices */}
        <div className="hidden sm:block">
          <Sidebar />
        </div>
        
        <section className="flex flex-1 flex-col overflow-hidden">
          {/* Enhanced Content Area with proper scroll handling */}
          <div className="flex-1 overflow-y-auto px-3 pb-4 pr-2 max-md:pb-8 sm:px-6 sm:pr-4 scrollbar-hide">
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