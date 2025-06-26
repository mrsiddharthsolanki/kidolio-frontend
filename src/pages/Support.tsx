import React, { useState } from 'react';
import SEO from '../components/SEO';

const Support = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '', type: 'feedback' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would send the form data to your backend or a service
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 text-gray-900 dark:text-white transition-all duration-700 ease-in-out flex flex-col relative overflow-hidden">
      <SEO title="Support | Kidolio" description="Get support for Kidolio, the family education and learning platform." />
      <div className="max-w-xl w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-gray-200/50 dark:border-gray-700/50">
        <h1 className="text-3xl font-bold mb-4 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Support & Feedback</h1>
        <p className="text-gray-700 dark:text-gray-300 mb-8 text-center">We value your feedback and are here to help! Please share your suggestions or report any issues below.</p>
        {submitted ? (
          <div className="text-green-600 text-center font-semibold py-8">Thank you for your feedback! We'll get back to you soon.</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-1 font-medium">Name</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} required className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-1 font-medium">Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} required className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-1 font-medium">Type</label>
              <select name="type" value={form.type} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800">
                <option value="feedback">Feedback</option>
                <option value="issue">Report an Issue</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-1 font-medium">Message</label>
              <textarea name="message" value={form.message} onChange={handleChange} required rows={5} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <button type="submit" className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-xl hover:scale-105 transition-all text-lg">Submit</button>
          </form>
        )}
      </div>

     
    </div>
  );
};

export default Support;
