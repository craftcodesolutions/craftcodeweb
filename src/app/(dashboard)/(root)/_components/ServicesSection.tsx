"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const services = [
  {
    title: "Website Development",
    description:
      "We craft stunning, responsive websites tailored to your business needs, ensuring seamless user experiences across all devices.",
    icon: "🌐",
  },
  {
    title: "App Development",
    description:
      "From iOS to Android, we build intuitive mobile apps that engage users and drive your business forward.",
    icon: "📱",
  },
  {
    title: "Software Development",
    description:
      "Our team develops custom software solutions to streamline your operations and boost productivity.",
    icon: "💻",
  },
  {
    title: "Product Maintenance",
    description:
      "We provide ongoing support and maintenance to keep your websites, apps, and software running smoothly.",
    icon: "🛠️",
  },
  {
    title: "UI/UX Design",
    description:
      "Our designers create intuitive and visually appealing interfaces to enhance user satisfaction and engagement.",
    icon: "🎨",
  },
  {
    title: "Cloud Solutions",
    description:
      "We help you leverage the power of the cloud for scalability, security, and efficiency in your business operations.",
    icon: "☁️",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.12 + 0.1,
      duration: 0.7,
      ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
    },
  }),
};

const ServicesSection: React.FC = () => {
  return (
    <section
      id="services"
      className="py-12 sm:py-16 lg:py-20 transition-colors duration-300"
      aria-label="Services Section"
    >
      <div className="px-4 sm:px-6 lg:px-8 xl:container mx-auto relative z-10">
        {/* Section Title */}
        <div
          className="relative mx-auto mb-12 max-w-[620px] pt-6 text-center md:mb-20 lg:pt-16"
          data-wow-delay=".2s"
        >
          <span
            className="absolute top-0 left-1/2 -translate-x-1/2 text-[40px] sm:text-[60px] lg:text-[95px] leading-[1] font-extrabold opacity-20"
            style={{
              background:
                "linear-gradient(180deg, rgba(74, 108, 247, 0.4) 0%, rgba(74, 108, 247, 0) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            SERVICES
          </span>
          <h2 className="font-heading text-dark mb-3 text-3xl font-semibold sm:text-4xl md:text-[50px] md:leading-[60px] dark:text-white inline-block relative">
            Comprehensive Solutions for Your Business
            <span className="block h-1 w-24 mx-auto mt-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full animate-gradient-x" />
          </h2>
          <p className="text-dark-text text-base leading-relaxed">
            From building innovative websites, apps, and software to maintaining your current products, we provide end-to-end solutions to help your business thrive.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-3 gap-6 sm:gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              custom={index}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={cardVariants}
              className="relative group bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out p-6 sm:p-8 flex flex-col items-center text-center border border-transparent before:content-[''] before:absolute before:inset-0 before:rounded-2xl before:opacity-0 before:group-hover:opacity-100 before:transition-opacity before:duration-300 before:ease-in-out before:pointer-events-none overflow-hidden focus-within:ring-2 focus-within:ring-blue-400"
              tabIndex={0}
              aria-label={service.title}
            >
              {/* Animated Gradient Border */}
              <span className="pointer-events-none absolute inset-0 z-0 rounded-2xl border-2 border-transparent group-hover:border-transparent before:transition-all before:duration-300 before:ease-in-out before:rounded-2xl before:absolute before:inset-0 before:bg-gradient-to-r before:from-blue-400 before:via-purple-400 before:to-pink-400 before:opacity-0 group-hover:before:opacity-100" />
              {/* Icon with animated gradient background */}
              <span className="mb-4 flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 shadow-lg text-white text-4xl sm:text-5xl border-4 border-white dark:border-gray-900 transition-all duration-300 ease-in-out group-hover:scale-105 group-hover:shadow-xl animate-pulse-gradient relative z-10">
                {service.icon}
              </span>
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-3 relative z-10">
                {service.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base leading-relaxed relative z-10">
                {service.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <Link
            href="/contact"
            className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-purple-600 transition-all duration-300 ease-in-out shadow-md hover:shadow-lg text-base sm:text-lg font-medium ring-2 ring-blue-400/30 hover:ring-pink-400/40 focus:outline-none focus:ring-4 focus:ring-blue-400/40 animate-gradient-x"
          >
            Get Started Today
          </Link>
        </div>
      </div>
      {/* Fade-in keyframes and custom animations */}
      <style>{`
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(40px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease-in-out infinite;
        }
        @keyframes pulse-gradient {
          0%, 100% { box-shadow: 0 0 0 0 rgba(59,130,246,0.3), 0 0 0 0 rgba(168,85,247,0.2), 0 0 0 0 rgba(236,72,153,0.2); }
          50% { box-shadow: 0 0 24px 8px rgba(59,130,246,0.15), 0 0 32px 12px rgba(168,85,247,0.12), 0 0 40px 16px rgba(236,72,153,0.12); }
        }
        .animate-pulse-gradient {
          animation: pulse-gradient 2.5s infinite;
        }
      `}</style>
    </section>
  );
};

export default ServicesSection;