const mongoose = require('mongoose');
const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  showtime: { type: mongoose.Schema.Types.ObjectId, ref: 'Showtime', required: true },
  movieTitle: { type: String, required: true },
  cinema: { type: String, required: true },
  startsAt: { type: Date, required: true },
  seats: [{ type: String, required: true }],
  totalAmount: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed' },
  bookingCode: { type: String, required: true, unique: true }
}, { timestamps: true });
module.exports = mongoose.model('Booking', bookingSchema);
