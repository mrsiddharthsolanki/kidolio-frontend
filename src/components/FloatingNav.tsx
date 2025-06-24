import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp } from 'lucide-react';

const FloatingNav = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  const sections = [
    { id: 'hero', label: 'Home' },
    { id: 'stats', label: 'Stats' },
    { id: 'roles', label: 'Roles' },
    { id: 'features', label: 'Features' },
    { id: 'testimonials', label: 'Reviews' }
  ];

  useEffect(() => {
    const handleScroll = () => {
      // Show/hide floating nav based on scroll position
      setIsVisible(window.scrollY > 300);

      // Update active section based on scroll position
      const sectionElements = sections.map(section => ({
        id: section.id,
        element: document.getElementById(section.id)
      }));

      const currentSection = sectionElements.find(section => {
        if (!section.element) return false;
        const rect = section.element.getBoundingClientRect();
        return rect.top <= 100 && rect.bottom >= 100;
      });

      if (currentSection) {
        setActiveSection(currentSection.id);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-4"
        >
          {/* Navigation dots */}
          <nav className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full p-4 shadow-lg">
            <ul className="flex flex-col gap-3">
              {sections.map((section) => (
                <li key={section.id}>
                  <button
                    onClick={() => scrollToSection(section.id)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 relative group
                              ${activeSection === section.id 
                                ? 'bg-blue-600 scale-125' 
                                : 'bg-gray-300 dark:bg-gray-600 hover:bg-blue-400'}`}
                    aria-label={section.label}
                  >
                    <span className="absolute right-full mr-2 py-1 px-2 rounded-md text-sm 
                                   bg-white dark:bg-gray-800 shadow-lg opacity-0 group-hover:opacity-100 
                                   transition-opacity duration-300 whitespace-nowrap">
                      {section.label}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Scroll to top button */}
          <button
            onClick={scrollToTop}
            className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg
                     transition-all duration-300 hover:scale-110"
            aria-label="Scroll to top"
          >
            <ChevronUp className="w-6 h-6" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FloatingNav; 