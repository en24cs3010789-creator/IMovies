const router = require('express').Router();
const crypto = require('crypto');
const mongoose = require('mongoose');
const { protect } = require('../middleware/auth');
const Showtime = require('../models/Showtime');
const Booking = require('../models/Booking');
const Movie = require('../models/Movie');
router.use(protect);

router.post('/', async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    const { showtimeId, seats } = req.body;
    if (!showtimeId || !Array.isArray(seats) || seats.length < 1 || seats.length > 8) return res.status(400).json({ message: 'Choose between 1 and 8 seats.' });
    if (new Set(seats).size !== seats.length) return res.status(400).json({ message: 'Duplicate seats were selected.' });
    let created;
    await session.withTransaction(async () => {
      const showtime = await Showtime.findById(showtimeId).session(session);
      if (!showtime) throw Object.assign(new Error('Showtime not found.'), { status: 404 });
      const chosen = showtime.seats.filter(s => seats.includes(s.code));
      if (chosen.length !== seats.length || chosen.some(s => s.status !== 'available')) throw Object.assign(new Error('One or more seats are no longer available. Refresh and try again.'), { status: 409 });
      const updated = await Showtime.updateOne(
        { _id: showtimeId, seats: { $all: seats.map(code => ({ $elemMatch: { code, status: 'available' } })) } },
        { $set: { 'seats.$[seat].status': 'booked' } },
        { arrayFilters: [{ 'seat.code': { $in: seats }, 'seat.status': 'available' }], session }
      );
      // The conditional update is checked; a concurrent change fails safely.
      if (updated.modifiedCount !== 1) throw Object.assign(new Error('Seats changed during checkout. Please try again.'), { status: 409 });
      const movie = await Movie.findById(showtime.movie).session(session);
      [created] = await Booking.create([{
        user: req.user._id, showtime: showtime._id, movieTitle: movie?.title || 'Movie',
        cinema: showtime.cinema, startsAt: showtime.startsAt, seats,
        totalAmount: showtime.price * seats.length,
        bookingCode: 'IM-' + crypto.randomBytes(4).toString('hex').toUpperCase()
      }], { session });
    });
    res.status(201).json({ booking: created });
  } catch (e) { next(e); }
  finally { await session.endSession(); }
});

router.get('/my', async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ bookings });
  } catch (e) { next(e); }
});
router.patch('/:id/cancel', async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    let booking;
    await session.withTransaction(async () => {
      booking = await Booking.findOne({ _id: req.params.id, user: req.user._id }).session(session);
      if (!booking) throw Object.assign(new Error('Booking not found.'), { status: 404 });
      if (booking.status === 'cancelled') throw Object.assign(new Error('Booking is already cancelled.'), { status: 409 });
      if (booking.startsAt <= new Date()) throw Object.assign(new Error('Past or started showtimes cannot be cancelled.'), { status: 400 });
      await Showtime.updateOne({ _id: booking.showtime }, { $set: { 'seats.$[seat].status': 'available' } }, { arrayFilters: [{ 'seat.code': { $in: booking.seats } }], session });
      booking.status = 'cancelled';
      await booking.save({ session });
    });
    res.json({ booking });
  } catch (e) { next(e); }
  finally { await session.endSession(); }
});
module.exports = router;
