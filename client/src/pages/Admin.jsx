import { useState, useEffect } from 'react';
import { FiUsers, FiMusic, FiGrid, FiTrendingUp, FiTrash2, FiEdit, FiPlus } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { getAdminDashboard, adminGetArtists, adminDeleteArtist, adminCreateArtist, adminGetCategories, adminDeleteCategory, adminCreateCategory, adminGetUsers, adminDeleteUser, adminUpdateUserRole } from '../services/api';
import toast from 'react-hot-toast';

const Admin = () => {
    const { user } = useAuth();
    const [tab, setTab] = useState('dashboard');
    const [stats, setStats] = useState({});
    const [artists, setArtists] = useState([]);
    const [categories, setCategories] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ name: '', bio: '', genre: '', image: '', searchQuery: '', featured: true });

    useEffect(() => {
        if (user?.role === 'admin') loadTab(tab);
    }, [tab, user]);

    const loadTab = async (t) => {
        setLoading(true);
        try {
            if (t === 'dashboard') {
                const res = await getAdminDashboard();
                setStats(res.data.stats);
            } else if (t === 'artists') {
                const res = await adminGetArtists();
                setArtists(res.data.artists || []);
            } else if (t === 'categories') {
                const res = await adminGetCategories();
                setCategories(res.data.categories || []);
            } else if (t === 'users') {
                const res = await adminGetUsers();
                setUsers(res.data.users || []);
            }
        } catch (e) {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteArtist = async (id) => {
        if (!confirm('Delete this artist?')) return;
        try {
            await adminDeleteArtist(id);
            setArtists(prev => prev.filter(a => a._id !== id));
            toast.success('Artist deleted');
        } catch (e) { toast.error('Failed'); }
    };

    const handleDeleteCategory = async (id) => {
        if (!confirm('Delete this category?')) return;
        try {
            await adminDeleteCategory(id);
            setCategories(prev => prev.filter(c => c._id !== id));
            toast.success('Category deleted');
        } catch (e) { toast.error('Failed'); }
    };

    const handleDeleteUser = async (id) => {
        if (!confirm('Delete this user?')) return;
        try {
            await adminDeleteUser(id);
            setUsers(prev => prev.filter(u => u._id !== id));
            toast.success('User deleted');
        } catch (e) { toast.error('Failed'); }
    };

    const handleToggleRole = async (userId, currentRole) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        try {
            await adminUpdateUserRole(userId, { role: newRole });
            setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
            toast.success(`Role updated to ${newRole}`);
        } catch (e) { toast.error('Failed'); }
    };

    const handleCreateArtist = async () => {
        try {
            const data = { ...formData, genre: formData.genre.split(',').map(g => g.trim()) };
            await adminCreateArtist(data);
            toast.success('Artist created!');
            setShowForm(false);
            setFormData({ name: '', bio: '', genre: '', image: '', searchQuery: '', featured: true });
            loadTab('artists');
        } catch (e) { toast.error('Failed to create artist'); }
    };

    if (!user || user.role !== 'admin') {
        return (
            <div className="empty-state">
                <div className="empty-icon">🔒</div>
                <h3>Admin Access Required</h3>
                <p>You need admin privileges to access this panel</p>
            </div>
        );
    }

    return (
        <div className="admin-layout">
            <div className="admin-header">
                <h1 className="admin-title">⚙️ Admin Panel</h1>
            </div>

            <div className="admin-tabs">
                {['dashboard', 'artists', 'categories', 'users'].map(t => (
                    <button key={t} className={`admin-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                ))}
            </div>

            {loading ? <div className="loader"><div className="spinner"></div></div> : (
                <>
                    {tab === 'dashboard' && (
                        <div className="admin-stats">
                            <div className="stat-card">
                                <div className="stat-icon" style={{ background: 'rgba(108,92,231,0.15)', color: 'var(--accent-primary)' }}><FiUsers /></div>
                                <div className="stat-value">{stats.totalUsers || 0}</div>
                                <div className="stat-label">Total Users</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon" style={{ background: 'rgba(253,121,168,0.15)', color: 'var(--accent-pink)' }}><FiMusic /></div>
                                <div className="stat-value">{stats.totalArtists || 0}</div>
                                <div className="stat-label">Artists</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon" style={{ background: 'rgba(0,206,201,0.15)', color: 'var(--accent-green)' }}><FiGrid /></div>
                                <div className="stat-value">{stats.totalCategories || 0}</div>
                                <div className="stat-label">Categories</div>
                            </div>
                        </div>
                    )}

                    {tab === 'artists' && (
                        <>
                            <div style={{ marginBottom: '16px' }}>
                                <button className="admin-add-btn" onClick={() => setShowForm(!showForm)}>
                                    <FiPlus /> Add Artist
                                </button>
                            </div>
                            {showForm && (
                                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-lg)', padding: '24px', marginBottom: '16px' }}>
                                    {['name', 'bio', 'genre', 'image', 'searchQuery'].map(field => (
                                        <div className="form-group" key={field}>
                                            <label className="form-label">{field.charAt(0).toUpperCase() + field.slice(1)} {field === 'genre' ? '(comma separated)' : ''}</label>
                                            <input className="form-input" value={formData[field]} onChange={e => setFormData({ ...formData, [field]: e.target.value })} />
                                        </div>
                                    ))}
                                    <button className="form-btn" onClick={handleCreateArtist} style={{ width: 'auto', padding: '10px 24px' }}>Create Artist</button>
                                </div>
                            )}
                            <table className="admin-table">
                                <thead><tr><th>Name</th><th>Genre</th><th>Nationality</th><th>Featured</th><th>Actions</th></tr></thead>
                                <tbody>
                                    {artists.map(a => (
                                        <tr key={a._id}>
                                            <td style={{ fontWeight: 600 }}>{a.name}</td>
                                            <td>{a.genre?.join(', ')}</td>
                                            <td>{a.nationality}</td>
                                            <td>{a.featured ? '⭐' : '—'}</td>
                                            <td className="actions">
                                                <button className="admin-action-btn delete" onClick={() => handleDeleteArtist(a._id)}><FiTrash2 /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </>
                    )}

                    {tab === 'categories' && (
                        <table className="admin-table">
                            <thead><tr><th>Name</th><th>Description</th><th>Color</th><th>Actions</th></tr></thead>
                            <tbody>
                                {categories.map(c => (
                                    <tr key={c._id}>
                                        <td style={{ fontWeight: 600 }}>{c.image} {c.name}</td>
                                        <td style={{ color: 'var(--text-muted)' }}>{c.description}</td>
                                        <td><span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 4, background: c.color }}></span></td>
                                        <td className="actions">
                                            <button className="admin-action-btn delete" onClick={() => handleDeleteCategory(c._id)}><FiTrash2 /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {tab === 'users' && (
                        <table className="admin-table">
                            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Actions</th></tr></thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u._id}>
                                        <td style={{ fontWeight: 600 }}>{u.name}</td>
                                        <td>{u.email}</td>
                                        <td><span style={{ padding: '2px 10px', borderRadius: 20, background: u.role === 'admin' ? 'rgba(108,92,231,0.2)' : 'var(--bg-glass)', fontSize: 12, fontWeight: 600, color: u.role === 'admin' ? 'var(--accent-primary)' : 'var(--text-muted)' }}>{u.role}</span></td>
                                        <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                                        <td className="actions">
                                            <button className="admin-action-btn edit" onClick={() => handleToggleRole(u._id, u.role)}>Toggle Role</button>
                                            <button className="admin-action-btn delete" onClick={() => handleDeleteUser(u._id)}><FiTrash2 /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </>
            )}
        </div>
    );
};

export default Admin;
