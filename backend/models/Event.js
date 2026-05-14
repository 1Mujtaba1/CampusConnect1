const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  date: { type: String, required: true }, // Stored as YYYY-MM-DD
  time: { type: String, required: true },
  venue: { type: String, required: true },
  capacity: { type: Number, required: true },
  spotsLeft: { type: Number, required: true },
  image: { type: String, default: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800&auto=format&fit=crop' },
  description: { type: String },
  isApproved: { type: Boolean, default: false } // Requires Admin approval
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);