# IMovies — Movie Ticket Booking Platform

A full-stack MERN project for an individual academic submission. It includes movie browsing, JWT authentication, showtimes, seat selection, booking history, and an admin-ready API foundation.

## Tech stack
- Frontend: React, Vite, React Router, Bootstrap 5, Axios
- Backend: Node.js, Express.js, MongoDB, Mongoose
- Authentication: JWT + bcryptjs

## Requirements
- Node.js 18+
- MongoDB local instance or MongoDB Atlas URI

## Quick start

### 1. Backend
```bash
cd backend
cp .env.example .env
# Edit MONGO_URI and JWT_SECRET in .env
npm install
npm run seed
npm run dev
```
API runs at `http://localhost:5000`.

### 2. Frontend
Open a second terminal:
```bash
cd frontend
npm install
npm run dev
```
Open the URL Vite prints (usually `http://localhost:5173`).

## Demo account
After running `npm run seed`:
- Admin: `admin@imovies.local` / `Admin123!`
- User: `user@imovies.local` / `User123!`

Change these credentials and `JWT_SECRET` before any public deployment. Seed accounts are for local demonstration only.

## Main features
- Responsive movie catalogue and movie detail pages
- Register/login with hashed passwords and JWT-protected endpoints
- Browse showtimes and choose seats
- Server-side seat availability validation and booking creation
- User booking history and cancellation
- Admin-protected endpoints to create movies and showtimes
- Seed script with sample movies and showtimes
- Basic validation, error handling, and environment-based configuration

## API overview
| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/api/health` | Public | Health check |
| GET | `/api/movies` | Public | List movies |
| GET | `/api/movies/:id` | Public | Movie details |
| POST | `/api/auth/register` | Public | Create account |
| POST | `/api/auth/login` | Public | Login |
| GET | `/api/auth/me` | User | Current user |
| GET | `/api/showtimes/movie/:movieId` | Public | Showtimes for movie |
| GET | `/api/showtimes/:id/seats` | Public | Seat availability |
| POST | `/api/bookings` | User | Book seats |
| GET | `/api/bookings/my` | User | Current user's bookings |
| PATCH | `/api/bookings/:id/cancel` | User | Cancel booking |
| POST | `/api/admin/movies` | Admin | Create movie |
| POST | `/api/admin/showtimes` | Admin | Create showtime |

## Notes for submission
1. Replace the sample movie data with your own data if required.
2. Add screenshots to your report and include the project architecture, ER/model design, API table, testing results, and future scope.
3. Deploy backend and frontend separately, set environment variables, and use MongoDB Atlas for hosted data.
4. The demo and GitHub URLs must be real links you create after deployment/pushing. This package does not claim to be deployed.

## Important implementation note
Seat booking checks availability on the server and uses a conditional update to avoid normal double-booking races. For production-grade booking, use MongoDB transactions on a replica set and consider temporary seat holds with expiry.
