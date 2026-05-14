import React, { useState, useEffect } from 'react';
import { Plus, Loader2, Trash2, ExternalLink, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import axios from 'axios';

const STATUS_CONFIG = {
  pending:  { label: 'Pending Review', icon: Clock,       color: 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-500/10 border-yellow-200 dark:border-yellow-500/30' },
  approved: { label: 'Approved',       icon: CheckCircle, color: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-500/10 border-green-200 dark:border-green-500/30' },
  rejected: { label: 'Rejected',       icon: XCircle,     color: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-500/10 border-red-200 dark:border-red-500/30' },
};

function OrganizerDashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');
  const userName = localStorage.getItem('userName');

  useEffect(() => {
    axios.get('http://localhost:5000/api/organizer/my-events', { headers: { authorization: token } })
      .then(res => setEvents(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [token]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/events/${id}`, { headers: { authorization: token } });
      setEvents(events.filter(e => e._id !== id));
      toast.success('Event deleted');
    } catch {
      toast.error('Delete failed.');
    }
  };

  const stats = {
    total: events.length,
    approved: events.filter(e => e.status === 'approved').length,
    pending: events.filter(e => e.status === 'pending').length,
    rejected: events.filter(e => e.status === 'rejected').length,
  };

  const statCards = [
    { label: 'Total', val: stats.total, color: 'dark:text-white text-indigo-950' },
    { label: 'Approved', val: stats.approved, color: 'text-green-600 dark:text-green-400' },
    { label: 'Pending', val: stats.pending, color: 'text-yellow-600 dark:text-yellow-400' },
    { label: 'Rejected', val: stats.rejected, color: 'text-red-600 dark:text-red-400' },
  ];

  return (
    <div className="min-h-screen dark:bg-indigo-950 bg-violet-50 py-20 px-4 sm:px-6 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black dark:text-white text-indigo-950">Organizer Dashboard</h1>
            <p className="dark:text-indigo-400 text-indigo-500 mt-1">Welcome back, {userName}</p>
          </div>
          <Link
            to="/create-event"
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-5 py-3 rounded-2xl font-bold shadow-lg shadow-violet-500/30 transition-all"
          >
            <Plus size={18} /> Create Event
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {statCards.map(s => (
            <div key={s.label} className="rounded-2xl p-5 text-center dark:bg-white/5 dark:border dark:border-white/10 bg-white border border-indigo-100 shadow-sm">
              <p className={`text-3xl font-black ${s.color}`}>{s.val}</p>
              <p className="text-xs dark:text-indigo-400 text-indigo-400 font-bold uppercase tracking-widest mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Events List */}
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 size={36} className="animate-spin text-violet-500" /></div>
        ) : events.length === 0 ? (
          <div className="rounded-3xl p-16 text-center border-2 border-dashed dark:bg-white/5 dark:border-white/10 bg-white border-indigo-100">
            <p className="dark:text-indigo-300 text-indigo-500 font-bold mb-2">No events yet</p>
            <p className="dark:text-indigo-500 text-indigo-400 text-sm mb-6">Create your first event to get started.</p>
            <Link to="/create-event" className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all">
              <Plus size={16} /> Create Event
            </Link>
          </div>
        ) : (
          <div className="rounded-3xl overflow-hidden dark:bg-white/5 dark:border dark:border-white/10 bg-white border border-indigo-100 shadow-sm">
            <div className="p-5 border-b dark:border-white/10 border-indigo-100">
              <h2 className="font-black dark:text-white text-indigo-950">My Events</h2>
            </div>
            <div className="divide-y dark:divide-white/5 divide-indigo-50">
              {events.map(event => {
                const cfg = STATUS_CONFIG[event.status] || STATUS_CONFIG.pending;
                const StatusIcon = cfg.icon;
                return (
                  <motion.div
                    key={event._id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="p-5 flex flex-col sm:flex-row sm:items-center gap-4 dark:hover:bg-white/5 hover:bg-indigo-50 transition-all"
                  >
                    <img src={event.image} className="w-14 h-14 rounded-xl object-cover border dark:border-white/10 border-indigo-100 shrink-0" alt="" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black dark:text-white text-indigo-950 truncate">{event.title}</h4>
                      <p className="text-xs dark:text-indigo-400 text-indigo-500 mt-0.5">{event.date} · {event.venue}</p>
                      {event.status === 'rejected' && event.rejectionReason && (
                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                          <AlertCircle size={11} /> Reason: {event.rejectionReason}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`flex items-center gap-1.5 text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${cfg.color}`}>
                        <StatusIcon size={11} /> {cfg.label}
                      </span>
                      {event.status === 'approved' && (
                        <Link to={`/events/${event._id}`} className="p-2 rounded-xl transition-all dark:text-indigo-400 dark:hover:text-white dark:bg-white/5 dark:hover:bg-white/10 text-indigo-400 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100">
                          <ExternalLink size={16} />
                        </Link>
                      )}
                      <button
                        onClick={() => handleDelete(event._id)}
                        className="p-2 rounded-xl transition-all text-red-500 dark:bg-red-500/10 dark:hover:bg-red-500/30 bg-red-50 hover:bg-red-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrganizerDashboard;
