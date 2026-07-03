import { useState } from 'react';
import { FiMonitor, FiMoon, FiSun, FiVolume2, FiBell, FiShield, FiType } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';

const Settings = () => {
    const { theme, toggleTheme } = useTheme();
    const [autoplay, setAutoplay] = useState(true);
    const [quality, setQuality] = useState('auto');
    const [notifications, setNotifications] = useState(true);

    return (
        <div className="page-container">
            <h1 className="page-title static">Settings</h1>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* Playback Settings */}
                <div className="page-card">
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

                {/* Appearance Settings */}
                <div className="page-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(124, 77, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}><FiSun size={20} /></div>
                        <h2 style={{ fontSize: '1.4rem' }}>Appearance</h2>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 0' }}>
                        <div>
                            <div style={{ fontWeight: '600', fontSize: '1.1rem', marginBottom: '5px' }}>Theme Mode</div>
                            <div style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Choose your visual style for the interface.</div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button 
                                onClick={() => theme === 'dark' && toggleTheme()} 
                                style={{
                                    padding: '8px 16px',
                                    background: theme === 'light' ? 'var(--accent)' : 'var(--bg-dark)',
                                    border: '1px solid var(--border)',
                                    color: theme === 'light' ? 'white' : 'var(--text-main)',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <FiSun /> Light
                            </button>
                            <button 
                                onClick={() => theme === 'light' && toggleTheme()} 
                                style={{
                                    padding: '8px 16px',
                                    background: theme === 'dark' ? 'var(--accent)' : 'var(--bg-dark)',
                                    border: '1px solid var(--border)',
                                    color: theme === 'dark' ? 'white' : 'var(--text-main)',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <FiMoon /> Dark
                            </button>
                        </div>
                    </div>
                </div>

                {/* Notifications & Privacy */}
                <div className="page-card">
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
