import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    // Here you would typically send the form data to your backend or an email service
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 text-gray-900 dark:text-white transition-all duration-700 ease-in-out flex flex-col relative overflow-hidden" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
      {/* Decorative Illustration */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <img src="https://undraw.co/api/illustrations/undraw_contact_us_re_4qqt.svg" alt="Contact Illustration" className="absolute right-0 top-0 w-96 max-w-full opacity-30 dark:opacity-20 select-none hidden lg:block" style={{zIndex: 1}} />
        <div className="absolute w-96 h-96 bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-400/10 dark:to-purple-400/10 rounded-full blur-3xl left-[-10%] top-[-10%] animate-float" />
        <div className="absolute w-64 h-64 bg-gradient-to-r from-green-500/10 to-blue-500/10 dark:from-green-400/10 dark:to-blue-400/10 rounded-full blur-3xl right-[-10%] bottom-[-10%] animate-float" style={{ animationDelay: '1.5s' }} />
      </div>
      <section className="py-20 lg:py-32 px-4 sm:px-8 max-w-3xl mx-auto w-full relative z-10">
        <h1 className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent text-center drop-shadow-lg">Contact Us</h1>
        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto text-center">
          Have questions, feedback, or want to partner with us? Reach out and our team will get back to you soon.
        </p>
        <div className="bg-white/90 dark:bg-gray-900/90 rounded-2xl p-8 shadow-2xl border border-gray-200/50 dark:border-gray-700/50 mb-10 backdrop-blur-xl animate-fadeInUp">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                  placeholder="Your Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                  placeholder="you@email.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                value={form.message}
                onChange={handleChange}
                required
                rows={5}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                placeholder="How can we help you?"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:shadow-xl transition-all flex items-center justify-center space-x-2 group text-lg tracking-wide disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={submitted}
            >
              <span>{submitted ? 'Message Sent!' : 'Send Message'}</span>
              <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
          {submitted && (
            <div className="mt-6 text-green-600 dark:text-green-400 text-center font-medium animate-fadeInUp">Thank you for contacting us! We'll be in touch soon.</div>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center animate-fadeInUp">
          <div className="flex flex-col items-center bg-white/80 dark:bg-gray-800/80 rounded-xl p-6 shadow-md border border-gray-200/50 dark:border-gray-700/50">
            <Mail className="w-8 h-8 mb-2 text-blue-600 dark:text-blue-400" />
            <div className="font-semibold mb-1">Email</div>
            <a href="mailto:support@kidolio.com" className="text-blue-600 dark:text-blue-400 hover:underline">support@kidolio.com</a>
          </div>
          <div className="flex flex-col items-center bg-white/80 dark:bg-gray-800/80 rounded-xl p-6 shadow-md border border-gray-200/50 dark:border-gray-700/50">
            <Phone className="w-8 h-8 mb-2 text-blue-600 dark:text-blue-400" />
            <div className="font-semibold mb-1">Phone</div>
            <a href="tel:+1234567890" className="text-blue-600 dark:text-blue-400 hover:underline">+1 (234) 567-890</a>
          </div>
          <div className="flex flex-col items-center bg-white/80 dark:bg-gray-800/80 rounded-xl p-6 shadow-md border border-gray-200/50 dark:border-gray-700/50">
            <MapPin className="w-8 h-8 mb-2 text-blue-600 dark:text-blue-400" />
            <div className="font-semibold mb-1">Address</div>
            <div>123 Kidolio Lane<br />San Francisco, CA</div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
