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
        return 'from-[#E6F7F6] to-[#D9F5F1] dark:from-[#0B1C2D]/70 dark:to-[#102A3A]/70 text-[#1E5AA8] dark:text-[#6EE7D8]';
      case 'collaboration':
        return 'from-[#E6F1F5] to-[#DCEEEE] dark:from-[#102A3A]/70 dark:to-[#0B1C2D]/70 text-[#1E5AA8] dark:text-[#6EE7D8]';
      case 'technical':
        return 'from-[#E1F3FB] to-[#E6F7F6] dark:from-[#0B1C2D]/70 dark:to-[#102A3A]/70 text-[#2FD1C5] dark:text-[#6EE7D8]';
      case 'support':
        return 'from-[#F2FBF9] to-[#E6F7F6] dark:from-[#102A3A]/70 dark:to-[#0B1C2D]/70 text-[#1E5AA8] dark:text-[#6EE7D8]';
      default:
        return 'from-[#F7FBFC] to-[#EEF7F6] dark:from-[#0B1C2D]/70 dark:to-[#102A3A]/70 text-[#475569] dark:text-[#9FB3C8]';
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
      className={`bg-white/85 dark:bg-[#0B1C2D]/70 backdrop-blur-xl border border-[#DCEEEE] dark:border-[#102A3A] rounded-2xl p-6 mb-4 shadow-sm hover:shadow-xl transition-all duration-300 group ${
        isOpen ? 'ring-2 ring-[#2FD1C5]/30 dark:ring-[#6EE7D8]/20' : ''
      }`}
    >
      <button
        className="w-full flex justify-between items-center text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2FD1C5] dark:focus-visible:ring-[#6EE7D8] rounded-xl p-2 transition-all duration-200 hover:bg-[#F7FBFC] dark:hover:bg-[#102A3A]/60 cursor-pointer"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`faq-answer-${faq.id}`}
      >
        <div className="flex-1">
          <div className="flex items-start gap-3">
            <span className="text-2xl mt-1">{getCategoryIcon(faq.category)}</span>
            <div className="flex-1">
              <h3 className="text-lg sm:text-xl font-semibold text-[#0F172A] dark:text-[#E6F1F5] group-hover:text-[#1E5AA8] dark:group-hover:text-[#6EE7D8] transition-colors duration-200">
                {faq.question}
              </h3>
              <div className="flex items-center gap-2 mt-2">
                <span className={`inline-block px-3 py-1 text-xs font-medium bg-gradient-to-r ${getCategoryColor(faq.category)} rounded-full`}>
                  {faq.category}
                </span>
                <span className="text-xs text-[#7B8A9A] dark:text-[#9FB3C8]">
                  Click to {isOpen ? 'hide' : 'view'} answer
                </span>
              </div>
            </div>
          </div>
        </div>
        <span className="ml-4 text-[#7B8A9A] dark:text-[#9FB3C8] transition-all duration-200 group-hover:text-[#1E5AA8] dark:group-hover:text-[#6EE7D8]">
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
            <div className="mt-6 pt-6 border-t border-[#DCEEEE] dark:border-[#102A3A]">
              <p className="text-[#475569] dark:text-[#9FB3C8] leading-relaxed">
                {faq.answer}
              </p>
              <div className="mt-4 flex items-center gap-4 text-sm text-[#7B8A9A] dark:text-[#9FB3C8]">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Helpful answer
                </span>
                <button className="flex items-center gap-1 hover:text-[#1E5AA8] dark:hover:text-[#6EE7D8] transition-colors duration-200 cursor-pointer">
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
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#F7FBFC] via-[#EEF7F6] to-[#F7FBFC] dark:from-[#050B14] dark:via-[#0B1C2D] dark:to-[#050B14]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(110,231,216,0.35),transparent_55%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_85%,rgba(30,90,168,0.25),transparent_55%)]"></div>
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#2FD1C5]/60 to-transparent"></div>
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Banner */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative bg-white/85 dark:bg-[#0B1C2D]/60 backdrop-blur-xl border border-[#DCEEEE] dark:border-[#102A3A] text-[#0F172A] dark:text-[#E6F1F5] py-12 px-6 sm:px-8 lg:px-12 flex flex-col lg:flex-row items-center justify-between rounded-2xl mb-16 shadow-xl dark:shadow-2xl"
        >
          <div className="relative z-10 mb-6 lg:mb-0">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-[#1E5AA8] via-[#2FD1C5] to-[#6EE7D8] dark:from-[#6EE7D8] dark:via-[#2FD1C5] dark:to-[#1E5AA8]">
              Looking for Answers? <br /> We&apos;ve Got You Covered!
            </h1>
            <p className="text-[#475569] dark:text-[#9FB3C8] mt-4 text-base lg:text-lg max-w-2xl">
              Find answers to common questions about our platform, collaboration tools, and how to get the most out of your experience.
            </p>
          </div>
          <button className="relative z-10 bg-gradient-to-r from-[#2FD1C5] via-[#1E5AA8] to-[#0B1C2D] hover:from-[#1E5AA8] hover:via-[#0B1C2D] hover:to-[#050B14] text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl dark:hover:shadow-2xl hover:shadow-[#2FD1C5]/25 dark:hover:shadow-[#1E5AA8]/25 cursor-pointer">
            <span className="flex items-center gap-2">
              Get Started Now
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
          </button>
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#2FD1C5]/15 dark:from-[#6EE7D8]/15 to-transparent rounded-full blur-xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-[#1E5AA8]/15 dark:from-[#2FD1C5]/15 to-transparent rounded-full blur-xl" />
        </motion.section>

        {/* Statistics Section */}
        <div className="mb-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="bg-white/85 dark:bg-[#0B1C2D]/70 backdrop-blur-xl border border-[#DCEEEE] dark:border-[#102A3A] rounded-2xl p-6 text-center"
            >
              <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#1E5AA8] to-[#2FD1C5] dark:from-[#6EE7D8] dark:to-[#2FD1C5] mb-2">
                {sampleFAQs.length}
              </div>
              <div className="text-sm text-[#475569] dark:text-[#9FB3C8]">Total Questions</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="bg-white/85 dark:bg-[#0B1C2D]/70 backdrop-blur-xl border border-[#DCEEEE] dark:border-[#102A3A] rounded-2xl p-6 text-center"
            >
              <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#2FD1C5] to-[#6EE7D8] dark:from-[#2FD1C5] dark:to-[#6EE7D8] mb-2">
                {sampleFAQs.filter(f => f.category === 'collaboration').length}
              </div>
              <div className="text-sm text-[#475569] dark:text-[#9FB3C8]">Collaboration</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="bg-white/85 dark:bg-[#0B1C2D]/70 backdrop-blur-xl border border-[#DCEEEE] dark:border-[#102A3A] rounded-2xl p-6 text-center"
            >
              <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#1E5AA8] to-[#6EE7D8] dark:from-[#6EE7D8] dark:to-[#1E5AA8] mb-2">
                {sampleFAQs.filter(f => f.category === 'technical').length}
              </div>
              <div className="text-sm text-[#475569] dark:text-[#9FB3C8]">Technical</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className="bg-white/85 dark:bg-[#0B1C2D]/70 backdrop-blur-xl border border-[#DCEEEE] dark:border-[#102A3A] rounded-2xl p-6 text-center"
            >
              <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#2FD1C5] to-[#1E5AA8] dark:from-[#6EE7D8] dark:to-[#1E5AA8] mb-2">
                {sampleFAQs.filter(f => f.category === 'support').length}
              </div>
              <div className="text-sm text-[#475569] dark:text-[#9FB3C8]">Support</div>
            </motion.div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-12 space-y-6">
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#7B8A9A]" />
            <input
              type="text"
              placeholder="Search for questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 text-[#0F172A] dark:text-[#E6F1F5] bg-white dark:bg-[#0B1C2D]/70 border border-[#DCEEEE] dark:border-[#102A3A] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#2FD1C5] dark:focus:ring-[#6EE7D8] transition-all duration-200"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#7B8A9A] hover:text-[#475569] dark:hover:text-[#9FB3C8] cursor-pointer"
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
                      ? 'bg-gradient-to-r from-[#2FD1C5] to-[#1E5AA8] text-white shadow-lg shadow-[#2FD1C5]/25 dark:shadow-[#1E5AA8]/25'
                      : 'bg-[#EEF7F6] dark:bg-[#0B1C2D] text-[#475569] dark:text-[#9FB3C8] hover:bg-[#DCEEEE] dark:hover:bg-[#102A3A] border border-[#DCEEEE] dark:border-[#102A3A]'
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
            <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#1E5AA8] via-[#2FD1C5] to-[#6EE7D8] dark:from-[#6EE7D8] dark:via-[#2FD1C5] dark:to-[#1E5AA8] mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-[#475569] dark:text-[#9FB3C8] text-lg max-w-2xl mx-auto">
              Find answers to the most common questions about our platform and services.
            </p>
          </div>

          {filteredFAQs.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-[#6EE7D8]/20 to-[#1E5AA8]/20 dark:from-[#1E5AA8]/20 dark:to-[#6EE7D8]/20 rounded-full flex items-center justify-center">
                <Search className="w-12 h-12 text-[#7B8A9A] dark:text-[#9FB3C8]" />
              </div>
              <h3 className="text-2xl font-semibold text-[#0F172A] dark:text-[#E6F1F5] mb-2">No questions found</h3>
              <p className="text-[#475569] dark:text-[#9FB3C8]">Try adjusting your search or filter criteria.</p>
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
            <h3 className="text-2xl md:text-3xl font-bold text-[#0F172A] dark:text-[#E6F1F5] mb-4">
              Quick Actions
            </h3>
            <p className="text-[#475569] dark:text-[#9FB3C8]">
              Get help faster with these quick access options
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="bg-white/85 dark:bg-[#0B1C2D]/70 backdrop-blur-xl border border-[#DCEEEE] dark:border-[#102A3A] rounded-2xl p-6 text-center hover:shadow-xl transition-all duration-300 group cursor-pointer"
            >
              <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-[#2FD1C5] to-[#1E5AA8] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-[#0F172A] dark:text-[#E6F1F5] mb-2">Live Chat</h4>
              <p className="text-[#475569] dark:text-[#9FB3C8] text-sm">Get instant help from our support team</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="bg-white/85 dark:bg-[#0B1C2D]/70 backdrop-blur-xl border border-[#DCEEEE] dark:border-[#102A3A] rounded-2xl p-6 text-center hover:shadow-xl transition-all duration-300 group cursor-pointer"
            >
              <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-[#6EE7D8] to-[#2FD1C5] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-[#0F172A] dark:text-[#E6F1F5] mb-2">Documentation</h4>
              <p className="text-[#475569] dark:text-[#9FB3C8] text-sm">Browse our comprehensive guides</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="bg-white/85 dark:bg-[#0B1C2D]/70 backdrop-blur-xl border border-[#DCEEEE] dark:border-[#102A3A] rounded-2xl p-6 text-center hover:shadow-xl transition-all duration-300 group cursor-pointer"
            >
              <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-[#1E5AA8] to-[#2FD1C5] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-[#0F172A] dark:text-[#E6F1F5] mb-2">Video Tutorials</h4>
              <p className="text-[#475569] dark:text-[#9FB3C8] text-sm">Watch step-by-step video guides</p>
            </motion.div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-20">
          <div className="relative bg-white/85 dark:bg-[#0B1C2D]/60 backdrop-blur-xl border border-[#DCEEEE] dark:border-[#102A3A] rounded-3xl p-12 overflow-hidden shadow-xl dark:shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#2FD1C5]/15 dark:from-[#6EE7D8]/15 to-transparent rounded-full blur-xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-[#1E5AA8]/15 dark:from-[#2FD1C5]/15 to-transparent rounded-full blur-xl" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-[#0F172A] dark:text-[#E6F1F5] mb-6">
                Still Have Questions?
              </h2>
              <p className="text-[#475569] dark:text-[#9FB3C8] mb-8 max-w-2xl mx-auto text-lg">
                Can&apos;t find what you&apos;re looking for? Our support team is here to help you with any questions or concerns.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-[#2FD1C5] via-[#1E5AA8] to-[#0B1C2D] rounded-xl hover:from-[#1E5AA8] hover:via-[#0B1C2D] hover:to-[#050B14] transition-all duration-300 transform hover:scale-105 hover:shadow-xl dark:hover:shadow-2xl hover:shadow-[#2FD1C5]/25 dark:hover:shadow-[#1E5AA8]/25 cursor-pointer">
                  <span className="flex items-center gap-3">
                    Contact Support
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </span>
                </button>
                <button className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-[#475569] dark:text-[#9FB3C8] bg-[#EEF7F6] dark:bg-[#0B1C2D] border border-[#DCEEEE] dark:border-[#102A3A] rounded-xl hover:bg-[#DCEEEE] dark:hover:bg-[#102A3A] transition-all duration-300 transform hover:scale-105 cursor-pointer">
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
