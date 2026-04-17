import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import SongCard from '../components/SongCard';
import { getByCategory } from '../services/api';

const CategoryPage = () => {
    const { name } = useParams();
    const decodedName = decodeURIComponent(name);
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [nextPage, setNextPage] = useState(null);

    useEffect(() => {
        setSongs([]);
        setError(null);
        loadSongs();
    }, [name]);

    const loadSongs = async (pageToken = null) => {
        if (!pageToken) setLoading(true);
        setError(null);
        try {
            const res = await getByCategory(decodedName, pageToken);
            const videos = res.data.videos || [];
            if (pageToken) {
                setSongs(prev => [...prev, ...videos]);
            } else {
                setSongs(videos);
            }
            setNextPage(res.data.nextPageToken);
        } catch (err) {
            console.error('Failed to load category:', err);
            setError(err.response?.data?.message || 'Failed to load songs. Check your YouTube API key.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loader"><div className="spinner"></div></div>;

    return (
        <div style={{ padding: '100px 32px 32px' }}>
            <div className="search-results-header" style={{ marginBottom: '32px' }}>
                <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '36px', fontWeight: 900 }}>
                    🎵 {decodedName}
                </h2>
                <p style={{ color: 'var(--text-dim)', marginTop: '8px' }}>
                    Explore the best {decodedName} music
                </p>
            </div>

            {error ? (
                <div className="empty-state" style={{ background: 'rgba(255,71,87,0.08)', border: '1px solid rgba(255,71,87,0.2)', borderRadius: '16px', padding: '40px' }}>
                    <div className="empty-icon">⚠️</div>
                    <h3>Could not load songs</h3>
                    <p style={{ color: 'var(--text-dim)', marginTop: '8px' }}>{error}</p>
                    <button
                        className="premium-outline-btn"
                        style={{ marginTop: '24px', padding: '12px 32px' }}
                        onClick={() => loadSongs()}
                    >
                        Try Again
                    </button>
                </div>
            ) : songs.length > 0 ? (
                <>
                    <div className="songs-grid">
                        {songs.map((song, i) => (
                            <SongCard key={`${song.videoId}-${i}`} song={song} songList={songs} animDelay={i} />
                        ))}
                    </div>
                    {nextPage && (
                        <div style={{ textAlign: 'center', marginTop: '32px' }}>
                            <button className="premium-outline-btn" style={{ padding: '14px 40px' }} onClick={() => loadSongs(nextPage)}>
                                Load More
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className="empty-state">
                    <div className="empty-icon">🎵</div>
                    <h3>No songs found</h3>
                    <p>Try a different genre</p>
                </div>
            )}
        </div>
    );
};

export default CategoryPage;
