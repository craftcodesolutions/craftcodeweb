/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

interface Review {
  _id: string;
  name: string;
  title: string;
  image?: string | null;
  message: string;
  rating: number;
  status: boolean;
}

// Dynamic import for react-slick
const Slider = dynamic(() => import("react-slick"), { ssr: false });

const TestimonialsSlider: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/reviews?status=true");
        if (!res.ok) throw new Error(`Failed to fetch reviews (status: ${res.status})`);

        const data = await res.json();
        const approvedReviews: Review[] = Array.isArray(data.reviews)
          ? data.reviews.filter((r: Review) => r.status === true)
          : [];
        setReviews(approvedReviews);
      } catch (err: any) {
        setError(err instanceof Error ? err.message : "Failed to fetch reviews");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    autoplay: true,
    autoplaySpeed: 5000,
    adaptiveHeight: true,
    dotsClass: "slick-dots custom-dots",
    className: "testimonial-active",
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = "/placeholder.png";
  };

  if (isLoading) {
    return (
      <section id="testimonials" className="relative overflow-hidden py-16">
        <div className="absolute inset-0 bg-gradient-to-br from-[#F7FBFC] via-[#EEF7F6] to-[#F7FBFC] dark:from-[#050B14] dark:via-[#0B1C2D] dark:to-[#050B14]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(110,231,216,0.35),transparent_55%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_85%,rgba(30,90,168,0.25),transparent_55%)]"></div>
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#2FD1C5]/60 to-transparent"></div>
        </div>
        <div className="relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Title Skeleton */}
          <div className="relative mx-auto mb-12 max-w-[620px] text-center md:mb-20">
            <div className="h-8 w-32 mx-auto bg-[#EEF7F6] dark:bg-[#102A3A] rounded animate-pulse"></div>
            <div className="h-10 w-3/4 mx-auto mt-4 bg-[#EEF7F6] dark:bg-[#102A3A] rounded animate-pulse"></div>
            <div className="h-4 w-1/2 mx-auto mt-4 bg-[#EEF7F6] dark:bg-[#102A3A] rounded animate-pulse"></div>
          </div>

          {/* Slider Skeleton */}
          <div className="bg-white/70 dark:bg-[#0B1C2D] rounded-lg border border-[#DCEEEE] dark:border-[#1E3A4A] shadow-xl px-6 py-10 sm:px-8 sm:py-12 md:px-10 md:py-14 drop-shadow-xl dark:drop-shadow-none">
            <div className="flex flex-col items-center gap-y-8 lg:flex-row lg:gap-x-10 lg:gap-y-0 min-h-[420px]">
              {/* Text Content Skeleton */}
              <div className="w-full lg:w-1/2 flex flex-col justify-center">
                <div className="h-4 w-3/4 bg-[#EEF7F6] dark:bg-[#102A3A] rounded animate-pulse mb-4"></div>
                <div className="h-4 w-5/6 bg-[#EEF7F6] dark:bg-[#102A3A] rounded animate-pulse mb-4"></div>
                <div className="h-4 w-2/3 bg-[#EEF7F6] dark:bg-[#102A3A] rounded animate-pulse mb-4"></div>
                <div className="h-6 w-1/2 bg-[#EEF7F6] dark:bg-[#102A3A] rounded animate-pulse mb-2"></div>
                <div className="h-4 w-1/3 bg-[#EEF7F6] dark:bg-[#102A3A] rounded animate-pulse"></div>
              </div>
              {/* Image Skeleton */}
              <div className="w-full max-w-[220px] sm:max-w-[260px] lg:w-1/2 flex items-center justify-center">
                <div className="w-[180px] h-[180px] sm:w-[220px] sm:h-[220px] lg:w-[260px] lg:h-[260px] bg-[#EEF7F6] dark:bg-[#102A3A] rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="testimonials" className="relative overflow-hidden py-16">
        <div className="absolute inset-0 bg-gradient-to-br from-[#F7FBFC] via-[#EEF7F6] to-[#F7FBFC] dark:from-[#050B14] dark:via-[#0B1C2D] dark:to-[#050B14]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(110,231,216,0.35),transparent_55%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_85%,rgba(30,90,168,0.25),transparent_55%)]"></div>
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#2FD1C5]/60 to-transparent"></div>
        </div>
        <div className="relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center py-20 text-red-500 dark:text-red-400 text-lg font-medium">{error}</p>
        </div>
        </div>
      </section>
    );
  }

  if (reviews.length === 0) {
    return (
      <section id="testimonials" className="relative overflow-hidden py-16">
        <div className="absolute inset-0 bg-gradient-to-br from-[#F7FBFC] via-[#EEF7F6] to-[#F7FBFC] dark:from-[#050B14] dark:via-[#0B1C2D] dark:to-[#050B14]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(110,231,216,0.35),transparent_55%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_85%,rgba(30,90,168,0.25),transparent_55%)]"></div>
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#2FD1C5]/60 to-transparent"></div>
        </div>
        <div className="relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center py-20 text-[#7B8A9A] dark:text-[#6B8299] text-lg font-medium">
            No testimonials found.
          </p>
        </div>
        </div>
      </section>
    );
  }

  return (
    <section id="testimonials" className="relative overflow-hidden py-16">
      <div className="absolute inset-0 bg-gradient-to-br from-[#F7FBFC] via-[#EEF7F6] to-[#F7FBFC] dark:from-[#050B14] dark:via-[#0B1C2D] dark:to-[#050B14]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(110,231,216,0.35),transparent_55%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_85%,rgba(30,90,168,0.25),transparent_55%)]"></div>
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#2FD1C5]/60 to-transparent"></div>
      </div>
      <div className="relative z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="relative mx-auto mb-12 max-w-[620px] text-center md:mb-20">
          <span className="absolute top-0 left-1/2 -translate-x-1/2 text-[80px] font-extrabold text-[#DCEEEE] dark:text-[#1E3A4A] opacity-30 tracking-wider">
            TRUSTS
          </span>
          <h2 className="font-heading text-[#0F172A] dark:text-[#E6F1F5] text-4xl sm:text-5xl md:text-6xl font-bold relative z-10 leading-tight">
            Trusted by Our Community
            <span className="block h-1.5 w-28 mx-auto mt-4 bg-gradient-to-r from-[#6EE7D8] via-[#2FD1C5] to-[#1E5AA8] dark:from-[#0FD9C3] dark:via-[#0B8ED8] dark:to-[#0A2A66] rounded-full animate-gradient-x"></span>
          </h2>
          <p className="text-[#475569] dark:text-[#9FB3C8] text-lg sm:text-xl mt-4 leading-relaxed max-w-md mx-auto">
            Discover why our users love and trust our innovative solutions.
          </p>
        </div>

        {/* Slider */}
        <div className="bg-white/70 dark:bg-[#0B1C2D] rounded-lg border border-[#DCEEEE] dark:border-[#1E3A4A] shadow-2xl px-6 py-10 sm:px-8 sm:py-12 md:px-12 md:py-14 lg:px-16 lg:py-16 transition-all duration-300 hover:shadow-3xl">
          {Slider && (
            <Slider {...sliderSettings}>
              {reviews.map((testimonial, index) => (
                <div key={testimonial._id} className="testimonial-item">
                  <div className="flex flex-col items-center gap-y-8 lg:flex-row lg:gap-x-10 lg:gap-y-0 min-h-[420px] sm:min-h-[480px] lg:min-h-[360px]">
                    {/* Text Content */}
                    <div className="w-full lg:w-1/2 lg:text-left flex flex-col justify-center">
                      <p
                        className="font-serif text-[#475569] dark:text-[#E6F1F5] text-base sm:text-lg lg:text-xl xl:text-2xl font-light italic line-clamp-6 sm:line-clamp-8 lg:line-clamp-6 mb-6 leading-relaxed"
                        title={testimonial.message}
                      >
                        <span className="text-[#2FD1C5] text-2xl mr-2">“</span>
                        {testimonial.message}
                        <span className="text-[#2FD1C5] text-2xl ml-2">”</span>
                      </p>
                      <h3 className="font-heading text-[#0F172A] dark:text-[#E6F1F5] text-xl sm:text-2xl lg:text-3xl font-bold">
                        {testimonial.name}
                      </h3>
                      <p className="text-[#1E5AA8] dark:text-[#9FB3C8] text-sm sm:text-base lg:text-lg mt-2">
                        {testimonial.title}
                      </p>
                    </div>

                    {/* Image */}
                    {testimonial.image && (
                      <div className="w-full max-w-[220px] sm:max-w-[260px] lg:w-1/2 lg:max-w-none flex items-center justify-center">
                        <div className="relative w-[180px] h-[180px] sm:w-[220px] sm:h-[220px] lg:w-[280px] lg:h-[280px] overflow-hidden rounded-lg shadow-md">
                          <Image
                            src={testimonial.image}
                            alt={testimonial.name}
                            width={280}
                            height={280}
                            className="object-cover w-full h-full rounded-lg transition-transform duration-300 hover:scale-105"
                            priority={index === 0}
                            onError={handleImageError}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </Slider>
          )}
        </div>
      </div>
      </div>
      <style jsx>{`
        .custom-dots li button:before {
          font-size: 12px;
          color: #DCEEEE;
          opacity: 0.5;
        }
        .custom-dots li.slick-active button:before {
          color: #2FD1C5;
          opacity: 1;
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 4s ease infinite;
        }
        @keyframes gradient-x {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .shadow-3xl {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
      `}</style>
    </section>
  );
};

export default TestimonialsSlider;
