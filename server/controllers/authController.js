const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email already registered' });
        }
        const user = await User.create({ name, email, password });
        const token = generateToken(user._id);
        res.status(201).json({
            success: true,
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
        const token = generateToken(user._id);
        res.json({
            success: true,
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.json({
            success: true,
            user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, favorites: user.favorites, playlists: user.playlists, recentlyPlayed: user.recentlyPlayed }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { name, avatar } = req.body;
        const user = await User.findByIdAndUpdate(req.user._id, { name, avatar }, { new: true });
        res.json({
            success: true,
            user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.addToFavorites = async (req, res) => {
    try {
        const { videoId, title, thumbnail, channelTitle } = req.body;
        const user = await User.findById(req.user._id);
        const exists = user.favorites.find(f => f.videoId === videoId);
        if (exists) {
            return res.status(400).json({ success: false, message: 'Already in favorites' });
        }
        user.favorites.unshift({ videoId, title, thumbnail, channelTitle });
        await user.save();
        res.json({ success: true, favorites: user.favorites });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.removeFromFavorites = async (req, res) => {
    try {
        const { videoId } = req.params;
        const user = await User.findById(req.user._id);
        user.favorites = user.favorites.filter(f => f.videoId !== videoId);
        await user.save();
        res.json({ success: true, favorites: user.favorites });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.addToRecentlyPlayed = async (req, res) => {
    try {
        const { videoId, title, thumbnail, channelTitle } = req.body;
        const user = await User.findById(req.user._id);
        user.recentlyPlayed = user.recentlyPlayed.filter(r => r.videoId !== videoId);
        user.recentlyPlayed.unshift({ videoId, title, thumbnail, channelTitle });
        if (user.recentlyPlayed.length > 50) user.recentlyPlayed = user.recentlyPlayed.slice(0, 50);
        await user.save();
        res.json({ success: true, recentlyPlayed: user.recentlyPlayed });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createPlaylist = async (req, res) => {
    try {
        const { name, description } = req.body;
        const user = await User.findById(req.user._id);
        user.playlists.push({ name, description, songs: [] });
        await user.save();
        res.status(201).json({ success: true, playlists: user.playlists });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.addToPlaylist = async (req, res) => {
    try {
        const { playlistId } = req.params;
        const { videoId, title, thumbnail, channelTitle } = req.body;
        const user = await User.findById(req.user._id);
        const playlist = user.playlists.id(playlistId);
        if (!playlist) {
            return res.status(404).json({ success: false, message: 'Playlist not found' });
        }
        const exists = playlist.songs.find(s => s.videoId === videoId);
        if (exists) {
            return res.status(400).json({ success: false, message: 'Song already in playlist' });
        }
        playlist.songs.push({ videoId, title, thumbnail, channelTitle });
        await user.save();
        res.json({ success: true, playlist });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deletePlaylist = async (req, res) => {
    try {
        const { playlistId } = req.params;
        const user = await User.findById(req.user._id);
        user.playlists = user.playlists.filter(p => p._id.toString() !== playlistId);
        await user.save();
        res.json({ success: true, playlists: user.playlists });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
