import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';
import { Calendar, MapPin, Users, ArrowLeft, CheckCircle, Clock, Loader2 } from 'lucide-react';

function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token');
  const userEmail = localStorage.getItem('userEmail');
  const userName = localStorage.getItem('userName');

  useEffect(() => {
    axios.get(`http://localhost:5000/api/events/${id}`)
      .then(res => setEvent(res.data))
      .catch(() => navigate('/events'));

    if (token) {
      axios.get('http://localhost:5000/api/users/me/events', { headers: { authorization: token } })
        .then(res => setIsRegistered(res.data.some(e => e._id === id)))
        .catch(() => {});
    }
  }, [id, navigate, token]);

  const handleRegister = async () => {
    if (!token) { toast.error('Please login first!'); return navigate('/login'); }
    setLoading(true);
    try {
      await axios.post(`http://localhost:5000/api/events/${id}/register`, {}, { headers: { authorization: token } });
      setIsRegistered(true);
      const res = await axios.get(`http://localhost:5000/api/events/${id}`);
      setEvent(res.data);
      toast.success('Registered! Check your QR code below.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const qrData = JSON.stringify({ eventId: id, eventTitle: event?.title, userName, userEmail, registeredAt: new Date().toISOString() });

  if (!event) return (
    <div className="min-h-screen dark:bg-indigo-950 bg-violet-50 flex items-center justify-center">
      <Loader2 size={40} className="animate-spin text-violet-500" />
    </div>
  );

  const spotsPercent = Math.round(((event.capacity - event.spotsLeft) / event.capacity) * 100);

  return (
    <div className="min-h-screen dark:bg-indigo-950 bg-violet-50 py-24 px-4 sm:px-6 transition-colors duration-300">
      <div className="max-w-5xl mx-auto">

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 font-bold mb-8 transition-colors dark:text-indigo-400 dark:hover:text-white text-indigo-400 hover:text-indigo-700"
        >
          <ArrowLeft size={18} /> Back to Events
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* Image */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <img
              src={event.image}
              className="w-full h-72 sm:h-96 object-cover rounded-3xl shadow-2xl dark:shadow-indigo-950 shadow-indigo-200"
              alt={event.title}
            />
            <div className="flex gap-2 mt-4">
              <span className="bg-violet-100 dark:bg-violet-600/20 text-violet-600 dark:text-violet-300 border border-violet-200 dark:border-violet-500/30 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
                {event.category}
              </span>
              {event.spotsLeft === 0 && (
                <span className="bg-red-100 dark:bg-red-500/20 text-red-500 dark:text-red-400 border border-red-200 dark:border-red-500/30 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
                  Full
                </span>
              )}
            </div>
          </motion.div>

          {/* Details */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <h1 className="text-3xl sm:text-4xl font-black dark:text-white text-indigo-950 mb-6 leading-tight">{event.title}</h1>

            <div className="space-y-4 mb-6">
              {[
                { icon: Calendar, label: 'Date', val: event.date },
                { icon: Clock, label: 'Time', val: event.time },
                { icon: MapPin, label: 'Venue', val: event.venue },
                { icon: Users, label: 'Availability', val: `${event.spotsLeft} / ${event.capacity} spots left` },
              ].map(({ icon: Icon, label, val }) => (
                <div key={label} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 dark:bg-violet-600/20 dark:border dark:border-violet-500/20 bg-violet-100 border border-violet-200">
                    <Icon size={18} className="text-violet-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black dark:text-indigo-500 text-indigo-400 uppercase tracking-widest">{label}</p>
                    <p className="font-bold dark:text-indigo-100 text-indigo-800">{val}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Capacity bar */}
            <div className="mb-6">
              <div className="h-2 dark:bg-white/10 bg-indigo-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${spotsPercent > 80 ? 'bg-red-500' : spotsPercent > 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
                  style={{ width: `${spotsPercent}%` }}
                />
              </div>
              <p className="text-xs dark:text-indigo-400 text-indigo-400 mt-1">{spotsPercent}% filled</p>
            </div>

            <p className="dark:text-indigo-300 text-indigo-600 leading-relaxed mb-8">{event.description}</p>

            {isRegistered ? (
              <div className="rounded-2xl p-6 text-center dark:bg-green-500/10 dark:border dark:border-green-500/30 bg-green-50 border border-green-200">
                <CheckCircle size={28} className="text-green-500 mx-auto mb-3" />
                <p className="font-black text-green-600 dark:text-green-400 text-lg mb-1">You're registered!</p>
                <p className="dark:text-green-400/70 text-green-500 text-sm mb-5">Show this QR code at the event entrance.</p>
                <div className="bg-white p-4 rounded-2xl inline-block shadow-xl">
                  <QRCodeSVG value={qrData} size={160} level="H" />
                </div>
                <p className="text-xs dark:text-green-400/60 text-green-500 mt-3 font-bold">{userName} · {event.title}</p>
              </div>
            ) : (
              <button
                onClick={handleRegister}
                disabled={event.spotsLeft <= 0 || loading}
                className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-violet-500/30 transition-all flex items-center justify-center gap-2"
              >
                {loading && <Loader2 size={20} className="animate-spin" />}
                {event.spotsLeft <= 0 ? 'Event Full' : loading ? 'Registering...' : 'Register Now — Get QR Code'}
              </button>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default EventDetails;
