import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL 
    ? (import.meta.env.VITE_API_URL.endsWith('/api') ? import.meta.env.VITE_API_URL : `${import.meta.env.VITE_API_URL}/api`)
    : (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:5000/api' : '/api');
const API = axios.create({ baseURL: API_URL });

API.interceptors.request.use((config) => {
    const token = localStorage.getItem('melodyverse_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Auth
export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);
export const getProfile = () => API.get('/auth/profile');
export const updateProfile = (data) => API.put('/auth/profile', data);
export const addToFavorites = (data) => API.post('/auth/favorites', data);
export const removeFromFavorites = (videoId) => API.delete(`/auth/favorites/${videoId}`);
export const addToRecentlyPlayed = (data) => API.post('/auth/recently-played', data);
export const createPlaylist = (data) => API.post('/auth/playlists', data);
export const addToPlaylist = (playlistId, data) => API.post(`/auth/playlists/${playlistId}/songs`, data);
export const deletePlaylist = (playlistId) => API.delete(`/auth/playlists/${playlistId}`);

// Music (YouTube)
export const searchMusic = (q, pageToken) => API.get('/music/search', { params: { q, pageToken } });
export const getTrending = (regionCode) => API.get('/music/trending', { params: { regionCode } });
export const getVideoDetails = (videoId) => API.get(`/music/video/${videoId}`);
export const getRelatedVideos = (videoId) => API.get(`/music/related/${videoId}`);
export const getByCategory = (category, pageToken) => API.get(`/music/category/${category}`, { params: { pageToken } });
export const getArtistMusic = (artistName, pageToken) => API.get(`/music/artist/${encodeURIComponent(artistName)}`, { params: { pageToken } });

// Public
export const getArtists = () => API.get('/public/artists');
export const getFeaturedArtists = () => API.get('/public/artists/featured');
export const getArtistById = (id) => API.get(`/public/artists/${id}`);
export const getCategories = () => API.get('/public/categories');

// Admin
export const getAdminDashboard = () => API.get('/admin/dashboard');
export const adminGetArtists = () => API.get('/admin/artists');
export const adminCreateArtist = (data) => API.post('/admin/artists', data);
export const adminUpdateArtist = (id, data) => API.put(`/admin/artists/${id}`, data);
export const adminDeleteArtist = (id) => API.delete(`/admin/artists/${id}`);
export const adminGetCategories = () => API.get('/admin/categories');
export const adminCreateCategory = (data) => API.post('/admin/categories', data);
export const adminUpdateCategory = (id, data) => API.put(`/admin/categories/${id}`, data);
export const adminDeleteCategory = (id) => API.delete(`/admin/categories/${id}`);
export const adminGetUsers = () => API.get('/admin/users');
export const adminDeleteUser = (id) => API.delete(`/admin/users/${id}`);
export const adminUpdateUserRole = (id, data) => API.put(`/admin/users/${id}/role`, data);

export default API;
