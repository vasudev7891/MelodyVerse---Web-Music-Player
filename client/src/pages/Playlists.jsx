import { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiMusic } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { getProfile, createPlaylist, deletePlaylist } from '../services/api';
import { useMusic } from '../context/MusicContext';
import SongCard from '../components/SongCard';
import toast from 'react-hot-toast';


const Playlists = () => {
    const { user } = useAuth();
    const { playVideo } = useMusic();
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [newName, setNewName] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [expandedPlaylist, setExpandedPlaylist] = useState(null);

    useEffect(() => {
        if (user) loadData();
        else setLoading(false);
    }, [user]);

    const loadData = async () => {
        try {
            const res = await getProfile();
            setPlaylists(res.data.user.playlists || []);
        } catch (e) { } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!newName.trim()) return;
        try {
            const res = await createPlaylist({ name: newName, description: newDesc });
            setPlaylists(res.data.playlists);
            setNewName(''); setNewDesc(''); setShowCreate(false);
            toast.success('Playlist created! 🎵');
        } catch (e) {
            toast.error('Failed to create playlist');
        }
    };

    const handleDelete = async (playlistId) => {
        try {
            const res = await deletePlaylist(playlistId);
            setPlaylists(res.data.playlists);
            toast.success('Playlist deleted');
        } catch (e) {
            toast.error('Failed to delete');
        }
    };

    if (!user) {
        return (
            <div className="empty-state">
                <div className="empty-icon">🔒</div>
                <h3>Login Required</h3>
                <p>Please login to manage playlists</p>
            </div>
        );
    }

    if (loading) return <div className="loader"><div className="spinner"></div></div>;

    return (
        <div className="page-container wide">
            <div className="search-results-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h2>🎶 Your Playlists</h2>
                    <p>{playlists.length} playlists</p>
                </div>
                <button className="admin-add-btn" onClick={() => setShowCreate(!showCreate)}>
                    <FiPlus /> New Playlist
                </button>
            </div>

            {showCreate && (
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-lg)', padding: '24px', marginBottom: '24px', animation: 'scaleIn 0.3s ease' }}>
                    <div className="form-group">
                        <label className="form-label">Playlist Name</label>
                        <input className="form-input" value={newName} onChange={e => setNewName(e.target.value)} placeholder="My Awesome Playlist" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Description (optional)</label>
                        <input className="form-input" value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="A collection of..." />
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="form-btn" onClick={handleCreate} style={{ width: 'auto', padding: '10px 24px' }}>Create</button>
                        <button className="navbar-btn ghost" onClick={() => setShowCreate(false)}>Cancel</button>
                    </div>
                </div>
            )}

            {playlists.length > 0 ? (
                <div style={{ display: 'grid', gap: '16px' }}>
                    {playlists.map((pl, i) => (
                        <div key={pl._id} className="animate-in" style={{
                            animationDelay: `${i * 0.05}s`,
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border-glass)',
                            borderRadius: 'var(--radius-lg)',
                            padding: '20px',
                            cursor: 'pointer',
                            transition: 'var(--transition)',
                        }} onClick={() => setExpandedPlaylist(expandedPlaylist === pl._id ? null : pl._id)}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h3 style={{ fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <FiMusic style={{ color: 'var(--accent-primary)' }} /> {pl.name}
                                    </h3>
                                    {pl.description && <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>{pl.description}</p>}
                                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{pl.songs?.length || 0} songs</p>
                                </div>
                                <button className="admin-action-btn delete" onClick={(e) => { e.stopPropagation(); handleDelete(pl._id); }}>
                                    <FiTrash2 /> Delete
                                </button>
                            </div>
                            {expandedPlaylist === pl._id && pl.songs?.length > 0 && (
                                <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
                                    {pl.songs.map((song, j) => (
                                        <SongCard key={`${song.videoId}-${j}`} song={song} songList={pl.songs} animDelay={j} />
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <div className="empty-icon">📝</div>
                    <h3>No playlists yet</h3>
                    <p>Create your first playlist!</p>
                </div>
            )}
        </div>
    );
};

export default Playlists;
