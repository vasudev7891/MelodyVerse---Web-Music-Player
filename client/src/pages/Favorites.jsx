import { useState, useEffect } from 'react';
import { FiHeart, FiTrash2 } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useMusic } from '../context/MusicContext';
import { getProfile, removeFromFavorites } from '../services/api';
import toast from 'react-hot-toast';
import SongCard from '../components/SongCard';

const Favorites = () => {
    const { user, loadUser, setShowAuthModal, setAuthMode } = useAuth();
    const [favorites, setFavorites] = useState([]);
    const [recentlyPlayed, setRecentlyPlayed] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) loadData();
        else setLoading(false);
    }, [user]);

    const loadData = async () => {
        try {
            const res = await getProfile();
            setFavorites(res.data.user.favorites || []);
            setRecentlyPlayed(res.data.user.recentlyPlayed || []);
        } catch (e) {
            console.error('Failed to load favorites');
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (videoId) => {
        try {
            await removeFromFavorites(videoId);
            setFavorites(prev => prev.filter(f => f.videoId !== videoId));
            toast.success('Removed from favorites');
        } catch (e) {
            toast.error('Failed to remove');
        }
    };

    if (!user) {
        return (
            <div className="page-container wide">
                <div className="empty-state animate-in">
                    <div className="empty-icon-wrapper">
                        <div className="empty-icon-glow"></div>
                        <span className="empty-icon">🔒</span>
                    </div>
                    <h3>Login Required</h3>
                    <p>Please login to view your favorites</p>
                    <button className="premium-play-btn empty-btn" onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}>
                        Sign In
                    </button>
                </div>
            </div>
        );
    }

    if (loading) return <div className="loader"><div className="spinner"></div></div>;

    return (
        <div className="page-container wide">
            <div className="search-results-header">
                <h2>❤️ Your Favorites</h2>
                <p>{favorites.length} songs saved</p>
            </div>

            {favorites.length > 0 ? (
                <div className="songs-grid">
                    {favorites.map((song, i) => (
                        <SongCard key={`${song.videoId}-${i}`} song={song} songList={favorites} animDelay={i} />
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <div className="empty-icon">💔</div>
                    <h3>No favorites yet</h3>
                    <p>Start adding songs you love!</p>
                </div>
            )}

            {recentlyPlayed.length > 0 && (
                <div className="section" style={{ marginTop: '48px' }}>
                    <div className="section-header">
                        <h2 className="section-title"><span className="emoji">🕐</span> Recently Played</h2>
                    </div>
                    <div className="songs-grid">
                        {recentlyPlayed.slice(0, 12).map((song, i) => (
                            <SongCard key={`recent-${song.videoId}-${i}`} song={song} songList={recentlyPlayed} animDelay={i} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Favorites;
