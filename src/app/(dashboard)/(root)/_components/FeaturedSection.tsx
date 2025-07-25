

const FeaturedSection = () => {
  const features = [
    {
      icon: (
        <svg width="44" height="44" viewBox="0 0 44 44" className="fill-current">
          <path d="M3.66663 23.8333H14.6666V38.5H3.66663V23.8333ZM16.5 5.5H27.5V38.5H16.5V5.5Z" />
          <path opacity="0.5" d="M29.3333 14.6667H40.3333V38.5H29.3333V14.6667Z" />
        </svg>
      ),
      title: 'Startup-Focused Solutions',
      description: 'We specialize in accelerating startup growth with tailored strategies and cutting-edge technology.',
      delay: '.2s',
    },
    {
      icon: (
        <svg width="44" height="44" viewBox="0 0 44 44" className="fill-current">
          <path d="M22.9424 2.39982L39.0226 12.0468C39.1585 12.1282 39.271 12.2434 39.3492 12.3813C39.4273 12.5191 39.4684 12.6749 39.4684 12.8333C39.4684 12.9918 39.4273 13.1475 39.3492 13.2854C39.271 13.4232 39.1585 13.5384 39.0226 13.6198L22.0001 23.8333L4.97756 13.6198C4.84161 13.5384 4.72908 13.4232 4.65094 13.2854C4.57281 13.1475 4.53174 12.9918 4.53174 12.8333C4.53174 12.6749 4.57281 12.5191 4.65094 12.3813C4.72908 12.2434 4.84161 12.1282 4.97756 12.0468L21.0559 2.39982C21.341 2.22851 21.6674 2.138 22.0001 2.138C22.3327 2.138 22.6591 2.22851 22.9442 2.39982H22.9424Z" />
          <path opacity="0.5" d="M36.8189 19.2501L39.0226 20.5719C39.1585 20.6533 39.271 20.7685 39.3492 20.9064C39.4273 21.0442 39.4684 21.1999 39.4684 21.3584C39.4684 21.5168 39.4273 21.6726 39.3492 21.8104C39.271 21.9483 39.1585 22.0635 39.0226 22.1449L22.0001 32.3584L4.97756 22.1449C4.84161 22.0635 4.72908 21.9483 4.65094 21.8104C4.57281 21.6726 4.53174 21.5168 4.53174 21.3584C4.53174 21.1999 4.57281 21.0442 4.65094 20.9064C4.72908 20.7685 4.84161 20.6533 4.97756 20.5719L7.18123 19.2501L22.0001 28.1417L36.8189 19.2501ZM36.8189 27.8667L39.0226 29.1886C39.1585 29.2699 39.271 29.3852 39.3492 29.523C39.4273 29.6609 39.4684 29.8166 39.4684 29.9751C39.4684 30.1335 39.4273 30.2893 39.3492 30.4271C39.271 30.5649 39.1585 30.6802 39.0226 30.7616L22.9442 40.4086C22.6591 40.5799 22.3327 40.6704 22.0001 40.6704C21.6674 40.6704 21.341 40.5799 21.0559 40.4086L4.97756 30.7616C4.84161 30.6802 4.72908 30.5649 4.65094 30.4271C4.57281 30.2893 4.53174 30.1335 4.53174 29.9751C4.53174 29.8166 4.57281 29.6609 4.65094 29.523C4.72908 29.3852 4.84161 29.2699 4.97756 29.1886L7.18123 27.8667L22.0001 36.7584L36.8189 27.8667Z" />
        </svg>
      ),
      title: 'Premium Design Quality',
      description: 'Our contemporary designs elevate your brand with unique, visually impressive solutions that stand out.',
      delay: '.25s',
    },
    {
      icon: (
        <svg width="44" height="44" viewBox="0 0 44 44" className="fill-current">
          <path d="M36.6667 40.3334H7.33333C6.8471 40.3334 6.38079 40.1402 6.03697 39.7964C5.69315 39.4526 5.5 38.9863 5.5 38.5V14.6667H38.5V38.5C38.5 38.9863 38.3068 39.4526 37.963 39.7964C37.6192 40.1402 37.1529 40.3334 36.6667 40.3334ZM12.8333 20.1667V27.5H20.1667V20.1667H12.8333ZM12.8333 31.1667V34.8334H31.1667V31.1667H12.8333ZM23.8333 22V25.6667H31.1667V22H23.8333Z" />
          <path opacity="0.5" d="M38.5 11H5.5V5.49996C5.5 5.01373 5.69315 4.54741 6.03697 4.2036C6.38079 3.85978 6.8471 3.66663 7.33333 3.66663H36.6667C37.1529 3.66663 37.6192 3.85978 37.963 4.2036C38.3068 4.54741 38.5 5.01373 38.5 5.49996V11Z" />
        </svg>
      ),
      title: 'Business Growth Framework',
      description: 'We offer complimentary marketing services designed to maximize your business potential and drive success.',
      delay: '.3s',
    },
    {
      icon: (
        <svg width="44" height="44" viewBox="0 0 44 44" className="fill-current">
          <path d="M22 3.66663C32.1255 3.66663 40.3333 11.8745 40.3333 22C40.3333 32.1255 32.1255 40.3333 22 40.3333C11.8745 40.3333 3.66663 32.1255 3.66663 22C3.66663 11.8745 11.8745 3.66663 22 3.66663ZM22 7.33329C13.9003 7.33329 7.33329 13.9003 7.33329 22C7.33329 30.0996 13.9003 36.6666 22 36.6666C30.0996 36.6666 36.6666 30.0996 36.6666 22C36.6666 13.9003 30.0996 7.33329 22 7.33329ZM29.777 11.6288L32.3711 14.2211L25.5438 21.0521C25.6245 21.3546 25.6666 21.6718 25.6666 22C25.6666 24.0258 24.0258 25.6666 22 25.6666C19.9741 25.6666 18.3333 24.0258 18.3333 22C18.3333 19.9741 19.9741 18.3333 22 18.3333C22.3281 18.3333 22.6453 18.3755 22.9478 18.4561L29.7788 11.6288H29.777Z" />
          <path opacity="0.5" d="M22 9.16663C23.8663 9.16663 25.6391 9.56446 27.2396 10.2813L24.3741 13.145C23.617 12.9433 22.8213 12.8333 22 12.8333C16.9381 12.8333 12.8333 16.9381 12.8333 22C12.8333 24.53 13.86 26.8216 15.5173 28.4826L12.925 31.075L12.639 30.7798C10.4866 28.4845 9.16663 25.3953 9.16663 22C9.16663 14.9123 14.9123 9.16663 22 9.16663ZM33.7186 16.7621C34.4336 18.3608 34.8333 20.1355 34.8333 22C34.8333 25.5438 33.396 28.7521 31.075 31.075L28.4826 28.4826C30.14 26.8216 31.1666 24.53 31.1666 22C31.1666 21.1786 31.0585 20.383 30.855 19.6258L33.7186 16.7621Z" />
        </svg>
      ),
      title: 'Performance Optimization',
      description: 'We prioritize lightning-fast performance to deliver exceptional user experiences and maximize engagement.',
      delay: '.35s',
    },
    {
      icon: (
        <svg width="44" height="44" viewBox="0 0 44 44" className="fill-current">
          <path d="M25.6667 38.5H7.33333C6.8471 38.5 6.38079 38.3068 6.03697 37.963C5.69315 37.6192 5.5 37.1529 5.5 36.6667V18.3333H25.6667V38.5ZM38.5 14.6667H5.5V7.33333C5.5 6.8471 5.69315 6.38079 6.03697 6.03697C6.38079 5.69315 6.8471 5.5 7.33333 5.5H36.6667C37.1529 5.5 37.6192 5.69315 37.963 6.03697C38.3068 6.38079 38.5 6.8471 38.5 7.33333V14.6667Z" />
          <path opacity="0.5" d="M29.3334 38.5V18.3334H38.5V36.6667C38.5 37.1529 38.3069 37.6193 37.9631 37.9631C37.6193 38.3069 37.1529 38.5 36.6667 38.5H29.3334Z" />
        </svg>
      ),
      title: 'Tailored Customization',
      description: 'Our solutions are fully adaptable to meet your specific requirements and business objectives.',
      delay: '.4s',
    },
    {
      icon: (
        <svg width="44" height="44" viewBox="0 0 44 44" className="fill-current">
          <path opacity="0.5" d="M10.0154 8.12714C13.3421 5.24452 17.598 3.6605 21.9999 3.66664C32.1254 3.66664 40.3332 11.8745 40.3332 22C40.3332 25.916 39.1049 29.546 37.0149 32.5233L31.1665 22H36.6665C36.6668 19.1246 35.8218 16.3126 34.2368 13.9136C32.6517 11.5146 30.3964 9.63443 27.7514 8.50687C25.1063 7.37931 22.1882 7.0541 19.3598 7.57168C16.5314 8.08926 13.9175 9.42679 11.8432 11.418L10.0154 8.12714Z" />
          <path d="M33.9843 35.8729C30.6576 38.7555 26.4017 40.3395 21.9998 40.3333C11.8743 40.3333 3.6665 32.1255 3.6665 22C3.6665 18.084 4.89484 14.454 6.98484 11.4767L12.8332 22H7.33317C7.33293 24.8754 8.17788 27.6874 9.76295 30.0864C11.348 32.4854 13.6033 34.3656 16.2483 35.4931C18.8934 36.6207 21.8115 36.9459 24.6399 36.4283C27.4683 35.9107 30.0822 34.5732 32.1565 32.582L33.9843 35.8729Z" />
        </svg>
      ),
      title: 'Continuous Improvement',
      description: 'Our team of expert developers ensures regular updates and maintenance for optimal performance.',
      delay: '.45s',
    },
  ];

  return (
    <section id="features" className="py-8 sm:py-10 md:py-16 lg:py-28">
      <div className="px-2 sm:px-4 md:px-8 xl:container mx-auto max-w-screen-xl">
        {/* Section Title */}
        <div
          className="relative mx-auto mb-6 sm:mb-10 md:mb-20 max-w-[98vw] sm:max-w-[620px] pt-2 sm:pt-6 lg:pt-16 text-center"
          data-wow-delay=".2s"
        >
          <span
            className="absolute top-0 left-1/2 -translate-x-1/2 text-[24px] sm:text-[40px] lg:text-[95px] font-extrabold leading-none opacity-20 dark:opacity-80"
            style={{
              background: 'linear-gradient(180deg, rgba(74, 108, 247, 0.4) 0%, rgba(74, 108, 247, 0) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              color: 'transparent',
              ...(typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? { WebkitTextFillColor: '#f3f4f6', color: '#f3f4f6', background: 'none' } : {})
            }}
          >
            FEATURES
          </span>

          <h2 className="font-heading text-dark mb-2 sm:mb-4 text-xl sm:text-2xl md:text-4xl lg:text-[50px] md:leading-[60px] dark:text-gray-100">
            Our Unique & Awesome Core Features
          </h2>
          <p className="text-dark-text text-xs sm:text-base md:text-lg">
            Discover powerful features: intuitive design, seamless integration, robust security, and scalable solutions to elevate your business with cutting-edge technology.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-6 sm:gap-y-10 gap-x-2 md:gap-x-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col items-center w-full animate-fade-in"
              style={{ animationDelay: feature.delay }}
            >
              <div className="group mx-auto mb-6 sm:mb-8 md:mb-16 max-w-[98vw] sm:max-w-[380px] text-center">
                <div className="bg-primary/5 text-primary mx-auto mb-3 sm:mb-6 flex h-[48px] w-[48px] sm:h-[70px] sm:w-[70px] md:h-[90px] md:w-[90px] items-center justify-center rounded-full transition-colors duration-300 group-hover:bg-blue-200 dark:bg-white/5 dark:text-white dark:group-hover:bg-blue-700">
                  {feature.icon}
                </div>
                <h3 className="font-heading text-dark mb-1 sm:mb-2 md:mb-5 text-base sm:text-xl md:text-2xl font-medium dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-dark-text text-xs sm:text-base md:text-lg">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(32px) scale(0.95); }
          50% { opacity: 0.7; transform: translateY(16px) scale(0.98); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s cubic-bezier(0.4, 0, 0.2, 1) both;
        }
      `}</style>
    </section>
  );
};

export default FeaturedSection;