import { FiInfo, FiMail, FiGithub, FiTwitter } from 'react-icons/fi';

const About = () => {
    return (
        <div className="page-container" style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '20px', background: 'var(--gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                About MelodyVerse
            </h1>
            <p style={{ fontSize: '1.2rem', color: 'var(--text-dim)', marginBottom: '40px', lineHeight: '1.6' }}>
                MelodyVerse is a next-generation music streaming platform designed to give you the ultimate audio-visual experience. Built for true music lovers, it combines a sleek, modern interface with extremely fast search and an integrated AI assistant.
            </p>

            <div style={{ background: 'var(--bg-glass)', borderRadius: '24px', padding: '30px', border: '1px solid var(--border)' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem', marginBottom: '20px' }}><FiInfo /> Our Mission</h2>
                <p style={{ color: 'var(--text-main)', marginBottom: '30px', lineHeight: '1.6' }}>
                    We aim to democratize access to high-quality music streaming by providing an ad-free, immersive platform. Whether you want to listen to Retro Bollywood, Modern Pop, or Indian Classical, you can easily discover, play, and organize all your favorites in one place.
                </p>

                <h2 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>Steps to Use MelodyVerse</h2>
                <ul style={{ color: 'var(--text-main)', marginBottom: '30px', lineHeight: '1.6', paddingLeft: '20px' }}>
                    <li><strong>Sign Up / Log In:</strong> Click on the Login/Register button on the top right. You can log in using `admin@melodyverse.com` / `admin123` to access the Admin Panel!</li>
                    <li><strong>Discover Music:</strong> Check out the 'Home' page to browse standard categories, or use the modernized Search Bar to find anything specific.</li>
                    <li><strong>Play Controls:</strong> Click on any song card to launch the player. Minimize it while exploring other pages or double-tap left/right on video edges to skip 10s easily!</li>
                    <li><strong>MelodyBot AI:</strong> Click the AI Icon in the top-right to summon your voice-activated, intelligent side-panel music assistant.</li>
                </ul>
                
                <h2 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>Contact & Links</h2>
                <div style={{ display: 'flex', gap: '20px' }}>
                    <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'var(--bg-glass)', borderRadius: '12px', textDecoration: 'none', color: 'var(--text-main)', border: '1px solid var(--border)' }}>
                        <FiMail /> Contact Us
                    </a>
                    <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'var(--bg-glass)', borderRadius: '12px', textDecoration: 'none', color: 'var(--text-main)', border: '1px solid var(--border)' }}>
                        <FiGithub /> GitHub
                    </a>
                    <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'var(--bg-glass)', borderRadius: '12px', textDecoration: 'none', color: 'var(--text-main)', border: '1px solid var(--border)' }}>
                        <FiTwitter /> Twitter
                    </a>
                </div>
            </div>
        </div>
    );
};

export default About;
