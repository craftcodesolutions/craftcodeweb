/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from "framer-motion";
import { useState } from 'react';

// Counter Component (now used for stats row)
function Counter({ end, label }: { end: number; label: string }) {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLDivElement>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const startCounter = () => {
        let current = 0;
        const duration = 2000;
        const stepTime = Math.max(10, Math.floor(duration / end));

        if (intervalRef.current) clearInterval(intervalRef.current);

        intervalRef.current = setInterval(() => {
            current += 1;
            setCount(current);
            if (current >= end && intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        }, stepTime);
    };

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setCount(0);
                    startCounter();
                }
            },
            { threshold: 0.5 }
        );

        if (ref.current) observer.observe(ref.current);
        return () => {
            if (ref.current) observer.unobserve(ref.current);
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [end]);

    return (
        <div ref={ref} className="text-center min-w-[100px]" aria-label={label}>
            <h3 className="text-4xl font-bold text-indigo-600">{count}+</h3>
            <p className="text-gray-600 dark:text-gray-300">{label}</p>
        </div>
    );
}

export default function WhyUsSection() {
    return (
        <section className="bg-transparent py-12 px-4 sm:px-6 lg:px-8">
            <AnimatePresence>
            <>
            {/* Section Header */}
            <div
                className="relative mx-auto mb-12 max-w-[620px] pt-6 text-center md:mb-20 lg:pt-16"
                data-wow-delay=".2s"
            >
                <span
                    className="absolute top-0 left-1/2 -translate-x-1/2 text-[40px] sm:text-[60px] lg:text-[95px] font-extrabold leading-none opacity-20"
                    style={{
                        background: 'linear-gradient(180deg, rgba(74, 108, 247, 0.4) 0%, rgba(74, 108, 247, 0) 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        color: 'transparent',
                    }}
                >
                    WHY_US
                </span>

                <h2 className="font-heading text-dark mb-5 text-3xl font-semibold sm:text-4xl md:text-[50px] md:leading-[60px] dark:text-white">
                    Our Unique & Awesome Core Features
                </h2>
                <p className="text-dark-text text-base">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. In convallis
                    tortor eros. Donec vitae tortor lacus. Phasellus aliquam ante in
                    maximus.
                </p>
            </div>

            {/* --- Stats Row --- */}
            <div className="flex flex-wrap justify-center gap-8 mb-12">
                <Counter end={120} label="Happy Clients" />
                <Counter end={15} label="Awards Won" />
                <Counter end={50} label="Projects Completed" />
                <Counter end={8} label="Years Experience" />
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start gap-10">
                {/* Left Image Section */}
                <motion.div
                    className="w-full lg:w-2/3 relative"
                    initial={{ opacity: 0, y: 32, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 32, scale: 0.95 }}
                    transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                >
                    <div className="rounded-2xl shadow-lg overflow-hidden">
                        <Image
                            src="/images/blog/mi1@2x.png"
                            alt="Business Growth Illustration"
                            width={800}
                            height={450}
                            className="w-full h-auto object-cover"
                            priority
                        />
                    </div>
                </motion.div>

                {/* Right Feature Cards */}
                <div className="w-full lg:w-1/3 flex flex-col gap-6">
                    {[
                        {
                            iconColor: 'text-blue-500',
                            title: 'Color & Font Options',
                            desc: 'Easily customize colors and fonts, or choose from provided options.',
                            path: 'M12 6v6m0 0v6m0-6h6m-6 0H6',
                            badge: 'Popular',
                        },
                        {
                            iconColor: 'text-purple-500',
                            title: 'Cool Features & Elements',
                            desc: 'Equipped with stunning features and elements for designing appealing pages.',
                            path: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
                            badge: 'New',
                        },
                        {
                            iconColor: 'text-pink-500',
                            title: 'Modern Portfolio Layouts',
                            desc: 'Effortlessly create and maintain a visually stunning and impactful portfolio.',
                            path: 'M12 4v16m8-8H4',
                            badge: '',
                        },
                        {
                            iconColor: 'text-green-500',
                            title: 'Real-time Collaboration',
                            desc: 'Work with your team in real-time for seamless productivity and communication.',
                            path: 'M17 20h5v-2a4 4 0 00-5-4M9 20H4v-2a4 4 0 015-4m4-6a4 4 0 110 8 4 4 0 010-8z',
                            badge: '',
                        },
                    ].map(({ iconColor, title, desc, path, badge }, idx) => (
                        <motion.div
                            key={idx}
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 transition-transform transform hover:scale-105 hover:shadow-2xl focus-within:ring-2 focus-within:ring-indigo-500 outline-none"
                            initial={{ opacity: 0, y: 32, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 32, scale: 0.95 }}
                            transition={{ duration: 0.6, delay: idx * 0.1 + 0.2, ease: [0.4, 0, 0.2, 1] }}
                            tabIndex={0}
                            aria-label={title}
                        >
                            <div className="flex items-center gap-3 mb-1">
                                <svg
                                    className={`w-8 h-8 ${iconColor}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                    aria-hidden="true"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d={path}
                                    />
                                </svg>
                                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                                    {title}
                                </h3>
                                {badge && (
                                    <span className="ml-2 px-2 py-0.5 text-xs font-bold bg-indigo-100 text-indigo-700 rounded-full">
                                        {badge}
                                    </span>
                                )}
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 mt-2">{desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
            </>
            </AnimatePresence>
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
}
