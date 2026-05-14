const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'campus_connect_secret_2026';
const PORT = process.env.PORT || 5000;

// ─── MODELS ──────────────────────────────────────────────────────────────────

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'organizer', 'admin'], default: 'student' },
  registeredEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }]
}, { timestamps: true });
const User = mongoose.model('User', userSchema);

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  venue: { type: String, required: true },
  capacity: { type: Number, required: true },
  spotsLeft: { type: Number, required: true },
  description: { type: String },
  image: { type: String, default: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800&auto=format&fit=crop' },
  isApproved: { type: Boolean, default: false },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  rejectionReason: { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdByName: { type: String },
  attendance: [{ type: String }]
}, { timestamps: true });
const Event = mongoose.model('Event', eventSchema);

const messageSchema = new mongoose.Schema({
  name: String,
  email: String,
  subject: String,
  message: String,
  createdAt: { type: Date, default: Date.now }
});
const ContactMessage = mongoose.model('ContactMessage', messageSchema);

// ─── AUTH MIDDLEWARE ──────────────────────────────────────────────────────────

const authenticate = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ message: 'No token provided' });
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Invalid Token' });
    req.user = decoded;
    next();
  });
};

// ─── AUTH ROUTES ─────────────────────────────────────────────────────────────

// Public — students only, role cannot be set from outside
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, role: 'student' });
    await user.save();
    res.status(201).json({ message: 'User created' });
  } catch {
    res.status(400).json({ error: 'Email already exists' });
  }
});

// Organizer registration — requires invite code
app.post('/api/auth/register-organizer', async (req, res) => {
  try {
    const { name, email, password, inviteCode } = req.body;
    if (!name || !email || !password || !inviteCode) return res.status(400).json({ error: 'All fields required' });
    if (inviteCode !== process.env.ORGANIZER_INVITE_CODE) {
      return res.status(403).json({ error: 'Invalid invite code' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, role: 'organizer' });
    await user.save();
    res.status(201).json({ message: 'Organizer account created' });
  } catch {
    res.status(400).json({ error: 'Email already exists' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
  res.json({ token, role: user.role, name: user.name, email: user.email });
});

// ─── EVENT ROUTES ─────────────────────────────────────────────────────────────

app.get('/api/events', async (req, res) => {
  const events = await Event.find({ isApproved: true }).sort({ date: 1 });
  res.json(events);
});

app.get('/api/events/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    res.json(event);
  } catch { res.status(404).json({ message: 'Event not found' }); }
});

app.post('/api/events', authenticate, async (req, res) => {
  if (req.user.role === 'student') return res.status(403).json({ message: 'Unauthorized' });
  const user = await User.findById(req.user.id);
  const newEvent = new Event({
    ...req.body,
    spotsLeft: req.body.capacity,
    createdBy: req.user.id,
    createdByName: user?.name || 'Unknown'
  });
  await newEvent.save();
  res.status(201).json(newEvent);
});

app.delete('/api/events/:id', authenticate, async (req, res) => {
  try {
    if (req.user.role === 'student') return res.status(403).json({ message: 'Unauthorized' });
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch { res.status(500).json({ message: 'Delete failed' }); }
});

app.post('/api/events/:id/register', authenticate, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    const user = await User.findById(req.user.id);
    if (user.registeredEvents.includes(event._id)) {
      return res.status(400).json({ message: 'Already registered' });
    }
    if (event.spotsLeft > 0) {
      event.spotsLeft -= 1;
      user.registeredEvents.push(event._id);
      await event.save();
      await user.save();
      res.json({ message: 'Registered' });
    } else {
      res.status(400).json({ message: 'Event Full' });
    }
  } catch { res.status(500).json({ error: 'Registration failed' }); }
});

// ─── QR VERIFY & ATTENDANCE ───────────────────────────────────────────────────

app.post('/api/events/:id/verify-qr', authenticate, async (req, res) => {
  if (req.user.role === 'student') return res.status(403).json({ message: 'Organizers only' });
  try {
    const { userEmail, userName } = req.body;
    if (!userEmail) return res.status(400).json({ valid: false, message: 'Invalid QR data' });
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ valid: false, message: 'Event not found' });
    if (!event.isApproved) return res.status(400).json({ valid: false, message: 'Event not approved' });
    const user = await User.findOne({ email: userEmail });
    if (!user) return res.status(404).json({ valid: false, message: 'User not found' });
    const isRegistered = user.registeredEvents.some(id => id.toString() === event._id.toString());
    if (!isRegistered) return res.status(400).json({ valid: false, message: 'Not registered for this event' });
    if (event.attendance.includes(userEmail)) {
      return res.json({ valid: false, alreadyCheckedIn: true, message: 'Already checked in', userName, userEmail });
    }
    event.attendance.push(userEmail);
    await event.save();
    res.json({ valid: true, message: 'Check-in successful!', userName, userEmail });
  } catch { res.status(500).json({ valid: false, message: 'Server error' }); }
});

app.get('/api/events/:id/attendance', authenticate, async (req, res) => {
  if (req.user.role === 'student') return res.status(403).json({ message: 'Organizers only' });
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json({
      eventTitle: event.title,
      totalRegistered: event.capacity - event.spotsLeft,
      totalAttended: event.attendance.length,
      attendance: event.attendance
    });
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// ─── ORGANIZER ROUTES ─────────────────────────────────────────────────────────

app.get('/api/organizer/my-events', authenticate, async (req, res) => {
  if (req.user.role === 'student') return res.status(403).json({ message: 'Unauthorized' });
  const events = await Event.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
  res.json(events);
});

// ─── USER ROUTES ──────────────────────────────────────────────────────────────

app.get('/api/users/me/events', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('registeredEvents');
    res.json(user.registeredEvents);
  } catch { res.status(500).json({ error: 'Could not fetch events' }); }
});

// ─── CONTACT ROUTES ───────────────────────────────────────────────────────────

app.post('/api/contact', async (req, res) => {
  try {
    const newMessage = new ContactMessage(req.body);
    await newMessage.save();
    res.status(201).json({ message: 'Sent' });
  } catch { res.status(500).json({ error: 'Failed' }); }
});

// ─── ADMIN ROUTES ─────────────────────────────────────────────────────────────

app.get('/api/admin/events/pending', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
  const events = await Event.find({ status: 'pending' }).sort({ createdAt: -1 });
  res.json(events);
});

app.patch('/api/admin/events/:id/approve', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
  const updated = await Event.findByIdAndUpdate(
    req.params.id,
    { isApproved: true, status: 'approved', rejectionReason: '' },
    { new: true }
  );
  res.json(updated);
});

app.patch('/api/admin/events/:id/reject', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
  const { reason } = req.body;
  const updated = await Event.findByIdAndUpdate(
    req.params.id,
    { isApproved: false, status: 'rejected', rejectionReason: reason || 'No reason provided' },
    { new: true }
  );
  res.json(updated);
});

app.get('/api/admin/messages', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
  const messages = await ContactMessage.find().sort({ createdAt: -1 });
  res.json(messages);
});

app.get('/api/admin/stats', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
  const totalEvents = await Event.countDocuments({ isApproved: true });
  const totalUsers = await User.countDocuments();
  const pendingEvents = await Event.countDocuments({ status: 'pending' });
  const totalMessages = await ContactMessage.countDocuments();
  res.json({ totalEvents, totalUsers, pendingEvents, totalMessages });
});

app.post('/api/admin/create-organizer', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, role: 'organizer' });
    await user.save();
    res.status(201).json({ message: 'Organizer created', user: { name, email, role: 'organizer' } });
  } catch {
    res.status(400).json({ error: 'Email already exists' });
  }
});

app.get('/api/admin/users', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
  const users = await User.find({}, '-password').sort({ createdAt: -1 });
  res.json(users);
});

app.delete('/api/admin/users/:id', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'User deleted' });
});

// ─── SEED + START ─────────────────────────────────────────────────────────────

async function seedAdmin() {
  const adminExists = await User.findOne({ role: 'admin' });
  if (!adminExists) {
    const hashed = await bcrypt.hash(process.env.ADMIN_SEED_PASSWORD, 10);
    await User.create({
      name: 'System Admin',
      email: process.env.ADMIN_SEED_EMAIL,
      password: hashed,
      role: 'admin'
    });
    console.log(`✅ Admin seeded: ${process.env.ADMIN_SEED_EMAIL} / ${process.env.ADMIN_SEED_PASSWORD}`);
  }
}

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ MongoDB Connected');
    await seedAdmin();
    app.listen(PORT, () => console.log(`🚀 CEMS Backend running on http://localhost:${PORT}`));
  } catch (err) {
    console.error('❌ MongoDB Connection Failed:', err.message);
    process.exit(1);
  }
}

startServer();
