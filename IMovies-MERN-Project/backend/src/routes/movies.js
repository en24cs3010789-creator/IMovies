const router = require('express').Router();
const Movie = require('../models/Movie');
router.get('/', async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.search) filter.title = { $regex: req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
    if (req.query.genre) filter.genre = req.query.genre;
    const movies = await Movie.find(filter).sort({ featured: -1, title: 1 }).limit(100);
    res.json({ movies });
  } catch (e) { next(e); }
});
router.get('/:id', async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: 'Movie not found.' });
    res.json({ movie });
  } catch (e) { next(e); }
});
module.exports = router;
