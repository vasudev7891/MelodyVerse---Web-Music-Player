const express = require('express');
const router = express.Router();
const { register, login, getProfile, updateProfile, addToFavorites, removeFromFavorites, addToRecentlyPlayed, createPlaylist, addToPlaylist, deletePlaylist } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/favorites', protect, addToFavorites);
router.delete('/favorites/:videoId', protect, removeFromFavorites);
router.post('/recently-played', protect, addToRecentlyPlayed);
router.post('/playlists', protect, createPlaylist);
router.post('/playlists/:playlistId/songs', protect, addToPlaylist);
router.delete('/playlists/:playlistId', protect, deletePlaylist);

module.exports = router;
