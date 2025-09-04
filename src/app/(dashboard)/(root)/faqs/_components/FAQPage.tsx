"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Search, MessageCircle, Users, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: 'general' | 'collaboration' | 'technical' | 'support';
}

const sampleFAQs: FAQ[] = [
  {
    id: '1',
    question: "What is CraftCode Solutions?",
    answer: "CraftCode Solutions is a software development company that builds modern web applications, mobile apps, and custom software solutions. We also provide marketing strategies and consultancy to help businesses grow digitally.",
    category: 'general'
  },
  {
    id: '2',
    question: "How can I get started with CraftCode Solutions?",
    answer: "To get started, reach out through our website or contact form. We’ll discuss your project requirements, suggest suitable solutions, and guide you through our development, marketing, or consultancy services.",
    category: 'general'
  },
  {
    id: '3',
    question: "Does CraftCode Solutions provide marketing services?",
    answer: "Yes! In addition to software development, we offer digital marketing solutions including social media campaigns, SEO, branding strategies, and consultancy to help your business reach its goals.",
    category: 'general'
  },
  {
    id: '4',
    question: "What types of projects can CraftCode work on?",
    answer: "We develop custom web applications, mobile apps, software solutions, e-commerce platforms, and automation tools. We also assist with marketing campaigns and business consultancy projects.",
    category: 'collaboration'
  },
  {
    id: '5',
    question: "How do I request a project quote?",
    answer: "You can request a quote via our contact form or by emailing our sales team. Provide details about your project, requirements, and timeline, and we’ll respond with a detailed proposal and cost estimate.",
    category: 'collaboration'
  },
  {
    id: '6',
    question: "Can CraftCode handle ongoing projects or maintenance?",
    answer: "Absolutely. We provide long-term support, software updates, bug fixes, and marketing consultancy to ensure your project continues running smoothly after deployment.",
    category: 'collaboration'
  },
  {
    id: '7',
    question: "How does CraftCode ensure quality in software development?",
    answer: "Our team follows modern development practices, including agile methodologies, code reviews, testing, and deployment best practices. We ensure scalable, secure, and maintainable solutions.",
    category: 'technical'
  },
  {
    id: '8',
    question: "Can CraftCode integrate third-party tools or APIs?",
    answer: "Yes! We can integrate APIs, payment gateways, cloud services, and other third-party tools into your apps, websites, or software to enhance functionality and streamline processes.",
    category: 'technical'
  },
  {
    id: '9',
    question: "Does CraftCode provide consultancy for business strategies?",
    answer: "Yes, our consultancy services cover digital transformation, marketing strategies, product planning, and operational efficiency to help businesses grow and leverage technology effectively.",
    category: 'technical'
  },
  {
    id: '10',
    question: "How is client data secured?",
    answer: "We implement enterprise-grade security measures including encryption, secure servers, access control, and regular audits. Your data and intellectual property are fully protected.",
    category: 'technical'
  },
  {
    id: '11',
    question: "How can I contact support at CraftCode?",
    answer: "You can reach our support team via email at support@craftcodesolutions.com, live chat, or the contact form on our website. Our team typically responds within 24 hours.",
    category: 'support'
  },
  {
    id: '12',
    question: "How does CraftCode handle project revisions or changes?",
    answer: "We provide clear revision policies and project management tools to track changes. Our team communicates with you regularly to ensure project milestones and expectations are met.",
    category: 'support'
  },
  {
    id: '13',
    question: "Can CraftCode develop projects for businesses of all sizes?",
    answer: "Yes, we work with startups, SMEs, and large enterprises. Whether you need a small website, a complex app, or full-scale software with marketing support, we can tailor solutions to your needs.",
    category: 'collaboration'
  },
  {
    id: '14',
    question: "Can I request training or consultancy after project delivery?",
    answer: "Yes, CraftCode offers post-project consultancy and training sessions for your team to help them understand the software, marketing tools, and strategies effectively.",
    category: 'support'
  },
  {
    id: '15',
    question: "What payment methods are accepted for services?",
    answer: "We accept all major credit cards, PayPal, and bank transfers. For larger projects or enterprise clients, flexible payment schedules can be arranged.",
    category: 'general'
  }
];


const FAQItem = ({
  faq,
  isOpen,
  onToggle,
}: {
  faq: FAQ;
  isOpen: boolean;
  onToggle: () => void;
}) => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'general':
        return 'from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-700 dark:text-blue-300';
      case 'collaboration':
        return 'from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-700 dark:text-purple-300';
      case 'technical':
        return 'from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 text-green-700 dark:text-green-300';
      case 'support':
        return 'from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 text-orange-700 dark:text-orange-300';
      default:
        return 'from-gray-100 to-gray-200 dark:from-gray-900/30 dark:to-gray-800/30 text-gray-700 dark:text-gray-300';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'general':
        return '💡';
      case 'collaboration':
        return '🤝';
      case 'technical':
        return '⚙️';
      case 'support':
        return '🆘';
      default:
        return '❓';
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-white dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-2xl p-6 mb-4 shadow-sm hover:shadow-xl transition-all duration-300 group ${
        isOpen ? 'ring-2 ring-blue-500/20 dark:ring-purple-500/20' : ''
      }`}
    >
      <button
        className="w-full flex justify-between items-center text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-purple-500 rounded-xl p-2 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`faq-answer-${faq.id}`}
      >
        <div className="flex-1">
          <div className="flex items-start gap-3">
            <span className="text-2xl mt-1">{getCategoryIcon(faq.category)}</span>
            <div className="flex-1">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-purple-400 transition-colors duration-200">
                {faq.question}
              </h3>
              <div className="flex items-center gap-2 mt-2">
                <span className={`inline-block px-3 py-1 text-xs font-medium bg-gradient-to-r ${getCategoryColor(faq.category)} rounded-full`}>
                  {faq.category}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  Click to {isOpen ? 'hide' : 'view'} answer
                </span>
              </div>
            </div>
          </div>
        </div>
        <span className="ml-4 text-gray-500 dark:text-gray-400 transition-all duration-200 group-hover:text-blue-600 dark:group-hover:text-purple-400">
          {isOpen ? (
            <ChevronUp className="w-6 h-6" />
          ) : (
            <ChevronDown className="w-6 h-6" />
          )}
        </span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
            id={`faq-answer-${faq.id}`}
          >
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {faq.answer}
              </p>
              <div className="mt-4 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Helpful answer
                </span>
                <button className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-purple-400 transition-colors duration-200 cursor-pointer">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                  Was this helpful?
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
};

const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = [
    { id: "all", name: "All Questions", icon: Search },
    { id: "general", name: "General", icon: MessageCircle },
    { id: "collaboration", name: "Collaboration", icon: Users },
    { id: "technical", name: "Technical", icon: Zap },
    { id: "support", name: "Support", icon: MessageCircle }
  ];

  const filteredFAQs = sampleFAQs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen relative">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Banner */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative bg-white dark:bg-gray-900/50 backdrop-blur-xl border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white py-12 px-6 sm:px-8 lg:px-12 flex flex-col lg:flex-row items-center justify-between rounded-2xl mb-16 shadow-xl dark:shadow-2xl"
        >
          <div className="relative z-10 mb-6 lg:mb-0">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 dark:from-blue-400 dark:via-purple-400 dark:to-cyan-400">
              Looking for Answers? <br /> We&apos;ve Got You Covered!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-4 text-base lg:text-lg max-w-2xl">
              Find answers to common questions about our platform, collaboration tools, and how to get the most out of your experience.
            </p>
          </div>
          <button className="relative z-10 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 hover:from-blue-700 hover:via-purple-700 hover:to-cyan-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl dark:hover:shadow-2xl hover:shadow-blue-500/25 dark:hover:shadow-purple-500/25 cursor-pointer">
            <span className="flex items-center gap-2">
              Get Started Now
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
          </button>
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 dark:from-purple-500/20 to-transparent rounded-full blur-xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-500/10 dark:from-blue-500/20 to-transparent rounded-full blur-xl" />
        </motion.section>

        {/* Statistics Section */}
        <div className="mb-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="bg-white dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-2xl p-6 text-center"
            >
              <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 mb-2">
                {sampleFAQs.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Questions</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="bg-white dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-2xl p-6 text-center"
            >
              <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 mb-2">
                {sampleFAQs.filter(f => f.category === 'collaboration').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Collaboration</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="bg-white dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-2xl p-6 text-center"
            >
              <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600 dark:from-green-400 dark:to-blue-400 mb-2">
                {sampleFAQs.filter(f => f.category === 'technical').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Technical</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className="bg-white dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-2xl p-6 text-center"
            >
              <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-400 dark:to-red-400 mb-2">
                {sampleFAQs.filter(f => f.category === 'support').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Support</div>
            </motion.div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-12 space-y-6">
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 text-gray-900 dark:text-white bg-white dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-purple-500 transition-all duration-200"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => {
              const Icon = category.icon;
              const count = category.id === "all" 
                ? sampleFAQs.length 
                : sampleFAQs.filter(f => f.category === category.id).length;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 cursor-pointer ${
                    selectedCategory === category.id
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25 dark:shadow-purple-500/25'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {category.name}
                  <span className="ml-1 px-2 py-0.5 text-xs bg-white/20 dark:bg-black/20 rounded-full">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* FAQ Section */}
        <section className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 dark:from-blue-400 dark:via-purple-400 dark:to-cyan-400 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
              Find answers to the most common questions about our platform and services.
            </p>
          </div>

          {filteredFAQs.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-blue-500/20 to-purple-500/20 dark:from-purple-500/20 dark:to-blue-500/20 rounded-full flex items-center justify-center">
                <Search className="w-12 h-12 text-gray-500 dark:text-gray-400" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">No questions found</h3>
              <p className="text-gray-600 dark:text-gray-400">Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFAQs.map((faq, index) => (
                <FAQItem
                  key={faq.id}
                  faq={faq}
                  isOpen={openIndex === index}
                  onToggle={() => handleToggle(index)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Quick Actions */}
        <div className="mt-16 mb-20">
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Get help faster with these quick access options
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="bg-white dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-2xl p-6 text-center hover:shadow-xl transition-all duration-300 group cursor-pointer"
            >
              <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Live Chat</h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Get instant help from our support team</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="bg-white dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-2xl p-6 text-center hover:shadow-xl transition-all duration-300 group cursor-pointer"
            >
              <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Documentation</h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Browse our comprehensive guides</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="bg-white dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-2xl p-6 text-center hover:shadow-xl transition-all duration-300 group cursor-pointer"
            >
              <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Video Tutorials</h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Watch step-by-step video guides</p>
            </motion.div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-20">
          <div className="relative bg-white dark:bg-gray-900/50 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-3xl p-12 overflow-hidden shadow-xl dark:shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 dark:from-purple-500/20 to-transparent rounded-full blur-xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-500/10 dark:from-blue-500/20 to-transparent rounded-full blur-xl" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Still Have Questions?
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto text-lg">
                Can&apos;t find what you&apos;re looking for? Our support team is here to help you with any questions or concerns.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 rounded-xl hover:from-blue-700 hover:via-purple-700 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105 hover:shadow-xl dark:hover:shadow-2xl hover:shadow-blue-500/25 dark:hover:shadow-purple-500/25 cursor-pointer">
                  <span className="flex items-center gap-3">
                    Contact Support
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </span>
                </button>
                <button className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 transform hover:scale-105 cursor-pointer">
                  <span className="flex items-center gap-3">
                    View Documentation
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;