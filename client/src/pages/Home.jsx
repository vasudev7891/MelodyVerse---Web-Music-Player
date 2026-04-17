import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlay, FiChevronRight, FiChevronLeft, FiEye } from 'react-icons/fi';
import SongCard from '../components/SongCard';
import { getFeaturedArtists, getCategories, getTrending, searchMusic } from '../services/api';
import { useMusic } from '../context/MusicContext';
import { LEGENDARY_ARTISTS, INDIAN_LEGENDS, MODERN_STARS, INTERNATIONAL_ICONS } from '../constants/artists';

const HERO_ARTISTS_LEFT = [
    { name: 'Lata Mangeshkar', img: 'https://upload.wikimedia.org/wikipedia/commons/2/2c/Lata-Mangeshkar.jpg' },
    { name: 'Mukesh', img: 'https://upload.wikimedia.org/wikipedia/commons/3/3b/Mukesh_Indian_Singer.jpg' },
    { name: 'Kishore Kumar', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Kishore_Kumar_at_the_premiere_of_the_film_Abhimaan.jpg/800px-Kishore_Kumar_at_the_premiere_of_the_film_Abhimaan.jpg' },
    { name: 'Mohammed Rafi', img: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Mohammed_Rafi_2016_postcard_of_India_crop-flip.jpg' },
];

const HERO_ARTISTS_RIGHT = [
    { name: 'Freddie Mercury', img: 'https://upload.wikimedia.org/wikipedia/commons/e/ef/FreddieMercuryNov1977.jpg' },
    { name: 'Michael Jackson', img: 'https://upload.wikimedia.org/wikipedia/commons/1/15/Michael_Jackson%2C_1988_%2846845017052%29.jpg' },
    { name: 'Arijit Singh', img: 'https://upload.wikimedia.org/wikipedia/commons/e/e5/Arijit_Singh.jpg' },
    { name: 'The Weeknd', img: 'https://upload.wikimedia.org/wikipedia/commons/e/ea/The_Weeknd_Portrait_by_Brian_Ziff.jpg' },
];

const QUICK_PLAYS = [
    { title: 'Lata Mangeshkar: Golden Hits', query: 'Lata Mangeshkar greatest hits', img: 'https://upload.wikimedia.org/wikipedia/commons/2/2c/Lata-Mangeshkar.jpg', views: '1.2M views' },
    { title: 'Global Pop Icons', query: 'Michael Jackson Freddie Mercury greatest hits', img: 'https://upload.wikimedia.org/wikipedia/commons/1/15/Michael_Jackson%2C_1988_%2846845017052%29.jpg', views: '3.1M views' },
    { title: 'Bollywood Golden Era', query: 'classical bollywood singers 60s 70s', img: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Mohammed_Rafi_2016_postcard_of_India_crop-flip.jpg', views: '2.4M views' },
    { title: 'Ed Sheeran: Modern Pop', query: 'Ed Sheeran best pop songs', img: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Ed_Sheeran-6886_%28cropped%29.jpg', views: '850K views' },
];

const Home = () => {
    const [featuredArtists, setFeaturedArtists] = useState([]);
    const [categories, setCategories] = useState([]);
    const [trendingVideos, setTrendingVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [carouselIndex, setCarouselIndex] = useState(0);
    const navigate = useNavigate();
    const { playVideo } = useMusic();
    const carouselRef = useRef(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [artistsRes, catsRes] = await Promise.all([
                getFeaturedArtists().catch(() => ({ data: { artists: [] } })),
                getCategories().catch(() => ({ data: { categories: [] } })),
            ]);
            const artists = artistsRes.data.artists || [];
            setFeaturedArtists(artists.length > 0 ? artists : LEGENDARY_ARTISTS);
            setCategories(catsRes.data.categories || []);
            try {
                const trendRes = await getTrending('IN');
                setTrendingVideos(trendRes.data.videos || []);
            } catch (e) {
                try {
                    const fallback = await searchMusic('trending music 2024');
                    setTrendingVideos(fallback.data.videos || []);
                } catch (e2) { }
            }
        } catch (error) {
            console.error('Failed to load home data:', error);
            setFeaturedArtists(LEGENDARY_ARTISTS);
            setCategories([]);
        } finally {
            setLoading(false);
        }
    };

    const handleQuickPlay = async (item) => {
        try {
            const res = await searchMusic(item.query);
            const videos = res.data.videos || [];
            if (videos.length > 0) {
                playVideo(videos[0], videos);
            }
        } catch (e) { }
    };

    const scrollCarousel = (dir) => {
        if (carouselRef.current) {
            const scrollAmount = 300;
            carouselRef.current.scrollBy({ left: dir * scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <div className="home-fullwidth">
            {/* ===== PREMIUM HERO ===== */}
            <div className="fw-hero-premium" style={{
                backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.8)), url('https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=2070&auto=format&fit=crop')`,
            }}>
                <div className="fw-hero-glow"></div>

                <div className="fw-hero-content-clean">
                    <div className="fw-hero-badge">BEST OF MUSIC</div>
                    <div className="fw-hero-actions">
                        <button className="premium-play-btn" onClick={() => navigate('/search')}>
                            <FiPlay /> START STREAMING
                        </button>
                    </div>
                </div>
            </div>
            {/* ===== CAROUSEL DOTS ===== */}
            <div className="fw-dots">
                {[0, 1, 2, 3, 4].map(i => (
                    <div key={i} className={`fw-dot ${carouselIndex === i ? 'active' : ''}`} onClick={() => setCarouselIndex(i)} />
                ))}
            </div>

            {/* ===== QUICK PLAY CAROUSEL ===== */}
            <div className="fw-carousel-section">
                <button className="fw-carousel-arrow left" onClick={() => scrollCarousel(-1)}>
                    <FiChevronLeft />
                </button>
                <div className="fw-carousel" ref={carouselRef}>
                    {QUICK_PLAYS.map((item, i) => (
                        <div key={i} className="fw-card" onClick={() => handleQuickPlay(item)}>
                            <div className="fw-card-thumb">
                                <img
                                    src={item.img}
                                    alt={item.title}
                                    onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.title)}&background=6c5ce7&color=fff&size=200`; }}
                                />
                                <div className="fw-card-play">
                                    <FiPlay /> Play
                                </div>
                            </div>
                            <div className="fw-card-info">
                                <div className="fw-card-title">{item.title}</div>
                                <div className="fw-card-meta">
                                    <span>Animated videos</span>
                                    <span><FiEye style={{ fontSize: '11px' }} /> {item.views}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <button className="fw-carousel-arrow right" onClick={() => scrollCarousel(1)}>
                    <FiChevronRight />
                </button>
            </div>

            {/* ===== TRENDING SECTION ===== */}
            {trendingVideos.length > 0 && (
                <div className="fw-section">
                    <div className="section-header">
                        <h2 className="section-title"><span className="emoji">🔥</span> Trending Now</h2>
                        <span className="section-link" onClick={() => navigate('/search?q=trending music')}>
                            See All <FiChevronRight />
                        </span>
                    </div>
                    <div className="songs-grid">
                        {trendingVideos.slice(0, 8).map((video, i) => (
                            <SongCard key={video.videoId} song={video} songList={trendingVideos} animDelay={i} />
                        ))}
                    </div>
                </div>
            )}

            {/* ===== INDIAN LEGENDS SECTION ===== */}
            <div className="fw-section">
                <div className="section-header">
                    <h2 className="section-title">
                        <span className="emoji">⭐</span> Indian Musical Legends
                    </h2>
                </div>
                <div className="artists-grid">
                    {(featuredArtists.length > 0 ? featuredArtists.filter(a => a.category === 'legend' || !a.category) : INDIAN_LEGENDS).slice(0, 6).map((artist, i) => (
                        <div key={artist._id} className="artist-card animate-in" style={{ animationDelay: `${i * 0.06}s` }} onClick={() => navigate(`/artist/${artist._id || artist.name}`)}>
                            <img className="artist-card-img" src={artist.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(artist.name)}&background=6c5ce7&color=fff&size=200`} alt={artist.name} loading="lazy" onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(artist.name)}&background=6c5ce7&color=fff&size=200`; }} />
                            <div className="artist-card-overlay">
                                <div className="artist-card-name">{artist.name}</div>
                            </div>
                            <button className="artist-play-btn"><FiPlay /></button>
                        </div>
                    ))}
                </div>
            </div>

            {/* ===== MODERN STARS SECTION ===== */}
            <div className="fw-section">
                <div className="section-header">
                    <h2 className="section-title">
                        <span className="emoji">✨</span> Modern Contemporary Stars
                    </h2>
                </div>
                <div className="artists-grid">
                    {MODERN_STARS.map((artist, i) => (
                        <div key={artist._id} className="artist-card animate-in" style={{ animationDelay: `${i * 0.06 + 0.5}s` }} onClick={() => navigate(`/artist/${artist._id || artist.name}`)}>
                            <img className="artist-card-img" src={artist.image} alt={artist.name} loading="lazy" onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(artist.name)}&background=6c5ce7&color=fff&size=200`; }} />
                            <div className="artist-card-overlay">
                                <div className="artist-card-name">{artist.name}</div>
                            </div>
                            <button className="artist-play-btn"><FiPlay /></button>
                        </div>
                    ))}
                </div>
            </div>

            {/* ===== INTERNATIONAL ICONS SECTION ===== */}
            <div className="fw-section">
                <div className="section-header">
                    <h2 className="section-title">
                        <span className="emoji">🌍</span> International Icons
                    </h2>
                </div>
                <div className="artists-grid">
                    {INTERNATIONAL_ICONS.map((artist, i) => (
                        <div key={artist._id} className="artist-card animate-in" style={{ animationDelay: `${i * 0.06 + 1.0}s` }} onClick={() => navigate(`/artist/${artist._id || artist.name}`)}>
                            <img className="artist-card-img" src={artist.image} alt={artist.name} loading="lazy" onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(artist.name)}&background=6c5ce7&color=fff&size=200`; }} />
                            <div className="artist-card-overlay">
                                <div className="artist-card-name">{artist.name}</div>
                            </div>
                            <button className="artist-play-btn"><FiPlay /></button>
                        </div>
                    ))}
                </div>
            </div>

            {/* ===== CATEGORIES ===== */}
            {categories.length > 0 && (
                <div className="fw-section">
                    <div className="section-header">
                        <h2 className="section-title"><span className="emoji">🎵</span> Browse by Genre</h2>
                    </div>
                    <div className="categories-grid">
                        {categories.map((cat, i) => (
                            <div key={cat._id} className="category-card animate-in" style={{ animationDelay: `${i * 0.05}s`, background: `linear-gradient(135deg, ${cat.color}22, ${cat.color}08)`, color: cat.color }} onClick={() => navigate(`/category/${encodeURIComponent(cat.name)}`)}>
                                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: cat.color, opacity: 0.06 }}></div>
                                <div className="category-emoji">{cat.image}</div>
                                <div className="category-name">{cat.name}</div>
                                <div className="category-desc">{cat.description}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ===== BOTTOM FOOTER ===== */}
            <footer className="fw-footer">
                <div className="fw-footer-links">
                    <span onClick={() => navigate('/')}>Home</span>
                    <span onClick={() => navigate('/search')}>Explore</span>
                    <span onClick={() => navigate('/search?q=genres music')}>Genres</span>
                    <span>Contact Us</span>
                </div>
                <p className="fw-footer-copy">© 2024 MelodyVerse — Stream the Greatest Music ⭐</p>
            </footer>
        </div>
    );
};

export default Home;
