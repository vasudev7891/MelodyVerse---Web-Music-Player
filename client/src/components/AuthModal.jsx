import { useState } from 'react';
import { FiX, FiMail, FiLock, FiUser, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const AuthModal = ({ mode, onClose, onSwitchMode }) => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, register } = useAuth();
    const isLogin = mode === 'login';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (isLogin) {
                await login(formData.email, formData.password);
                toast.success('Welcome back! 🎵');
            } else {
                await register(formData.name, formData.email, formData.password);
                toast.success('Account created! Welcome to MelodyVerse! 🎉');
            }
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modern-auth-overlay" onClick={onClose}>
            <style>{`
                .modern-auth-overlay {
                    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
                    background: rgba(0, 0, 0, 0.75); backdrop-filter: blur(8px);
                    display: flex; align-items: center; justify-content: center; z-index: 10000;
                    animation: fadeIn 0.3s ease;
                }
                .modern-auth-container {
                    display: flex; width: 900px; height: 550px;
                    background: rgba(13, 13, 18, 0.95); border-radius: 24px;
                    border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
                    overflow: hidden; position: relative;
                    transform: scale(0.95); animation: scaleUp 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
                }
                .auth-side-graphic {
                    flex: 1; background: linear-gradient(135deg, rgba(108, 92, 231, 0.8), rgba(253, 121, 168, 0.8)), url('https://images.unsplash.com/photo-1614149162883-504ce4d13909?q=80&w=1000&auto=format&fit=crop');
                    background-size: cover; background-position: center; position: relative;
                    display: flex; flex-direction: column; justify-content: flex-end; padding: 40px; color: white;
                }
                .auth-side-graphic::after {
                    content: ''; position: absolute; inset: 0; background: linear-gradient(to top, rgba(7,7,10,0.9), transparent);
                }
                .auth-graphic-content { position: relative; z-index: 10; }
                .auth-graphic-content h2 { font-family: 'Outfit', sans-serif; font-size: 2.5rem; font-weight: 900; line-height: 1.1; margin-bottom: 12px; }
                .auth-graphic-content p { font-size: 1rem; color: rgba(255, 255, 255, 0.8); }
                
                .auth-form-wrapper {
                    flex: 1; padding: 60px 50px; display: flex; flex-direction: column; justify-content: center; position: relative;
                }
                .modern-close-btn {
                    position: absolute; top: 20px; right: 20px; width: 40px; height: 40px;
                    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 50%;
                    color: white; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.3s;
                }
                .modern-close-btn:hover { background: rgba(255, 71, 87, 0.2); border-color: #ff4757; color: #ff4757; transform: rotate(90deg); }
                
                .auth-header { margin-bottom: 30px; }
                .auth-header h3 { font-family: 'Outfit', sans-serif; font-size: 2rem; font-weight: 800; background: linear-gradient(135deg, #6c5ce7, #fd79a8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 8px; }
                .auth-header p { font-size: 0.9rem; color: #a0a0b0; }
                
                .modern-input-group { position: relative; margin-bottom: 20px; }
                .modern-input-icon { position: absolute; top: 50%; left: 16px; transform: translateY(-50%); color: #6b6b80; font-size: 18px; transition: 0.3s; }
                .modern-input {
                    width: 100%; padding: 16px 16px 16px 48px; background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; color: white; font-family: 'Inter', sans-serif;
                    font-size: 15px; transition: 0.3s; outline: none;
                }
                .modern-input:focus { background: rgba(255, 255, 255, 0.08); border-color: #6c5ce7; box-shadow: 0 0 0 4px rgba(108, 92, 231, 0.1); }
                .modern-input:focus + .modern-input-icon { color: #6c5ce7; }
                
                .modern-submit-btn {
                    width: 100%; padding: 16px; border-radius: 16px; border: none; background: linear-gradient(135deg, #6c5ce7, #fd79a8);
                    color: white; font-family: 'Inter', sans-serif; font-weight: 700; font-size: 16px; cursor: pointer;
                    display: flex; align-items: center; justify-content: center; gap: 10px; transition: 0.3s; margin-top: 10px; box-shadow: 0 10px 25px rgba(108, 92, 231, 0.3);
                }
                .modern-submit-btn:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 15px 35px rgba(108, 92, 231, 0.4); }
                .modern-submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }
                
                .auth-switch { text-align: center; margin-top: 24px; font-size: 0.9rem; color: #a0a0b0; }
                .auth-switch span { color: #fd79a8; font-weight: 600; cursor: pointer; transition: 0.3s; margin-left: 5px; }
                .auth-switch span:hover { color: #6c5ce7; text-decoration: underline; }
                
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes scaleUp { to { transform: scale(1); } }
            `}</style>

            <div className="modern-auth-container" onClick={e => e.stopPropagation()}>
                {/* Left Side: Graphic (always on left) */}
                <div className="auth-side-graphic">
                    <div className="auth-graphic-content">
                        <h2>{isLogin ? 'Welcome Back.' : 'Start Listening.'}</h2>
                        <p>{isLogin ? 'Log in to access your curated playlists, top tracks, and personal history.' : 'Join the fastest-growing next-generation music streaming community today.'}</p>
                    </div>
                </div>

                {/* Right Side: Form */}
                <div className="auth-form-wrapper">
                    <button className="modern-close-btn" onClick={onClose}><FiX /></button>
                    
                    <div className="auth-header">
                        <h3>{isLogin ? 'Sign In' : 'Create Account'}</h3>
                        <p>{isLogin ? 'Let the music play!' : 'Takes less than 30 seconds.'}</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {!isLogin && (
                            <div className="modern-input-group">
                                <input className="modern-input" type="text" placeholder="Full Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                                <FiUser className="modern-input-icon" />
                            </div>
                        )}
                        <div className="modern-input-group">
                            <input className="modern-input" type="email" placeholder="Email Address" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
                            <FiMail className="modern-input-icon" />
                        </div>
                        <div className="modern-input-group">
                            <input className="modern-input" type="password" placeholder="Password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required minLength={6} />
                            <FiLock className="modern-input-icon" />
                        </div>

                        {error && <p style={{ color: '#ff4757', fontSize: '0.85rem', marginBottom: '15px', padding: '10px', background: 'rgba(255, 71, 87, 0.1)', borderRadius: '8px', borderLeft: '3px solid #ff4757' }}>{error}</p>}

                        <button className="modern-submit-btn" type="submit" disabled={loading}>
                            {loading ? 'Processing...' : (isLogin ? 'Sign In to Account' : 'Register Now')} <FiArrowRight />
                        </button>
                    </form>

                    <p className="auth-switch">
                        {isLogin ? "Don't have an account?" : "Already a member?"}
                        <span onClick={() => {
                            setError('');
                            setFormData({ name: '', email: '', password: '' });
                            onSwitchMode(isLogin ? 'register' : 'login');
                        }}>
                            {isLogin ? 'Create one now' : 'Log in here'}
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
