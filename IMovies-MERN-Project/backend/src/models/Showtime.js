const mongoose = require('mongoose');
const showtimeSchema = new mongoose.Schema({
  movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
  cinema: { type: String, required: true },
  screen: { type: String, default: 'Screen 1' },
  startsAt: { type: Date, required: true },
  price: { type: Number, min: 0, required: true },
  seats: [{
    code: { type: String, required: true },
    status: { type: String, enum: ['available', 'booked'], default: 'available' }
  }]
}, { timestamps: true });
showtimeSchema.index({ movie: 1, startsAt: 1 });
module.exports = mongoose.model('Showtime', showtimeSchema);
