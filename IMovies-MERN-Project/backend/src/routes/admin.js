const router = require('express').Router();
const { protect, adminOnly } = require('../middleware/auth');
const Movie = require('../models/Movie');
const Showtime = require('../models/Showtime');
router.use(protect, adminOnly);
router.post('/movies', async (req, res, next) => {
  try {
    const { title, synopsis, durationMinutes } = req.body;
    if (!title || !synopsis || !Number(durationMinutes)) return res.status(400).json({ message: 'Title, synopsis and duration are required.' });
    const movie = await Movie.create(req.body);
    res.status(201).json({ movie });
  } catch (e) { next(e); }
});
router.post('/showtimes', async (req, res, next) => {
  try {
    const { movie, cinema, startsAt, price } = req.body;
    if (!movie || !cinema || !startsAt || price == null) return res.status(400).json({ message: 'Movie, cinema, start time and price are required.' });
    const seats = Array.from({ length: 6 }, (_, r) => 'ABCDEF'[r]).flatMap(row => Array.from({ length: 8 }, (_, i) => ({ code: `${row}${i + 1}`, status: 'available' })));
    const showtime = await Showtime.create({ movie, cinema, startsAt, price, seats, screen: req.body.screen || 'Screen 1' });
    res.status(201).json({ showtime });
  } catch (e) { next(e); }
});
module.exports = router;
