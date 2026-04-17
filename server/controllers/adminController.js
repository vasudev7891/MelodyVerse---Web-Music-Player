const Artist = require('../models/Artist');
const Category = require('../models/Category');
const User = require('../models/User');

exports.getDashboard = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalArtists = await Artist.countDocuments();
        const totalCategories = await Category.countDocuments();
        const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select('name email createdAt role');
        res.json({
            success: true,
            stats: { totalUsers, totalArtists, totalCategories },
            recentUsers
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Artists CRUD
exports.getAllArtists = async (req, res) => {
    try {
        const artists = await Artist.find().sort({ name: 1 });
        res.json({ success: true, artists });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createArtist = async (req, res) => {
    try {
        const artist = await Artist.create(req.body);
        res.status(201).json({ success: true, artist });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateArtist = async (req, res) => {
    try {
        const artist = await Artist.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!artist) return res.status(404).json({ success: false, message: 'Artist not found' });
        res.json({ success: true, artist });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteArtist = async (req, res) => {
    try {
        await Artist.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Artist deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Categories CRUD
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find({ isActive: true }).sort({ name: 1 });
        res.json({ success: true, categories });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createCategory = async (req, res) => {
    try {
        const category = await Category.create(req.body);
        res.status(201).json({ success: true, category });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
        res.json({ success: true, category });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Category deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Users management
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json({ success: true, users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateUserRole = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true });
        res.json({ success: true, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getFeaturedArtists = async (req, res) => {
    try {
        const artists = await Artist.find({ featured: true }).sort({ name: 1 });
        res.json({ success: true, artists });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
