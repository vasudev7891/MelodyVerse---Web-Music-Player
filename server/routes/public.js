// Public routes for fetching artists and categories without admin auth
const express = require('express');
const router = express.Router();
const Artist = require('../models/Artist');
const Category = require('../models/Category');

router.get('/artists', async (req, res) => {
    try {
        const artists = await Artist.find().sort({ name: 1 });
        res.json({ success: true, artists });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/artists/featured', async (req, res) => {
    try {
        const artists = await Artist.find({ featured: true }).sort({ name: 1 });
        res.json({ success: true, artists });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/artists/:id', async (req, res) => {
    try {
        const artist = await Artist.findById(req.params.id);
        if (!artist) return res.status(404).json({ success: false, message: 'Artist not found' });
        res.json({ success: true, artist });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/categories', async (req, res) => {
    try {
        const categories = await Category.find({ isActive: true }).sort({ name: 1 });
        res.json({ success: true, categories });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
