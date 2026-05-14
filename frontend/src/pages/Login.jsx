import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Mail, Lock, Zap, Loader2 } from 'lucide-react';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', formData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);
      localStorage.setItem('userName', res.data.name);
      localStorage.setItem('userEmail', res.data.email);
      toast.success(`Welcome back, ${res.data.name}!`);
      navigate('/');
      window.location.reload();
    } catch {
      toast.error('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen dark:bg-indigo-950 bg-violet-50 flex items-center justify-center px-4 py-20 transition-colors duration-300">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">

        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-500/30">
            <Zap size={24} className="text-white" fill="white" />
          </div>
          <h2 className="text-3xl font-black dark:text-white text-indigo-950">Welcome back</h2>
          <p className="dark:text-indigo-400 text-indigo-500 mt-1">Sign in to your CampusConnect account</p>
        </div>

        <div className="rounded-3xl p-8 dark:bg-white/5 dark:border dark:border-white/10 bg-white border border-indigo-100 shadow-sm">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-bold dark:text-indigo-300 text-indigo-600 mb-2">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-3.5 dark:text-indigo-400 text-indigo-400" />
                <input
                  type="email" required placeholder="you@university.edu"
                  className="w-full pl-11 pr-4 py-3 rounded-xl outline-none transition-all
                    dark:bg-white/5 dark:border dark:border-white/10 dark:text-white dark:placeholder-indigo-500 dark:focus:ring-violet-500
                    bg-indigo-50 border border-indigo-100 text-indigo-900 placeholder-indigo-300 focus:ring-violet-400 focus:ring-2"
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold dark:text-indigo-300 text-indigo-600 mb-2">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-3.5 dark:text-indigo-400 text-indigo-400" />
                <input
                  type="password" required placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 rounded-xl outline-none transition-all
                    dark:bg-white/5 dark:border dark:border-white/10 dark:text-white dark:placeholder-indigo-500 dark:focus:ring-violet-500
                    bg-indigo-50 border border-indigo-100 text-indigo-900 placeholder-indigo-300 focus:ring-violet-400 focus:ring-2"
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white py-3 rounded-xl font-black transition-all shadow-lg shadow-violet-500/30 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p className="mt-6 text-center dark:text-indigo-400 text-indigo-500 text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-violet-500 font-bold hover:text-violet-400">Register here</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default Login;
