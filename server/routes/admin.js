const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
    getDashboard, getAllArtists, createArtist, updateArtist, deleteArtist,
    getAllCategories, createCategory, updateCategory, deleteCategory,
    getAllUsers, deleteUser, updateUserRole, getFeaturedArtists
} = require('../controllers/adminController');

router.use(protect, adminOnly);

router.get('/dashboard', getDashboard);
router.get('/artists', getAllArtists);
router.post('/artists', createArtist);
router.put('/artists/:id', updateArtist);
router.delete('/artists/:id', deleteArtist);
router.get('/categories', getAllCategories);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/role', updateUserRole);
router.get('/featured-artists', getFeaturedArtists);

module.exports = router;
