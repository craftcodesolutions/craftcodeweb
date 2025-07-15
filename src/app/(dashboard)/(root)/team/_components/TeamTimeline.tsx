"use client";

import React from "react";

const TeamTimeline: React.FC = () => {
  const milestones = [
    {
      date: "January 2023",
      title: "Company Founded",
      description:
        "Launched CodeCraft with a mission to deliver innovative software solutions.",
      icon: "🚀",
      color: "from-blue-500 to-cyan-500",
    },
    {
      date: "June 2023",
      title: "First Client Project",
      description:
        "Completed our first website project for a local startup, marking our entry into the market.",
      icon: "💼",
      color: "from-emerald-500 to-teal-500",
    },
    {
      date: "November 2024",
      title: "Best Tech Award",
      description:
        "Won the Best Tech Award for excellence in software development at the Tech Innovate Summit.",
      icon: "🏆",
      color: "from-amber-500 to-orange-500",
    },
    {
      date: "May 2025",
      title: "100th Project Milestone",
      description:
        "Celebrated the completion of our 100th project, showcasing our growth and impact.",
      icon: "🎯",
      color: "from-purple-500 to-pink-500",
    },
  ];

  return (
    <section
      id="timeline"
      className="py-16 sm:py-20 lg:py-24 transition-all duration-500"
      aria-label="Team Timeline Section"
    >
      <div className="px-4 sm:px-6 lg:px-8 xl:container mx-auto">
        {/* Enhanced Header */}
        <div className="relative mx-auto mb-16 max-w-[720px] text-center">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-3xl blur-3xl"></div>
          <span
            className="absolute top-0 left-1/2 -translate-x-1/2 text-[50px] sm:text-[70px] lg:text-[110px] leading-[1] font-black opacity-10"
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
            <div className="mx-auto h-1.5 w-32 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full mb-8 shadow-lg"></div>
            <p className="text-gray-600 dark:text-gray-300 text-lg lg:text-xl font-medium leading-relaxed">
              A journey through the milestones that shaped our team&apos;s success.
            </p>
          </div>
        </div>

        {/* Enhanced Timeline */}
        <div className="relative">
          {/* Central Timeline Line */}
          <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-blue-600 via-purple-600 to-pink-600 shadow-lg"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {milestones.map((milestone, index) => (
              <div
                key={index}
                className={`group relative ${
                  index % 2 === 0 ? "lg:pr-12" : "lg:pl-12 lg:col-start-2"
                }`}
              >
                {/* Timeline Dot */}
                <div className="hidden lg:block absolute top-8 w-4 h-4 bg-white dark:bg-gray-800 border-4 border-blue-600 rounded-full shadow-lg z-10 transform -translate-x-2 group-hover:scale-125 transition-transform duration-300"></div>
                
                {/* Card */}
                <div
                  className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 p-8 transform hover:-translate-y-2 group-hover:scale-[1.02] border border-gray-100 dark:border-gray-700 overflow-hidden`}
                >
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${milestone.color} opacity-5 group-hover:opacity-10 transition-opacity duration-500`}></div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`text-3xl sm:text-4xl transform group-hover:scale-110 transition-transform duration-300`}>
                        {milestone.icon}
                      </div>
                      <div className="flex-1">
                        <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${milestone.color} text-white mb-3 shadow-md`}>
                          {milestone.date}
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                          {milestone.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
                          {milestone.description}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Hover Effect Border */}
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${milestone.color} opacity-0 group-hover:opacity-20 transition-opacity duration-500 -z-10`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 cursor-pointer">
            <span>Join Our Journey</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TeamTimeline;