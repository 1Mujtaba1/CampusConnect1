import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { User, Mail, Lock, Zap, Loader2 } from 'lucide-react';

function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/auth/register', formData);
      toast.success('Account created! Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `w-full pl-11 pr-4 py-3 rounded-xl outline-none transition-all
    dark:bg-white/5 dark:border dark:border-white/10 dark:text-white dark:placeholder-indigo-500 dark:focus:ring-violet-500
    bg-indigo-50 border border-indigo-100 text-indigo-900 placeholder-indigo-300 focus:ring-violet-400 focus:ring-2`;

  return (
    <div className="min-h-screen dark:bg-indigo-950 bg-violet-50 flex items-center justify-center px-4 py-20 transition-colors duration-300">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">

        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-500/30">
            <Zap size={24} className="text-white" fill="white" />
          </div>
          <h2 className="text-3xl font-black dark:text-white text-indigo-950">Create account</h2>
          <p className="dark:text-indigo-400 text-indigo-500 mt-1">Join as a student and start exploring events</p>
        </div>

        <div className="rounded-3xl p-8 dark:bg-white/5 dark:border dark:border-white/10 bg-white border border-indigo-100 shadow-sm">
          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-sm font-bold dark:text-indigo-300 text-indigo-600 mb-2">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-3.5 dark:text-indigo-400 text-indigo-400" />
                <input type="text" required placeholder="Your full name" className={inputClass}
                  onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold dark:text-indigo-300 text-indigo-600 mb-2">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-3.5 dark:text-indigo-400 text-indigo-400" />
                <input type="email" required placeholder="you@university.edu" className={inputClass}
                  onChange={e => setFormData({ ...formData, email: e.target.value })} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold dark:text-indigo-300 text-indigo-600 mb-2">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-3.5 dark:text-indigo-400 text-indigo-400" />
                <input type="password" required placeholder="Min. 6 characters" className={inputClass}
                  onChange={e => setFormData({ ...formData, password: e.target.value })} />
              </div>
            </div>

            {/* Role info badge — read only */}
            <div className="flex items-center gap-3 p-3 rounded-xl border border-violet-200 dark:border-violet-500/30 bg-violet-50 dark:bg-violet-600/10">
              <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center shrink-0">
                <User size={14} className="text-white" />
              </div>
              <div>
                <p className="font-bold text-violet-700 dark:text-violet-300 text-sm">Student Account</p>
                <p className="text-violet-500 dark:text-violet-400 text-xs">Browse and register for campus events</p>
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white py-3 rounded-xl font-black transition-all shadow-lg shadow-violet-500/30 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? 'Creating account...' : 'Create Student Account'}
            </button>
          </form>

          <p className="mt-6 text-center dark:text-indigo-400 text-indigo-500 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-violet-500 font-bold hover:text-violet-400">Sign in</Link>
          </p>

          {/* Organizer note */}
          <div className="mt-4 pt-4 border-t dark:border-white/10 border-indigo-100 text-center">
            <p className="text-xs dark:text-indigo-500 text-indigo-400">
              Are you a department organizer?{' '}
              <Link to="/register-organizer" className="text-violet-500 font-bold hover:text-violet-400">
                Register with invite code
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Register;
