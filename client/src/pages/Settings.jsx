import { useState } from 'react';
import { FiMonitor, FiMoon, FiSun, FiVolume2, FiBell, FiShield, FiType } from 'react-icons/fi';

const Settings = () => {
    const [theme, setTheme] = useState('dark');
    const [autoplay, setAutoplay] = useState(true);
    const [quality, setQuality] = useState('auto');
    const [notifications, setNotifications] = useState(true);

    const toggleTheme = (newTheme) => {
        setTheme(newTheme);
        // Additional theme logic could go here
    };

    return (
        <div className="page-container" style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '40px', color: 'var(--text-main)' }}>Settings</h1>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Theme Settings */}
                <div style={{ background: 'var(--bg-glass)', borderRadius: '24px', padding: '30px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(108, 92, 231, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}><FiMoon size={20} /></div>
                        <h2 style={{ fontSize: '1.4rem' }}>Appearance</h2>
                    </div>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <button onClick={() => toggleTheme('dark')} style={{ flex: 1, padding: '15px', borderRadius: '12px', background: theme === 'dark' ? 'var(--accent)' : 'var(--bg-dark)', border: '1px solid var(--border)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: '0.3s' }}>
                            <FiMoon /> Dark Theme
                        </button>
                        <button onClick={() => toggleTheme('light')} style={{ flex: 1, padding: '15px', borderRadius: '12px', background: theme === 'light' ? 'var(--text-main)' : 'var(--bg-glass)', border: '1px solid var(--border)', color: theme === 'light' ? 'black' : 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: '0.3s' }}>
                            <FiSun /> Light Theme
                        </button>
                    </div>
                </div>

                {/* Playback Settings */}
                <div style={{ background: 'var(--bg-glass)', borderRadius: '24px', padding: '30px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(253, 121, 168, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-pink)' }}><FiVolume2 size={20} /></div>
                        <h2 style={{ fontSize: '1.4rem' }}>Playback</h2>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid var(--border)' }}>
                        <div>
                            <div style={{ fontWeight: '600', fontSize: '1.1rem', marginBottom: '5px' }}>Autoplay next song</div>
                            <div style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Automatically play the next recommended track.</div>
                        </div>
                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                            <input type="checkbox" checked={autoplay} onChange={(e) => setAutoplay(e.target.checked)} style={{ width: '24px', height: '24px', accentColor: 'var(--accent)' }} />
                        </label>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 0' }}>
                        <div>
                            <div style={{ fontWeight: '600', fontSize: '1.1rem', marginBottom: '5px' }}>Video Quality</div>
                            <div style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Choose default streaming quality.</div>
                        </div>
                        <select value={quality} onChange={(e) => setQuality(e.target.value)} style={{ padding: '8px 16px', background: 'var(--bg-dark)', border: '1px solid var(--border)', color: 'white', borderRadius: '8px', outline: 'none' }}>
                            <option value="auto">Auto (Recommended)</option>
                            <option value="1080p">1080p HD</option>
                            <option value="720p">720p</option>
                            <option value="480p">480p</option>
                        </select>
                    </div>
                </div>

                {/* Notifications & Privacy */}
                <div style={{ background: 'var(--bg-glass)', borderRadius: '24px', padding: '30px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(46, 204, 113, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2ecc71' }}><FiBell size={20} /></div>
                        <h2 style={{ fontSize: '1.4rem' }}>Notifications</h2>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 0' }}>
                        <div>
                            <div style={{ fontWeight: '600', fontSize: '1.1rem', marginBottom: '5px' }}>Push Notifications</div>
                            <div style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Get notified about new releases and trending artists.</div>
                        </div>
                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                            <input type="checkbox" checked={notifications} onChange={(e) => setNotifications(e.target.checked)} style={{ width: '24px', height: '24px', accentColor: 'var(--accent)' }} />
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
