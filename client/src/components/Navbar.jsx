import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiLogOut, FiUser, FiShield } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';

const Navbar = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authMode, setAuthMode] = useState('login');
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const openAuth = (mode) => {
        setAuthMode(mode);
        setShowAuthModal(true);
    };

    return (
        <>
            <header className="navbar">
                <form className="navbar-search" onSubmit={handleSearch}>
                    <FiSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search songs, artists, genres..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </form>

                <div className="navbar-actions">
                    {user ? (
                        <div style={{ position: 'relative' }}>
                            <div className="user-avatar" onClick={() => setShowUserMenu(!showUserMenu)}>
                                {user.name?.charAt(0).toUpperCase()}
                            </div>
                            {showUserMenu && (
                                <div className="user-menu">
                                    <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-glass)', marginBottom: '4px' }}>
                                        <div style={{ fontWeight: 600, fontSize: '14px' }}>{user.name}</div>
                                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{user.email}</div>
                                    </div>
                                    {user.role === 'admin' && (
                                        <button className="user-menu-item" onClick={() => { navigate('/admin'); setShowUserMenu(false); }}>
                                            <FiShield /> Admin Panel
                                        </button>
                                    )}
                                    <button className="user-menu-item" onClick={() => { navigate('/favorites'); setShowUserMenu(false); }}>
                                        <FiUser /> My Favorites
                                    </button>
                                    <button className="user-menu-item danger" onClick={() => { logout(); setShowUserMenu(false); }}>
                                        <FiLogOut /> Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <button className="navbar-btn ghost" onClick={() => openAuth('login')}>LOGIN</button>
                            <button className="navbar-btn primary" onClick={() => openAuth('register')}>REGISTER</button>
                        </>
                    )}
                </div>
            </header>

            {showAuthModal && (
                <AuthModal
                    mode={authMode}
                    onClose={() => setShowAuthModal(false)}
                    onSwitchMode={(mode) => setAuthMode(mode)}
                />
            )}
        </>
    );
};

export default Navbar;
