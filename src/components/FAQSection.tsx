import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

const faqs = [
  {
    question: 'Is Kidolio really free during launch?',
    answer: 'Yes! All features are free for everyone during our initial launch period. Enjoy full access and invite your family.'
  },
  {
    question: 'When will payment plans become available?',
    answer: 'We are working to launch secure payment options soon. Stay tuned for updates and enjoy free access in the meantime.'
  },
  {
    question: 'Is my family’s data safe?',
    answer: 'Absolutely. We use enterprise-grade security,encryption, and strict privacy controls to keep your data safe.'
  },
  {
    question: 'Can I add more than one child?',
    answer: 'Yes! Our Professional and Enterprise plans allow multiple or unlimited child accounts. All plans are free during launch.'
  },
  {
    question: 'How do I contact support?',
    answer: 'You can reach us anytime via email or in-app support page. We’re here to help you 24/7.'
  }
];

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section id="faq" className="py-20 lg:py-32 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-t border-gray-100/50 dark:border-gray-800/50 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14 lg:mb-20">
          <div className="flex justify-center mb-4">
            <span className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg animate-fadeInUp">
              <HelpCircle className="w-7 h-7 text-white" />
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-gray-900 dark:text-white mb-4">
            Frequently Asked <span className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Questions</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Everything you need to know about Kidolio’s platform, security, and launch.
          </p>
        </div>
        <div className="space-y-6">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className={`bg-white/90 dark:bg-gray-900/90 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-lg p-6 transition-all duration-500 group hover:scale-[1.02] hover:shadow-2xl ${openIndex === idx ? 'ring-2 ring-blue-500/30 dark:ring-blue-400/30' : ''}`}
            >
              <button
                className="w-full flex items-center justify-between text-left focus:outline-none"
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                aria-expanded={openIndex === idx}
              >
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {faq.question}
                </span>
                <span className="ml-4">
                  {openIndex === idx ? (
                    <ChevronUp className="w-6 h-6 text-blue-600 dark:text-blue-400 transition-transform duration-300" />
                  ) : (
                    <ChevronDown className="w-6 h-6 text-gray-400 dark:text-gray-500 transition-transform duration-300" />
                  )}
                </span>
              </button>
              <div
                className={`overflow-hidden transition-all duration-500 ${openIndex === idx ? 'max-h-40 mt-4 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Decorative background orbs */}
      <div className="absolute -top-16 -left-16 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" style={{zIndex:0}}></div>
      <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-gradient-to-br from-green-400/20 to-blue-500/20 rounded-full blur-3xl animate-pulse" style={{zIndex:0}}></div>
    </section>
  );
};

export default FAQSection;
