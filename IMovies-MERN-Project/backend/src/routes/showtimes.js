const router = require('express').Router();
const Showtime = require('../models/Showtime');
router.get('/movie/:movieId', async (req, res, next) => {
  try {
    const showtimes = await Showtime.find({ movie: req.params.movieId, startsAt: { $gte: new Date() } }).sort({ startsAt: 1 }).populate('movie', 'title posterUrl');
    res.json({ showtimes });
  } catch (e) { next(e); }
});
router.get('/:id/seats', async (req, res, next) => {
  try {
    const showtime = await Showtime.findById(req.params.id).populate('movie', 'title');
    if (!showtime) return res.status(404).json({ message: 'Showtime not found.' });
    res.json({ showtime });
  } catch (e) { next(e); }
});
module.exports = router;
