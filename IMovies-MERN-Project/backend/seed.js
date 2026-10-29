require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');
const Movie = require('./src/models/Movie');
const Showtime = require('./src/models/Showtime');
const makeSeats = () => Array.from({ length: 6 }, (_, r) => 'ABCDEF'[r]).flatMap(row => Array.from({ length: 8 }, (_, i) => ({ code: `${row}${i + 1}`, status: 'available' })));
(async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/imovies');
  await Promise.all([User.deleteMany({}), Movie.deleteMany({}), Showtime.deleteMany({})]);
  await User.create([
    { name: 'IMovies Admin', email: 'admin@imovies.local', passwordHash: await bcrypt.hash('Admin123!', 12), role: 'admin' },
    { name: 'Demo User', email: 'user@imovies.local', passwordHash: await bcrypt.hash('User123!', 12), role: 'user' }
  ]);
  const movies = await Movie.create([
    { title: 'Interstellar', synopsis: 'A team travels beyond this galaxy to discover whether mankind has a future among the stars.', genre: ['Sci-Fi', 'Adventure'], durationMinutes: 169, language: 'English', rating: 8.7, posterUrl: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', featured: true },
    { title: 'The Dark Knight', synopsis: 'Batman faces a criminal mastermind who plunges Gotham into chaos.', genre: ['Action', 'Crime'], durationMinutes: 152, language: 'English', rating: 9.0, posterUrl: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg', featured: true },
    { title: 'Dune: Part Two', synopsis: 'Paul Atreides unites with the Fremen while seeking revenge against those who destroyed his family.', genre: ['Sci-Fi', 'Adventure'], durationMinutes: 166, language: 'English', rating: 8.5, posterUrl: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg' },
    { title: 'Spider-Man: Across the Spider-Verse', synopsis: 'Miles Morales journeys across the multiverse and meets a team of Spider-People.', genre: ['Animation', 'Action'], durationMinutes: 140, language: 'English', rating: 8.6, posterUrl: 'https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xjrc8Z9.jpg' },
    { title: 'The Grand Budapest Hotel', synopsis: 'A legendary concierge and his lobby boy become embroiled in a story of theft and family legacy.', genre: ['Comedy', 'Drama'], durationMinutes: 99, language: 'English', rating: 8.1, posterUrl: 'https://image.tmdb.org/t/p/w500/eWdyYQreja6JGCzqHWXpWHDrrPo.jpg' },
    { title: 'Everything Everywhere All at Once', synopsis: 'An exhausted laundromat owner becomes the unlikely hero of the multiverse.', genre: ['Action', 'Comedy'], durationMinutes: 139, language: 'English', rating: 7.8, posterUrl: 'https://image.tmdb.org/t/p/w500/w3LxiVYdWWRvEVdn5RYq6jIqkb1.jpg' }
  ]);
  const start = new Date(); start.setDate(start.getDate() + 1); start.setHours(14, 0, 0, 0);
  const showtimes = [];
  for (const [idx, movie] of movies.entries()) {
    for (const offset of [0, 1, 2]) {
      const date = new Date(start); date.setDate(date.getDate() + offset); date.setHours([11, 15, 19][offset], 0, 0, 0);
      showtimes.push({ movie: movie._id, cinema: ['CineWorld Central', 'PVR Downtown'][idx % 2], screen: `Screen ${(idx % 4) + 1}`, startsAt: date, price: 180 + (idx % 3) * 40, seats: makeSeats() });
    }
  }
  await Showtime.create(showtimes);
  console.log('Seeded demo users, movies and showtimes.');
  await mongoose.disconnect();
})().catch(err => { console.error(err); process.exit(1); });
