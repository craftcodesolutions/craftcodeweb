"use client";

// Removed 'use client'; now a server component

import { motion, AnimatePresence } from "framer-motion";
import { Users } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface TeamMember {
  name: string;
  role: string;
  description: string;
  image: string;
  userId: string;
}

// Static team data
const teamMembers: TeamMember[] = [
  {
    name: "Fahad Alamgir Dhrubo",
    role: "Chief Executive Officer (CEO)",
    description: "Visionary leader focused on nurturing innovation and turning big ideas into real products.",
    image: "/images/testimonial/dhrubo.jpg",
    userId: "fahad-alamgir-dhrubo",
  },
  {
    name: "Jayed Bin Islam",
    role: "Chief Marketing Officer (CMO)",
    description: "Expert in building trust and inspiring confidence through every interaction.",
    image: "/images/testimonial/jayed.jpeg",
    userId: "jayed-bin-islam",
  },
  {
    name: "Tahmid Hasan Showmik",
    role: "Editorial Head",
    description: "Believes in thoughtful storytelling that elevates the reader's understanding.",
    image: "/images/testimonial/shoumik.jpeg",
    userId: "tahmid-hasan-showmik",
  },
  {
    name: "Raihan Hossain",
    role: "Graphic Designer",
    description: "Crafts visual systems that make complex ideas feel simple and beautiful.",
    image: "/images/testimonial/molla.jpg",
    userId: "raihan-hossain",
  },
  {
    name: "Atik Mahbub Akash",
    role: "Senior Software Engineer",
    description: "Writes not just functions, but future-ready experiences bridging ideas and impact.",
    image: "/images/testimonial/atik.jpg",
    userId: "atik-mahbub-akash",
  },
  {
    name: "Juhayer Anzum Kabbo",
    role: "Social Media Manager (SMM)",
    description: "Transforms strategy into social moments, turning brands into communities.",
    image: "/images/testimonial/protibondi.jpg",
    userId: "juhayer-anzum-kabbo",
  },
  {
    name: "Mohammad Siam",
    role: "Operations Assistant",
    description: "Takes pride in being a part of every build, supporting the foundation of strong systems.",
    image: "/images/testimonial/cudirvai.jpg",
    userId: "mohammad-siam",
  },
];

// Animation variants
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.8 } },
};

export default function TeamPage() {
  return (
    <div className="min-h-screen px-4 sm:px-6 py-12">
      {/* Floating gradient blobs */}
      <FloatingBlobs />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-100/40 to-transparent dark:from-blue-900/20 dark:to-transparent" />
        <motion.div
          initial="hidden"
          animate="show"
          variants={container}
          className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 text-center"
        >
          <motion.h1
            variants={item}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
              Our Exceptional Team
            </span>
          </motion.h1>

          <motion.p
            variants={item}
            className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-10"
          >
            Meet the brilliant minds who combine innovation with expertise to deliver extraordinary results.
          </motion.p>

          <motion.div variants={item}>
            <a
              href="#team"
              className="inline-flex items-center px-8 py-3.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Scroll to team section"
            >
              Discover Our Team
              <motion.svg
                className="ml-2 w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                whileHover={{ y: 2 }}
                transition={{ duration: 0.2 }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </motion.svg>
            </a>
          </motion.div>
        </motion.div>
      </section>

      {/* Team Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial="hidden"
          animate="show"
          variants={container}
          className="text-center mb-16"
        >
          <motion.h2
            variants={item}
            className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 mb-4"
          >
            The Minds Behind Our Success
          </motion.h2>
          <motion.p
            variants={item}
            className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
          >
            Our diverse team combines creativity, technical expertise, and strategic vision to deliver outstanding results.
          </motion.p>
        </motion.div>

        {/* Team Members Grid */}
        <div id="team" className="mb-20">
          <AnimatePresence>
            {teamMembers.length > 0 ? (
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
              >
                {teamMembers.map((member) => (
                  <motion.div
                    key={member.userId}
                    variants={item}
                    whileHover={{ y: -5 }}
                    className="group"
                  >
                    <Link
                      href={`/team/${member.userId}`}
                      aria-label={`View profile of ${member.name}`}
                    >
                      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-2xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                        <div className="relative pt-8 px-8">
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/70 to-indigo-50/70 dark:from-blue-900/20 dark:to-indigo-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-2xl" />
                          <div className="relative mx-auto h-40 w-40 rounded-full overflow-hidden border-4 border-white dark:border-gray-700 shadow-md group-hover:border-blue-400 transition-all duration-300">
                            <Image
                              src={member.image}
                              alt={member.name}
                              width={160}
                              height={160}
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                              sizes="(max-width: 768px) 100vw, 160px"
                            />
                          </div>
                        </div>
                        <div className="p-6 pt-4 mt-2 flex-grow">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 mb-1">
                            {member.name}
                          </h3>
                          <p className="text-blue-600 dark:text-blue-400 font-medium mb-4">
                            {member.role}
                          </p>
                          <p className="text-gray-600 dark:text-gray-300 line-clamp-3">
                            {member.description}
                          </p>
                        </div>
                        <div className="px-6 pb-6 flex justify-between items-center">
                          <span className="inline-block text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:underline">
                            View Profile →
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial="hidden"
                animate="show"
                variants={fadeIn}
                className="text-center py-16"
              >
                <Users
                  className="mx-auto text-5xl text-gray-400 mb-6"
                  aria-label="Team placeholder icon"
                />
                <h3 className="text-xl font-medium text-gray-600 dark:text-gray-300 mb-2">
                  Our Team is Growing
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Check back soon to meet our talented professionals!
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}

// Floating gradient blobs
const FloatingBlobs = () => (
  <div className="fixed inset-0 flex items-center justify-center pointer-events-none overflow-hidden -z-10">
    <motion.div
      animate={{
        x: [0, 100, 0],
        y: [0, -80, 0],
        scale: [1, 1.1, 1],
        transition: { duration: 25, repeat: Infinity, ease: "easeInOut" },
      }}
      className="absolute top-[15%] -left-1/3 w-[500px] h-[500px] bg-blue-400/10 dark:bg-blue-600/5 rounded-full blur-[80px]"
    />
    <motion.div
      animate={{
        x: [0, -100, 0],
        y: [0, 80, 0],
        scale: [1, 1.1, 1],
        transition: { duration: 30, repeat: Infinity, ease: "easeInOut" },
      }}
      className="absolute top-[15%] -right-1/3 w-[500px] h-[500px] bg-purple-400/10 dark:bg-purple-600/5 rounded-full blur-[80px]"
    />
    <motion.div
      animate={{
        x: [0, 60, 0],
        y: [0, 120, 0],
        scale: [1, 1.2, 1],
        transition: { duration: 35, repeat: Infinity, ease: "easeInOut" },
      }}
      className="absolute bottom-[10%] left-1/4 w-[400px] h-[400px] bg-pink-400/10 dark:bg-pink-600/5 rounded-full blur-[70px]"
    />
  </div>
);