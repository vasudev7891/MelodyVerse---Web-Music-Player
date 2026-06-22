import { FiInfo, FiMail, FiGithub, FiTwitter } from 'react-icons/fi';

const About = () => {
    return (
        <div className="page-container">
            <h1 className="page-title">
                About MelodyVerse
            </h1>
            <p className="page-subtitle">
                MelodyVerse is a next-generation music streaming platform designed to give you the ultimate audio-visual experience. Built for true music lovers, it combines a sleek, modern interface with extremely fast search and an integrated AI assistant.
            </p>

            <div className="page-card">
                <h2 className="page-card-title">
                    <FiInfo /> Our Mission
                </h2>
                <p style={{ color: 'var(--text-main)', marginBottom: '30px', lineHeight: '1.6', fontSize: 'clamp(0.9rem, 3.5vw, 1rem)' }}>
                    We aim to democratize access to high-quality music streaming by providing an ad-free, immersive platform. Whether you want to listen to Retro Bollywood, Modern Pop, or Indian Classical, you can easily discover, play, and organize all your favorites in one place.
                </p>

                <h2 className="page-card-title" style={{ display: 'block' }}>Steps to Use MelodyVerse</h2>
                <ul className="page-card-list">
                    <li><strong>Sign Up / Log In:</strong> Click on the Login/Register button on the top right. You can log in using `admin@melodyverse.com` / `admin123` to access the Admin Panel!</li>
                    <li><strong>Discover Music:</strong> Check out the 'Home' page to browse standard categories, or use the modernized Search Bar to find anything specific.</li>
                    <li><strong>Play Controls:</strong> Click on any song card to launch the player. Minimize it while exploring other pages or double-tap left/right on video edges to skip 10s easily!</li>
                    <li><strong>MelodyBot AI:</strong> Click the AI Icon in the top-right to summon your voice-activated, intelligent side-panel music assistant.</li>
                </ul>
                
                <h2 className="page-card-title" style={{ display: 'block' }}>Contact & Links</h2>
                <div className="page-card-links">
                    <a href="#" className="page-card-link-btn">
                        <FiMail /> Contact Us
                    </a>
                    <a href="#" className="page-card-link-btn">
                        <FiGithub /> GitHub
                    </a>
                    <a href="#" className="page-card-link-btn">
                        <FiTwitter /> Twitter
                    </a>
                </div>
            </div>
        </div>
    );
};

export default About;
