import React, { createContext, useContext, useEffect, useState } from 'react';
import { Link, NavLink, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import api from './api';
const AuthContext = createContext(null);
const useAuth = () => useContext(AuthContext);
const money = n => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);
const dateTime = d => new Date(d).toLocaleString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

function App() {
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem('imovies_user')); } catch { return null; } });
  const [toast, setToast] = useState('');
  const notify = msg => { setToast(msg); window.setTimeout(() => setToast(''), 3500); };
  const logout = () => { localStorage.removeItem('imovies_token'); localStorage.removeItem('imovies_user'); setUser(null); notify('You have been signed out.'); };
  const auth = { user, setUser, notify, logout };
  return <AuthContext.Provider value={auth}>
    <div className="app-shell">
      <header className="topbar"><div className="container nav-inner">
        <Link to="/" className="brand"><span className="brand-mark">i</span> IMOVIES<span className="brand-dot">.</span></Link>
        <nav><NavLink to="/" end>Discover</NavLink><NavLink to="/my-bookings">My bookings</NavLink></nav>
        <div className="nav-actions">{user ? <><span className="user-greeting">Hi, {user.name.split(' ')[0]}</span><button className="btn btn-outline-light btn-sm" onClick={logout}>Sign out</button></> : <Link className="btn btn-primary btn-sm px-3" to="/login">Sign in</Link>}</div>
      </div></header>
      {toast && <div className="toast-note">{toast}</div>}
      <main><Routes><Route path="/" element={<Home/>}/><Route path="/movie/:id" element={<MovieDetail/>}/><Route path="/login" element={<AuthPage mode="login"/>}/><Route path="/register" element={<AuthPage mode="register"/>}/><Route path="/showtime/:id" element={<SeatBooking/>}/><Route path="/my-bookings" element={<MyBookings/>}/><Route path="*" element={<NotFound/>}/></Routes></main>
      <footer><div className="container footer-inner"><Link to="/" className="brand small-brand">IMOVIES<span className="brand-dot">.</span></Link><span>Made for movie lovers.</span><span>© {new Date().getFullYear()} IMovies</span></div></footer>
    </div>
  </AuthContext.Provider>;
}

function Home() {
  const [movies, setMovies] = useState([]), [search, setSearch] = useState(''), [genre, setGenre] = useState('All'), [loading, setLoading] = useState(true), [error, setError] = useState('');
  useEffect(() => { setLoading(true); api.get('/movies').then(r => setMovies(r.data.movies)).catch(() => setError('Could not connect to the API. Start the backend and MongoDB, then refresh.')).finally(() => setLoading(false)); }, []);
  const genres = ['All', ...new Set(movies.flatMap(m => m.genre || []))];
  const filtered = movies.filter(m => m.title.toLowerCase().includes(search.toLowerCase()) && (genre === 'All' || m.genre?.includes(genre)));
  const featured = movies.find(m => m.featured) || movies[0];
  return <><section className="hero"><div className="hero-glow"/><div className="container hero-content"><div className="eyebrow"><span className="eyebrow-line"/> THE BIG SCREEN, REIMAGINED</div><div className="hero-grid"><div><h1>Stories worth<br/><em>showing up for.</em></h1><p className="hero-copy">Find your next favourite film. Pick your seats. Make it a night to remember.</p><a href="#movies" className="btn btn-primary btn-lg">Explore movies <span aria-hidden="true">↗</span></a><div className="hero-stats"><div><strong>{movies.length || '—'}</strong><span>Movies to explore</span></div><div><strong>1 click</strong><span>To your next story</span></div></div></div>{featured && <div className="hero-poster-wrap"><div className="poster-halo"/><img className="hero-poster" src={featured.posterUrl} alt={featured.title} onError={e => e.currentTarget.style.visibility='hidden'}/><div className="poster-caption"><span>✦ FEATURED FILM</span><strong>{featured.title}</strong><small>★ {featured.rating}/10 · {featured.genre?.slice(0,2).join(' / ')}</small></div></div>}</div><div className="hero-bottom"><span>SCROLL TO DISCOVER</span><span className="scroll-line"/></div></div></section>
  <section className="container movie-section" id="movies"><div className="section-heading"><div><div className="eyebrow">YOUR NEXT MOVIE NIGHT</div><h2>Now showing<span className="brand-dot">.</span></h2><p>Handpicked stories for every kind of movie mood.</p></div><div className="search-wrap"><span>⌕</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search movies..." aria-label="Search movies"/></div></div>
  <div className="genre-list">{genres.map(g=><button key={g} className={`genre-chip ${genre===g?'active':''}`} onClick={()=>setGenre(g)}>{g}</button>)}</div>
  {loading ? <div className="loading-state">Loading the lineup<span className="pulse"> . . .</span></div> : error ? <div className="alert alert-warning">{error}</div> : filtered.length ? <div className="movie-grid">{filtered.map((m,i)=><MovieCard key={m._id} movie={m} index={i}/>)}</div> : <div className="empty-state">No movies match that search. Try another title or genre.</div>}
  </section></>;
}

function MovieCard({movie,index}) {
  return <article className="movie-card" style={{'--delay':`${index*60}ms`}}><Link to={`/movie/${movie._id}`} className="poster-link"><div className="movie-poster"><img src={movie.posterUrl} alt={movie.title} loading="lazy" onError={e=>{e.currentTarget.style.display='none';}}/><div className="poster-fallback">{movie.title}</div><span className="rating-pill">★ {movie.rating || 'NR'}</span><span className="poster-overlay"><span>View movie <b>↗</b></span></span></div></Link><div className="movie-meta"><div className="movie-tags">{(movie.genre||[]).slice(0,2).map(g=><span key={g}>{g}</span>)}</div><Link to={`/movie/${movie._id}`} className="movie-title">{movie.title}</Link><div className="movie-sub">{movie.durationMinutes} min <span>·</span> {movie.language}</div></div></article>;
}

function MovieDetail() {
  const {id}=useParams(), [movie,setMovie]=useState(null), [showtimes,setShowtimes]=useState([]), [error,setError]=useState('');
  useEffect(()=>{Promise.all([api.get(`/movies/${id}`),api.get(`/showtimes/movie/${id}`)]).then(([m,s])=>{setMovie(m.data.movie);setShowtimes(s.data.showtimes)}).catch(e=>setError(e.response?.data?.message||'Could not load movie details.'));},[id]);
  if(error)return <div className="container page-space"><div className="alert alert-warning">{error}</div><Link to="/">← Back to movies</Link></div>;
  if(!movie)return <div className="container page-space loading-state">Loading movie...</div>;
  const grouped=showtimes.reduce((acc,s)=>{const key=new Date(s.startsAt).toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'});(acc[key] ||= []).push(s);return acc;},{});
  return <section className="container detail-layout page-space"><div className="detail-poster"><img src={movie.posterUrl} alt={movie.title}/></div><div className="detail-content"><Link className="back-link" to="/">← All movies</Link><div className="eyebrow">FEATURED ON IMOVIES</div><h1>{movie.title}</h1><div className="detail-facts"><span>★ {movie.rating}/10</span><span>{movie.durationMinutes} minutes</span><span>{movie.language}</span></div><div className="movie-tags">{movie.genre?.map(g=><span key={g}>{g}</span>)}</div><p className="synopsis">{movie.synopsis}</p><h2 className="showtime-title">Choose your showtime</h2>{Object.keys(grouped).length===0?<p className="muted">No upcoming showtimes are available yet.</p>:Object.entries(grouped).map(([day,items])=><div className="show-day" key={day}><strong>{day}</strong><div className="showtime-list">{items.map(s=><Link key={s._id} to={`/showtime/${s._id}`} className="showtime-chip"><span>{new Date(s.startsAt).toLocaleTimeString('en-IN',{hour:'numeric',minute:'2-digit'})}</span><small>{money(s.price)} / seat</small></Link>)}</div></div>)}</div></section>;
}

function AuthPage({mode}) {
  const isRegister=mode==='register', [name,setName]=useState(''),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
  const {setUser,notify}=useAuth(), nav=useNavigate();
  async function submit(e){e.preventDefault();setBusy(true);setError('');try{const r=await api.post(`/auth/${mode}`,isRegister?{name,email,password}:{email,password});localStorage.setItem('imovies_token',r.data.token);localStorage.setItem('imovies_user',JSON.stringify(r.data.user));setUser(r.data.user);notify(isRegister?'Welcome to IMovies!':'Welcome back!');nav('/');}catch(e){setError(e.response?.data?.message||'Unable to authenticate. Check that the API is running.');}finally{setBusy(false);}}
  return <section className="auth-page"><div className="auth-card"><div className="auth-symbol">i<span>.</span></div><div className="eyebrow">{isRegister?'YOUR SEAT IS WAITING':'GOOD TO SEE YOU AGAIN'}</div><h1>{isRegister?'Join the story.':'Welcome back.'}</h1><p className="muted">{isRegister?'Create an account and make every movie night count.':'Sign in to manage your bookings and movie nights.'}</p>{error&&<div className="alert alert-danger py-2">{error}</div>}<form onSubmit={submit}>{isRegister&&<label>Full name<input className="form-control" value={name} onChange={e=>setName(e.target.value)} required minLength="2" autoComplete="name"/></label>}<label>Email address<input className="form-control" type="email" value={email} onChange={e=>setEmail(e.target.value)} required autoComplete="email"/></label><label>Password<input className="form-control" type="password" value={password} onChange={e=>setPassword(e.target.value)} required minLength="8" autoComplete={isRegister?'new-password':'current-password'}/><small>At least 8 characters</small></label><button className="btn btn-primary w-100 btn-lg" disabled={busy}>{busy?'Please wait…':isRegister?'Create account':'Sign in'} <span>→</span></button></form><div className="auth-switch">{isRegister?'Already have an account?':'New to IMovies?'} <Link to={isRegister?'/login':'/register'}>{isRegister?'Sign in':'Create an account'}</Link></div></div></section>;
}

function SeatBooking() {
  const {id}=useParams(),{user,notify}=useAuth(),nav=useNavigate();const [showtime,setShowtime]=useState(null),[selected,setSelected]=useState([]),[busy,setBusy]=useState(false),[error,setError]=useState('');
  useEffect(()=>{api.get(`/showtimes/${id}/seats`).then(r=>setShowtime(r.data.showtime)).catch(e=>setError(e.response?.data?.message||'Could not load seats.'));},[id]);
  if(!user)return <div className="container page-space"><div className="auth-required"><h2>Your seats are waiting.</h2><p>Sign in before booking so your tickets stay connected to your account.</p><Link className="btn btn-primary" to="/login">Sign in to continue</Link></div></div>;
  if(error)return <div className="container page-space alert alert-warning">{error}</div>;
  if(!showtime)return <div className="container page-space loading-state">Preparing your screen…</div>;
  const toggle=code=>setSelected(old=>old.includes(code)?old.filter(s=>s!==code):old.length>=8?old:[...old,code]);
  async function book(){setBusy(true);setError('');try{const r=await api.post('/bookings',{showtimeId:id,seats:selected});notify(`Booking confirmed · ${r.data.booking.bookingCode}`);nav('/my-bookings');}catch(e){setError(e.response?.data?.message||'Booking failed. Please try again.');setSelected([]);api.get(`/showtimes/${id}/seats`).then(r=>setShowtime(r.data.showtime));}finally{setBusy(false);}}
  const rows=[...new Set(showtime.seats.map(s=>s.code[0]))];
  return <section className="container page-space seat-page"><Link to={`/movie/${showtime.movie?._id}`} className="back-link">← Back to movie</Link><div className="seat-header"><div><div className="eyebrow">PICK YOUR PERFECT VIEW</div><h1>Select your seats<span className="brand-dot">.</span></h1><p>{showtime.movie?.title} · {showtime.cinema} · {dateTime(showtime.startsAt)}</p></div><div className="seat-price">{money(showtime.price)}<small>per seat</small></div></div><div className="screen-area"><div className="screen-curve"/><span>SCREEN THIS WAY</span></div><div className="seat-map">{rows.map(row=><div className="seat-row" key={row}><span className="row-label">{row}</span>{showtime.seats.filter(s=>s.code[0]===row).map(seat=><button key={seat.code} title={seat.code} disabled={seat.status==='booked'} onClick={()=>toggle(seat.code)} className={`seat ${seat.status==='booked'?'booked':selected.includes(seat.code)?'selected':''}`}>{seat.code.slice(1)}</button>)}</div>)}</div><div className="seat-legend"><span><i className="seat available-legend"/> Available</span><span><i className="seat selected-legend"/> Selected</span><span><i className="seat booked-legend"/> Booked</span></div>{error&&<div className="alert alert-danger">{error}</div>}<div className="booking-summary"><div><small>SELECTED SEATS</small><strong>{selected.length?selected.join(', '):'Choose your seats'}</strong></div><div><small>TOTAL</small><strong>{money(selected.length*showtime.price)}</strong></div><button className="btn btn-primary btn-lg" disabled={!selected.length||busy} onClick={book}>{busy?'Confirming…':'Confirm booking →'}</button></div><p className="fine-print">Demo project: checkout confirms a booking but does not process real payments.</p></section>;
}

function MyBookings() {
  const {user,notify}=useAuth(),[bookings,setBookings]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState('');
  async function load(){try{const r=await api.get('/bookings/my');setBookings(r.data.bookings);}catch(e){setError(e.response?.data?.message||'Could not load bookings.');}finally{setLoading(false);}}
  useEffect(()=>{if(user)load();else setLoading(false);},[user]);
  async function cancel(id){if(!window.confirm('Cancel this booking? Seats will be released.'))return;try{await api.patch(`/bookings/${id}/cancel`);notify('Booking cancelled.');load();}catch(e){setError(e.response?.data?.message||'Unable to cancel booking.');}}
  if(!user)return <div className="container page-space auth-required"><h2>Your movie nights live here.</h2><p>Sign in to view your ticket bookings.</p><Link className="btn btn-primary" to="/login">Sign in</Link></div>;
  return <section className="container page-space"><div className="eyebrow">YOUR CINEMA HISTORY</div><h1 className="page-title">My bookings<span className="brand-dot">.</span></h1><p className="muted">All your movie plans, in one place.</p>{error&&<div className="alert alert-warning">{error}</div>}{loading?<div className="loading-state">Loading your tickets…</div>:bookings.length===0?<div className="empty-state booking-empty"><div className="empty-icon">▤</div><h3>No tickets yet.</h3><p>Your next favourite story is just a booking away.</p><Link to="/" className="btn btn-primary">Find a movie</Link></div>:<div className="booking-list">{bookings.map(b=><article className={`ticket-card ${b.status==='cancelled'?'ticket-cancelled':''}`} key={b._id}><div className="ticket-main"><div className="ticket-icon">▣</div><div><span className={`status-tag ${b.status}`}>{b.status}</span><h3>{b.movieTitle}</h3><p>{b.cinema} · {dateTime(b.startsAt)}</p><p className="ticket-seats">Seats: {b.seats.join(', ')}</p></div></div><div className="ticket-side"><small>BOOKING CODE</small><strong>{b.bookingCode}</strong><b>{money(b.totalAmount)}</b>{b.status==='confirmed'&&new Date(b.startsAt)>new Date()&&<button className="btn btn-sm btn-outline-light" onClick={()=>cancel(b._id)}>Cancel booking</button>}</div></article>)}</div>}</section>;
}
function NotFound(){return <div className="container page-space empty-state"><h2>That page missed its screening.</h2><Link to="/" className="btn btn-primary">Back to IMovies</Link></div>}
export default App;
