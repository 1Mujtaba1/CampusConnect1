import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Camera, Loader2, RefreshCw, Users, QrCode } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// Result states
const IDLE       = 'idle';
const SCANNING   = 'scanning';
const SUCCESS    = 'success';
const DUPLICATE  = 'duplicate';
const FAILED     = 'failed';

function QRScanner() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [scanState, setScanState] = useState(IDLE);
  const [result, setResult] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [cameraStarted, setCameraStarted] = useState(false);
  const scannerRef = useRef(null);
  const isProcessing = useRef(false);
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  // Redirect students away
  useEffect(() => {
    if (role === 'student') { navigate('/'); }
  }, [role, navigate]);

  // Load organizer's approved events
  useEffect(() => {
    axios.get('http://localhost:5000/api/organizer/my-events', { headers: { authorization: token } })
      .then(res => {
        const approved = res.data.filter(e => e.status === 'approved');
        setEvents(approved);
        if (approved.length === 1) setSelectedEventId(approved[0]._id);
      })
      .catch(() => toast.error('Failed to load events'));
  }, [token]);

  // Fetch attendance when event selected
  useEffect(() => {
    if (!selectedEventId) return;
    fetchAttendance();
  }, [selectedEventId]);

  const fetchAttendance = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/events/${selectedEventId}/attendance`, {
        headers: { authorization: token }
      });
      setAttendance(res.data);
    } catch {}
  };

  const startScanner = async () => {
    if (!selectedEventId) { toast.error('Select an event first'); return; }
    setScanState(SCANNING);
    setCameraStarted(true);

    try {
      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          if (isProcessing.current) return;
          isProcessing.current = true;

          try {
            const data = JSON.parse(decodedText);
            await verifyQR(data);
          } catch {
            setResult({ message: 'Invalid QR code format' });
            setScanState(FAILED);
          }

          // Pause scanner after each scan
          await scanner.pause(true);
        },
        () => {} // ignore scan errors (camera noise)
      );
    } catch (err) {
      toast.error('Camera access denied. Please allow camera permission.');
      setScanState(IDLE);
      setCameraStarted(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try { await scannerRef.current.stop(); } catch {}
      scannerRef.current = null;
    }
    setScanState(IDLE);
    setCameraStarted(false);
    isProcessing.current = false;
  };

  const verifyQR = async (data) => {
    try {
      const res = await axios.post(
        `http://localhost:5000/api/events/${selectedEventId}/verify-qr`,
        { userEmail: data.userEmail, userName: data.userName },
        { headers: { authorization: token } }
      );
      setResult(res.data);
      setScanState(res.data.valid ? SUCCESS : DUPLICATE);
      fetchAttendance();
    } catch (err) {
      const msg = err.response?.data?.message || 'Verification failed';
      setResult({ message: msg });
      setScanState(FAILED);
    }
  };

  const resetScan = async () => {
    setResult(null);
    isProcessing.current = false;
    setScanState(SCANNING);
    if (scannerRef.current) {
      try { await scannerRef.current.resume(); } catch {}
    }
  };

  const scanAgain = async () => {
    await stopScanner();
    setResult(null);
    setScanState(IDLE);
  };

  return (
    <div className="min-h-screen dark:bg-indigo-950 bg-violet-50 py-24 px-4 sm:px-6 transition-colors duration-300">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black dark:text-white text-indigo-950 flex items-center gap-3">
            <QrCode className="text-violet-500" size={32} /> QR Check-In Scanner
          </h1>
          <p className="dark:text-indigo-400 text-indigo-500 mt-1">Scan attendee QR codes to verify and mark attendance.</p>
        </div>

        {/* Event Selector */}
        <div className="rounded-3xl p-6 mb-6 dark:bg-white/5 dark:border dark:border-white/10 bg-white border border-indigo-100 shadow-sm">
          <label className="block text-sm font-bold dark:text-indigo-300 text-indigo-600 mb-3">Select Event to Scan For</label>
          {events.length === 0 ? (
            <p className="dark:text-indigo-400 text-indigo-500 text-sm">No approved events found. Events must be approved before scanning.</p>
          ) : (
            <select
              value={selectedEventId}
              onChange={e => { setSelectedEventId(e.target.value); scanAgain(); }}
              className="w-full p-3 rounded-xl outline-none transition-all font-semibold
                dark:bg-white/5 dark:border dark:border-white/10 dark:text-white
                bg-indigo-50 border border-indigo-100 text-indigo-900 focus:ring-2 focus:ring-violet-500"
            >
              <option value="">-- Choose an event --</option>
              {events.map(e => (
                <option key={e._id} value={e._id}>{e.title} · {e.date}</option>
              ))}
            </select>
          )}

          {/* Attendance Stats */}
          {attendance && (
            <div className="mt-4 flex gap-4">
              <div className="flex-1 rounded-2xl p-4 text-center dark:bg-white/5 bg-indigo-50 border dark:border-white/10 border-indigo-100">
                <p className="text-2xl font-black text-violet-500">{attendance.totalAttended}</p>
                <p className="text-xs dark:text-indigo-400 text-indigo-500 font-bold uppercase tracking-widest mt-1">Checked In</p>
              </div>
              <div className="flex-1 rounded-2xl p-4 text-center dark:bg-white/5 bg-indigo-50 border dark:border-white/10 border-indigo-100">
                <p className="text-2xl font-black dark:text-white text-indigo-950">{attendance.totalRegistered}</p>
                <p className="text-xs dark:text-indigo-400 text-indigo-500 font-bold uppercase tracking-widest mt-1">Registered</p>
              </div>
              <div className="flex-1 rounded-2xl p-4 text-center dark:bg-white/5 bg-indigo-50 border dark:border-white/10 border-indigo-100">
                <p className="text-2xl font-black text-green-500">
                  {attendance.totalRegistered > 0
                    ? Math.round((attendance.totalAttended / attendance.totalRegistered) * 100)
                    : 0}%
                </p>
                <p className="text-xs dark:text-indigo-400 text-indigo-500 font-bold uppercase tracking-widest mt-1">Attendance</p>
              </div>
            </div>
          )}
        </div>

        {/* Scanner Box */}
        <div className="rounded-3xl overflow-hidden dark:bg-white/5 dark:border dark:border-white/10 bg-white border border-indigo-100 shadow-sm">

          {/* Camera viewport — always rendered so html5-qrcode can attach */}
          <div className={cameraStarted ? 'block' : 'hidden'}>
            <div id="qr-reader" className="w-full" />
          </div>

          {/* Idle state */}
          {!cameraStarted && scanState === IDLE && (
            <div className="p-12 text-center">
              <div className="w-20 h-20 dark:bg-violet-600/20 bg-violet-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Camera size={36} className="text-violet-500" />
              </div>
              <p className="dark:text-indigo-300 text-indigo-600 font-bold mb-2">Camera is off</p>
              <p className="dark:text-indigo-500 text-indigo-400 text-sm mb-6">Select an event above, then start scanning.</p>
              <button
                onClick={startScanner}
                disabled={!selectedEventId}
                className="bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white px-8 py-3 rounded-2xl font-black transition-all shadow-lg shadow-violet-500/30"
              >
                Start Camera
              </button>
            </div>
          )}

          {/* Scan result overlay */}
          <AnimatePresence>
            {(scanState === SUCCESS || scanState === DUPLICATE || scanState === FAILED) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="p-10 text-center"
              >
                {scanState === SUCCESS && (
                  <>
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle size={44} className="text-green-500" />
                    </div>
                    <p className="text-2xl font-black text-green-500 mb-1">Check-In Successful!</p>
                    <p className="dark:text-indigo-300 text-indigo-600 font-bold text-lg">{result?.userName}</p>
                    <p className="dark:text-indigo-400 text-indigo-500 text-sm mb-6">{result?.userEmail}</p>
                  </>
                )}
                {scanState === DUPLICATE && (
                  <>
                    <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertCircle size={44} className="text-yellow-500" />
                    </div>
                    <p className="text-2xl font-black text-yellow-500 mb-1">Already Checked In</p>
                    <p className="dark:text-indigo-300 text-indigo-600 font-bold text-lg">{result?.userName}</p>
                    <p className="dark:text-indigo-400 text-indigo-500 text-sm mb-6">{result?.userEmail}</p>
                  </>
                )}
                {scanState === FAILED && (
                  <>
                    <div className="w-20 h-20 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <XCircle size={44} className="text-red-500" />
                    </div>
                    <p className="text-2xl font-black text-red-500 mb-1">Invalid QR Code</p>
                    <p className="dark:text-indigo-400 text-indigo-500 text-sm mb-6">{result?.message}</p>
                  </>
                )}

                <div className="flex gap-3 justify-center">
                  <button
                    onClick={resetScan}
                    className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-6 py-3 rounded-2xl font-black transition-all shadow-lg shadow-violet-500/30"
                  >
                    <RefreshCw size={16} /> Scan Next
                  </button>
                  <button
                    onClick={scanAgain}
                    className="flex items-center gap-2 dark:bg-white/5 dark:border dark:border-white/10 dark:text-indigo-300 dark:hover:bg-white/10 bg-indigo-50 border border-indigo-100 text-indigo-600 hover:bg-indigo-100 px-6 py-3 rounded-2xl font-bold transition-all"
                  >
                    Stop Camera
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Attendance List */}
        {attendance && attendance.attendance.length > 0 && (
          <div className="mt-6 rounded-3xl overflow-hidden dark:bg-white/5 dark:border dark:border-white/10 bg-white border border-indigo-100 shadow-sm">
            <div className="p-5 border-b dark:border-white/10 border-indigo-100 flex items-center gap-2">
              <Users size={18} className="text-violet-500" />
              <h3 className="font-black dark:text-white text-indigo-950">Checked-In Attendees</h3>
              <span className="ml-auto text-xs font-black text-violet-500 bg-violet-100 dark:bg-violet-500/20 px-2 py-1 rounded-full">
                {attendance.attendance.length}
              </span>
            </div>
            <div className="divide-y dark:divide-white/5 divide-indigo-50 max-h-64 overflow-y-auto">
              {attendance.attendance.map((email, i) => (
                <div key={i} className="px-5 py-3 flex items-center gap-3">
                  <div className="w-7 h-7 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center shrink-0">
                    <CheckCircle size={14} className="text-green-500" />
                  </div>
                  <span className="text-sm dark:text-indigo-200 text-indigo-700 font-medium">{email}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default QRScanner;
