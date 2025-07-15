/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useEffect, useState } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Image from 'next/image';

function HomeSection() {
    const [typedText, setTypedText] = useState('');
    const words = ['Startup', 'SaaS', 'Business', 'Agency'];
    const [wordIndex, setWordIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);

    // Typing Effect
    useEffect(() => {
        let timeout: NodeJS.Timeout;

        if (!isDeleting && typedText.length < words[wordIndex].length) {
            timeout = setTimeout(() => {
                setTypedText((prev) => prev + words[wordIndex][typedText.length]);
            }, 150);
        } else if (isDeleting && typedText.length > 0) {
            timeout = setTimeout(() => {
                setTypedText((prev) => prev.slice(0, -1));
            }, 100);
        } else if (!isDeleting && typedText.length === words[wordIndex].length) {
            timeout = setTimeout(() => setIsDeleting(true), 2000);
        } else if (isDeleting && typedText.length === 0) {
            setIsDeleting(false);
            setWordIndex((prev) => (prev + 1) % words.length);
        }

        return () => clearTimeout(timeout);
    }, [typedText, isDeleting, wordIndex]);

    // Initialize AOS
    useEffect(() => {
        AOS.init({ once: true, disable: 'mobile' });
        AOS.refresh();
    }, []);

    return (
        <section
            id="home"
            className="relative w-full z-10 overflow-hidden pt-8 pb-16 px-2 sm:pt-24 sm:pb-24 sm:px-6 lg:pt-[15px] lg:pb-[120px] lg:px-0"
        >
            <div>
                <div className="-mx-2 sm:-mx-4 flex flex-col lg:flex-row items-center justify-between">
                    {/* Text Section */}
                    <div className="mb-10 flex w-full justify-center px-2 sm:px-3 lg:mb-0 lg:w-1/2 lg:justify-start">
                        <div className="mx-auto max-w-[95vw] sm:max-w-[530px] text-center lg:text-left">
                            <span
                                className="bg-primary/10 font-heading text-primary mb-6 sm:mb-8 inline-block rounded-full px-4 sm:px-6 py-2 sm:py-3 text-base sm:text-lg shadow-sm dark:bg-white/10 dark:text-white transition-all duration-300"
                                data-aos="fade-up"
                                data-aos-delay="200"
                            >
                                <span className="bg-primary mr-2 inline-block h-2 w-2 rounded-full" />
                                Your Dream, Our Priority!!
                            </span>

                            <h1
                                className="font-heading mb-4 sm:mb-6 text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold md:leading-[56px] lg:leading-[68px] dark:text-white transition-all duration-300"
                                data-aos="fade-up"
                                data-aos-delay="300"
                            >
                                Digital Solutions for <br /> Your{' '}
                                <span className="txt-type underline decoration-primary decoration-4 underline-offset-4 animate-pulse" data-wait="3000">
                                    {typedText}
                                </span>
                            </h1>

                            <p
                                className="text-dark-text mb-8 sm:mb-10 text-base sm:text-lg leading-relaxed dark:text-gray-300 transition-all duration-300"
                                data-aos="fade-up"
                                data-aos-delay="400"
                            >
                                CraftCode thrives on innovation, crafting solutions that empower progress. With our A to Z services, we transform ideas into reality, driving success for your business. Our motto reflects a commitment to excellence, pushing boundaries to shape a smarter, connected future through successful businesses.
                            </p>

                            <div
                                className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 lg:justify-start"
                                data-aos="fade-up"
                                data-aos-delay="500"
                            >
                                <a
                                    href="https://wa.me/qr/FRJC7NDURYO7P1"
                                    className="group bg-blue-400 hover:bg-blue-500 text-white font-heading inline-flex items-center rounded-full px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg shadow-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
                                >
                                    Let&apos;s Talk
                                    <span className="pl-2 sm:pl-3">
                                        <svg
                                            width="16"
                                            height="16"
                                            viewBox="0 0 16 16"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M12.172 7L6.808 1.636L8.222 0.222L16 8L8.222 15.778L6.808 14.364L12.172 9H0V7H12.172Z"
                                                fill="white"
                                            />
                                        </svg>
                                    </span>
                                </a>

                                <a
                                    href="#about"
                                    className="group bg-blue-400 hover:bg-blue-500 text-white font-heading inline-flex items-center rounded-full px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg shadow-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
                                >
                                    <span className="pr-2 sm:pr-3">
                                        <svg
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                            className="fill-current"
                                        >
                                            <path d="M19.376 12.416L8.777 19.482C8.70171 19.5321 8.61423 19.5608 8.52389 19.5652C8.43355 19.5695 8.34373 19.5492 8.264 19.5065C8.18427 19.4639 8.1176 19.4003 8.07111 19.3228C8.02462 19.2452 8.00005 19.1564 8 19.066V4.934C8.00005 4.84356 8.02462 4.75482 8.07111 4.67724C8.1176 4.59966 8.18427 4.53615 8.264 4.49346C8.34373 4.45077 8.43355 4.43051 8.52389 4.43483C8.61423 4.43915 8.70171 4.46789 8.777 4.518L19.376 11.584C19.4445 11.6297 19.5006 11.6915 19.5395 11.7641C19.5783 11.8367 19.5986 11.9177 19.5986 12C19.5986 12.0823 19.5783 12.1633 19.5395 12.2359C19.5006 12.3085 19.4445 12.3703 19.376 12.416Z" />
                                        </svg>
                                    </span>
                                    How it Works
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Image Section */}
                    <div className="flex w-full justify-center px-2 sm:px-4 lg:w-1/2 lg:justify-end">
                        <div
                            className="relative z-30 mx-auto h-[220px] sm:h-[320px] md:h-[420px] lg:h-[520px] w-full max-w-[95vw] sm:max-w-[500px] md:max-w-[700px] lg:ml-20"
                            data-aos="fade-right"
                            data-aos-delay="300"
                        >
                            <div className="absolute top-0 right-0 w-10/12 sm:w-11/12">
                                <Image
                                    src="/images/hero/image-2.jpg"
                                    alt="Person sitting with tablet"
                                    width={480}
                                    height={500}
                                    className="object-cover w-full h-auto rounded-lg"
                                />
                            </div>
                            <div className="absolute bottom-0 left-0 z-10 w-7/12 sm:w-8/12">
                                <Image
                                    src="/images/hero/image-1.jpg"
                                    alt="Person working on laptop"
                                    width={300}
                                    height={700}
                                    className="object-cover w-full h-auto rounded-lg"
                                />
                                <div className="border-primary/10 bg-primary/5 absolute -top-4 sm:-top-6 -right-4 sm:-right-6 -z-10 h-full w-full border backdrop-blur-[6px] dark:border-white/10 dark:bg-white/10 rounded-lg" />
                            </div>
                            <div className="absolute bottom-0 left-0">
                                <svg
                                    width="56"
                                    height="28"
                                    viewBox="0 0 72 38"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        fillRule="evenodd"
                                        clipRule="evenodd"
                                        d="M62.0035 2.04985C59.6808 1.76671 57.4524 2.70929 55.1508 4.68209C51.3631 7.92863 44.7908 9.54366 38.8668 4.69678C36.329 2.6204 34.117 2.29213 32.2894 2.59672C30.3972 2.91209 28.8057 3.92088 27.5547 4.75487C25.5734 6.07577 23.3915 7.46379 20.8786 7.78953C18.2847 8.12577 15.515 7.32034 12.3598 4.69105C9.71804 2.48955 7.45748 2.0661 5.72104 2.33325C3.94436 2.6066 2.56003 3.6273 1.76341 4.56877C1.40666 4.99037 0.775686 5.04295 0.354079 4.68621C-0.0675277 4.32946 -0.120109 3.69849 0.236635 3.27688C1.27334 2.05168 3.0643 0.71846 5.41692 0.356509C7.80979 -0.0116349 10.6326 0.648246 13.6402 3.1546C16.485 5.52529 18.7154 6.05321 20.6215 5.80612C22.6086 5.54854 24.4266 4.43657 26.4453 3.09078L27 3.92282L26.4453 3.09078C27.6943 2.25809 29.6028 1.0169 31.9606 0.623935C34.383 0.220203 37.1711 0.725274 39.5973 2.40561C45.3399 5.77965 51.0241 6.31429 56.3917 3.60602C58.7993 2.36207 60.9272 1.39769 62.0035 2.04985Z"
                                        fill="white"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>



                </div>
            </div>
        </section>
    );
}

export default HomeSection;
