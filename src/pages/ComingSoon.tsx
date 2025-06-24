import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, ArrowLeft } from 'lucide-react';

const ComingSoon = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50/80 via-white to-purple-50/80 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 transition-all duration-700 ease-in-out">
      <div className="relative bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-3xl shadow-2xl p-10 md:p-16 border border-gray-200/50 dark:border-gray-700/50 flex flex-col items-center max-w-lg w-full animate-fadeInUp">
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full flex items-center justify-center shadow-lg bg-gradient-to-r from-blue-600 to-purple-600">
          <Lock className="w-10 h-10 text-white" />
        </div>
        <h1 className="mt-14 text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 text-center">
          Payment Gateway Coming Soon
        </h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 text-center">
          We’re working hard to bring secure payments to Kidolio.<br/>
          Enjoy <span className="font-semibold text-blue-600 dark:text-blue-400">free access</span> during our launch period!
        </p>
        <Link
          to="/"
          className="inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:scale-105 transition-all shadow-lg"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Home
        </Link>
      </div>
      <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" style={{zIndex:0}}></div>
      <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-br from-green-400/20 to-blue-500/20 rounded-full blur-3xl animate-pulse" style={{zIndex:0}}></div>
    </div>
  );
};

export default ComingSoon;
