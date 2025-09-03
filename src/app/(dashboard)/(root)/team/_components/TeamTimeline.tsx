"use client";

import React from "react";

const TeamTimeline: React.FC = () => {
  const milestones = [
    {
      date: "May 2025",
      title: "Company Founded",
      description:
        "CraftCode Solutions was founded with a mission to innovate and provide impactful digital solutions.",
      icon: "🚀",
      color: "from-blue-500 to-cyan-500",
    },
    {
      date: "June 2025",
      title: "First Client Project",
      description:
        "Successfully delivered our very first client project, marking the beginning of our professional journey.",
      icon: "💼",
      color: "from-emerald-500 to-teal-500",
    },
    {
      date: "September 2025",
      title: "Expanded Services",
      description:
        "Emerged as a trusted provider of both software and marketing solutions, broadening our impact and reach.",
      icon: "🌐",
      color: "from-purple-500 to-pink-500",
    },
  ];

  return (
    <section
      id="timeline"
      className="py-16 sm:py-20 lg:py-24 transition-all duration-500 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] dark:from-blue-900/20 dark:to-transparent"
      aria-label="Team Timeline Section"
    >
      <div className="px-4 sm:px-6 lg:px-8 xl:container mx-auto">
        {/* Header */}
        <div className="relative mx-auto mb-16 max-w-[720px] text-center animate-fade-in-up">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-3xl blur-3xl opacity-80"></div>
          <span
            className="absolute top-0 left-1/2 -translate-x-1/2 text-[50px] sm:text-[70px] lg:text-[110px] leading-[1] font-black opacity-5"
            style={{
              background:
                "linear-gradient(180deg, rgba(74, 108, 247, 0.6) 0%, rgba(147, 51, 234, 0.3) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            TIMELINE
          </span>
          <div className="relative">
            <h2 className="font-heading text-gray-900 dark:text-white mb-6 text-4xl font-bold sm:text-5xl md:text-[56px] md:leading-[64px] tracking-tight">
              Our Journey Through Time
            </h2>
            <div className="mx-auto h-1.5 w-32 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full mb-8 shadow-lg shadow-purple-500/20"></div>
            <p className="text-gray-600 dark:text-gray-300 text-lg lg:text-xl font-medium leading-relaxed max-w-2xl mx-auto">
              A look back at the milestones that shaped CraftCode Solutions&apos;
              foundation and growth.
            </p>
          </div>
        </div>

        {/* Timeline */}
        <div className="relative">
          <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-blue-600 via-purple-600 to-pink-600 shadow-[0_0_20px_rgba(147,51,234,0.3)]"></div>
          <div className="block lg:hidden absolute left-4 top-0 h-full w-0.5 bg-gradient-to-b from-blue-600 via-purple-600 to-pink-600 opacity-60 shadow-[0_0_10px_rgba(147,51,234,0.2)]"></div>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
            {milestones.map((milestone, index) => (
              <div
                key={index}
                className={`group relative animate-fade-in-up delay-${index * 100} ${
                  index % 2 === 0 ? "lg:pr-16" : "lg:pl-16 lg:col-start-2"
                }`}
              >
                {/* Timeline Dot */}
                <div className="hidden lg:block absolute top-10 w-5 h-5 bg-white dark:bg-gray-800 border-4 border-purple-600 rounded-full shadow-xl z-10 transform -translate-x-2.5 group-hover:scale-125 group-hover:animate-pulse transition-all duration-300"></div>
                {/* Connector */}
                <div
                  className={`hidden lg:block absolute top-10 h-0.5 bg-gradient-to-r ${milestone.color} z-0 ${
                    index % 2 === 0
                      ? "right-0 w-[calc(50%+2rem)] -translate-x-4"
                      : "left-0 w-[calc(50%+2rem)] translate-x-4"
                  }`}
                ></div>
                {/* Mobile Icon */}
                <div className="block lg:hidden absolute left-0 top-10 w-8 h-8 items-center justify-center z-10">
                  <span
                    className={`text-2xl bg-white dark:bg-gray-800 rounded-full border-2 border-purple-500 shadow-md p-1.5 transform group-hover:scale-110 transition-transform duration-300`}
                  >
                    {milestone.icon}
                  </span>
                </div>
                {/* Card */}
                <div
                  className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 p-6 sm:p-7 md:p-9 pl-14 lg:pl-8 lg:pr-8 transform hover:-translate-y-3 group-hover:scale-[1.03] border border-gray-100/50 dark:border-gray-700/50 overflow-hidden`}
                  style={{ minHeight: "140px" }}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${milestone.color} opacity-5 group-hover:opacity-10 transition-opacity duration-500`}
                  ></div>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.05),transparent)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.05),transparent)]"></div>
                  <div className="relative z-10">
                    <div className="flex items-start gap-4 sm:gap-5 mb-4 sm:mb-5">
                      <div className="hidden lg:block text-4xl sm:text-5xl transform group-hover:scale-110 transition-transform duration-300">
                        {milestone.icon}
                      </div>
                      <div className="flex-1">
                        <div
                          className={`inline-block px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-sm font-semibold bg-gradient-to-r ${milestone.color} text-white mb-3 sm:mb-4 shadow-md transform group-hover:-translate-y-1 transition-transform duration-300`}
                        >
                          {milestone.date}
                        </div>
                        <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                          {milestone.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg leading-relaxed">
                          {milestone.description}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div
                    className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${milestone.color} opacity-0 group-hover:opacity-30 group-hover:shadow-[0_0_20px_rgba(147,51,234,0.4)] transition-all duration-500 -z-10`}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 sm:mt-20 text-center animate-fade-in-up delay-400">
          <a
            href="#contact"
            className="inline-flex items-center gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-full font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 hover:brightness-110 transition-all duration-300 cursor-pointer max-w-full"
          >
            <span className="truncate">Join Our Journey</span>
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
};

export default TeamTimeline;
