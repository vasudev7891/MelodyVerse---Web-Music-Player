import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiSearch, FiChevronRight, FiChevronLeft } from 'react-icons/fi';
import SongCard from '../components/SongCard';
import { searchMusic, getTrending } from '../services/api';

const Search = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const [results, setResults] = useState([]);
    const [weeklyTop, setWeeklyTop] = useState([]);
    const [trending, setTrending] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchInput, setSearchInput] = useState(query);
    const [nextPage, setNextPage] = useState(null);

    useEffect(() => {
        if (query) {
            setSearchInput(query);
            handleSearch(query);
        } else {
            loadExploreData();
        }
    }, [query]);

    const loadExploreData = async () => {
        setLoading(true);
        try {
            const [topRes, trendRes] = await Promise.all([
                searchMusic('top tracks 2024 hits'),
                getTrending('IN').catch(() => searchMusic('trending music'))
            ]);
            setWeeklyTop(topRes.data.videos?.slice(0, 6) || []);
            setTrending(trendRes.data.videos?.slice(0, 8) || []);
        } catch (e) {
            console.error('Explore data load failed');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (q, pageToken = null) => {
        if (!q.trim()) return;
        setLoading(true);
        try {
            const res = await searchMusic(q, pageToken);
            if (pageToken) {
                setResults(prev => [...prev, ...(res.data.videos || [])]);
            } else {
                setResults(res.data.videos || []);
            }
            setNextPage(res.data.nextPageToken);
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!query) {
        return (
            <div className="explore-dashboard" style={{ paddingTop: '100px' }}>
                <div className="explore-header">
                    <h1>Discover New Music</h1>
                    <p>Explore weekly top tracks and trending music from around the world.</p>
                </div>

                {/* Weekly Top Tracks */}
                <div className="fw-section">
                    <div className="section-header">
                        <h2 className="section-title">Weekly Top Tracks</h2>
                        <span className="section-link">View All <FiChevronRight /></span>
                    </div>
                    <div className="songs-grid">
                        {weeklyTop.map((song, i) => (
                            <SongCard key={song.videoId} song={song} songList={weeklyTop} animDelay={i} />
                        ))}
                    </div>
                </div>

                {/* Trending Now */}
                <div className="fw-section">
                    <div className="section-header">
                        <h2 className="section-title">Trending Now</h2>
                        <span className="section-link">View All <FiChevronRight /></span>
                    </div>
                    <div className="songs-grid">
                        {trending.map((song, i) => (
                            <SongCard key={song.videoId} song={song} songList={trending} animDelay={i+4} />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="search-page" style={{ padding: '100px 32px 32px' }}>
            <div className="search-results-header" style={{ marginBottom: '32px' }}>
                <h2>Showing results for &ldquo;{query}&rdquo;</h2>
            </div>

            {loading && results.length === 0 ? (
                <div className="loader"><div className="spinner"></div></div>
            ) : results.length > 0 ? (
                <>
                    <div className="songs-grid">
                        {results.map((video, i) => (
                            <SongCard key={`${video.videoId}-${i}`} song={video} songList={results} animDelay={i} />
                        ))}
                    </div>
                    {nextPage && (
                        <div style={{ textAlign: 'center', marginTop: '32px' }}>
                            <button
                                className="premium-outline-btn"
                                onClick={() => handleSearch(query, nextPage)}
                                disabled={loading}
                            >
                                {loading ? 'Loading...' : 'Load More'}
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className="empty-state">
                    <div className="empty-icon">🎵</div>
                    <h3>No results found</h3>
                    <p>Try searching for something else</p>
                </div>
            )}
        </div>
    );
};
export default Search;
