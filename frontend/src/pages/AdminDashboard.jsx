import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Loader2, Mail, ShieldCheck, CalendarCheck, MessageSquare, CheckCircle, XCircle, Users, BarChart3, Plus, Trash2, UserCog } from 'lucide-react';

function AdminDashboard() {
  const [view, setView] = useState('events');
  const [data, setData] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [users, setUsers] = useState([]);
  const [newOrg, setNewOrg] = useState({ name: '', email: '', password: '' });
  const [creatingOrg, setCreatingOrg] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => { fetchStats(); }, []);
  useEffect(() => { fetchData(); }, [view]);
  useEffect(() => { if (view === 'users') fetchUsers(); }, [view]);

  const fetchStats = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/stats', { headers: { authorization: token } });
      setStats(res.data);
    } catch {}
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/users', { headers: { authorization: token } });
      setUsers(res.data);
    } catch {}
  };

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"?`)) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${id}`, { headers: { authorization: token } });
      setUsers(users.filter(u => u._id !== id));
      toast.success('User deleted');
      fetchStats();
    } catch { toast.error('Failed to delete user'); }
  };

  const handleCreateOrganizer = async (e) => {
    e.preventDefault();
    if (newOrg.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setCreatingOrg(true);
    try {
      await axios.post('http://localhost:5000/api/admin/create-organizer', newOrg, { headers: { authorization: token } });
      toast.success(`Organizer account created for ${newOrg.name}`);
      setNewOrg({ name: '', email: '', password: '' });
      fetchUsers();
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create organizer');
    } finally {
      setCreatingOrg(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const endpoint = view === 'events' ? '/api/admin/events/pending' : '/api/admin/messages';
      const res = await axios.get(`http://localhost:5000${endpoint}`, { headers: { authorization: token } });
      setData(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleApprove = async (id) => {
    try {
      await axios.patch(`http://localhost:5000/api/admin/events/${id}/approve`, {}, { headers: { authorization: token } });
      setData(data.filter(e => e._id !== id));
      toast.success('Event approved!');
      fetchStats();
    } catch { toast.error('Failed to approve'); }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) { toast.error('Please provide a reason'); return; }
    try {
      await axios.patch(`http://localhost:5000/api/admin/events/${rejectModal.id}/reject`,
        { reason: rejectReason }, { headers: { authorization: token } }
      );
      setData(data.filter(e => e._id !== rejectModal.id));
      toast.success('Event rejected');
      setRejectModal(null);
      setRejectReason('');
      fetchStats();
    } catch { toast.error('Failed to reject'); }
  };

  const TABS = [
    { key: 'events',   label: 'Pending Events', icon: CalendarCheck },
    { key: 'users',    label: 'Manage Users',   icon: UserCog },
    { key: 'messages', label: 'Messages',       icon: MessageSquare },
  ];

  const statCards = [
    { label: 'Live Events', val: stats?.totalEvents, icon: CalendarCheck, color: 'text-green-600 dark:text-green-400' },
    { label: 'Total Users', val: stats?.totalUsers, icon: Users, color: 'text-blue-600 dark:text-blue-400' },
    { label: 'Pending', val: stats?.pendingEvents, icon: BarChart3, color: 'text-yellow-600 dark:text-yellow-400' },
    { label: 'Messages', val: stats?.totalMessages, icon: Mail, color: 'text-violet-600 dark:text-violet-400' },
  ];

  return (
    <div className="min-h-screen dark:bg-indigo-950 bg-violet-50 py-20 px-4 sm:px-6 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/30">
            <ShieldCheck size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black dark:text-white text-indigo-950">Admin Panel</h1>
            <p className="dark:text-indigo-400 text-indigo-500 text-sm">Manage events and platform activity</p>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {statCards.map(s => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="rounded-2xl p-5 dark:bg-white/5 dark:border dark:border-white/10 bg-white border border-indigo-100 shadow-sm">
                  <Icon size={20} className={`${s.color} mb-2`} />
                  <p className={`text-2xl font-black ${s.color}`}>{s.val}</p>
                  <p className="text-xs dark:text-indigo-400 text-indigo-400 font-bold uppercase tracking-widest mt-1">{s.label}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setView(tab.key)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  view === tab.key
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30'
                    : 'dark:bg-white/5 dark:text-indigo-300 dark:border dark:border-white/10 dark:hover:text-white bg-white text-indigo-500 border border-indigo-100 hover:text-violet-600 shadow-sm'
                }`}
              >
                <Icon size={16} /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 size={36} className="animate-spin text-violet-500" /></div>
        ) : (
          <div className="rounded-3xl overflow-hidden dark:bg-white/5 dark:border dark:border-white/10 bg-white border border-indigo-100 shadow-sm">
            {view === 'users' ? (
              <div className="p-6 space-y-8">
                {/* Create Organizer Form */}
                <div>
                  <h3 className="font-black dark:text-white text-indigo-950 mb-4 flex items-center gap-2">
                    <Plus size={16} className="text-violet-500" /> Create Organizer Account
                  </h3>
                  <form onSubmit={handleCreateOrganizer} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { key: 'name',     placeholder: 'Full Name',    type: 'text' },
                      { key: 'email',    placeholder: 'Email',        type: 'email' },
                      { key: 'password', placeholder: 'Password',     type: 'password' },
                    ].map(f => (
                      <input
                        key={f.key} type={f.type} required placeholder={f.placeholder}
                        value={newOrg[f.key]}
                        onChange={e => setNewOrg({ ...newOrg, [f.key]: e.target.value })}
                        className="p-3 rounded-xl outline-none transition-all text-sm
                          dark:bg-white/5 dark:border dark:border-white/10 dark:text-white dark:placeholder-indigo-500 dark:focus:ring-violet-500
                          bg-indigo-50 border border-indigo-100 text-indigo-900 placeholder-indigo-400 focus:ring-violet-400 focus:ring-2"
                      />
                    ))}
                    <button
                      type="submit" disabled={creatingOrg}
                      className="sm:col-span-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white py-3 rounded-xl font-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-500/30"
                    >
                      {creatingOrg ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                      {creatingOrg ? 'Creating...' : 'Create Organizer Account'}
                    </button>
                  </form>
                </div>

                {/* Users List */}
                <div>
                  <h3 className="font-black dark:text-white text-indigo-950 mb-4 flex items-center gap-2">
                    <Users size={16} className="text-violet-500" /> All Users ({users.length})
                  </h3>
                  <div className="rounded-2xl overflow-hidden border dark:border-white/10 border-indigo-100">
                    <div className="divide-y dark:divide-white/5 divide-indigo-50 max-h-96 overflow-y-auto">
                      {users.map(u => {
                        const roleStyle = {
                          student:   'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-500/10 border-green-200 dark:border-green-500/30',
                          organizer: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30',
                          admin:     'text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-500/10 border-violet-200 dark:border-violet-500/30',
                        };
                        return (
                          <div key={u._id} className="px-5 py-3 flex items-center gap-3 dark:hover:bg-white/5 hover:bg-indigo-50 transition-all">
                            <div className="w-9 h-9 bg-violet-600 rounded-full flex items-center justify-center text-white text-sm font-black shrink-0 uppercase">
                              {u.name?.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold dark:text-white text-indigo-950 text-sm truncate">{u.name}</p>
                              <p className="text-xs dark:text-indigo-400 text-indigo-500 truncate">{u.email}</p>
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${roleStyle[u.role]}`}>
                              {u.role}
                            </span>
                            {u.role !== 'admin' && (
                              <button
                                onClick={() => handleDeleteUser(u._id, u.name)}
                                className="p-1.5 rounded-lg text-red-500 dark:bg-red-500/10 bg-red-50 hover:bg-red-100 dark:hover:bg-red-500/30 transition-all shrink-0"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ) : view === 'events' ? (              data.length === 0 ? (
                <div className="p-16 text-center">
                  <CheckCircle size={40} className="text-green-500 mx-auto mb-3" />
                  <p className="dark:text-indigo-300 text-indigo-500 font-bold">All caught up! No pending events.</p>
                </div>
              ) : (
                <div className="divide-y dark:divide-white/5 divide-indigo-50">
                  {data.map(event => (
                    <motion.div
                      key={event._id}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="p-5 flex flex-col sm:flex-row sm:items-center gap-4 dark:hover:bg-white/5 hover:bg-indigo-50 transition-all"
                    >
                      <img src={event.image} className="w-14 h-14 rounded-xl object-cover border dark:border-white/10 border-indigo-100 shrink-0" alt="" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-black dark:text-white text-indigo-950 truncate">{event.title}</h4>
                        <p className="text-xs dark:text-indigo-400 text-indigo-500 mt-0.5">{event.category} · {event.date} · {event.venue}</p>
                        <p className="text-xs dark:text-indigo-500 text-indigo-400 mt-0.5">By: {event.createdByName || 'Unknown'} · Capacity: {event.capacity}</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => handleApprove(event._id)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-sm transition-all text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-500/20 hover:bg-green-200 dark:hover:bg-green-500/40 border border-green-200 dark:border-green-500/30"
                        >
                          <CheckCircle size={14} /> Approve
                        </button>
                        <button
                          onClick={() => setRejectModal({ id: event._id, title: event.title })}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-sm transition-all text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-500/20 hover:bg-red-200 dark:hover:bg-red-500/40 border border-red-200 dark:border-red-500/30"
                        >
                          <XCircle size={14} /> Reject
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )
            ) : (
              data.length === 0 ? (
                <div className="p-16 text-center">
                  <Mail size={40} className="dark:text-indigo-600 text-indigo-300 mx-auto mb-3" />
                  <p className="dark:text-indigo-300 text-indigo-500 font-bold">No messages yet.</p>
                </div>
              ) : (
                <div className="divide-y dark:divide-white/5 divide-indigo-50">
                  {data.map(m => (
                    <div key={m._id} className="p-6 dark:hover:bg-white/5 hover:bg-indigo-50 transition-all">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-black dark:text-white text-indigo-950">{m.subject}</h4>
                        <span className="text-[10px] text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-500/20 border border-violet-200 dark:border-violet-500/30 px-2 py-1 rounded-full font-black uppercase">New</span>
                      </div>
                      <p className="text-sm dark:text-indigo-300 text-indigo-600 mb-3">{m.message}</p>
                      <div className="flex items-center gap-4 text-xs dark:text-indigo-500 text-indigo-400 font-bold">
                        <span className="flex items-center gap-1"><Mail size={12} /> {m.email}</span>
                        <span>From: {m.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 dark:bg-indigo-950/80 bg-indigo-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl p-8 max-w-md w-full shadow-2xl dark:bg-indigo-900 dark:border dark:border-white/10 bg-white border border-indigo-100"
          >
            <h3 className="font-black dark:text-white text-indigo-950 text-lg mb-1">Reject Event</h3>
            <p className="dark:text-indigo-400 text-indigo-500 text-sm mb-5">"{rejectModal.title}"</p>
            <label className="block text-sm font-bold dark:text-indigo-300 text-indigo-600 mb-2">Reason for rejection</label>
            <textarea
              rows={3}
              placeholder="e.g. Incomplete details, scheduling conflict..."
              className="w-full p-3 rounded-xl outline-none resize-none mb-5 transition-all
                dark:bg-white/5 dark:border dark:border-white/10 dark:text-white dark:placeholder-indigo-500 dark:focus:ring-red-500
                bg-indigo-50 border border-indigo-100 text-indigo-900 placeholder-indigo-300 focus:ring-red-400 focus:ring-2"
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setRejectModal(null); setRejectReason(''); }}
                className="flex-1 py-2.5 rounded-xl font-bold transition-all dark:bg-white/5 dark:border dark:border-white/10 dark:text-indigo-300 dark:hover:bg-white/10 bg-indigo-50 border border-indigo-100 text-indigo-600 hover:bg-indigo-100"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition-all"
              >
                Reject Event
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
