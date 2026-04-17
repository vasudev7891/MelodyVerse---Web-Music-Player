import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlay } from 'react-icons/fi';
import { getArtists } from '../services/api';
import { LEGENDARY_ARTISTS, INDIAN_LEGENDS, MODERN_STARS, INTERNATIONAL_ICONS } from '../constants/artists';

const Artists = () => {
    const [artists, setArtists] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadArtists();
    }, []);

    const loadArtists = async () => {
        try {
            const res = await getArtists();
            const artistsData = res.data.artists || [];
            setArtists(artistsData.length > 0 ? artistsData : LEGENDARY_ARTISTS);
        } catch (error) {
            console.error('Failed to load artists:', error);
            setArtists(LEGENDARY_ARTISTS);
        } finally {
            setLoading(false);
        }
    };

    const renderArtistGrid = (items, title, emoji) => (
        <div className="fw-section" style={{ padding: '40px 0' }}>
            <div className="section-header">
                <h2 className="section-title"><span className="emoji">{emoji}</span> {title}</h2>
            </div>
            <div className="artists-grid">
                {items.map((artist, i) => (
                    <div
                        key={artist._id}
                        className="artist-card animate-in"
                        style={{ animationDelay: `${i * 0.06}s` }}
                        onClick={() => navigate(`/artist/${artist._id || artist.name}`)}
                    >
                        <img
                            className="artist-card-img"
                            src={artist.image}
                            alt={artist.name}
                            loading="lazy"
                            onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(artist.name)}&background=6c5ce7&color=fff&size=200`; }}
                        />
                        <div className="artist-card-overlay">
                            <div className="artist-card-name">{artist.name}</div>
                        </div>
                        <button className="artist-play-btn"><FiPlay /></button>
                    </div>
                ))}
            </div>
        </div>
    );

    if (loading) return <div className="loader"><div className="spinner"></div></div>;

    return (
        <div style={{ padding: '40px' }}>
            <div className="search-results-header">
                <h1 style={{ fontSize: '42px', fontWeight: 900 }}>Legendary Artists</h1>
                <p>The greatest voices in musical history, curated for you.</p>
            </div>

            {renderArtistGrid(INDIAN_LEGENDS, "Indian Musical Legends", "⭐")}
            {renderArtistGrid(MODERN_STARS, "Modern Contemporary Stars", "✨")}
            {renderArtistGrid(INTERNATIONAL_ICONS, "International Icons", "🌍")}
        </div>
    );
};

export default Artists;
