import React, { useState } from 'react';

const ComingSoonButton = ({ children, className = '' }) => {
  const [show, setShow] = useState(false);

  return (
    <>
      <button
        className={`relative ${className}`}
        onClick={() => setShow(true)}
        type="button"
      >
        {children}
      </button>
      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 max-w-xs w-full text-center border border-gray-200 dark:border-gray-700 animate-fadeInUp">
            <div className="text-2xl font-bold mb-2 text-blue-600 dark:text-blue-400">Coming Soon</div>
            <div className="text-gray-700 dark:text-gray-300 mb-4">Payment Gateway will be available soon.<br/>Enjoy Kidolio for free during our launch period!</div>
            <button
              className="mt-2 px-6 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:scale-105 transition-all"
              onClick={() => setShow(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ComingSoonButton;
