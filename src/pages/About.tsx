import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Brain, File, Shield, Lock, Award, Star, ArrowRight, Globe } from 'lucide-react';
import SEO from '../components/SEO';

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 text-gray-900 dark:text-white transition-all duration-700 ease-in-out flex flex-col relative overflow-hidden" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
      <SEO title="About Kidolio" description="Learn more about Kidolio, our mission, and how we empower families and educators worldwide." />
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute w-[600px] h-[600px] bg-gradient-to-r from-blue-500/20 to-purple-500/20 dark:from-blue-400/10 dark:to-purple-400/10 rounded-full blur-3xl transition-all duration-1000 ease-out left-[-15%] top-[-15%] animate-float" />
        <div className="absolute w-96 h-96 bg-gradient-to-r from-green-500/20 to-blue-500/20 dark:from-green-400/10 dark:to-blue-400/10 rounded-full blur-3xl transition-all duration-1000 ease-out right-[-10%] bottom-[-10%] animate-float" style={{ animationDelay: '1.5s' }} />
        <div className="absolute w-48 h-48 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-2xl animate-pulse left-[60%] top-[60%]" />
        <div className="absolute w-24 h-24 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-full blur-2xl animate-pulse right-[20%] top-[30%]" style={{ animationDelay: '2s' }} />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 w-full py-24 px-4 sm:px-8 flex-1 flex items-center justify-center">
        <div className="max-w-4xl mx-auto text-center animate-fadeInUp">
          <div className="inline-flex items-center space-x-2 bg-blue-100/80 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2.5 rounded-full text-sm font-medium mb-6 animate-fadeInUp">
            <Star className="w-4 h-4 animate-pulse" />
            <span>Empowering Families Worldwide</span>
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent animate-gradient bg-300% animate-gradientShift mb-6 animate-fadeInUp drop-shadow-lg">
            About Kidolio
          </h1>
          <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed mb-10 animate-fadeInUp">
            Whether you're a parent, child, or educator, Kidolio provides tailored experiences that meet your specific needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fadeInUp">
            <Link to="/signup" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-500 flex items-center justify-center space-x-2 group font-medium transform hover:scale-105 hover:from-blue-500 hover:to-purple-500 relative overflow-hidden">
              <span className="relative z-10">Get Started</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300 relative z-10" />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </Link>
            <Link to="/" className="border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-8 py-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-500 flex items-center justify-center space-x-2 font-medium transform hover:scale-105 backdrop-blur-sm">
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Vision & Unique Section */}
      <section className="relative z-10 py-20 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div className="animate-fadeInUp">
            <h2 className="text-3xl font-black mb-4 text-blue-600 dark:text-blue-400 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Our Vision</h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
              To empower families by securely managing a child’s journey from birth to growth through one connected, intelligent platform.
              We aim to simplify records, support learning, and unlock every child’s potential.
            </p>
            <h2 className="text-2xl font-bold mb-4 text-purple-600 dark:text-purple-400">What Makes Us Unique?</h2>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg animate-float"><Shield className="w-6 h-6" /></span>
                <span className="text-gray-700 dark:text-gray-300 font-medium text-lg">Advanced Security</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-blue-500 text-white shadow-lg animate-float" style={{ animationDelay: '0.2s' }}><File className="w-6 h-6" /></span>
                <span className="text-gray-700 dark:text-gray-300 font-medium text-lg">Unified Records</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg animate-float" style={{ animationDelay: '0.4s' }}><Users className="w-6 h-6" /></span>
                <span className="text-gray-700 dark:text-gray-300 font-medium text-lg">Parent & Child Dashboard</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-yellow-500 text-white shadow-lg animate-float" style={{ animationDelay: '0.6s' }}><Lock className="w-6 h-6" /></span>
                <span className="text-gray-700 dark:text-gray-300 font-medium text-lg">Verified Official Access</span>
              </li>
            </ul>
          </div>
          <div className="flex flex-col items-center animate-fadeInUp">
            <div className="relative w-44 h-44 mb-8 animate-float">
              <img src="./whilte_logo.png" alt="Kidolio Logo" className="h-full w-full object-contain rounded-3xl shadow-4xl bg-white dark:bg-gray-800 p-4 border-4 border-white dark:border-gray-900" />
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-blue-400/30 to-purple-500/30 rounded-full blur-2xl animate-pulse"></div>
              <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-gradient-to-br from-green-400/30 to-blue-500/30 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl p-8 shadow-3xl w-full text-center animate-fadeInUp">
              <h3 className="text-2xl font-black mb-2">Join Our Mission</h3>
              <p className="mb-4 text-lg">Be part of a new era where every child’s journey is valued, tracked, and celebrated.</p>
              <Link to="/signup" className="inline-block bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:shadow-xl transition-all">Get Started</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <footer className="relative z-10 w-full py-16 px-4 sm:px-8 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-auto">
        <div className="max-w-5xl mx-auto text-center animate-fadeInUp">
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Ready to unlock
            your child’s full potential?
          </h2>
          <Link to="/signup" className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-500 font-medium transform hover:scale-105 hover:from-blue-500 hover:to-purple-500 relative overflow-hidden mt-4">
            <span className="relative z-10">Start your free trial</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300 relative z-10 inline-block ml-2" />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </Link>
          <div className="mt-6 text-gray-500 dark:text-gray-400 text-sm">
            No credit card required • 30-day free trial • Cancel anytime
          </div>
        </div>
      </footer>
    </div>
  );
};

export default About;
