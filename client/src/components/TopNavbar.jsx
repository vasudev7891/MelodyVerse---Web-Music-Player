import { useState, useEffect, useRef, useCallback } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FiSearch, FiLogOut, FiShield, FiMenu, FiX, FiClock, FiHeart, FiCamera, FiMessageCircle, FiTrendingUp } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useMusic } from '../context/MusicContext';
import AuthModal from './AuthModal';
import { searchMusic } from '../services/api';
import { suggestionsCache } from '../utils/searchCache';

const STATIC_SUGGESTIONS = [
    "Arijit Singh", "Taylor Swift", "Lata Mangeshkar", "Kishore Kumar", "Ed Sheeran",
    "Shreya Ghoshal", "Bollywood Hits", "90s Songs", "Pop Mix", "Lo-Fi Beats",
    "Hindi Sad Songs", "Punjabi Pop", "Michael Jackson", "Neha Kakkar",
    "Drake", "The Weeknd", "Dua Lipa", "BTS", "A.R. Rahman", "Pritam"
];

const TopNavbar = ({ onToggleSidebar }) => {
    const { setShowAIAssistant, setShowMoodCamera, showAIAssistant, showMoodCamera, playVideo } = useMusic();
    const [searchQuery, setSearchQuery] = useState('');
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authMode, setAuthMode] = useState('login');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = useState(false);
    const [textSuggestions, setTextSuggestions] = useState([]);
    const [videoSuggestions, setVideoSuggestions] = useState([]);
    const [loadingVideos, setLoadingVideos] = useState(false);
    const dropdownRef = useRef(null);
    const debounceTimer = useRef(null);
    const inputRef = useRef(null);
    const lastFetchedQuery = useRef('');

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                // Only close if the target is still actively in the document (prevents detached node issues)
                if (document.contains(e.target)) {
                    setShowDropdown(false);
                }
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Debounced search for live video suggestions
    const fetchVideoSuggestions = useCallback((query) => {
        clearTimeout(debounceTimer.current);
        const trimmed = query.trim();
        if (!trimmed) {
            setVideoSuggestions([]);
            setLoadingVideos(false);
            return;
        }
        // ─── Min query length guard (< 3 chars = skip API call) ────────
        if (trimmed.length < 3) {
            setLoadingVideos(false);
            return;
        }
        // ─── Duplicate query prevention ────────────────────────────────
        if (trimmed === lastFetchedQuery.current) {
            return;
        }
        setLoadingVideos(true);
        debounceTimer.current = setTimeout(async () => {
            try {
                // ─── Client cache check ────────────────────────────────
                const cacheKey = `suggest:${trimmed.toLowerCase()}`;
                const cached = suggestionsCache.get(cacheKey);
                if (cached) {
                    setVideoSuggestions(cached);
                    lastFetchedQuery.current = trimmed;
                    setLoadingVideos(false);
                    return;
                }
                const res = await searchMusic(query);
                const videos = (res.data.videos || []).slice(0, 5);
                setVideoSuggestions(videos);
                suggestionsCache.set(cacheKey, videos);
                lastFetchedQuery.current = trimmed;
            } catch (e) {
                setVideoSuggestions([]);
            } finally {
                setLoadingVideos(false);
            }
        }, 600);
    }, []);

    const handleInput = (e) => {
        const val = e.target.value;
        setSearchQuery(val);
        if (val.trim()) {
            const matches = STATIC_SUGGESTIONS
                .filter(s => s.toLowerCase().includes(val.toLowerCase()))
                .slice(0, 4);
            setTextSuggestions(matches);
            fetchVideoSuggestions(val);
            setShowDropdown(true);
        } else {
            setTextSuggestions([]);
            setVideoSuggestions([]);
            setShowDropdown(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            setShowDropdown(false);
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const handleSuggestionClick = (sug) => {
        setSearchQuery(sug);
        setShowDropdown(false);
        navigate(`/search?q=${encodeURIComponent(sug)}`);
    };

    const handleVideoClick = (video) => {
        setShowDropdown(false);
        playVideo(video, [video]);
    };

    const openAuth = (mode) => {
        setAuthMode(mode);
        setShowAuthModal(true);
    };

    const navLinks = [
        { to: '/', label: 'Home' },
        { to: '/search', label: 'Explore' },
        { to: '/favorites', label: 'Favorites' },
        { to: '/time-machine', label: 'Time Machine' },
    ];

    // Keep dropdown open as long as there's text, to prevent it from suddenly disappearing
    const hasDropdownContent = searchQuery.trim().length > 0;

    return (
        <>
            <nav className="top-nav">
                {/* Row 1: Logo + Nav Links + Buttons */}
                <div className="top-nav-inner">
                    <div className="top-nav-left">
                        <button
                            className="top-nav-btn menu-toggle"
                            onClick={onToggleSidebar}
                            style={{ border: 'none', background: 'transparent', boxShadow: 'none', fontSize: '24px', padding: '0', cursor: 'pointer', color: 'var(--text-main)', display: 'flex', alignItems: 'center' }}
                            title="Toggle Sidebar"
                        >
                            <FiMenu />
                        </button>
                        <div className="top-nav-logo" onClick={() => navigate('/')}>
                            <div className="logo-icon-top">
                                <img src="/favicon.svg" alt="MelodyVerse Logo" className="app-logo-img" />
                            </div>
                            <div className="logo-text-top">
                                <span className="logo-name">MELODY<span className="logo-accent">VERSE</span></span>
                                <span className="logo-sub">Music Video Streaming App</span>
                            </div>
                        </div>
                    </div>

                    {/* Desktop Nav Links */}
                    <div className="top-nav-links">
                        {navLinks.map(link => (
                            <NavLink
                                key={link.to}
                                to={link.to}
                                className={({ isActive }) => `top-nav-link ${isActive ? 'active' : ''}`}
                                end={link.to === '/'}
                            >
                                {link.label}
                            </NavLink>
                        ))}
                        {user?.role === 'admin' && (
                            <NavLink to="/admin" className={({ isActive }) => `top-nav-link ${isActive ? 'active' : ''}`}>
                                Admin
                            </NavLink>
                        )}
                    </div>

                    {/* Center: Search bar with live suggestions dropdown */}
                    <div className="top-nav-center" ref={dropdownRef} style={{ position: 'relative' }}>
                        <form className="top-nav-search" onSubmit={handleSearch}>
                            <FiSearch className="top-search-icon" />
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="Search for songs, albums, artists..."
                                value={searchQuery}
                                onChange={handleInput}
                                onFocus={() => { if (searchQuery.trim()) setShowDropdown(true); }}
                                autoComplete="off"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => { setSearchQuery(''); setShowDropdown(false); setVideoSuggestions([]); setTextSuggestions([]); inputRef.current?.focus(); }}
                                    style={{ position: 'absolute', right: '16px', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', display: 'flex', fontSize: '16px' }}
                                >
                                    <FiX />
                                </button>
                            )}
                        </form>

                        {/* Live Search Dropdown */}
                        {showDropdown && hasDropdownContent && (
                            <div className="search-live-dropdown">
                                {/* Text suggestions */}
                                {textSuggestions.length > 0 && (
                                    <div className="search-dropdown-section">
                                        <div className="search-dropdown-label">
                                            <FiSearch size={11} /> Suggestions
                                        </div>
                                        {textSuggestions.map((sug, i) => (
                                            <div
                                                key={i}
                                                className="search-text-suggestion"
                                                onClick={() => handleSuggestionClick(sug)}
                                            >
                                                <FiSearch className="search-sug-icon" />
                                                <span>{sug}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Divider if both sections exist */}
                                {textSuggestions.length > 0 && (videoSuggestions.length > 0 || loadingVideos) && (
                                    <div className="search-dropdown-divider" />
                                )}

                                {/* Video suggestions */}
                                {(loadingVideos || videoSuggestions.length > 0) && (
                                    <div className="search-dropdown-section">
                                        <div className="search-dropdown-label">
                                            <FiTrendingUp size={11} /> Videos
                                        </div>
                                        {loadingVideos && videoSuggestions.length === 0 ? (
                                            <div className="search-dropdown-loading">
                                                <div className="search-loading-dots">
                                                    <span /><span /><span />
                                                </div>
                                                <span>Searching...</span>
                                            </div>
                                        ) : videoSuggestions.map((video, i) => (
                                            <div
                                                key={video.videoId}
                                                className="search-video-suggestion"
                                                onClick={() => handleVideoClick(video)}
                                            >
                                                <div className="search-vid-thumb">
                                                    <img
                                                        src={video.thumbnail || `https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`}
                                                        alt={video.title}
                                                        onError={(e) => { e.target.src = `https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`; }}
                                                    />
                                                    <div className="search-vid-play">▶</div>
                                                </div>
                                                <div className="search-vid-info">
                                                    <div className="search-vid-title">{video.title}</div>
                                                    <div className="search-vid-channel">{video.channelTitle}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Footer: search all results */}
                                {searchQuery.trim() && (
                                    <div
                                        className="search-dropdown-footer"
                                        onClick={() => handleSuggestionClick(searchQuery)}
                                    >
                                        <FiSearch size={13} />
                                        Search all results for &ldquo;<strong>{searchQuery}</strong>&rdquo;
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="top-nav-right">
                        {/* Feature Buttons */}
                        <div className="top-feature-btns">
                            <button
                                className={`top-nav-btn ${showMoodCamera ? 'active' : ''}`}
                                onClick={() => setShowMoodCamera(true)}
                                title="Mood Camera"
                            >
                                <FiCamera />
                            </button>
                            <button
                                className={`top-nav-btn ${showAIAssistant ? 'active' : ''}`}
                                onClick={() => setShowAIAssistant(true)}
                                title="AI Assistant"
                            >
                                <FiMessageCircle />
                            </button>
                        </div>

                        {/* Auth */}
                        <div className="top-nav-auth">
                            {user ? (
                                <div style={{ position: 'relative' }}>
                                    <div className="top-user-avatar" onClick={() => setShowUserMenu(!showUserMenu)}>
                                        {user.name?.charAt(0).toUpperCase()}
                                    </div>
                                    {showUserMenu && (
                                        <div className="user-menu" style={{ top: '50px', right: '0' }}>
                                            <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', marginBottom: '4px' }}>
                                                <div style={{ fontWeight: 600, fontSize: '14px' }}>{user.name}</div>
                                                <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{user.email}</div>
                                            </div>
                                            {user.role === 'admin' && (
                                                <button className="user-menu-item" onClick={() => { navigate('/admin'); setShowUserMenu(false); }}>
                                                    <FiShield /> Admin Panel
                                                </button>
                                            )}
                                            <button className="user-menu-item" onClick={() => { navigate('/favorites'); setShowUserMenu(false); }}>
                                                <FiHeart /> Favorites
                                            </button>
                                            <button className="user-menu-item" onClick={() => { navigate('/time-machine'); setShowUserMenu(false); }}>
                                                <FiClock /> Time Machine
                                            </button>
                                            <button className="user-menu-item danger" onClick={() => { logout(); setShowUserMenu(false); }}>
                                                <FiLogOut /> Logout
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <button className="top-auth-btn login" onClick={() => openAuth('login')}>LOGIN</button>
                                    <button className="top-auth-btn register" onClick={() => openAuth('register')}>REGISTER</button>
                                </>
                            )}
                        </div>

                        {/* Mobile menu toggle */}
                        <button className="mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                            {mobileMenuOpen ? <FiX /> : <FiMenu />}
                        </button>
                    </div>
                </div>


                {/* Mobile dropdown nav links */}
                {mobileMenuOpen && (
                    <div className="mobile-dropdown">
                        {navLinks.map(link => (
                            <NavLink
                                key={link.to}
                                to={link.to}
                                className="mobile-nav-link"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {link.label}
                            </NavLink>
                        ))}
                    </div>
                )}
            </nav>

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

export default TopNavbar;
