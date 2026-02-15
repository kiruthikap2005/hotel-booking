const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs-extra');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const SECRET_KEY = process.env.JWT_SECRET || 'tamilnadu_hotel_secret_key_2024';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hotelDB';

app.use(cors());
app.use(express.json());

// --- MongoDB Connectivity ---
mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// --- Schemas & Models ---
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' }
});
const User = mongoose.model('User', UserSchema);

const HotelSchema = new mongoose.Schema({
    name: { type: String, required: true },
    city: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    description: { type: String, required: true },
    settings: {
        roomTypes: [
            { name: String, baseModifier: Number, maxGuests: Number, available: Boolean }
        ],
        extraGuestCharge: Number
    }
});
const Hotel = mongoose.model('Hotel', HotelSchema);

const BookingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
    hotelName: String,
    price: Number,
    checkIn: String,
    checkOut: String,
    guests: Number,
    paymentMethod: String,
    status: { type: String, default: 'confirmed' },
    bookingDate: { type: Date, default: Date.now }
});
const Booking = mongoose.model('Booking', BookingSchema);

const SettingsSchema = new mongoose.Schema({
    key: { type: String, default: 'global' },
    roomTypes: [
        { name: String, baseModifier: Number, maxGuests: Number, available: Boolean }
    ],
    extraGuestCharge: Number
});
const Settings = mongoose.model('Settings', SettingsSchema);

// --- Data Migration & Initialization ---
const initDB = async () => {
    try {
        // Migration: Settings
        let globalSettings = await Settings.findOne({ key: 'global' });
        if (!globalSettings) {
            console.log('Initializing Global Settings...');
            const SETTINGS_FILE = path.join(__dirname, 'data', 'settings.json');
            let initialSettings = {
                roomTypes: [
                    { name: 'Single Room', baseModifier: 1.0, maxGuests: 1, available: true },
                    { name: 'Double Room', baseModifier: 1.5, maxGuests: 2, available: true },
                    { name: 'Deluxe Room', baseModifier: 2.2, maxGuests: 3, available: true },
                    { name: 'Suite', baseModifier: 3.5, maxGuests: 4, available: true }
                ],
                extraGuestCharge: 1000
            };

            if (await fs.pathExists(SETTINGS_FILE)) {
                initialSettings = await fs.readJson(SETTINGS_FILE);
            }
            globalSettings = await Settings.create({ key: 'global', ...initialSettings });
        }

        // Migration: Users
        const userCount = await User.countDocuments();
        if (userCount === 0) {
            const USERS_FILE = path.join(__dirname, 'data', 'users.json');
            if (await fs.pathExists(USERS_FILE)) {
                console.log('Migrating Users from JSON...');
                const users = await fs.readJson(USERS_FILE);
                for (const u of users) {
                    await User.create({ name: u.name, email: u.email, password: u.password, role: u.role });
                }
            }
        }

        // Seed Admin from Env
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPass = process.env.ADMIN_PASSWORD;
        if (adminEmail && adminPass) {
            const admin = await User.findOne({ email: adminEmail });
            const hashedAdminPass = await bcrypt.hash(adminPass, 10);
            if (!admin) {
                console.log('Seeding Admin User...');
                await User.create({ name: 'System Admin', email: adminEmail, password: hashedAdminPass, role: 'admin' });
            } else {
                const isMatch = await bcrypt.compare(adminPass, admin.password);
                if (!isMatch) {
                    console.log('Updating Admin Password from Env...');
                    admin.password = hashedAdminPass;
                    await admin.save();
                }
            }
        }

        // Migration: Hotels
        const hotelCount = await Hotel.countDocuments();
        if (hotelCount === 0) {
            const HOTELS_FILE = path.join(__dirname, 'data', 'hotels.json');
            if (await fs.pathExists(HOTELS_FILE)) {
                console.log('Migrating Hotels from JSON...');
                const hotels = await fs.readJson(HOTELS_FILE);
                for (const h of hotels) {
                    if (!h.settings) h.settings = JSON.parse(JSON.stringify(globalSettings));
                    await Hotel.create({ name: h.name, city: h.city, price: h.price, image: h.image, description: h.description, settings: h.settings });
                }
            }
        }

        // Migration: Bookings (Note: ID mapping would be complex, typically skipped for manual migrations unless using UUIDs)
        console.log('Database Initialization Complete.');
    } catch (err) {
        console.error('Initialization Error:', err);
    }
};

initDB();

// --- Auth Routes ---
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (await User.findOne({ email })) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ name, email, password: hashedPassword, role: 'user' });
        const token = jwt.sign({ id: newUser._id, role: newUser.role }, SECRET_KEY);
        res.status(201).json({ token, user: { id: newUser._id, name, email, role: newUser.role } });
    } catch (err) {
        res.status(500).json({ message: 'Registration failed' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign({ id: user._id, role: user.role }, SECRET_KEY);
        res.json({ token, user: { id: user._id, name: user.name, email, role: user.role } });
    } catch (err) {
        res.status(500).json({ message: 'Login failed' });
    }
});

// --- Hotel Routes ---
app.get('/api/hotels', async (req, res) => {
    const hotels = await Hotel.find();
    res.json(hotels.map(h => ({ ...h.toObject(), id: h._id })));
});

app.get('/api/ping', (req, res) => {
    res.json({ time: Date.now(), msg: 'Server is LIVE and connected to MongoDB' });
});

app.get('/', (req, res) => {
    res.send('<h1>TN Stay Backend API</h1><p>The server is running! Use <code>/api/ping</code> to verify connectivity.</p>');
});

// --- Middlewares ---
const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token' });
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded;
        next();
    } catch (e) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

const adminMiddleware = (req, res, next) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
    next();
};

// --- Admin Hotel Management ---
app.post('/api/hotels', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const globalSettings = await Settings.findOne({ key: 'global' });
        const newHotel = await Hotel.create({
            ...req.body,
            settings: req.body.settings || globalSettings.toObject()
        });
        res.status(201).json({ ...newHotel.toObject(), id: newHotel._id });
    } catch (err) {
        res.status(500).json({ message: 'Failed to add hotel' });
    }
});

app.put('/api/hotels/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!hotel) return res.status(404).json({ message: 'Hotel not found' });
        res.json({ ...hotel.toObject(), id: hotel._id });
    } catch (err) {
        res.status(500).json({ message: 'Update failed' });
    }
});

app.delete('/api/hotels/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        await Hotel.findByIdAndDelete(req.params.id);
        res.json({ message: 'Hotel deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Delete failed' });
    }
});

// --- Booking Routes ---
app.get('/api/admin/bookings', authMiddleware, adminMiddleware, async (req, res) => {
    const bookings = await Booking.find();
    res.json(bookings.map(b => ({ ...b.toObject(), id: b._id })));
});

app.post('/api/bookings', authMiddleware, async (req, res) => {
    try {
        const newBooking = await Booking.create({
            ...req.body,
            userId: req.user.id
        });
        res.status(201).json({ ...newBooking.toObject(), id: newBooking._id });
    } catch (err) {
        res.status(500).json({ message: 'Booking failed' });
    }
});

app.get('/api/bookings/my', authMiddleware, async (req, res) => {
    const bookings = await Booking.find({ userId: req.user.id });
    res.json(bookings.map(b => ({ ...b.toObject(), id: b._id })));
});

// --- Settings Routes ---
app.get('/api/settings', async (req, res) => {
    const settings = await Settings.findOne({ key: 'global' });
    res.json(settings);
});

app.put('/api/settings', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const settings = await Settings.findOneAndUpdate({ key: 'global' }, req.body, { new: true });
        res.json({ message: 'Settings updated successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Settings update failed' });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
