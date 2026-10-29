const mongoose = require('mongoose');
const movieSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  synopsis: { type: String, required: true },
  genre: [{ type: String }],
  durationMinutes: { type: Number, min: 1, required: true },
  language: { type: String, default: 'English' },
  rating: { type: Number, min: 0, max: 10, default: 0 },
  posterUrl: { type: String, default: '' },
  releaseDate: { type: Date },
  featured: { type: Boolean, default: false }
}, { timestamps: true });
module.exports = mongoose.model('Movie', movieSchema);
