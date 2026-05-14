import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, MapPin, Calendar, ArrowRight, Loader2, Clock, Users } from 'lucide-react';
import axios from 'axios';

const CATEGORIES = ['All', 'Tech', 'Cultural', 'Workshop', 'Sports'];
const TIMEFRAMES = ['All', 'Upcoming', 'Past'];

function EventFeed() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeTimeframe, setActiveTimeframe] = useState('All');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:5000/api/events')
      .then(res => setEvents(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = events.filter(event => {
    const matchSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.venue?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = activeCategory === 'All' || event.category === activeCategory;
    let matchTime = true;
    if (activeTimeframe !== 'All') {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const eDate = new Date(event.date); eDate.setHours(0, 0, 0, 0);
      matchTime = activeTimeframe === 'Upcoming' ? eDate >= today : eDate < today;
    }
    return matchSearch && matchCat && matchTime;
  });

  return (
    <div className="min-h-screen dark:bg-indigo-950 bg-violet-50 py-24 px-4 sm:px-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="mb-10">
          <motion.h1
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl font-black dark:text-white text-indigo-950 tracking-tight mb-2"
          >
            Campus <span className="text-violet-500">Events</span>
          </motion.h1>
          <p className="dark:text-indigo-400 text-indigo-500">Discover workshops, fests, and seminars across all departments.</p>
        </div>

        {/* SEARCH + TIMEFRAME */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 dark:text-indigo-400 text-indigo-400" size={18} />
            <input
              type="text"
              placeholder="Search events or venues..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl outline-none transition-all
                dark:bg-white/5 dark:border dark:border-white/10 dark:text-white dark:placeholder-indigo-400 dark:focus:ring-violet-500
                bg-white border border-indigo-100 text-indigo-900 placeholder-indigo-300 focus:ring-violet-400
                focus:ring-2 shadow-sm"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex p-1 rounded-2xl gap-1
            dark:bg-white/5 dark:border dark:border-white/10
            bg-white border border-indigo-100 shadow-sm"
          >
            {TIMEFRAMES.map(t => (
              <button
                key={t}
                onClick={() => setActiveTimeframe(t)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  activeTimeframe === t
                    ? 'bg-violet-600 text-white shadow'
                    : 'dark:text-indigo-300 dark:hover:text-white text-indigo-500 hover:text-violet-600'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* CATEGORY TABS */}
        <div className="flex gap-2 mb-10 overflow-x-auto pb-2 no-scrollbar">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-5 py-2.5 rounded-xl font-bold text-sm transition-all border ${
                activeCategory === cat
                  ? 'bg-violet-600 text-white border-violet-600 shadow-lg shadow-violet-500/30'
                  : 'dark:bg-white/5 dark:text-indigo-300 dark:border-white/10 dark:hover:border-violet-500 dark:hover:text-white bg-white text-indigo-500 border-indigo-100 hover:border-violet-400 hover:text-violet-600 shadow-sm'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* GRID */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 size={40} className="animate-spin text-violet-500 mb-4" />
            <p className="dark:text-indigo-400 text-indigo-400 text-sm font-bold uppercase tracking-widest">Loading events...</p>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filtered.length > 0 ? (
                filtered.map(event => <EventCard key={event._id} event={event} />)
              ) : (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="col-span-full py-20 text-center rounded-3xl border-2 border-dashed
                    dark:bg-white/5 dark:border-white/10
                    bg-white border-indigo-100"
                >
                  <p className="text-xl font-bold dark:text-indigo-300 text-indigo-400 mb-3">No events found</p>
                  <button
                    onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}
                    className="text-violet-500 font-bold hover:text-violet-400"
                  >
                    Clear filters
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function EventCard({ event }) {
  const isPast = new Date(event.date) < new Date().setHours(0, 0, 0, 0);
  const spotsPercent = Math.round(((event.capacity - event.spotsLeft) / event.capacity) * 100);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`group rounded-3xl overflow-hidden flex flex-col transition-all duration-300 border
        dark:bg-white/5 dark:border-white/10 dark:hover:border-violet-500/50 dark:hover:bg-white/8
        bg-white border-indigo-100 hover:border-violet-300 hover:shadow-lg hover:shadow-violet-100
        ${isPast ? 'opacity-60' : ''}`}
    >
      <Link to={`/events/${event._id}`} className="flex flex-col h-full">
        {/* Image */}
        <div className="relative h-48 overflow-hidden dark:bg-indigo-900 bg-indigo-100">
          <img
            src={event.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800'}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <span className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
            {event.category}
          </span>
          {isPast && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-white/20 backdrop-blur-sm text-white px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-wider border border-white/30">
                Finished
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1">
          <h3 className="text-lg font-black dark:text-white text-indigo-950 mb-3 group-hover:text-violet-500 transition-colors line-clamp-2">
            {event.title}
          </h3>

          <div className="space-y-2 mb-4 text-sm dark:text-indigo-300 text-indigo-500">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-violet-500 shrink-0" />
              <span>{event.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-violet-500 shrink-0" />
              <span>{event.time || 'TBA'}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-violet-500 shrink-0" />
              <span className="truncate">{event.venue}</span>
            </div>
          </div>

          {/* Capacity bar */}
          <div className="mt-auto">
            <div className="flex justify-between text-xs font-bold mb-1.5">
              <span className="dark:text-indigo-400 text-indigo-400">Capacity</span>
              <span className={event.spotsLeft > 0 ? 'text-green-500' : 'text-red-500'}>
                {event.spotsLeft > 0 ? `${event.spotsLeft} left` : 'Full'}
              </span>
            </div>
            <div className="h-1.5 dark:bg-white/10 bg-indigo-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${spotsPercent > 80 ? 'bg-red-500' : spotsPercent > 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
                style={{ width: `${spotsPercent}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t dark:border-white/5 border-indigo-50">
            <span className="text-xs dark:text-indigo-400 text-indigo-400 font-bold">{event.capacity} total seats</span>
            <div className="w-8 h-8 rounded-xl dark:bg-violet-600/20 bg-violet-100 flex items-center justify-center group-hover:bg-violet-600 transition-all">
              <ArrowRight size={14} className="dark:text-violet-400 text-violet-500 group-hover:text-white" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default EventFeed;
