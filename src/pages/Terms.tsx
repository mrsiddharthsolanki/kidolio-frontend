import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import SEO from '../components/SEO';

const Terms = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 text-gray-900 dark:text-white transition-all duration-700 ease-in-out flex flex-col relative overflow-hidden">
      <SEO title="Terms & Conditions | Kidolio" description="Read the terms and conditions for using Kidolio, the family education platform." />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <Link 
          to="/"
          className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-all duration-300 mb-8"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Home
        </Link>

        <h1 className="text-4xl font-bold mb-8">Terms and Conditions</h1>
        
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Welcome to Kidolio. These Terms and Conditions govern your use of our website and services. By accessing or using Kidolio, you agree to be bound by these Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Definitions</h2>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
              <li>"Service" refers to the Kidolio platform and all related services</li>
              <li>"User" refers to any individual or entity using our Service</li>
              <li>"Content" refers to all materials available through our Service</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              To access certain features of our Service, you must register for an account. You agree to provide accurate and complete information during registration and to update such information to keep it accurate and current.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Privacy Policy</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Your use of our Service is also governed by our Privacy Policy. Please review our Privacy Policy, which also governs the Site and informs users of our data collection practices.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. User Conduct</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              You agree not to use the Service to:
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
              <li>Violate any laws or regulations</li>
              <li>Infringe upon the rights of others</li>
              <li>Interfere with the proper functioning of the Service</li>
              <li>Attempt to gain unauthorized access to any portion of the Service</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Intellectual Property</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              The Service and its original content, features, and functionality are owned by Kidolio and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Limitation of Liability</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              In no event shall Kidolio, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Changes to Terms</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Contact Us</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              If you have any questions about these Terms, please contact us at support@kidolio.com
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Terms;