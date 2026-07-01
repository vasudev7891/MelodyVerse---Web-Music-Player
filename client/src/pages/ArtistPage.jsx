import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import SongCard from '../components/SongCard';
import { getArtistById, getArtistMusic } from '../services/api';
import { LEGENDARY_ARTISTS } from '../constants/artists';

const ArtistPage = () => {
    const { id } = useParams();
    const [artist, setArtist] = useState(null);
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [nextPage, setNextPage] = useState(null);

    useEffect(() => {
        loadArtist();
    }, [id]);

    const loadArtist = async () => {
        setLoading(true);
        try {
            let a;
            try {
                const artistRes = await getArtistById(id);
                a = artistRes.data.artist;
            } catch (e) {
                a = LEGENDARY_ARTISTS.find(art => art._id === id);
            }
            if (!a) {
                a = LEGENDARY_ARTISTS.find(art => art._id === id);
            }
            setArtist(a);

            const musicRes = await getArtistMusic(a.searchQuery || a.name);
            setSongs(musicRes.data.videos || []);
            setNextPage(musicRes.data.nextPageToken);
        } catch (error) {
            console.error('Failed to load artist:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadMore = async () => {
        if (!nextPage || !artist) return;
        try {
            const res = await getArtistMusic(artist.searchQuery || artist.name, nextPage);
            setSongs(prev => [...prev, ...(res.data.videos || [])]);
            setNextPage(res.data.nextPageToken);
        } catch (e) { }
    };

    if (loading) return <div className="loader"><div className="spinner"></div></div>;
    if (!artist) return <div className="empty-state"><h3>Artist not found</h3></div>;

    return (
        <div className="page-container wide">
            <div className="artist-hero">
                <img
                    className="artist-hero-img"
                    src={artist.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(artist.name)}&background=6c5ce7&color=fff&size=300`}
                    alt={artist.name}
                    onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(artist.name)}&background=6c5ce7&color=fff&size=300`; }}
                />
                <div className="artist-hero-info">
                    <h1>{artist.name}</h1>
                    {artist.era && <div className="artist-era">🕐 {artist.era} • {artist.nationality}</div>}
                    {artist.bio && <p className="artist-bio">{artist.bio}</p>}
                    <div className="artist-genres">
                        {artist.genre?.map(g => <span key={g} className="genre-tag">{g}</span>)}
                    </div>
                </div>
            </div>

            <div className="section">
                <div className="section-header">
                    <h2 className="section-title"><span className="emoji">🎵</span> Songs by {artist.name}</h2>
                </div>
                {songs.length > 0 ? (
                    <>
                        <div className="songs-grid">
                            {songs.map((song, i) => (
                                <SongCard key={`${song.videoId}-${i}`} song={song} songList={songs} animDelay={i} />
                            ))}
                        </div>
                        {nextPage && (
                            <div style={{ textAlign: 'center', marginTop: '32px' }}>
                                <button className="hero-btn" onClick={loadMore} style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-glass)' }}>
                                    Load More Songs
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="empty-state">
                        <div className="empty-icon">🎵</div>
                        <h3>No songs found</h3>
                        <p>Try searching for this artist</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ArtistPage;
