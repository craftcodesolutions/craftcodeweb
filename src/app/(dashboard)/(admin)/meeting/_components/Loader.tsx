import Image from 'next/image';

const Loader = () => {
  return (
    <div className="flex-center h-screen w-full bg-gradient-to-br from-dark-1 via-dark-2 to-dark-1">
      <div className="flex flex-col items-center gap-6">
        {/* Animated Logo */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
          <div className="relative bg-dark-3/50 backdrop-blur-sm rounded-full p-6 border border-white/10">
            <Image
              src="/icons/loading-circle.svg"
              alt="Loading..."
              width={60}
              height={60}
              className="animate-spin"
            />
          </div>
        </div>
        
        {/* Loading Text */}
        <div className="text-center space-y-2">
          <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Loading Meeting
          </h3>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loader;
