/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: number;
  className?: string;
  fallbackSrc?: string;
}

const Avatar = ({ 
  src, 
  alt = 'User Avatar', 
  size = 32, 
  className = '', 
  fallbackSrc = '/avatar.png' 
}: AvatarProps) => {
  const [imgSrc, setImgSrc] = useState<string>(fallbackSrc);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Update image source when src prop changes
  useEffect(() => {
    setIsLoading(true);
    
    if (src && src.trim() !== '' && src !== 'undefined' && src !== 'null') {
      setImgSrc(src);
    } else {
      setImgSrc(fallbackSrc);
      setIsLoading(false);
    }
  }, [src, fallbackSrc]);

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
    setImgSrc(fallbackSrc);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  // Show loading state or fallback immediately if no valid src
  if (isLoading && imgSrc === fallbackSrc) {
    return (
      <div 
        className={`rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        <span className="text-white font-semibold text-sm">
          {alt?.charAt(0)?.toUpperCase() || 'U'}
        </span>
      </div>
    );
  }

  return (
    <div className="relative">
      <Image
        src={imgSrc}
        alt={alt}
        width={size}
        height={size}
        className={`rounded-full object-cover ${className}`}
        unoptimized
        onError={handleError}
        onLoad={handleLoad}
        priority={false}
      />
      {isLoading && (
        <div 
          className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center animate-pulse"
          style={{ width: size, height: size }}
        >
          <span className="text-white font-semibold text-sm">
            {alt?.charAt(0)?.toUpperCase() || 'U'}
          </span>
        </div>
      )}
    </div>
  );
};

export default Avatar;
