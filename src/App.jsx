import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import { Hotel, User, BookOpen, LogIn, Search, MapPin, Calendar, Users, CreditCard, Trash2, Edit, CheckCircle, XCircle, Settings, Save } from 'lucide-react';
import './App.css';

// --- Shared Components ---
const Navbar = ({ user, setUser }) => (
    <nav className="navbar">
        <div className="nav-logo">
            <Hotel size={28} color="#c5a059" />
            <span>TN Stay</span>
        </div>
        <ul className="nav-links">
            <li><Link to="/">Home</Link></li>
            {user ? (
                <>
                    <li><Link to="/bookings">My Bookings</Link></li>
                    {user.role === 'admin' && <li><Link to="/admin">Admin</Link></li>}
                    <li className="user-pill"><User size={18} /> {user.name}</li>
                    <li><button onClick={() => {
                        localStorage.removeItem('token');
                        setUser(null);
                    }} className="btn btn-link" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>Logout</button></li>
                </>
            ) : (
                <li><Link to="/login" className="btn btn-primary">Login</Link></li>
            )}
        </ul>
    </nav>
);

// --- Auth Components ---
const Login = ({ setUser }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (res.ok) {
                localStorage.setItem('token', data.token);
                setUser(data.user);
                navigate('/');
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Connection failed');
        }
    };

    return (
        <div className="auth-container">
            <h2>Welcome Back</h2>
            <p style={{ marginBottom: '1.5rem', color: '#636e72' }}>Please enter your details</p>
            <form className="auth-form" onSubmit={handleLogin}>
                <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label>Password</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                </div>
                {error && <p style={{ color: 'red', fontSize: '0.8rem' }}>{error}</p>}
                <button type="submit" className="btn btn-primary">Sign In</button>
            </form>
            <div className="auth-footer">
                Don't have an account? <Link to="/register">Create one</Link>
            </div>
        </div>
    );
};

const Register = ({ setUser, defaultRole = 'user' }) => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: defaultRole });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (res.ok) {
                localStorage.setItem('token', data.token);
                setUser(data.user);
                navigate('/');
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Connection failed');
        }
    };

    return (
        <div className="auth-container">
            <h2>{defaultRole === 'admin' ? 'Create Admin Account' : 'Create Account'}</h2>
            <p style={{ marginBottom: '1.5rem', color: '#636e72' }}>Join the TN Stay community</p>
            <form className="auth-form" onSubmit={handleRegister}>
                <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                </div>
                <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
                </div>
                <div className="form-group">
                    <label>Password</label>
                    <input type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required />
                </div>
                {error && <p style={{ color: 'red', fontSize: '0.8rem' }}>{error}</p>}
                <button type="submit" className="btn btn-primary">{defaultRole === 'admin' ? 'Register as Admin' : 'Register'}</button>
            </form>
            <div className="auth-footer">
                Already have an account? <Link to="/login">Sign in</Link>
            </div>
        </div>
    );
};

// --- Page Components ---
const Home = () => {
    const [hotels, setHotels] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/hotels')
            .then(res => res.json())
            .then(data => {
                setHotels(data);
                setLoading(false);
            });
    }, []);

    const filteredHotels = hotels.filter(h =>
        h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.city.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <main>
            <section className="hero">
                <h1>Experience Pure Luxury</h1>
                <p>From the shores of Marina to the heights of Ooty, find your perfect sanctuary in Tamil Nadu.</p>
                <div className="search-bar">
                    <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '1.5rem', color: '#94a3b8' }}>
                        <Search size={20} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by hotel or city (e.g. Ooty, Chennai)..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ flex: 1, border: 'none', padding: '0 1rem', borderRadius: '50px', outline: 'none', fontSize: '1rem', color: 'var(--text-main)' }}
                    />
                    <button className="btn btn-primary" style={{ borderRadius: '100px', padding: '0.8rem 2.5rem' }}>Search</button>
                </div>
            </section>

            <div className="container">
                <h2 className="section-title" style={{ marginTop: '4rem' }}>{searchTerm ? 'Search Results' : 'Popular Destinations'}</h2>
                <div className="hotel-grid">
                    {filteredHotels.map(hotel => {
                        const isAvailable = hotel.settings?.roomTypes?.some(rt => rt.available) ?? true;
                        return (
                            <div key={hotel.id} className="hotel-card" style={{ opacity: isAvailable ? 1 : 0.9 }}>
                                <div className="hotel-image-container">
                                    <img src={hotel.image} alt={hotel.name} className="hotel-image" />
                                    <div className="hotel-image-overlay" />
                                    {!isAvailable && (
                                        <div style={{ position: 'absolute', top: '15px', right: '15px', zIndex: 10 }}>
                                            <span className="badge-booked">Fully Booked</span>
                                        </div>
                                    )}
                                </div>
                                <div className="hotel-info">
                                    <div className="hotel-meta">
                                        <MapPin size={14} color="var(--primary)" />
                                        <span>{hotel.city}, Tamil Nadu</span>
                                    </div>
                                    <div className="hotel-name">{hotel.name}</div>
                                    <div className="hotel-footer">
                                        <div className="hotel-price-tag">
                                            <span className="hotel-price-label">Starts from</span>
                                            <div className="hotel-price">₹{hotel.price.toLocaleString('en-IN')}<span>/night</span></div>
                                        </div>
                                        <Link to={`/hotel/${hotel.id}`} className="btn btn-primary btn-sm" style={{ padding: '0.6rem 1.2rem' }}>
                                            {isAvailable ? 'View Details' : 'Fully Booked'}
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </main>
    );
};

const HotelDetails = ({ user, settings }) => {
    const { id } = useParams();
    const [hotel, setHotel] = useState(null);
    const [bookingStatus, setBookingStatus] = useState(null);

    // Use hotel-specific settings or fallback to global settings
    const activeSettings = hotel?.settings || settings;

    // Advanced Booking State
    const [bookingForm, setBookingForm] = useState({
        checkIn: '',
        checkOut: '',
        guests: 1,
        roomType: '',
        paymentMethod: 'Credit Card'
    });

    useEffect(() => {
        if (activeSettings && !bookingForm.roomType) {
            setBookingForm(prev => ({ ...prev, roomType: activeSettings.roomTypes[0]?.name || 'Single Room' }));
        }
    }, [activeSettings]);

    useEffect(() => {
        fetch('/api/hotels')
            .then(res => res.json())
            .then(data => setHotel(data.find(h => h.id === parseInt(id))));
    }, [id]);

    const handleBook = async (e) => {
        e.preventDefault();
        if (!user) return alert('Please login to book');

        // Date Validation
        const start = new Date(bookingForm.checkIn);
        const end = new Date(bookingForm.checkOut);

        if (!bookingForm.checkIn || !bookingForm.checkOut) {
            return alert('Please select both check-in and check-out dates');
        }

        if (end <= start) {
            return alert('Check-out date must be after the check-in date');
        }

        try {
            const nights = Math.max(1, Math.ceil((new Date(bookingForm.checkOut) - new Date(bookingForm.checkIn)) / (1000 * 60 * 60 * 24)));
            const rt = activeSettings.roomTypes.find(r => r.name === bookingForm.roomType);
            const basePrice = hotel.price * (rt?.baseModifier || 1);
            const extraGuests = Math.max(0, parseInt(bookingForm.guests || 1) - (rt?.maxGuests || 1));
            const extraCost = extraGuests * (activeSettings.extraGuestCharge || 0) * nights;
            const total = (basePrice * nights) + extraCost;

            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    hotelId: hotel.id,
                    hotelName: hotel.name,
                    price: total,
                    ...bookingForm
                })
            });
            if (res.ok) setBookingStatus('success');
        } catch (err) {
            alert('Booking failed');
        }
    };

    if (!hotel) return <div className="container" style={{ padding: '5rem' }}>Loading...</div>;

    return (
        <div className="container" style={{ padding: '4rem 0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '3rem' }}>
                <div>
                    <img src={hotel.image} alt={hotel.name} style={{ width: '100%', borderRadius: '20px', height: '400px', objectFit: 'cover' }} />
                    <h1 style={{ marginTop: '2rem' }}>{hotel.name}</h1>
                    <p style={{ color: '#636e72', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <MapPin size={18} /> {hotel.city}, Tamil Nadu
                    </p>
                    <div style={{ marginTop: '2rem', fontSize: '1.1rem' }}>{hotel.description}</div>
                </div>

                <div style={{ background: 'white', padding: '2rem', borderRadius: '20px', boxShadow: 'var(--shadow)', height: 'fit-content' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#c5a059' }}>₹{hotel.price.toLocaleString('en-IN')} / night</div>

                    {!activeSettings.roomTypes.some(rt => rt.available) ? (
                        <div style={{ marginTop: '2.5rem', textAlign: 'center', padding: '3rem 2rem', background: '#fffaf0', borderRadius: '20px', border: '1px solid #feebc8' }}>
                            <div style={{ background: '#fef3c7', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                                <Calendar size={32} color="#d97706" />
                            </div>
                            <h3 style={{ color: '#92400e', marginBottom: '0.5rem', fontSize: '1.5rem', fontWeight: 800 }}>Fully Booked</h3>
                            <p style={{ color: '#b45309', fontSize: '1rem', lineHeight: '1.5' }}>This sanctuary is currently operating at full capacity. Please explore our other premier stays or check back for future availability.</p>
                            <button onClick={() => navigate('/')} className="btn btn-primary" style={{ marginTop: '2rem' }}>Explore Alternatives</button>
                        </div>
                    ) : user ? (
                        <form onSubmit={handleBook} style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className="form-group">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Calendar size={14} /> Check-in</label>
                                <input type="date" min={new Date().toISOString().split('T')[0]} value={bookingForm.checkIn} onChange={e => {
                                    const newCheckIn = e.target.value;
                                    setBookingForm({
                                        ...bookingForm,
                                        checkIn: newCheckIn,
                                        checkOut: bookingForm.checkOut && new Date(bookingForm.checkOut) <= new Date(newCheckIn) ? '' : bookingForm.checkOut
                                    });
                                }} required style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #dfe6e9' }} />
                            </div>

                            <div className="form-group">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Calendar size={14} /> Check-out</label>
                                <input type="date" min={bookingForm.checkIn || new Date().toISOString().split('T')[0]} value={bookingForm.checkOut} onChange={e => setBookingForm({ ...bookingForm, checkOut: e.target.value })} required style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #dfe6e9' }} />
                            </div>

                            <div className="form-group">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Users size={14} /> Guests</label>
                                <input type="number" min="1" max="10" value={bookingForm.guests} onChange={e => setBookingForm({ ...bookingForm, guests: e.target.value })} required style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #dfe6e9' }} />
                            </div>

                            <div className="form-group">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Hotel size={14} /> Room Type</label>
                                <select value={bookingForm.roomType} onChange={e => setBookingForm({ ...bookingForm, roomType: e.target.value })} style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #dfe6e9', background: 'white' }}>
                                    {activeSettings.roomTypes.filter(rt => rt.available).map(rt => (
                                        <option key={rt.name} value={rt.name}>{rt.name} (₹{(hotel.price * rt.baseModifier).toLocaleString('en-IN')}/night)</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><CreditCard size={14} /> Payment Method</label>
                                <select value={bookingForm.paymentMethod} onChange={e => setBookingForm({ ...bookingForm, paymentMethod: e.target.value })} style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #dfe6e9', background: 'white' }}>
                                    <option>Credit Card</option>
                                    <option>UPI (GPay/PhonePe)</option>
                                    <option>Net Banking</option>
                                    <option>Pay at Hotel</option>
                                </select>
                            </div>

                            {bookingForm.checkIn && bookingForm.checkOut && (
                                <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '10px', marginTop: '0.5rem' }}>
                                    {(() => {
                                        const nights = Math.max(1, Math.ceil((new Date(bookingForm.checkOut) - new Date(bookingForm.checkIn)) / (1000 * 60 * 60 * 24)));
                                        const rt = activeSettings.roomTypes.find(r => r.name === bookingForm.roomType);
                                        const basePrice = hotel.price * (rt?.baseModifier || 1);
                                        const extraGuests = Math.max(0, parseInt(bookingForm.guests || 1) - (rt?.maxGuests || 1));
                                        const extraCost = extraGuests * (activeSettings.extraGuestCharge || 0) * nights;
                                        const roomCost = basePrice * nights;
                                        const total = roomCost + extraCost;

                                        return (
                                            <>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem', color: '#636e72', fontSize: '0.9rem' }}>
                                                    <span>{rt?.name} x {nights} nights</span>
                                                    <span>₹{roomCost.toLocaleString('en-IN')}</span>
                                                </div>
                                                {extraGuests > 0 && (
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem', color: '#636e72', fontSize: '0.9rem' }}>
                                                        <span>Extra Guests ({extraGuests})</span>
                                                        <span>+₹{extraCost.toLocaleString('en-IN')}</span>
                                                    </div>
                                                )}
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.1rem', borderTop: '1px solid #dfe6e9', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                                                    <span>Total</span>
                                                    <span>₹{total.toLocaleString('en-IN')}</span>
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>
                            )}

                            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Reserve Now</button>
                        </form>
                    ) : (
                        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                            <p style={{ color: '#636e72', marginBottom: '1.5rem' }}>Sign in to view prices and book this stay.</p>
                            <Link to="/login" className="btn btn-primary" style={{ display: 'block', textDecoration: 'none' }}>Login to Book</Link>
                        </div>
                    )}
                </div>
            </div>

            {bookingStatus === 'success' && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2 style={{ color: 'green' }}>Booking Confirmed!</h2>
                        <p style={{ margin: '1rem 0' }}>Your stay at {hotel.name} has been reserved successfully.</p>
                        <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '10px', marginBottom: '1.5rem', textAlign: 'left', fontSize: '0.9rem' }}>
                            <p><strong>Dates:</strong> {bookingForm.checkIn} to {bookingForm.checkOut}</p>
                            <p><strong>Guests:</strong> {bookingForm.guests}</p>
                            <p><strong>Payment:</strong> {bookingForm.paymentMethod}</p>
                        </div>
                        <button className="btn btn-primary" onClick={() => setBookingStatus(null)}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

const Bookings = ({ user }) => {
    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        fetch('/api/bookings/my', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
            .then(res => res.json())
            .then(data => setBookings(data));
    }, []);

    return (
        <div className="container" style={{ padding: '4rem 0' }}>
            <h2>My Bookings</h2>
            <div className="hotel-grid">
                {bookings.map(book => (
                    <div key={book.id} className="hotel-card" style={{ padding: '1.5rem' }}>
                        <h3 className="hotel-name">{book.hotelName}</h3>
                        <div style={{ fontSize: '0.85rem', color: '#636e72', marginTop: '0.5rem' }}>
                            <p>Check-in: {book.checkIn || 'N/A'}</p>
                            <p>Check-out: {book.checkOut || 'N/A'}</p>
                            <p>Guests: {book.guests || '1'}</p>
                            <p>Payment: {book.paymentMethod || 'Paid'}</p>
                        </div>
                        <p style={{ marginTop: '1rem', color: 'green', fontWeight: 600 }}>Status: {book.status}</p>
                        <p style={{ marginTop: '0.5rem', fontWeight: 700 }}>Total: ₹{book.price.toLocaleString('en-IN')}</p>
                    </div>
                ))}
                {bookings.length === 0 && <p>No bookings yet. Start exploring!</p>}
            </div>
        </div>
    );
};

const Admin = ({ user, settings, setSettings }) => {
    const [hotels, setHotels] = useState([]);
    const [allBookings, setAllBookings] = useState([]);
    const [activeTab, setActiveTab] = useState('hotels'); // 'hotels', 'bookings', or 'hotel-settings'
    const [editingHotel, setEditingHotel] = useState(null);
    const [configuringHotel, setConfiguringHotel] = useState(null); // New state
    const [hotelForm, setHotelForm] = useState({ name: '', city: '', price: '', image: '', description: '' });
    const [tempSettings, setTempSettings] = useState(null);

    useEffect(() => {
        if (activeTab === 'hotels') {
            fetch('/api/hotels').then(res => res.json()).then(data => setHotels(data));
        } else if (activeTab === 'bookings') {
            fetch('/api/admin/bookings', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            }).then(res => res.json()).then(data => setAllBookings(data));
        } else if (activeTab === 'hotel-settings' && configuringHotel) {
            setTempSettings(JSON.parse(JSON.stringify(configuringHotel.settings)));
        }
    }, [activeTab, configuringHotel]);

    const handleSubmitHotel = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) return alert('Session expired. Please login again.');

        const isUpdate = !!editingHotel;
        const url = isUpdate ? `/api/hotels/${editingHotel.id}` : '/api/hotels';
        const method = isUpdate ? 'PUT' : 'POST';

        console.log(`Admin ${method} Request:`, hotelForm);

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...hotelForm,
                    price: parseFloat(hotelForm.price)
                })
            });

            const contentType = res.headers.get('content-type');
            let result;
            if (contentType && contentType.includes('application/json')) {
                result = await res.json();
            } else {
                const text = await res.text();
                throw new Error(`Server returned non-JSON response: ${text.substring(0, 100)}...`);
            }

            if (res.ok) {
                alert(isUpdate ? 'Update Successful! ✅' : 'Hotel Added! ✅');
                // Refresh the list immediately
                if (isUpdate) {
                    setHotels(prev => prev.map(h => String(h.id) === String(editingHotel.id) ? { ...h, ...result } : h));
                } else {
                    setHotels(prev => [...prev, result]);
                }
                resetForm();
            } else {
                alert(`Failed: ${result.message || 'Server error'}`);
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            alert(`Could not connect to server: ${error.message}`);
        }
    };



    const handleDeleteHotel = async (id) => {
        if (!window.confirm('Are you sure you want to delete this hotel?')) return;
        const res = await fetch(`/api/hotels/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) {
            setHotels(hotels.filter(h => h.id !== id));
        }
    };

    const resetForm = () => {
        setEditingHotel(null);
        setHotelForm({ name: '', city: '', price: '', image: '', description: '' });
    };

    const startEdit = (hotel) => {
        setEditingHotel(hotel);
        setHotelForm({ ...hotel });
    };

    const handleSaveSettings = async () => {
        if (!configuringHotel) return;
        try {
            const res = await fetch(`/api/hotels/${configuringHotel.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    ...configuringHotel,
                    settings: tempSettings
                })
            });
            if (res.ok) {
                const updatedHotel = await res.json();
                setHotels(prev => prev.map(h => h.id === configuringHotel.id ? updatedHotel : h));
                alert(`Settings for ${configuringHotel.name} updated! ✅`);
                setActiveTab('hotels');
                setConfiguringHotel(null);
            }
        } catch (err) {
            alert('Failed to save settings');
        }
    };

    if (!user || user.role !== 'admin') return <div className="container" style={{ padding: '6rem 0', textAlign: 'center' }}><h3>Access Denied</h3><p>You do not have permission to view this page.</p></div>;
    if (!settings) return <div className="container" style={{ padding: '6rem 0', textAlign: 'center' }}><h3>Loading System Data...</h3></div>;

    return (
        <div className="container" style={{ padding: '4rem 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2>{activeTab === 'hotel-settings' ? `Settings: ${configuringHotel?.name}` : 'Admin Dashboard'}</h2>
                <div className="admin-tabs" style={{ display: 'flex', gap: '10px' }}>
                    <button className={`btn ${activeTab === 'hotels' ? 'btn-primary' : 'btn-link'}`} onClick={() => { setActiveTab('hotels'); setConfiguringHotel(null); }}>Manage Hotels</button>
                    <button className={`btn ${activeTab === 'bookings' ? 'btn-primary' : 'btn-link'}`} onClick={() => { setActiveTab('bookings'); setConfiguringHotel(null); }}>View Bookings</button>
                    {activeTab === 'hotel-settings' && <button className="btn btn-primary">Configuration Mode</button>}
                </div>
            </div>

            {activeTab === 'hotels' ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: '3rem' }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '15px', height: 'fit-content', boxShadow: 'var(--shadow)' }}>
                        <h3>{editingHotel ? 'Edit Hotel' : 'Add New Hotel'}</h3>
                        <form className="auth-form" onSubmit={handleSubmitHotel} style={{ marginTop: '1rem' }}>
                            <div className="form-group">
                                <label>Hotel Name</label>
                                <input type="text" value={hotelForm.name} onChange={e => setHotelForm({ ...hotelForm, name: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>City</label>
                                <input type="text" value={hotelForm.city} onChange={e => setHotelForm({ ...hotelForm, city: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Price per Night (₹)</label>
                                <input type="number" value={hotelForm.price} onChange={e => setHotelForm({ ...hotelForm, price: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Image URL</label>
                                <input type="text" value={hotelForm.image} onChange={e => setHotelForm({ ...hotelForm, image: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #dfe6e9' }} value={hotelForm.description} onChange={e => setHotelForm({ ...hotelForm, description: e.target.value })} required />
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>{editingHotel ? 'Update' : 'Add'} Hotel</button>
                                {editingHotel && <button type="button" className="btn btn-link" style={{ flex: 1 }} onClick={resetForm}>Cancel</button>}
                            </div>
                        </form>
                    </div>

                    <div>
                        <h3>Existing Hotels</h3>
                        <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {hotels.map(h => (
                                <div key={h.id} style={{ background: 'white', padding: '1.2rem', borderRadius: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow)' }}>
                                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                        <img src={h.image} style={{ width: '60px', height: '60px', borderRadius: '10px', objectFit: 'cover' }} alt="" />
                                        <div>
                                            <div style={{ fontWeight: 700 }}>{h.name}</div>
                                            <div style={{ fontSize: '0.9rem', color: '#636e72' }}>{h.city} • ₹{h.price.toLocaleString('en-IN')}</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button className="btn btn-sm btn-link" title="Pricing & Compatibility" onClick={() => { setConfiguringHotel(h); setActiveTab('hotel-settings'); }}><Settings size={18} /></button>
                                        <button className="btn btn-sm btn-link" onClick={() => startEdit(h)}><Edit size={18} /></button>
                                        <button className="btn btn-sm btn-link" style={{ color: 'red' }} onClick={() => handleDeleteHotel(h.id)}><Trash2 size={18} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : activeTab === 'bookings' ? (
                <div>
                    <h3>All User Bookings</h3>
                    <div style={{ marginTop: '1.5rem' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '15px', overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
                            <thead>
                                <tr style={{ background: '#f8f9fa', textAlign: 'left' }}>
                                    <th style={{ padding: '1.2rem' }}>Booking ID</th>
                                    <th style={{ padding: '1.2rem' }}>Hotel</th>
                                    <th style={{ padding: '1.2rem' }}>Details</th>
                                    <th style={{ padding: '1.2rem' }}>Price</th>
                                    <th style={{ padding: '1.2rem' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allBookings.map(b => (
                                    <tr key={b.id} style={{ borderTop: '1px solid #dfe6e9' }}>
                                        <td style={{ padding: '1.2rem', fontSize: '0.9rem' }}>{b.id}</td>
                                        <td style={{ padding: '1.2rem' }}>
                                            <strong>{b.hotelName}</strong>
                                        </td>
                                        <td style={{ padding: '1.2rem', fontSize: '0.85rem' }}>
                                            <div>{b.checkIn} to {b.checkOut}</div>
                                            <div style={{ color: '#636e72' }}>{b.guests} Guests • {b.paymentMethod}</div>
                                        </td>
                                        <td style={{ padding: '1.2rem' }}>₹{b.price.toLocaleString('en-IN')}</td>
                                        <td style={{ padding: '1.2rem' }}>
                                            <span style={{ padding: '4px 10px', background: '#d1e7dd', color: '#0f5132', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 600 }}>Confirmed</span>
                                        </td>
                                    </tr>
                                ))}
                                {allBookings.length === 0 && (
                                    <tr>
                                        <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: '#636e72' }}>No bookings recorded yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : !tempSettings || !tempSettings.roomTypes ? (
                <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Configuration...</div>
            ) : (
                <div style={{ background: 'white', padding: '2rem', borderRadius: '20px', boxShadow: 'var(--shadow)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h3 style={{ margin: 0 }}>System Configuration</h3>
                        <button className="btn btn-primary" onClick={handleSaveSettings}><Save size={18} /> Save All Changes</button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        <div>
                            <h4 style={{ marginBottom: '1.5rem', color: '#c5a059' }}>Pricing & Capacity</h4>
                            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                <label>Extra Guest Surcharge (₹/night)</label>
                                <input type="number" value={tempSettings.extraGuestCharge} onChange={e => setTempSettings({ ...tempSettings, extraGuestCharge: parseInt(e.target.value) })} />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {tempSettings.roomTypes.map((rt, idx) => (
                                    <div key={rt.name} style={{ padding: '1rem', border: '1px solid #dfe6e9', borderRadius: '12px' }}>
                                        <div style={{ fontWeight: 700, marginBottom: '0.8rem' }}>{rt.name}</div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                            <div className="form-group">
                                                <label style={{ fontSize: '0.8rem' }}>Price Multiplier</label>
                                                <input type="number" step="0.1" value={rt.baseModifier} onChange={e => {
                                                    const newRTs = [...tempSettings.roomTypes];
                                                    newRTs[idx].baseModifier = parseFloat(e.target.value);
                                                    setTempSettings({ ...tempSettings, roomTypes: newRTs });
                                                }} />
                                            </div>
                                            <div className="form-group">
                                                <label style={{ fontSize: '0.8rem' }}>Max Guests</label>
                                                <input type="number" value={rt.maxGuests} onChange={e => {
                                                    const newRTs = [...tempSettings.roomTypes];
                                                    newRTs[idx].maxGuests = parseInt(e.target.value);
                                                    setTempSettings({ ...tempSettings, roomTypes: newRTs });
                                                }} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h4 style={{ marginBottom: '1.5rem', color: '#c5a059' }}>Availability Management</h4>
                            <p style={{ fontSize: '0.9rem', color: '#636e72', marginBottom: '1.5rem' }}>Toggle room type visibility for users across all hotel listings.</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                {tempSettings.roomTypes.map((rt, idx) => (
                                    <div key={rt.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#f8f9fa', borderRadius: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            {rt.available ? <CheckCircle size={18} color="green" /> : <XCircle size={18} color="red" />}
                                            <span style={{ fontWeight: 600 }}>{rt.name}</span>
                                        </div>
                                        <button className={`btn btn-sm ${rt.available ? 'btn-link' : 'btn-primary'}`} style={{ color: rt.available ? 'red' : 'white' }} onClick={() => {
                                            const newRTs = [...tempSettings.roomTypes];
                                            newRTs[idx].available = !newRTs[idx].available;
                                            setTempSettings({ ...tempSettings, roomTypes: newRTs });
                                        }}>
                                            {rt.available ? 'Disable' : 'Enable'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Main App ---
function App() {
    const [user, setUser] = useState(null);
    const [settings, setSettings] = useState(null);

    useEffect(() => {
        // Fetch Settings
        fetch('/api/settings')
            .then(res => res.json())
            .then(data => setSettings(data))
            .catch(err => console.error('Error fetching settings:', err));

        // Auto-login if token exists
        const token = localStorage.getItem('token');
        if (token) {
            const savedUser = JSON.parse(localStorage.getItem('user_info'));
            if (savedUser) setUser(savedUser);
        }
    }, []);

    const handleSetUser = (u) => {
        setUser(u);
        if (u) {
            localStorage.setItem('user_info', JSON.stringify(u));
        } else {
            localStorage.removeItem('user_info');
        }
    };

    return (
        <Router>
            <div className="app">
                <Navbar user={user} setUser={handleSetUser} />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login setUser={handleSetUser} />} />
                    <Route path="/register" element={<Register setUser={handleSetUser} />} />

                    <Route path="/hotel/:id" element={settings ? <HotelDetails user={user} settings={settings} /> : <div>Loading...</div>} />
                    <Route path="/bookings" element={<Bookings user={user} />} />
                    <Route path="/admin" element={<Admin user={user} settings={settings} setSettings={setSettings} />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
