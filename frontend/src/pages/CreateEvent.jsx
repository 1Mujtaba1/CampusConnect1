import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Users, Type, Image as ImageIcon, Send, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';

const CATEGORIES = ['Tech', 'Cultural', 'Workshop', 'Sports', 'Other'];

function CreateEvent() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '', category: 'Tech', date: '', time: '',
    venue: '', capacity: '', description: '', image: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      await axios.post('http://localhost:5000/api/events', formData, { headers: { authorization: token } });
      toast.success('Event submitted for admin approval!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `w-full pl-11 pr-4 py-3 rounded-xl outline-none transition-all
    dark:bg-white/5 dark:border dark:border-white/10 dark:text-white dark:placeholder-indigo-500 dark:focus:ring-violet-500
    bg-indigo-50 border border-indigo-100 text-indigo-900 placeholder-indigo-300 focus:ring-violet-400 focus:ring-2`;

  const fields = [
    { name: 'title',    label: 'Event Title',      type: 'text',   icon: Type,      placeholder: 'e.g. Annual Techathon 2026', span: 2 },
    { name: 'date',     label: 'Date',             type: 'date',   icon: Calendar,  span: 1 },
    { name: 'time',     label: 'Time',             type: 'time',   icon: Clock,     span: 1 },
    { name: 'venue',    label: 'Venue',            type: 'text',   icon: MapPin,    placeholder: 'e.g. Seminar Hall A', span: 1 },
    { name: 'capacity', label: 'Max Capacity',     type: 'number', icon: Users,     placeholder: 'e.g. 100', span: 1 },
    { name: 'image',    label: 'Poster Image URL', type: 'text',   icon: ImageIcon, placeholder: 'https://images.unsplash.com/...', span: 2 },
  ];

  return (
    <div className="min-h-screen dark:bg-indigo-950 bg-violet-50 py-24 px-4 sm:px-6 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <div className="mb-8">
          <h1 className="text-3xl font-black dark:text-white text-indigo-950">Create Event</h1>
          <p className="dark:text-indigo-400 text-indigo-500 mt-1">Submit a new event for admin approval.</p>
        </div>

        <div className="rounded-3xl overflow-hidden dark:bg-white/5 dark:border dark:border-white/10 bg-white border border-indigo-100 shadow-sm">
          <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-5">

            {fields.map(f => {
              const Icon = f.icon;
              return (
                <div key={f.name} className={f.span === 2 ? 'sm:col-span-2' : ''}>
                  <label className="block text-sm font-bold dark:text-indigo-300 text-indigo-600 mb-2">{f.label}</label>
                  <div className="relative">
                    <Icon size={15} className="absolute left-4 top-3.5 dark:text-indigo-400 text-indigo-400" />
                    <input
                      type={f.type} name={f.name} required
                      placeholder={f.placeholder}
                      value={formData[f.name]}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                </div>
              );
            })}

            {/* Category */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-bold dark:text-indigo-300 text-indigo-600 mb-2">Category</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat} type="button"
                    onClick={() => setFormData({ ...formData, category: cat })}
                    className={`px-4 py-2 rounded-xl font-bold text-sm border transition-all ${
                      formData.category === cat
                        ? 'bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-500/30'
                        : 'dark:bg-white/5 dark:text-indigo-300 dark:border-white/10 dark:hover:border-violet-500 bg-indigo-50 text-indigo-500 border-indigo-100 hover:border-violet-400 hover:text-violet-600'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-bold dark:text-indigo-300 text-indigo-600 mb-2">Description</label>
              <textarea
                name="description" rows={4} required
                placeholder="Describe your event — what to expect, who should attend..."
                value={formData.description}
                onChange={handleChange}
                className="w-full p-4 rounded-xl outline-none resize-none transition-all
                  dark:bg-white/5 dark:border dark:border-white/10 dark:text-white dark:placeholder-indigo-500 dark:focus:ring-violet-500
                  bg-indigo-50 border border-indigo-100 text-indigo-900 placeholder-indigo-300 focus:ring-violet-400 focus:ring-2"
              />
            </div>

            <button
              type="submit" disabled={loading}
              className="sm:col-span-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white py-4 rounded-2xl font-black transition-all shadow-lg shadow-violet-500/30 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              {loading ? 'Submitting...' : 'Submit for Approval'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

export default CreateEvent;
