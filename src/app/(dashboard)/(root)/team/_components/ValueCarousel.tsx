"use client";

import React, { useState, useEffect, useRef } from "react";

const coreValues = [
  {
    title: "Customer Obsession",
    description:
      "We put our clients at the heart of every decision, ensuring solutions truly solve their challenges.",
    icon: "🌍",
    story:
      "When a logistics company faced delivery delays, we designed a real-time tracking system that cut waiting times by 35% within two months.",
    color: "from-[#6EE7D8] to-[#2FD1C5]",
    bgColor: "from-[#F2FBF9] to-[#E6F7F6]",
  },
  {
    title: "Innovation",
    description:
      "We embrace curiosity and creativity to stay ahead of the curve with groundbreaking technologies.",
    icon: "🚀",
    story:
      "Our engineers created an AI-powered chatbot that reduced customer support costs by 50% for a global retailer.",
    color: "from-[#2FD1C5] to-[#1E5AA8]",
    bgColor: "from-[#E6F1F5] to-[#EEF7F6]",
  },
  {
    title: "Collaboration",
    description:
      "We believe great things happen when diverse minds work together in harmony.",
    icon: "🤝",
    story:
      "Working hand-in-hand with a non-profit, we co-developed a mobile app that connected 10,000 volunteers to local causes in just six months.",
    color: "from-[#6EE7D8] to-[#1E5AA8]",
    bgColor: "from-[#F7FBFC] to-[#E6F7F6]",
  },
  {
    title: "Excellence",
    description:
      "We never settle for average — every product and service is refined to deliver outstanding quality.",
    icon: "🏆",
    story:
      "Our dedication to detail earned us recognition as 'Best Software Partner 2025' from a Fortune 500 company.",
    color: "from-[#1E5AA8] to-[#0B1C2D]",
    bgColor: "from-[#EEF7F6] to-[#DCEEEE]",
  },
  {
    title: "Integrity",
    description:
      "We uphold honesty, trust, and transparency as the foundation of all relationships.",
    icon: "🛡️",
    story:
      "During a critical fintech project, we openly shared risks with our client and collaboratively built safeguards, saving millions in potential losses.",
    color: "from-[#2FD1C5] to-[#0B1C2D]",
    bgColor: "from-[#F7FBFC] to-[#E6F1F5]",
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
        {/* Header */}
        <div className="relative mx-auto mb-16 max-w-[720px] text-center">
          <div className="absolute inset-0 bg-gradient-to-r from-[#6EE7D8]/15 to-[#1E5AA8]/10 rounded-3xl blur-3xl"></div>
          <span
            className="absolute top-0 left-1/2 -translate-x-1/2 text-[50px] sm:text-[70px] lg:text-[110px] leading-[1] font-black opacity-10"
            style={{
              background:
                "linear-gradient(180deg, rgba(47, 209, 197, 0.6) 0%, rgba(30, 90, 168, 0.3) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            VALUES
          </span>
          <div className="relative">
            <h2 className="font-heading text-[#0F172A] dark:text-white mb-6 text-4xl font-bold sm:text-5xl md:text-[56px] md:leading-[64px] tracking-tight">
              Our Core Values
            </h2>
            <div className="mx-auto h-1.5 w-32 bg-gradient-to-r from-[#6EE7D8] via-[#2FD1C5] to-[#1E5AA8] rounded-full mb-8 shadow-lg"></div>
              <p className="text-[#475569] dark:text-[#9FB3C8] text-lg lg:text-xl font-medium leading-relaxed">
              Explore the principles that drive our innovation and culture.
            </p>
          </div>
        </div>

        {/* Carousel */}
        <div className="relative max-w-4xl mx-auto">
          <div className="absolute inset-0 bg-gradient-to-br from-[#F7FBFC]/50 via-transparent to-[#F7FBFC]/50 dark:from-[#050B14]/20 dark:to-[#050B14]/20 rounded-3xl blur-2xl"></div>

          {/* Card */}
          <div
            className={`relative rounded-3xl bg-white/80 dark:bg-[#102A3A]/80 backdrop-blur-xl shadow-2xl p-8 sm:p-12 text-center transition-all duration-700 ease-in-out transform ${
              isAnimating
                ? "scale-95 opacity-50 rotate-1"
                : "scale-100 opacity-100 rotate-0"
            } border border-[#E6F7F6]/50 dark:border-[#0B1C2D]/50 overflow-hidden`}
            key={currentValue.title}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${currentValue.bgColor} dark:from-[#102A3A] dark:to-[#0B1C2D] opacity-30`}
            ></div>

            <div className="relative z-10">
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-white/80 to-white/40 dark:from-[#0B1C2D]/80 dark:to-[#0B1C2D]/40 backdrop-blur-sm border border-white/20 dark:border-[#1E5AA8]/20 shadow-lg mb-6">
                <span className="text-4xl">{currentValue.icon}</span>
              </div>

              {/* Title */}
              <h3
                className={`text-3xl sm:text-4xl font-bold bg-gradient-to-r ${currentValue.color} bg-clip-text text-transparent mb-4`}
              >
                {currentValue.title}
              </h3>

              {/* Description */}
              <p className="text-[#475569] dark:text-[#9FB3C8] text-lg sm:text-xl mb-6 leading-relaxed max-w-2xl mx-auto">
                {currentValue.description}
              </p>

              {/* Story */}
              <div className="bg-gradient-to-r from-[#F7FBFC] to-[#E6F7F6] dark:from-[#0B1C2D] dark:to-[#1E5AA8] rounded-2xl p-6 mb-8 border border-[#DCEEEE]/50 dark:border-[#1E5AA8]/50">
                <p className="italic text-[#1E5AA8] dark:text-[#6EE7D8] text-base leading-relaxed">
                  &ldquo;{currentValue.story}&rdquo;
                </p>
              </div>

              {/* Progress Bar */}
              <div className="relative">
                <div className="h-3 bg-[#DCEEEE] dark:bg-[#0B1C2D] rounded-full overflow-hidden shadow-inner">
                  <div
                    ref={progressRef}
                    className={`bg-gradient-to-r ${currentValue.color} h-full w-0 transition-all duration-5000 ease-linear rounded-full shadow-lg`}
                  />
                </div>
                <div className="flex justify-between items-center mt-3 text-sm text-[#2FD1C5] dark:text-[#6EE7D8]">
                  <span>
                    Value {currentIndex + 1} of {coreValues.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ValueCarousel;
