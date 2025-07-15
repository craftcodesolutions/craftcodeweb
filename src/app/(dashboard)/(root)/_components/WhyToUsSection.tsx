'use client';

import Image from 'next/image';
import { motion, AnimatePresence } from "framer-motion";

export default function WhyToUsSection() {
  return (
    <section className="bg-transparent py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col-reverse lg:flex-row items-center gap-12">
        <AnimatePresence>
          <>
              <motion.div
                className="w-full lg:w-1/2 grid gap-6"
                initial={{ opacity: 0, y: 32, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 32, scale: 0.95 }}
                transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
              >
                {[
                  {
                    title: 'Well-Written Code',
                    description: 'Pixel-perfect and easily editable code with comprehensive comments.',
                    color: 'text-blue-500',
                    path: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z',
                  },
                  {
                    title: 'Gorgeous Shop Layouts',
                    description: 'Present your products to your visitors in an efficient and visually appealing manner.',
                    color: 'text-purple-500',
                    path: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
                  },
                  {
                    title: 'Fully Responsive Layouts',
                    description: 'Adjusts to varying screen sizes, ensuring seamless compatibility across all devices.',
                    color: 'text-pink-500',
                    path: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m6 9a9 9 0 01-9-9m9 9a9 9 0 009-9',
                  },
                  {
                    title: 'Quality Assurance',
                    description: 'Every product is tested for performance, reliability, and scalability.',
                    color: 'text-green-500',
                    path: 'M5 13l4 4L19 7',
                  },
                ].map(({ title, description, color, path }, idx) => (
                  <div
                    key={idx}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 flex gap-4 items-start"
                  >
                    <svg
                      className={`w-8 h-8 shrink-0 ${color}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={path} />
                    </svg>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{title}</h3>
                      <p className="text-gray-600 dark:text-gray-300 mt-1">{description}</p>
                    </div>
                  </div>
                ))}
              </motion.div>

              <motion.div
                className="w-full lg:w-1/2 flex justify-center"
                initial={{ opacity: 0, y: 32, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 32, scale: 0.95 }}
                transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                style={{ animationDelay: '0.2s' }}
              >
                <div className="rounded-2xl shadow-lg overflow-hidden w-full max-w-2xl">
                  <Image
                    src="/images/blog/mi2@2x.png"
                    alt="Team Collaboration"
                    width={800}
                    height={500}
                    className="object-cover w-full h-auto rounded-2xl"
                  />
                </div>
              </motion.div>
          </>
        </AnimatePresence>
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
}
