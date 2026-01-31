const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs-extra');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const SECRET_KEY = process.env.JWT_SECRET || 'tamilnadu_hotel_secret_key_2024';

app.use(cors());
app.use(express.json());

const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const HOTELS_FILE = path.join(DATA_DIR, 'hotels.json');
const BOOKINGS_FILE = path.join(DATA_DIR, 'bookings.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

// Ensure data directory and files exist
const initDB = async () => {
    await fs.ensureDir(DATA_DIR);
    if (!await fs.pathExists(USERS_FILE)) await fs.writeJson(USERS_FILE, []);
    if (!await fs.pathExists(HOTELS_FILE)) await fs.writeJson(HOTELS_FILE, []);
    if (!await fs.pathExists(BOOKINGS_FILE)) await fs.writeJson(BOOKINGS_FILE, []);

    if (!await fs.pathExists(SETTINGS_FILE)) {
        await fs.writeJson(SETTINGS_FILE, {
            roomTypes: [
                { name: 'Single Room', baseModifier: 1.0, maxGuests: 1, available: true },
                { name: 'Double Room', baseModifier: 1.5, maxGuests: 2, available: true },
                { name: 'Deluxe Room', baseModifier: 2.2, maxGuests: 3, available: true },
                { name: 'Suite', baseModifier: 3.5, maxGuests: 4, available: true }
            ],
            extraGuestCharge: 1000
        });
    }

    // Seed Admin from Env
    const users = await fs.readJson(USERS_FILE);
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPass = process.env.ADMIN_PASSWORD;

    if (adminEmail && adminPass) {
        const adminIndex = users.findIndex(u => u.email === adminEmail);
        const hashedAdminPass = await bcrypt.hash(adminPass, 10);

        if (adminIndex === -1) {
            console.log('Seeding Admin User...');
            users.push({
                id: 'admin_1',
                name: 'System Admin',
                email: adminEmail,
                password: hashedAdminPass,
                role: 'admin'
            });
            await fs.writeJson(USERS_FILE, users);
        } else {
            // Update admin password if it changed in env
            const adminUser = users[adminIndex];
            const isMatch = await bcrypt.compare(adminPass, adminUser.password);
            if (!isMatch) {
                console.log('Updating Admin Password from Env...');
                users[adminIndex].password = hashedAdminPass;
                await fs.writeJson(USERS_FILE, users);
            }
        }
    }

    // Migration: Ensure all hotels have settings
    const hotels = await fs.readJson(HOTELS_FILE);
    const defaultSettings = await fs.readJson(SETTINGS_FILE);
    let migrated = false;

    const migratedHotels = hotels.map(hotel => {
        if (!hotel.settings) {
            console.log(`Migrating hotel "${hotel.name}" to include per-hotel settings...`);
            migrated = true;
            return { ...hotel, settings: JSON.parse(JSON.stringify(defaultSettings)) };
        }
        return hotel;
    });

    if (migrated) {
        await fs.writeJson(HOTELS_FILE, migratedHotels);
    }
};

initDB();

// --- Auth Routes ---
app.post('/api/auth/register', async (req, res) => {
    const { name, email, password } = req.body; // Removed role destructuring
    const users = await fs.readJson(USERS_FILE);

    if (users.find(u => u.email === email)) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    // Force role to 'user' always. Admin must be created via .env
    const newUser = { id: Date.now(), name, email, password: hashedPassword, role: 'user' };
    users.push(newUser);
    await fs.writeJson(USERS_FILE, users);

    const token = jwt.sign({ id: newUser.id, role: newUser.role }, SECRET_KEY);
    res.status(201).json({ token, user: { id: newUser.id, name, email, role: newUser.role } });
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const users = await fs.readJson(USERS_FILE);
    const user = users.find(u => u.email === email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY);
    res.json({ token, user: { id: user.id, name: user.name, email, role: user.role } });
});

// --- Hotel Routes ---
app.get('/api/hotels', async (req, res) => {
    const hotels = await fs.readJson(HOTELS_FILE);
    res.json(hotels);
});

app.get('/api/ping', (req, res) => {
    res.json({ time: Date.now(), msg: 'Server is LIVE and UPDATED' });
});

// Admin Hotel Management (Mock Middleware for now)
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
    console.log(`Admin Check: User ${req.user.id} has role ${req.user.role}`);
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
    next();
};

app.post('/api/hotels', authMiddleware, adminMiddleware, async (req, res) => {
    const hotels = await fs.readJson(HOTELS_FILE);
    const defaultSettings = await fs.readJson(SETTINGS_FILE);
    const newHotel = {
        id: Date.now(),
        ...req.body,
        settings: JSON.parse(JSON.stringify(defaultSettings)) // Initialize with default settings
    };
    hotels.push(newHotel);
    await fs.writeJson(HOTELS_FILE, hotels);
    res.status(201).json(newHotel);
});

app.put('/api/hotels/:id', authMiddleware, adminMiddleware, async (req, res) => {
    const targetId = String(req.params.id).trim();
    console.log(`Searching for hotel with ID: "${targetId}"`);
    const hotels = await fs.readJson(HOTELS_FILE);
    console.log('Available IDs:', hotels.map(h => `"${h.id}"`).join(', '));

    const index = hotels.findIndex(h => String(h.id).trim() === targetId);

    if (index === -1) {
        console.log('Hotel NOT found in list.');
        return res.status(404).json({ message: 'Hotel not found' });
    }

    console.log('Hotel found! Updating...');
    const updates = { ...req.body };
    if (updates.price) updates.price = Number(updates.price);

    hotels[index] = { ...hotels[index], ...updates, id: hotels[index].id };
    await fs.writeJson(HOTELS_FILE, hotels);
    res.json(hotels[index]);
});

app.delete('/api/hotels/:id', authMiddleware, adminMiddleware, async (req, res) => {
    const hotels = await fs.readJson(HOTELS_FILE);
    const filtered = hotels.filter(h => h.id !== parseInt(req.params.id));
    await fs.writeJson(HOTELS_FILE, filtered);
    res.json({ message: 'Hotel deleted' });
});

app.get('/api/admin/bookings', authMiddleware, adminMiddleware, async (req, res) => {
    const bookings = await fs.readJson(BOOKINGS_FILE);
    res.json(bookings);
});

app.post('/api/bookings', authMiddleware, async (req, res) => {
    const bookings = await fs.readJson(BOOKINGS_FILE);
    const { hotelId, hotelName, price, checkIn, checkOut, guests, paymentMethod } = req.body;
    const newBooking = {
        id: Date.now(),
        userId: req.user.id,
        hotelId,
        hotelName,
        price,
        checkIn,
        checkOut,
        guests,
        paymentMethod,
        status: 'confirmed',
        bookingDate: new Date().toISOString()
    };
    bookings.push(newBooking);
    await fs.writeJson(BOOKINGS_FILE, bookings);
    res.status(201).json(newBooking);
});

app.get('/api/bookings/my', authMiddleware, async (req, res) => {
    const bookings = await fs.readJson(BOOKINGS_FILE);
    const userBookings = bookings.filter(b => b.userId === req.user.id);
    res.json(userBookings);
});

// --- Settings Routes ---
app.get('/api/settings', async (req, res) => {
    const settings = await fs.readJson(SETTINGS_FILE);
    res.json(settings);
});

app.put('/api/settings', authMiddleware, adminMiddleware, async (req, res) => {
    await fs.writeJson(SETTINGS_FILE, req.body);
    res.json({ message: 'Settings updated successfully' });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
