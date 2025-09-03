/* eslint-disable react/no-unescaped-entities */
"use client";

import React from "react";

const HeroArt = () => (
  <svg
    width="140"
    height="110"
    viewBox="0 0 140 110"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    {/* Orange background block */}
    <rect x="70" y="10" width="60" height="60" rx="8" fill="#FF6B1A" />
    {/* Person 1 (left, black/white) */}
    <circle cx="40" cy="40" r="18" fill="#fff" stroke="#222" strokeWidth="2" />
    <ellipse cx="40" cy="70" rx="18" ry="10" fill="#fff" stroke="#222" strokeWidth="2" />
    <circle cx="40" cy="38" r="6" fill="#222" />
    <rect x="34" y="44" width="12" height="10" rx="4" fill="#fff" stroke="#222" strokeWidth="2" />
    {/* Person 2 (right, orange shirt) */}
    <circle cx="100" cy="40" r="16" fill="#fff" stroke="#222" strokeWidth="2" />
    <ellipse cx="100" cy="68" rx="16" ry="9" fill="#FF6B1A" stroke="#222" strokeWidth="2" />
    <circle cx="100" cy="38" r="5" fill="#222" />
    <rect x="94" y="44" width="12" height="10" rx="4" fill="#FF6B1A" stroke="#222" strokeWidth="2" />
    {/* Speech bubble */}
    <rect x="80" y="15" width="28" height="14" rx="4" fill="#fff" stroke="#222" strokeWidth="2" />
    <polygon points="95,29 99,35 101,29" fill="#fff" stroke="#222" strokeWidth="2" />
    {/* Bubble text lines */}
    <rect x="84" y="19" width="20" height="2" rx="1" fill="#222" />
    <rect x="84" y="23" width="12" height="2" rx="1" fill="#222" />
  </svg>
);

const ContactPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full bg-[#0b2c36] dark:bg-[#0b2c36] pt-14 pb-10 px-4 flex flex-col md:flex-row items-center justify-between relative mb-0 md:mb-2 lg:mb-4">
        <div className="max-w-2xl text-left z-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">Get in touch<span className="text-orange-500">.</span></h1>
          <p className="text-base sm:text-lg text-gray-100 mb-2">Want to get in touch? We'd love to hear from you. Here's how you can reach us.</p>
        </div>
        {/* SVG Illustration */}
        <div className="hidden md:block absolute right-8 top-8 z-0">
          <HeroArt />
        </div>
      </section>

      {/* Contact Options Cards */}
      <section className="w-full max-w-4xl mx-auto -mt-12 md:-mt-16 flex flex-col md:flex-row gap-6 px-4 z-10 mb-10 md:mb-14">
        {/* Card 1: Talk to Sales */}
        <div className="flex-1 bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-800 p-6 sm:p-8 flex flex-col items-center text-center transition hover:shadow-lg">
          <div className="mb-4">
            <svg className="w-10 h-10 text-blue-600 mx-auto" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M22 16.92V19a2 2 0 01-2 2A19.72 19.72 0 013 5a2 2 0 012-2h2.09a2 2 0 012 1.72c.13 1.13.37 2.23.72 3.28a2 2 0 01-.45 2.11l-.27.27a16 16 0 006.29 6.29l.27-.27a2 2 0 012.11-.45c1.05.35 2.15.59 3.28.72A2 2 0 0122 16.92z" /></svg>
          </div>
          <h2 className="text-lg font-semibold mb-2">Talk to Sales</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">Interested in Craftcode Solutions? Just pick up the phone to chat with a member of our sales team.</p>
          <a href="tel:+15551234567" className="text-blue-600 font-semibold hover:underline mb-2 block">+1 555 123 4567</a>
          <a href="#" className="text-sm text-blue-500 hover:underline">View all global numbers</a>
        </div>
        {/* Card 2: Customer Support */}
        <div className="flex-1 bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-800 p-6 sm:p-8 flex flex-col items-center text-center transition hover:shadow-lg">
          <div className="mb-4">
            <svg className="w-10 h-10 text-blue-600 mx-auto" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8a2 2 0 012-2h2m2-4h4a2 2 0 012 2v4a2 2 0 01-2 2h-4a2 2 0 01-2-2V6a2 2 0 012-2z" /></svg>
          </div>
          <h2 className="text-lg font-semibold mb-2">Contact Customer Support</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">Sometimes you need a little help from your friends. Or a support rep. Don’t worry... we’re here for you.</p>
          <a href="#" className="inline-block px-6 py-2 rounded bg-orange-500 text-white font-semibold shadow hover:bg-orange-600 transition">Contact Support</a>
        </div>
      </section>

      {/* Section Divider */}
      <div className="w-full flex justify-center my-8 md:my-12">
        <span className="text-2xl font-bold text-white bg-blue-700 px-4 py-2 rounded shadow">Connect with one of our global offices</span>
      </div>

      {/* Map and Office Info Section */}
      <section className="w-full max-w-4xl mx-auto flex flex-col md:flex-row gap-6 px-4 mb-16">
        {/* Google Map Embed for University of Rajshahi */}
        <div className="flex-1 min-h-[260px] rounded-xl overflow-hidden flex items-center justify-center border border-gray-200 dark:border-gray-800 shadow-md">
          <iframe
            title="University of Rajshahi Map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3650.073982510684!2d88.6345133154316!3d24.3635894842867!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39fbef4e0e0e0e0f%3A0x7e8e8e8e8e8e8e8e!2sUniversity%20of%20Rajshahi!5e0!3m2!1sen!2sbd!4v1680000000000!5m2!1sen!2sbd"
            width="100%"
            height="260"
            style={{ border: 0 }}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
        {/* Office Info */}
        <div className="flex-1 bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-800 p-6 sm:p-8 flex flex-col justify-center">
          <h3 className="text-lg font-bold mb-2">Global Headquarters</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-2">University of Rajshahi<br />Rajshahi 6205<br />Bangladesh</p>
          <div className="mb-2">
            <span className="font-semibold">Phone / Fax</span>
            <div className="text-gray-700 dark:text-gray-300">+880 721 750244<br />Fax: +880 721 750064</div>
          </div>
          <div className="mb-2">
            <span className="font-semibold">Press / Media / Blogger Information</span>
            <div>
              <a href="https://craftcodesolutions.com" className="text-blue-600 hover:underline">Visit our Newsroom for contact info</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;