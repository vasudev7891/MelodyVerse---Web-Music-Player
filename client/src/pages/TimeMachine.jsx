import { useState, useEffect } from 'react';
import { FiClock, FiPlay, FiCalendar, FiMusic, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useMusic } from '../context/MusicContext';
import { getProfile } from '../services/api';

const TimeMachine = () => {
    const { user, setShowAuthModal, setAuthMode } = useAuth();
    const { playVideo } = useMusic();
    const [memories, setMemories] = useState({});
    const [loading, setLoading] = useState(true);
    const [expandedDate, setExpandedDate] = useState(null);
    const [selectedFilter, setSelectedFilter] = useState('all');

    useEffect(() => {
        if (user) loadMemories();
        else setLoading(false);
    }, [user]);

    const loadMemories = async () => {
        try {
            const res = await getProfile();
            const recentlyPlayed = res.data.user.recentlyPlayed || [];

            // Group by date
            const grouped = {};
            recentlyPlayed.forEach(song => {
                const date = new Date(song.playedAt);
                const dateKey = date.toLocaleDateString('en-IN', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
                if (!grouped[dateKey]) {
                    grouped[dateKey] = {
                        date: date,
                        dateKey,
                        songs: []
                    };
                }
                grouped[dateKey].songs.push({
                    ...song,
                    time: date.toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                    }),
                    fullDate: date
                });
            });

            setMemories(grouped);
        } catch (e) {
            console.error('Failed to load memories');
        } finally {
            setLoading(false);
        }
    };

    const getTimeAgo = (date) => {
        const now = new Date();
        const diff = now - new Date(date);
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor(diff / (1000 * 60));

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes} min ago`;
        if (hours < 24) return `${hours} hours ago`;
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days} days ago`;
        if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
        if (days < 365) return `${Math.floor(days / 30)} months ago`;
        return `${Math.floor(days / 365)} years ago`;
    };

    const getMemoryEmoji = (date) => {
        const hour = new Date(date).getHours();
        if (hour >= 5 && hour < 12) return '🌅';
        if (hour >= 12 && hour < 17) return '☀️';
        if (hour >= 17 && hour < 21) return '🌆';
        return '🌙';
    };

    const getMemoryMood = (date) => {
        const hour = new Date(date).getHours();
        if (hour >= 5 && hour < 12) return 'Morning vibes';
        if (hour >= 12 && hour < 17) return 'Afternoon jam';
        if (hour >= 17 && hour < 21) return 'Evening melody';
        return 'Late night session';
    };

    const memoryDates = Object.keys(memories).sort((a, b) => {
        return new Date(memories[b].date) - new Date(memories[a].date);
    });

    if (!user) {
        return (
            <div className="page-container wide">
                <div className="empty-state animate-in">
                    <div className="empty-icon-wrapper">
                        <div className="empty-icon-glow"></div>
                        <span className="empty-icon">🔒</span>
                    </div>
                    <h3>Login Required</h3>
                    <p>Sign in to see your music time machine</p>
                    <button className="premium-play-btn empty-btn" onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}>
                        Sign In
                    </button>
                </div>
            </div>
        );
    }

    if (loading) return <div className="loader"><div className="spinner"></div></div>;

    const totalSongs = Object.values(memories).reduce((sum, m) => sum + m.songs.length, 0);

    return (
        <div className="page-container wide">
            {/* Time Machine Header */}
            <div className="tm-header">
                <div className="tm-header-icon">
                    <div className="tm-clock">
                        <span>⏳</span>
                        <div className="tm-clock-ring"></div>
                        <div className="tm-clock-ring ring-2"></div>
                    </div>
                </div>
                <div>
                    <h2 className="tm-title">Music Time Machine</h2>
                    <p className="tm-subtitle">Your musical journey through time</p>
                </div>
            </div>

            {/* Stats */}
            <div className="tm-stats">
                <div className="tm-stat-card">
                    <div className="tm-stat-icon">🎵</div>
                    <div className="tm-stat-value">{totalSongs}</div>
                    <div className="tm-stat-label">Songs Played</div>
                </div>
                <div className="tm-stat-card">
                    <div className="tm-stat-icon">📅</div>
                    <div className="tm-stat-value">{memoryDates.length}</div>
                    <div className="tm-stat-label">Memory Days</div>
                </div>
                <div className="tm-stat-card">
                    <div className="tm-stat-icon">⏱️</div>
                    <div className="tm-stat-value">
                        {totalSongs > 0 ? getTimeAgo(memories[memoryDates[memoryDates.length - 1]]?.date) : '—'}
                    </div>
                    <div className="tm-stat-label">First Memory</div>
                </div>
            </div>

            {/* Memory Timeline */}
            {memoryDates.length > 0 ? (
                <div className="tm-timeline">
                    {memoryDates.map((dateKey, di) => {
                        const memory = memories[dateKey];
                        const isExpanded = expandedDate === dateKey;
                        return (
                            <div key={dateKey} className="tm-day animate-in" style={{ animationDelay: `${di * 0.08}s` }}>
                                {/* Timeline connector */}
                                <div className="tm-connector">
                                    <div className="tm-dot" style={{
                                        background: di === 0 ? 'var(--accent-primary)' : 'var(--bg-glass)',
                                        boxShadow: di === 0 ? '0 0 15px rgba(108,92,231,0.5)' : 'none'
                                    }}></div>
                                    {di < memoryDates.length - 1 && <div className="tm-line"></div>}
                                </div>

                                {/* Day Content */}
                                <div className="tm-day-content" onClick={() => setExpandedDate(isExpanded ? null : dateKey)}>
                                    <div className="tm-day-header">
                                        <div>
                                            <div className="tm-day-date">
                                                <FiCalendar style={{ fontSize: '14px' }} />
                                                {dateKey}
                                            </div>
                                            <div className="tm-day-meta">
                                                {memory.songs.length} song{memory.songs.length > 1 ? 's' : ''} • {getTimeAgo(memory.date)}
                                            </div>
                                        </div>
                                        <div className="tm-day-toggle">
                                            {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                                        </div>
                                    </div>

                                    {/* Preview (collapsed) */}
                                    {!isExpanded && (
                                        <div className="tm-preview">
                                            {memory.songs.slice(0, 3).map((song, i) => (
                                                <img
                                                    key={i}
                                                    src={song.thumbnail || `https://img.youtube.com/vi/${song.videoId}/mqdefault.jpg`}
                                                    alt=""
                                                    className="tm-preview-thumb"
                                                    style={{ zIndex: 3 - i, marginLeft: i > 0 ? '-12px' : '0' }}
                                                />
                                            ))}
                                            {memory.songs.length > 3 && (
                                                <span className="tm-preview-more">+{memory.songs.length - 3}</span>
                                            )}
                                        </div>
                                    )}

                                    {/* Expanded Song List */}
                                    {isExpanded && (
                                        <div className="tm-songs" onClick={e => e.stopPropagation()}>
                                            {memory.songs.map((song, si) => (
                                                <div
                                                    key={si}
                                                    className="tm-song-item animate-in"
                                                    style={{ animationDelay: `${si * 0.05}s` }}
                                                    onClick={() => playVideo(song, memory.songs)}
                                                >
                                                    <div className="tm-song-time-badge">
                                                        <span className="tm-song-emoji">{getMemoryEmoji(song.fullDate)}</span>
                                                        <span className="tm-song-time">{song.time}</span>
                                                    </div>
                                                    <img
                                                        className="tm-song-thumb"
                                                        src={song.thumbnail || `https://img.youtube.com/vi/${song.videoId}/mqdefault.jpg`}
                                                        alt=""
                                                    />
                                                    <div className="tm-song-info">
                                                        <div className="tm-song-title">{song.title}</div>
                                                        <div className="tm-song-channel">
                                                            {song.channelTitle} • {getMemoryMood(song.fullDate)}
                                                        </div>
                                                        <div className="tm-song-memory">
                                                            🎵 You listened to this on {new Date(song.fullDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} at {song.time}
                                                        </div>
                                                    </div>
                                                    <button className="tm-play-btn">
                                                        <FiPlay />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="empty-state">
                    <div className="empty-icon">⏳</div>
                    <h3>No memories yet</h3>
                    <p>Start playing songs to create your music timeline!</p>
                </div>
            )}
        </div>
    );
};

export default TimeMachine;
