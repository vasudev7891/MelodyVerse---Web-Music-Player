const express = require('express');
const router = express.Router();
const { searchMusic, getTrending, getVideoDetails, getRelatedVideos, getByCategory, getArtistMusic } = require('../controllers/musicController');

router.get('/search', searchMusic);
router.get('/trending', getTrending);
router.get('/video/:videoId', getVideoDetails);
router.get('/related/:videoId', getRelatedVideos);
router.get('/category/:category', getByCategory);
router.get('/artist/:artistName', getArtistMusic);

module.exports = router;
