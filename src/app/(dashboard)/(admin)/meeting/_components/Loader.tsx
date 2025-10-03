import Image from 'next/image';

const Loader = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="flex flex-col items-center justify-center gap-8 p-8">
        {/* Animated Logo Container */}
        <div className="relative flex items-center justify-center">
          {/* Outer glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 rounded-full blur-2xl opacity-40 animate-pulse scale-150"></div>
          
          {/* Middle ring */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-lg opacity-60 animate-spin scale-125" style={{ animationDuration: '3s' }}></div>
          
          {/* Inner container */}
          <div className="relative bg-white/10 dark:bg-gray-800/50 backdrop-blur-lg rounded-full p-8 border border-white/20 dark:border-gray-700/50 shadow-2xl">
            <div className="relative">
              <Image
                src="/icons/loading-circle.svg"
                alt="Loading..."
                width={80}
                height={80}
                className="animate-spin drop-shadow-lg"
                style={{ animationDuration: '2s' }}
              />
              {/* Fallback spinner if image fails */}
              <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 border-r-purple-500 rounded-full animate-spin opacity-50" style={{ animationDuration: '1.5s' }}></div>
            </div>
          </div>
        </div>
        
        {/* Loading Text Section */}
        <div className="text-center space-y-4 max-w-sm">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent animate-pulse">
            Loading Meeting
          </h3>
          
          <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">
            Please wait while we prepare your meeting room...
          </p>
          
          {/* Animated dots */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <div 
              className="w-3 h-3 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full animate-bounce shadow-lg"
              style={{ animationDelay: '0s', animationDuration: '1.4s' }}
            ></div>
            <div 
              className="w-3 h-3 bg-gradient-to-r from-purple-500 to-purple-400 rounded-full animate-bounce shadow-lg"
              style={{ animationDelay: '0.2s', animationDuration: '1.4s' }}
            ></div>
            <div 
              className="w-3 h-3 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full animate-bounce shadow-lg"
              style={{ animationDelay: '0.4s', animationDuration: '1.4s' }}
            ></div>
          </div>
          
          {/* Progress indicator */}
          <div className="w-48 h-1 bg-gray-700/50 dark:bg-gray-800/50 rounded-full overflow-hidden mt-6">
            <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
      
      {/* Background overlay for better contrast */}
      <div className="absolute inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm -z-10"></div>
    </div>
  );
};

export default Loader;
