import React from 'react';
import Header from '@/components/Home/Header';
import Footer from '@/components/Home/Footer';

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col min-h-screen bg-white text-black dark:bg-black dark:text-white transition-colors duration-500">
      <Header />
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 pt-20">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default RootLayout;

