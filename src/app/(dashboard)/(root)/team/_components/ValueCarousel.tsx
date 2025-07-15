"use client";

import React, { useState, useEffect, useRef } from "react";

const coreValues = [
  {
    title: "Innovation",
    description:
      "We push boundaries to create cutting-edge solutions that transform businesses.",
    icon: "💡",
    story:
      "Our team developed a groundbreaking AI-powered e-commerce platform that increased client sales by 40% within the first quarter.",
    color: "from-blue-500 to-cyan-500",
    bgColor: "from-blue-50 to-cyan-50",
  },
  {
    title: "Collaboration",
    description:
      "We thrive on teamwork, partnering with clients to achieve shared success.",
    icon: "🤝",
    story:
      "We worked closely with a healthcare provider to co-create a patient management app, ensuring it met their exact needs.",
    color: "from-emerald-500 to-teal-500",
    bgColor: "from-emerald-50 to-teal-50",
  },
  {
    title: "Excellence",
    description:
      "We deliver top-quality products with precision and dedication.",
    icon: "🏆",
    story:
      "Our commitment to excellence earned us the Best Tech Award 2024 for our outstanding software solutions.",
    color: "from-amber-500 to-orange-500",
    bgColor: "from-amber-50 to-orange-50",
  },
  {
    title: "Integrity",
    description:
      "We uphold honesty and transparency in all our interactions.",
    icon: "🛡️",
    story:
      "We maintained open communication during a tight-deadline project, ensuring the client was informed at every step.",
    color: "from-purple-500 to-pink-500",
    bgColor: "from-purple-50 to-pink-50",
  },
];

const ValueCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const progressRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isHovered) {
        setIsAnimating(true);
        setTimeout(() => {
          setCurrentIndex((prevIndex) => (prevIndex + 1) % coreValues.length);
          setIsAnimating(false);
        }, 400);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isHovered]);

  useEffect(() => {
    if (progressRef.current) {
      progressRef.current.style.width = "0%";
      setTimeout(() => {
        if (progressRef.current) {
          progressRef.current.style.width = "100%";
        }
      }, 200);
    }
  }, [currentIndex]);

  const currentValue = coreValues[currentIndex];

  return (
    <section
      id="value-carousel"
      className="py-20 sm:py-24 lg:py-28 transition-all duration-700 ease-in-out"
    >
      <div className="px-4 sm:px-6 lg:px-8 xl:container mx-auto">
        {/* Enhanced Header */}
        <div className="relative mx-auto mb-16 max-w-[720px] text-center">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-3xl blur-3xl transition-all duration-1000 ease-out"></div>
          <span
            className="absolute top-0 left-1/2 -translate-x-1/2 text-[50px] sm:text-[70px] lg:text-[110px] leading-[1] font-black opacity-10 transition-all duration-800 ease-in-out"
            style={{
              background:
                "linear-gradient(180deg, rgba(74, 108, 247, 0.6) 0%, rgba(147, 51, 234, 0.3) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            VALUES
          </span>
          <div className="relative">
            <h2 className="font-heading text-gray-900 dark:text-white mb-6 text-4xl font-bold sm:text-5xl md:text-[56px] md:leading-[64px] tracking-tight transition-all duration-600 ease-out">
              Our Core Values
            </h2>
            <div className="mx-auto h-1.5 w-32 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full mb-8 shadow-lg transition-all duration-500 ease-in-out hover:scale-110"></div>
            <p className="text-gray-600 dark:text-gray-300 text-lg lg:text-xl font-medium leading-relaxed transition-all duration-600 ease-out">
              Explore the principles that drive our innovation and culture.
            </p>
          </div>
        </div>

        {/* Enhanced Carousel */}
        <div className="relative max-w-4xl mx-auto">
          {/* Background Decoration */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-3xl blur-2xl transition-all duration-1000 ease-in-out"></div>
          
          {/* Main Card */}
          <div
            className={`relative rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-2xl p-8 sm:p-12 text-center transition-all duration-700 ease-in-out transform ${
              isAnimating ? "scale-95 opacity-50 rotate-1" : "scale-100 opacity-100 rotate-0"
            } border border-gray-100/50 dark:border-gray-700/50 overflow-hidden hover:shadow-3xl hover:scale-[1.02]`}
            key={currentValue.title}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${currentValue.bgColor} dark:from-gray-800 dark:to-gray-700 opacity-30 transition-all duration-800 ease-in-out`}></div>
            
            {/* Content */}
            <div className="relative z-10">
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-white/80 to-white/40 dark:from-gray-700/80 dark:to-gray-700/40 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 shadow-lg mb-6 transition-all duration-500 ease-in-out hover:scale-110 hover:shadow-xl hover:rotate-6">
                <span className="text-4xl transform transition-all duration-500 ease-in-out hover:scale-125">
                  {currentValue.icon}
                </span>
              </div>

              {/* Title */}
              <h3 className={`text-3xl sm:text-4xl font-bold bg-gradient-to-r ${currentValue.color} bg-clip-text text-transparent mb-4 transition-all duration-600 ease-out hover:scale-105`}>
                {currentValue.title}
              </h3>

              {/* Description */}
              <p className="text-gray-700 dark:text-gray-300 text-lg sm:text-xl mb-6 leading-relaxed max-w-2xl mx-auto transition-all duration-600 ease-out">
                {currentValue.description}
              </p>

              {/* Story */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-2xl p-6 mb-8 border border-gray-200/50 dark:border-gray-600/50 transition-all duration-500 ease-in-out hover:shadow-lg hover:scale-[1.02] hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-600 dark:hover:to-gray-500">
                <p className="italic text-gray-600 dark:text-gray-400 text-base leading-relaxed transition-all duration-500 ease-out">
                  &ldquo;{currentValue.story}&rdquo;
                </p>
              </div>

              {/* Enhanced Progress Bar */}
              <div className="relative">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner transition-all duration-500 ease-in-out">
                  <div
                    ref={progressRef}
                    className={`bg-gradient-to-r ${currentValue.color} h-full w-0 transition-all duration-5000 ease-linear rounded-full shadow-lg`}
                  />
                </div>
                <div className="flex justify-between items-center mt-3 text-sm text-gray-500 dark:text-gray-400 transition-all duration-500 ease-out">
                  <span className="transition-all duration-300 ease-in-out hover:text-gray-700 dark:hover:text-gray-300">Value {currentIndex + 1} of {coreValues.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Dots */}
          <div className="flex justify-center mt-8 space-x-3">
            {coreValues.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setIsAnimating(true);
                  setTimeout(() => {
                    setCurrentIndex(index);
                    setIsAnimating(false);
                  }, 400);
                }}
                className={`w-3 h-3 rounded-full transition-all duration-500 ease-in-out hover:scale-150 hover:shadow-lg ${
                  index === currentIndex
                    ? `bg-gradient-to-r ${currentValue.color} shadow-lg scale-125`
                    : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
                }`}
                aria-label={`Go to value ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ValueCarousel;
