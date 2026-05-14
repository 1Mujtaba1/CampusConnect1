import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, LayoutDashboard, ShieldCheck, Menu, X, Zap, Sun, Moon, ScanLine } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const role = localStorage.getItem('role');
  const userName = localStorage.getItem('userName');

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
    window.location.reload();
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/events', label: 'Events' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 px-6
      ${isScrolled
        ? 'dark:bg-indigo-950/95 bg-white/95 backdrop-blur-md shadow-lg dark:shadow-indigo-950/30 shadow-indigo-100/50 py-2'
        : 'dark:bg-indigo-950 bg-white py-4 border-b dark:border-indigo-900 border-indigo-100'
      }`}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">

        {/* BRAND */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center shadow-md shadow-violet-500/30">
            <Zap size={16} className="text-white" fill="white" />
          </div>
          <span className="text-xl font-black tracking-tight dark:text-white text-indigo-950">
            Campus<span className="text-violet-500">Connect</span>
          </span>
        </Link>

        {/* DESKTOP NAV */}
        <div className="hidden md:flex items-center gap-6 font-semibold dark:text-indigo-200 text-indigo-600">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`hover:text-violet-500 transition-colors ${
                location.pathname === link.to
                  ? 'dark:text-white text-violet-600 font-bold'
                  : ''
              }`}
            >
              {link.label}
            </Link>
          ))}
          {(role === 'organizer' || role === 'admin') && (
            <Link to="/dashboard" className="flex items-center gap-1.5 hover:text-violet-500 transition-colors">
              <LayoutDashboard size={16} /> Dashboard
            </Link>
          )}
          {(role === 'organizer' || role === 'admin') && (
            <Link to="/scan" className="flex items-center gap-1.5 hover:text-violet-500 transition-colors">
              <ScanLine size={16} /> Scan QR
            </Link>
          )}
          {role === 'admin' && (
            <Link to="/admin" className="flex items-center gap-1.5 text-violet-500 hover:text-violet-400 transition-colors">
              <ShieldCheck size={16} /> Admin
            </Link>
          )}
        </div>

        {/* DESKTOP RIGHT */}
        <div className="hidden md:flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all
              dark:bg-indigo-900 dark:border-indigo-700 dark:text-indigo-300 dark:hover:text-yellow-300 dark:hover:bg-indigo-800
              bg-indigo-50 border border-indigo-100 text-indigo-500 hover:text-violet-600 hover:bg-indigo-100"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {!role ? (
            <>
              <Link to="/login" className="dark:text-indigo-200 text-indigo-600 font-semibold hover:text-violet-500 px-4 py-2 rounded-xl transition-all">
                Login
              </Link>
              <Link to="/register" className="bg-violet-600 text-white px-5 py-2 rounded-xl font-bold hover:bg-violet-500 shadow-lg shadow-violet-500/30 transition-all">
                Sign Up
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/profile"
                className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all
                  dark:bg-indigo-900 dark:border-indigo-700 dark:hover:bg-indigo-800
                  bg-indigo-50 border border-indigo-100 hover:bg-indigo-100"
              >
                <div className="w-7 h-7 bg-violet-600 text-white rounded-full flex items-center justify-center text-xs font-black uppercase">
                  {userName?.charAt(0)}
                </div>
                <span className="text-xs font-bold dark:text-indigo-100 text-indigo-700">{userName}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl transition-all dark:text-indigo-400 dark:hover:text-red-400 dark:hover:bg-red-900/30 text-indigo-400 hover:text-red-500 hover:bg-red-50"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          )}
        </div>

        {/* MOBILE RIGHT */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all
              dark:bg-indigo-900 dark:text-indigo-300 bg-indigo-50 text-indigo-500"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button
            className="dark:text-indigo-200 text-indigo-600 hover:text-violet-500 p-2"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className="md:hidden mt-3 pb-4 border-t dark:border-indigo-800 border-indigo-100 pt-4 flex flex-col gap-1 px-2">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className="dark:text-indigo-200 text-indigo-600 font-semibold hover:text-violet-500 px-3 py-2.5 rounded-xl dark:hover:bg-indigo-900 hover:bg-indigo-50 transition-all"
            >
              {link.label}
            </Link>
          ))}
          {(role === 'organizer' || role === 'admin') && (
            <Link to="/dashboard" className="dark:text-indigo-200 text-indigo-600 font-semibold hover:text-violet-500 px-3 py-2.5 rounded-xl dark:hover:bg-indigo-900 hover:bg-indigo-50 flex items-center gap-2 transition-all">
              <LayoutDashboard size={16} /> Dashboard
            </Link>
          )}
          {(role === 'organizer' || role === 'admin') && (
            <Link to="/scan" className="dark:text-indigo-200 text-indigo-600 font-semibold hover:text-violet-500 px-3 py-2.5 rounded-xl dark:hover:bg-indigo-900 hover:bg-indigo-50 flex items-center gap-2 transition-all">
              <ScanLine size={16} /> Scan QR
            </Link>
          )}
          {role === 'admin' && (
            <Link to="/admin" className="text-violet-500 font-semibold hover:text-violet-400 px-3 py-2.5 rounded-xl dark:hover:bg-indigo-900 hover:bg-violet-50 flex items-center gap-2 transition-all">
              <ShieldCheck size={16} /> Admin Panel
            </Link>
          )}
          <div className="border-t dark:border-indigo-800 border-indigo-100 pt-3 mt-2">
            {!role ? (
              <div className="flex gap-2">
                <Link to="/login" className="flex-1 text-center dark:text-indigo-200 text-indigo-600 font-semibold border dark:border-indigo-700 border-indigo-200 px-4 py-2.5 rounded-xl dark:hover:bg-indigo-900 hover:bg-indigo-50 transition-all">Login</Link>
                <Link to="/register" className="flex-1 text-center bg-violet-600 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-violet-500 transition-all">Sign Up</Link>
              </div>
            ) : (
              <div className="flex items-center justify-between px-1">
                <Link to="/profile" className="flex items-center gap-2 dark:text-indigo-100 text-indigo-700 font-bold">
                  <div className="w-8 h-8 bg-violet-600 text-white rounded-full flex items-center justify-center text-sm font-black uppercase">
                    {userName?.charAt(0)}
                  </div>
                  {userName}
                </Link>
                <button onClick={handleLogout} className="text-red-400 font-semibold flex items-center gap-1 text-sm hover:text-red-500">
                  <LogOut size={16} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
