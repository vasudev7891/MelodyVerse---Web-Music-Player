import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProfile } from '../services/api';
import SongCard from '../components/SongCard';
import { FiClock } from 'react-icons/fi';

const Recents = () => {
    const { user, setShowAuthModal, setAuthMode } = useAuth();
    const [recentlyPlayed, setRecentlyPlayed] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) loadRecents();
        else setLoading(false);
    }, [user]);

    const loadRecents = async () => {
        try {
            const res = await getProfile();
            setRecentlyPlayed(res.data.user.recentlyPlayed || []);
        } catch (e) {
            console.error('Failed to load recently played');
        } finally {
            setLoading(false);
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
                    <p>Please login to view your recently played songs</p>
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
                <h2><FiClock style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Recently Played</h2>
                <p>{recentlyPlayed.length} songs in your history</p>
            </div>

            {recentlyPlayed.length > 0 ? (
                <div className="songs-grid">
                    {recentlyPlayed.map((song, i) => (
                        <SongCard key={`recent-${song.videoId}-${i}`} song={song} songList={recentlyPlayed} animDelay={i} />
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <div className="empty-icon">🎵</div>
                    <h3>No recent plays</h3>
                    <p>Songs you play will appear here — start listening!</p>
                </div>
            )}
        </div>
    );
};

export default Recents;
