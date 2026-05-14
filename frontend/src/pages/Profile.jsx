import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Calendar, MapPin, Ticket, Mail, Shield, Loader2, QrCode, X } from 'lucide-react';

function Profile() {
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const name = localStorage.getItem('userName');
  const email = localStorage.getItem('userEmail');
  const role = localStorage.getItem('role');
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    axios.get('http://localhost:5000/api/users/me/events', { headers: { authorization: token } })
      .then(res => setMyEvents(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [token]);

  const roleStyle = {
    student:  'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-500/10 border-green-200 dark:border-green-500/30',
    organizer:'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30',
    admin:    'text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-500/10 border-violet-200 dark:border-violet-500/30',
  };

  return (
    <div className="min-h-screen dark:bg-indigo-950 bg-violet-50 py-24 px-4 sm:px-6 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-8 mb-10 flex flex-col sm:flex-row items-center gap-6
            dark:bg-white/5 dark:border dark:border-white/10
            bg-white border border-indigo-100 shadow-sm"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-4xl font-black shadow-xl shadow-violet-500/30 shrink-0">
            {name?.charAt(0).toUpperCase()}
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-black dark:text-white text-indigo-950 mb-2">{name}</h1>
            <div className="flex flex-wrap justify-center sm:justify-start gap-2">
              <span className="flex items-center gap-1.5 text-sm dark:text-indigo-300 text-indigo-500 dark:bg-white/5 bg-indigo-50 border dark:border-white/10 border-indigo-100 px-3 py-1 rounded-full">
                <Mail size={13} /> {email || 'No email saved'}
              </span>
              <span className={`flex items-center gap-1.5 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border ${roleStyle[role] || roleStyle.student}`}>
                <Shield size={12} /> {role}
              </span>
            </div>
          </div>
          <div className="sm:ml-auto text-center">
            <p className="text-3xl font-black text-violet-500">{myEvents.length}</p>
            <p className="text-xs dark:text-indigo-400 text-indigo-400 font-bold uppercase tracking-widest">Events Joined</p>
          </div>
        </motion.div>

        {/* Registered Events */}
        <h2 className="text-xl font-black dark:text-white text-indigo-950 mb-6 flex items-center gap-2">
          <Ticket size={20} className="text-violet-500" /> My Registered Events
        </h2>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 size={36} className="animate-spin text-violet-500" /></div>
        ) : myEvents.length === 0 ? (
          <div className="rounded-3xl p-16 text-center border-2 border-dashed dark:bg-white/5 dark:border-white/10 bg-white border-indigo-100">
            <Ticket size={40} className="dark:text-indigo-600 text-indigo-300 mx-auto mb-4" />
            <p className="dark:text-indigo-300 text-indigo-500 font-bold mb-1">No events yet</p>
            <p className="dark:text-indigo-500 text-indigo-400 text-sm">Register for events to see them here with your QR codes.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {myEvents.map(event => (
              <motion.div
                key={event._id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl p-5 flex gap-4 transition-all
                  dark:bg-white/5 dark:border dark:border-white/10 dark:hover:border-violet-500/40
                  bg-white border border-indigo-100 hover:border-violet-300 hover:shadow-sm"
              >
                <img src={event.image} className="w-16 h-16 rounded-xl object-cover border dark:border-white/10 border-indigo-100 shrink-0" alt="" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-black dark:text-white text-indigo-950 text-sm mb-1 truncate">{event.title}</h4>
                  <div className="space-y-0.5 text-xs dark:text-indigo-400 text-indigo-500">
                    <p className="flex items-center gap-1.5"><Calendar size={11} className="text-violet-500" /> {event.date}</p>
                    <p className="flex items-center gap-1.5"><MapPin size={11} className="text-violet-500" /> {event.venue}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedEvent(event)}
                  className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all
                    dark:bg-violet-600/20 dark:border dark:border-violet-500/30 dark:hover:bg-violet-600
                    bg-violet-100 border border-violet-200 hover:bg-violet-600 hover:text-white group"
                  title="Show QR Code"
                >
                  <QrCode size={16} className="text-violet-500 group-hover:text-white" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* QR Modal */}
      {selectedEvent && (
        <div
          className="fixed inset-0 dark:bg-indigo-950/80 bg-indigo-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedEvent(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl relative
              dark:bg-indigo-900 dark:border dark:border-white/10
              bg-white border border-indigo-100"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute top-4 right-4 dark:text-indigo-400 dark:hover:text-white text-indigo-400 hover:text-indigo-700"
            >
              <X size={20} />
            </button>
            <h3 className="font-black dark:text-white text-indigo-950 text-lg mb-1">{selectedEvent.title}</h3>
            <p className="dark:text-indigo-400 text-indigo-500 text-sm mb-6">Show this at the event entrance</p>
            <div className="bg-white p-5 rounded-2xl inline-block shadow-xl mb-4">
              <QRCodeSVG
                value={JSON.stringify({ eventId: selectedEvent._id, eventTitle: selectedEvent.title, userName, userEmail: email, registeredAt: new Date().toISOString() })}
                size={180} level="H"
              />
            </div>
            <p className="text-xs dark:text-indigo-400 text-indigo-500 font-bold">{name} · {selectedEvent.date}</p>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default Profile;
