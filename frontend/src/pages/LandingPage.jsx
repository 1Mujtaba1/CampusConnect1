import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, ShieldCheck, QrCode, Users, Calendar } from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } };

const LandingPage = () => {
  return (
    <div className="relative min-h-screen w-full dark:bg-indigo-950 bg-violet-50 overflow-x-hidden transition-colors duration-300">

      {/* Background glows */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[70%] h-[70%] dark:bg-violet-600/20 bg-violet-300/30 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] dark:bg-indigo-600/20 bg-indigo-200/30 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10">

        {/* HERO */}
        <section className="pt-32 pb-20 lg:pt-48 lg:pb-32 px-6">
          <div className="max-w-6xl mx-auto text-center">
            <motion.div
              variants={fadeUp} initial="hidden" animate="show" transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 mb-8 text-xs font-bold tracking-widest uppercase rounded-full
                dark:text-violet-300 dark:bg-violet-500/10 dark:border dark:border-violet-500/30
                text-violet-700 bg-violet-100 border border-violet-200"
            >
              <Zap size={12} fill="currentColor" /> Campus Event Management System
            </motion.div>

            <motion.h1
              variants={fadeUp} initial="hidden" animate="show" transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-8xl font-black leading-[1.05] mb-6 tracking-tighter dark:text-white text-indigo-950"
            >
              Your Campus.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500">
                All Events.
              </span>
              <br />
              One Place.
            </motion.h1>

            <motion.p
              variants={fadeUp} initial="hidden" animate="show" transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg dark:text-indigo-300 text-indigo-500 mb-10 max-w-xl mx-auto"
            >
              Discover, register, and attend campus events with QR-based check-in. Built for students, organizers, and admins.
            </motion.p>

            <motion.div
              variants={fadeUp} initial="hidden" animate="show" transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                to="/events"
                className="w-full sm:w-auto px-8 py-4 bg-violet-600 hover:bg-violet-500 text-white rounded-2xl font-black text-base flex items-center justify-center gap-2 transition-all shadow-2xl shadow-violet-500/30"
              >
                Browse Events <ArrowRight size={18} />
              </Link>
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-base transition-all
                  dark:bg-white/5 dark:hover:bg-white/10 dark:border dark:border-white/10 dark:text-white
                  bg-white hover:bg-indigo-50 border border-indigo-200 text-indigo-700 shadow-sm"
              >
                Join as Organizer
              </Link>
            </motion.div>
          </div>
        </section>

        {/* STATS */}
        <section className="py-12 px-6">
          <div className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { val: '50+', label: 'Active Events' },
              { val: '1.5k', label: 'Students' },
              { val: '12+', label: 'Departments' },
              { val: '100%', label: 'Free to Use' },
            ].map((s, i) => (
              <motion.div
                key={i}
                variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="rounded-2xl p-6 text-center
                  dark:bg-white/5 dark:border dark:border-white/10
                  bg-white border border-indigo-100 shadow-sm"
              >
                <p className="text-3xl font-black text-violet-500 mb-1">{s.val}</p>
                <p className="text-xs font-bold dark:text-indigo-400 text-indigo-400 uppercase tracking-widest">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* FEATURES */}
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <motion.h2
              variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
              className="text-3xl font-black mb-10 text-center dark:text-white text-indigo-950"
            >
              Everything you need,{' '}
              <span className="text-violet-500">nothing you don't.</span>
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-6 gap-5">
              {/* Big card */}
              <motion.div
                variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
                className="md:col-span-4 bg-gradient-to-br from-violet-600 to-indigo-700 rounded-3xl p-10 relative overflow-hidden text-white"
              >
                <QrCode size={48} className="text-white/80 mb-6" />
                <h3 className="text-3xl font-black mb-3">QR Code Check-In</h3>
                <p className="text-indigo-200 text-base max-w-sm">
                  Every registration generates a unique QR code. Organizers scan it at the door — no paper lists, no confusion.
                </p>
                <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-white/5 rounded-full" />
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/5 rounded-full" />
              </motion.div>

              {[
                { icon: ShieldCheck, title: 'Admin Approval', desc: 'Every event is reviewed before going live.', color: 'text-violet-500' },
                { icon: Zap, title: 'Instant Registration', desc: 'One click to secure your spot.', color: 'text-yellow-500' },
                { icon: Users, title: 'Role-Based Access', desc: 'Student, Organizer, and Admin panels.', color: 'text-green-500' },
                { icon: Calendar, title: 'Smart Filtering', desc: 'Filter by category, date, and availability.', color: 'text-blue-500' },
              ].map((f, i) => {
                const Icon = f.icon;
                return (
                  <motion.div
                    key={i}
                    variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} transition={{ delay: 0.1 + i * 0.05 }}
                    className={`${i < 1 ? 'md:col-span-2' : 'md:col-span-3'} rounded-3xl p-8 flex flex-col justify-between
                      dark:bg-white/5 dark:border dark:border-white/10
                      bg-white border border-indigo-100 shadow-sm`}
                  >
                    <Icon size={36} className={f.color} />
                    <div>
                      <h3 className="text-xl font-black mb-1 dark:text-white text-indigo-950">{f.title}</h3>
                      <p className="dark:text-indigo-400 text-indigo-500 text-sm">{f.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <motion.h2
              variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
              className="text-3xl font-black mb-12 text-center dark:text-white text-indigo-950"
            >
              How it works
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { step: '01', title: 'Organizer Creates', desc: 'Submit event details — title, date, venue, capacity, and poster.', color: 'text-violet-500' },
                { step: '02', title: 'Admin Reviews', desc: 'Admin approves or rejects with a reason. Organizer is notified.', color: 'text-purple-500' },
                { step: '03', title: 'Students Join', desc: 'Browse, register, and get a QR code for entry. Simple.', color: 'text-indigo-500' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="rounded-3xl p-8 relative
                    dark:bg-white/5 dark:border dark:border-white/10
                    bg-white border border-indigo-100 shadow-sm"
                >
                  <span className={`text-5xl font-black ${item.color} opacity-30 absolute top-6 right-8`}>{item.step}</span>
                  <h4 className="text-lg font-black mb-2 dark:text-white text-indigo-950">{item.title}</h4>
                  <p className="dark:text-indigo-400 text-indigo-500 text-sm">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6">
          <div className="max-w-3xl mx-auto text-center rounded-3xl p-12
            dark:bg-gradient-to-br dark:from-violet-600/30 dark:to-indigo-700/30 dark:border dark:border-violet-500/20
            bg-gradient-to-br from-violet-100 to-indigo-100 border border-violet-200"
          >
            <h2 className="text-4xl font-black mb-4 dark:text-white text-indigo-950">Ready to get started?</h2>
            <p className="dark:text-indigo-300 text-indigo-500 mb-8">Join hundreds of students already using CampusConnect.</p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-violet-600 hover:bg-violet-500 text-white rounded-2xl font-black transition-all shadow-xl shadow-violet-500/30"
            >
              Create Free Account <ArrowRight size={18} />
            </Link>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="py-8 text-center border-t dark:border-white/10 border-indigo-100">
          <p className="dark:text-indigo-500 text-indigo-400 text-xs font-bold uppercase tracking-widest">
            © 2026 CampusConnect · CEMS · Final Year Project
          </p>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
