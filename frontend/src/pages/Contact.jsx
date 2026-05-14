import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, MapPin, Send, CheckCircle2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState('idle');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    try {
      await axios.post('http://localhost:5000/api/contact', formData);
      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
      toast.success('Message sent!');
      setTimeout(() => setStatus('idle'), 5000);
    } catch {
      toast.error('Failed to send. Try again.');
      setStatus('idle');
    }
  };

  const inputClass = `w-full p-3 rounded-xl outline-none transition-all
    dark:bg-white/5 dark:border dark:border-white/10 dark:text-white dark:placeholder-indigo-500 dark:focus:ring-violet-500
    bg-indigo-50 border border-indigo-100 text-indigo-900 placeholder-indigo-300 focus:ring-violet-400 focus:ring-2`;

  const labelClass = 'block text-xs font-bold dark:text-indigo-400 text-indigo-500 uppercase tracking-widest mb-2';

  return (
    <div className="min-h-screen dark:bg-indigo-950 bg-violet-50 pt-28 pb-20 px-4 sm:px-6 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

          {/* Left */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-5xl font-black mb-4 leading-tight dark:text-white text-indigo-950">
              Get in <span className="text-violet-500">Touch</span>
            </h1>
            <p className="dark:text-indigo-400 text-indigo-500 mb-10 max-w-sm">
              Questions about an event or the platform? We're here to help.
            </p>

            <div className="space-y-6">
              {[
                { icon: Mail,  label: 'Email',    val: 'support@cems.university.edu', color: 'bg-violet-600' },
                { icon: Phone, label: 'Phone',    val: '+91 98765 43210',             color: 'bg-indigo-600' },
                { icon: MapPin,label: 'Location', val: 'Admin Block, Room 402',       color: 'bg-purple-600' },
              ].map(({ icon: Icon, label, val, color }) => (
                <div key={label} className="flex items-center gap-4">
                  <div className={`${color} w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg`}>
                    <Icon size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-black dark:text-indigo-500 text-indigo-400 uppercase tracking-widest">{label}</p>
                    <p className="font-bold dark:text-indigo-100 text-indigo-800">{val}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="rounded-3xl p-8 dark:bg-white/5 dark:border dark:border-white/10 bg-white border border-indigo-100 shadow-sm"
          >
            <AnimatePresence mode="wait">
              {status === 'success' ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="text-center py-16"
                >
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-500/20 border border-green-200 dark:border-green-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={32} className="text-green-500" />
                  </div>
                  <h3 className="text-2xl font-black dark:text-white text-indigo-950 mb-2">Message Sent!</h3>
                  <p className="dark:text-indigo-400 text-indigo-500">We'll get back to you shortly.</p>
                </motion.div>
              ) : (
                <motion.form key="form" onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Name</label>
                      <input type="text" required placeholder="Your name" className={inputClass}
                        value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div>
                      <label className={labelClass}>Email</label>
                      <input type="email" required placeholder="you@email.com" className={inputClass}
                        value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Subject</label>
                    <input type="text" required placeholder="What's this about?" className={inputClass}
                      value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} />
                  </div>
                  <div>
                    <label className={labelClass}>Message</label>
                    <textarea rows={5} required placeholder="Write your message..."
                      className={`${inputClass} resize-none`}
                      value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} />
                  </div>
                  <button
                    type="submit" disabled={status === 'sending'}
                    className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white py-3.5 rounded-xl font-black flex items-center justify-center gap-2 transition-all shadow-lg shadow-violet-500/30"
                  >
                    {status === 'sending' ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    {status === 'sending' ? 'Sending...' : 'Send Message'}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Contact;
