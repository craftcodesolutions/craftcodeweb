/* eslint-disable react-hooks/exhaustive-deps */
"use client";
// components/Testimonial.tsx
import Image from "next/image";
import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import { Settings } from "react-slick";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

interface SliderRef {
  slickGoTo: (index: number) => void;
}

interface SliderComponentProps extends Settings {
  children: React.ReactNode;
  className?: string;
  ref?: React.Ref<SliderRef>;
}

const Slider = dynamic(() => import("react-slick"), { ssr: false }) as React.ComponentType<SliderComponentProps>;

interface TestimonialItem {
  quote: string;
  name: string;
  title: string;
  imageSrc: string;
}

const TestimonialSection: React.FC = () => {
  const sliderRef = useRef<SliderRef | null>(null);

  const testimonials: TestimonialItem[] = [
    {
      quote:
        "Marketing isn't just about visibility—it's about building trust. At CodeCraft, I aim to turn every interaction into an opportunity to inspire confidence and spark action.",
      name: "Jayed Bin Islam",
      title: "CMO @codecraft",
      imageSrc: "/images/testimonial/jayed.jpeg",
    },
    {
      quote:
        "Every piece of content we create should elevate the reader's understanding. I believe in thoughtful storytelling that mirrors the quality of our software.",
      name: "Tahmid Hasan Showmik",
      title: "Editorial Head @codecraft",
      imageSrc: "/images/testimonial/shoumik.jpeg",
    },
    {
      quote:
        "Design isn't just how it looks—it’s how it works. At CodeCraft, I craft visual systems that make complex ideas feel simple and beautiful.",
      name: "Raihan Hossain",
      title: "Graphic Designer @codecraft",
      imageSrc: "/images/testimonial/molla.jpg",
    },
    {
      quote:
        "As a developer, I see code as an invisible bridge between ideas and impact. At CodeCraft, I write not just functions, but future-ready experiences.",
      name: "Atik Mahbub Akash",
      title: "Senior Software Engineer @codecraft",
      imageSrc: "/images/testimonial/atik.jpg",
    },
    {
      quote:
        "Leadership is about nurturing innovation. At CodeCraft, I focus on creating a culture where creativity meets precision—and big ideas become real products.",
      name: "Fahad Alamgir Dhrubo",
      title: "CEO @codecraft",
      imageSrc: "/images/testimonial/dhrubo.jpg", 
    },
    {
      quote:
        "I transform strategy into social moments. As SMM at CodeCraft, I turn brands into communities and campaigns into conversations.",
      name: "Juhayer Anzum Kabbo",
      title: "SMM @codecraft",
      imageSrc: "/images/testimonial/protibondi.jpg",
    },
    {
      quote:
        "Even the strongest systems are built by the hands that carry the foundation. I take pride in being a part of every build at CodeCraft.",
      name: "Mohammad Siam",
      title: "Labourer @codecraft",
      imageSrc: "/images/testimonial/cudirvai.jpg",
    },
  ];
  

  const sliderSettings: Settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    autoplay: true,
    autoplaySpeed: 5000,
    adaptiveHeight: false,
    dotsClass: "slick-dots custom-dots",
    className: "testimonial-active",
  };

  useEffect(() => {
    if (sliderRef.current && testimonials.length > 0) {
      sliderRef.current.slickGoTo(0);
    }
  }, [testimonials]);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = "/images/testimonial/fallback-image.jpeg"; // Fallback image path
  };

  return (
    <section id="testimonial">
      <div className="px-4 sm:px-6 xl:container mx-auto">
        {/* Section Title */}
        <div
          className="relative mx-auto mb-12 max-w-[620px] pt-6 text-center md:mb-20 lg:pt-16 animate-fade-in"
          data-wow-delay=".2s"
        >
          <span
            className="absolute top-0 left-1/2 -translate-x-1/2 text-[40px] sm:text-[60px] lg:text-[95px] leading-[1] font-extrabold opacity-20 dark:opacity-80"
            style={{
              background: 'linear-gradient(180deg, rgba(74, 108, 247, 0.4) 0%, rgba(74, 108, 247, 0) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              color: 'transparent',
              ...(typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? { WebkitTextFillColor: '#f3f4f6', color: '#f3f4f6', background: 'none' } : {})
            }}
          >
            LEADERSHIP
          </span>
          <h2 className="font-heading text-dark mb-5 text-3xl font-semibold sm:text-4xl md:text-[50px] md:leading-[60px] dark:text-gray-100">
            The brilliant minds powering innovation
          </h2>
          <p className="text-dark-text text-base leading-relaxed">
            Meet the visionaries who turned late-night coffee runs into groundbreaking code.
            This is where revolutionary ideas meet relentless execution.
          </p>
        </div>

        <div className="w-full px-4 sm:px-6">
          <div className="drop-shadow-light relative z-10 overflow-hidden rounded-sm bg-white px-6 py-8 sm:px-8 sm:py-10 md:px-10 md:py-12 lg:px-12 lg:py-14 dark:drop-shadow-none dark:bg-gray-800">
            <Slider {...sliderSettings} ref={sliderRef}>
              {testimonials.map((testimonial, index) => (
                <div key={index} className="testimonial-item">
                  <div className="flex flex-col items-center gap-y-6 sm:gap-y-8 lg:flex-row lg:gap-x-8 lg:gap-y-0 min-h-[500px] sm:min-h-[550px] lg:min-h-[400px]">
                    {/* Text Content */}
                    <div className="w-full lg:w-1/2 lg:text-left flex flex-col justify-center">
                      <p
                        className="font-heading text-dark-text mb-4 sm:mb-6 text-sm sm:text-base lg:text-lg xl:text-xl font-light italic line-clamp-6 sm:line-clamp-8 lg:line-clamp-6"
                        title={testimonial.quote}
                      >
                        “{testimonial.quote}”
                      </p>
                      <h3 className="font-heading text-dark text-lg sm:text-xl lg:text-2xl font-semibold dark:text-white">
                        {testimonial.name}
                      </h3>
                      <p className="text-dark-text text-xs sm:text-sm lg:text-base">
                        {testimonial.title}
                      </p>
                    </div>
                    {/* Image */}
                    <div className="w-full max-w-[300px] sm:max-w-[360px] lg:w-1/2 lg:max-w-none flex items-center justify-center">
                      <div className="relative w-[280px] h-[280px] sm:w-[330px] sm:h-[330px] lg:w-[360px] lg:h-[360px] overflow-hidden">
                        <div className="absolute top-4 right-4 sm:top-5 sm:right-5 z-20">
                          <Image
                            src={testimonial.imageSrc}
                            alt={`${testimonial.name}'s testimonial image`}
                            width={360}
                            height={360}
                            className="object-cover w-[280px] h-[280px] sm:w-[330px] sm:h-[330px] lg:w-[360px] lg:h-[360px] rounded-sm"
                            priority={index === 0}
                            onError={handleImageError}
                          />
                          <div className="border-primary/10 bg-primary/5 dark:border-opacity-10 absolute -top-4 -right-4 -z-10 h-full w-full border backdrop-blur-[6px] dark:border-white/10 dark:bg-white/10"></div>
                        </div>
                        <div className="absolute right-0 bottom-0 z-10">
                          <svg
                            width="48"
                            height="24"
                            viewBox="0 0 72 38"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-[36px] h-[18px] sm:w-[48px] sm:h-[24px] lg:w-[60px] lg:h-[30px]"
                          >
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M62.0035 2.04985C59.6808 1.76671 57.3575 1.48357 55.0342 1.20043C52.7108 0.917293 50.3875 0.634154 48.0642 0.351015C45.7408 0.0678758 43.4175 -0.215264 41.0942 0.0678758C38.7708 0.351015 36.4475 0.634154 34.1242 0.917293C31.8008 1.20043 29.4775 1.48357 27.1542 1.76671C24.8308 2.04985 22.5075 2.33299 20.1842 2.61613C17.8608 2.89927 15.5375 3.18241 13.2142 3.46555C10.8908 3.74869 8.56746 4.03183 6.24417 4.31497C3.92083 4.59811 1.5975 4.88125 0.774167 5.16439L0.774167 37.1644C3.0975 36.8812 5.42083 36.5981 7.74417 36.315C10.0675 36.0318 12.3908 35.7487 14.7142 35.4655C17.0375 35.1824 19.3608 34.8993 21.6842 34.6161C24.0075 34.333 26.3308 34.0498 28.6542 33.7667C30.9775 33.4836 33.3008 33.2004 35.6242 32.9173C37.9475 32.6342 40.2708 32.351 42.5942 32.0679C44.9175 31.7848 47.2408 31.5016 49.5642 31.2185C51.8875 30.9353 54.2108 30.6522 56.5342 30.3691C58.8575 30.0859 61.1808 29.8028 63.5042 29.5196C65.8275 29.2365 68.1508 28.9534 70.4742 28.6702C70.7575 28.3871 71.0408 28.104 71.3242 27.8208C71.6075 27.5377 71.8908 27.2546 71.8908 26.9714L71.8908 5.44753C71.6075 5.16439 71.3242 4.88125 71.0408 4.59811C70.7575 4.31497 70.4742 4.03183 70.1908 3.74869C69.9075 3.46555 69.6242 3.18241 69.3408 2.89927C69.0575 2.61613 68.7742 2.33299 68.4908 2.04985C66.1675 2.33299 63.8442 2.61613 61.5208 2.89927L62.0035 2.04985Z"
                              fill="#4A6CF7"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </Slider>
          </div>
        </div>
      </div>

      {/* Custom CSS for Slider Dots and Responsive Text */}
      <style jsx>{`
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(32px) scale(0.95); }
          50% { opacity: 0.7; transform: translateY(16px) scale(0.98); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s cubic-bezier(0.4, 0, 0.2, 1) both;
        }
        .custom-dots {
          bottom: -40px;
          display: flex !important;
          justify-content: center;
          gap: 8px;
        }
        .custom-dots li {
          width: 12px;
          height: 12px;
          margin: 0;
        }
        .custom-dots li button {
          width: 12px;
          height: 12px;
          padding: 0;
        }
        .custom-dots li button:before {
          content: "";
          width: 12px;
          height: 12px;
          background: rgba(74, 108, 247, 0.3);
          border-radius: 50%;
          opacity: 1;
          transition: background 0.3s ease, transform 0.3s ease;
        }
        .custom-dots li.slick-active button:before {
          background: #4a6cf7;
          transform: scale(1.2);
        }
        .testimonial-item {
          padding: 0 16px;
        }
        .line-clamp-6 {
          display: -webkit-box;
          -webkit-line-clamp: 6;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .line-clamp-8 {
          display: -webkit-box;
          -webkit-line-clamp: 8;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        @media (max-width: 1024px) {
          .testimonial-item {
            padding: 0 12px;
          }
          .line-clamp-6 {
            -webkit-line-clamp: 8;
          }
        }
        @media (max-width: 640px) {
          .custom-dots {
            bottom: -30px;
            gap: 6px;
          }
          .custom-dots li {
            width: 10px;
            height: 10px;
          }
          .custom-dots li button:before {
            width: 10px;
            height: 10px;
          }
          .testimonial-item {
            padding: 0 8px;
          }
          .line-clamp-6 {
            -webkit-line-clamp: 6;
          }
          .line-clamp-8 {
            -webkit-line-clamp: 6;
          }
        }
      `}</style>
    </section>
  );
};

export default TestimonialSection;