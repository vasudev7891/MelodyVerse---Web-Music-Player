require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');

const authRoutes = require('./routes/auth');
const musicRoutes = require('./routes/music');
const adminRoutes = require('./routes/admin');
const publicRoutes = require('./routes/public');
const aiRoutes = require('./routes/ai');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
    origin: '*', // Allow all for now to debug, can restrict later
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// API Routes (Prefixed with /api)
app.use('/api/auth', authRoutes);
app.use('/api/music', musicRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/ai', aiRoutes);

// SERVE STATIC ASSETS & SPA ROUTING (Only in Production mode)
// Note: This must come AFTER API routes
if (process.env.NODE_ENV === 'production' || true) {
    const distPath = path.join(__dirname, '../client/dist');
    app.use(express.static(distPath));
    
    app.get('*', (req, res) => {
        // Only serve index.html for non-API requests
        if (!req.path.startsWith('/api')) {
            res.sendFile(path.resolve(distPath, 'index.html'));
        }
    });
}

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🎵 MelodyVerse Server running on port ${PORT}`);
});
