import { useState } from 'react';
import { FiX, FiMail, FiUser, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import PasswordStrength from './PasswordStrength';
import toast from 'react-hot-toast';

const AuthModal = ({ mode, onClose, onSwitchMode }) => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, register } = useAuth();
    const isLogin = mode === 'login';

    const handleToggle = () => {
        const nextMode = isLogin ? 'register' : 'login';
        setError('');
        setFormData({ name: '', email: '', password: '' });
        onSwitchMode(nextMode);
    };

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
                    --gradient: linear-gradient(135deg, rgba(108, 92, 231, 0.85), rgba(253, 121, 168, 0.85));
                    --bg-dark: #07070a;
                    --surface: #12121a;
                    --text: #f8f8fb;
                    --text-dim: #a0a0b0;
                    --duration: 0.6s;
                    --easing: cubic-bezier(0.16, 1, 0.3, 1);
                    --easing-panel: cubic-bezier(0.65, 0, 0.35, 1);

                    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
                    background: rgba(0, 0, 0, 0.8); backdrop-filter: blur(10px);
                    display: flex; align-items: center; justify-content: center; z-index: 10000;
                    animation: fadeIn 0.3s ease;
                }

                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes scaleUp { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }

                .card {
                    position: relative;
                    width: 660px;
                    height: 440px;
                    overflow: hidden;
                    border-radius: 24px;
                    background: var(--surface);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
                    transform: scale(0.95);
                    animation: scaleUp 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
                }

                .toggle {
                    display: none;
                }

                .card-bg {
                    position: absolute;
                    inset: 0 auto 0 0;
                    z-index: 2;
                    width: 50%;
                    background: var(--gradient), url('https://images.unsplash.com/photo-1614149162883-504ce4d13909?q=80&w=1000&auto=format&fit=crop');
                    background-size: cover;
                    background-position: center;
                    transition: var(--duration) var(--easing-panel);
                }

                .toggle:checked ~ .card-bg {
                    translate: 100% 0;
                }

                .hero,
                .form {
                    position: absolute;
                    width: 50%;
                    height: 100%;
                    opacity: 0;
                    visibility: hidden;
                    transition: var(--duration) var(--easing-panel);
                }

                .hero.signup,
                .form.signup {
                    opacity: 1;
                    visibility: visible;
                    translate: 0;
                }

                .hero.signin,
                .form.signup {
                    left: 50%;
                }

                .hero.signin {
                    translate: 25% 0;
                }

                .form.signin {
                    translate: 50% 0;
                }

                .toggle:checked ~ .hero.signup {
                    opacity: 0;
                    visibility: hidden;
                    translate: -25% 0;
                }

                .toggle:checked ~ .hero.signin,
                .toggle:checked ~ .form.signin {
                    opacity: 1;
                    visibility: visible;
                    translate: 0;
                }

                .toggle:checked ~ .form.signup {
                    opacity: 0;
                    visibility: hidden;
                    translate: -50% 0;
                }

                .hero {
                    z-index: 3;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 16px;
                    padding: 0 28px;
                    color: #fff;
                    text-align: center;
                }

                .hero h2 {
                    margin: 0;
                    font-size: 24px;
                    font-weight: 800;
                    font-family: 'Outfit', sans-serif;
                    letter-spacing: -0.02em;
                    line-height: 1.2;
                }

                .hero p {
                    margin: 0 0 4px;
                    font-size: 13px;
                    line-height: 1.5;
                    opacity: 0.85;
                    font-family: 'Inter', sans-serif;
                }

                .hero label {
                    padding: 10px 36px;
                    border: 1.5px solid rgba(255, 255, 255, 0.6);
                    border-radius: 32px;
                    background: transparent;
                    font-size: 12px;
                    font-weight: 700;
                    transition: 0.25s var(--easing);
                    cursor: pointer;
                    display: inline-block;
                    letter-spacing: 0.05em;
                }

                .hero label:hover {
                    background: rgba(255, 255, 255, 0.15);
                    border-color: #fff;
                }

                /* Close Button Styling */
                .modern-close-btn {
                    position: absolute;
                    top: 16px;
                    right: 16px;
                    width: 36px;
                    height: 36px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 50%;
                    color: #fff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: 0.3s;
                    z-index: 100;
                }

                .modern-close-btn:hover {
                    background: rgba(255, 71, 87, 0.2);
                    border-color: #ff4757;
                    color: #ff4757;
                    transform: rotate(90deg);
                }

                /* Form Layout Styling */
                .form {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    padding: 0 40px;
                    z-index: 1;
                }

                .form h2 {
                    margin: 0 0 4px 0;
                    font-size: 24px;
                    font-weight: 800;
                    font-family: 'Outfit', sans-serif;
                    color: var(--text);
                    text-align: center;
                }

                .form-subtitle {
                    font-size: 13px;
                    color: var(--text-dim);
                    text-align: center;
                    margin-bottom: 24px;
                    font-family: 'Inter', sans-serif;
                }

                .form-group {
                    position: relative;
                    margin-bottom: 14px;
                    width: 100%;
                }

                .form-input-wrapper {
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                .form-input-icon {
                    position: absolute;
                    left: 14px;
                    color: var(--text-dim);
                    font-size: 16px;
                }

                .form-input {
                    width: 100%;
                    padding: 12px 12px 12px 42px;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    color: #fff;
                    font-family: 'Inter', sans-serif;
                    font-size: 14px;
                    transition: 0.25s;
                    outline: none;
                }

                .form-input:focus {
                    border-color: #6c5ce7;
                    background: rgba(255, 255, 255, 0.06);
                    box-shadow: 0 0 0 3px rgba(108, 92, 231, 0.2);
                }

                .form-submit-btn {
                    width: 100%;
                    padding: 12px;
                    border-radius: 12px;
                    border: none;
                    background: linear-gradient(135deg, #6c5ce7, #fd79a8);
                    color: white;
                    font-family: 'Inter', sans-serif;
                    font-weight: 700;
                    font-size: 14px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    transition: 0.25s;
                    margin-top: 6px;
                    box-shadow: 0 8px 20px rgba(108, 92, 231, 0.3);
                }

                .form-submit-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 25px rgba(108, 92, 231, 0.4);
                }

                .form-submit-btn:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }

                .form-error {
                    color: #ff4757;
                    font-size: 0.8rem;
                    margin-bottom: 10px;
                    padding: 8px 12px;
                    background: rgba(255, 71, 87, 0.08);
                    border-radius: 8px;
                    border-left: 3px solid #ff4757;
                }

                .mobile-switch-text {
                    display: none;
                }

                @media (max-width: 768px) {
                    .card {
                        width: 90% !important;
                        max-width: 380px !important;
                        height: 600px !important;
                        display: block !important;
                        padding: 0 !important;
                        overflow: hidden !important;
                    }
                    
                    .card-bg {
                        width: 100% !important;
                        height: 40% !important;
                        inset: 0 0 auto 0 !important;
                        transition: var(--duration) var(--easing-panel) !important;
                    }
                    
                    .toggle:checked ~ .card-bg {
                        translate: 0 150% !important;
                    }
                    
                    .hero {
                        width: 100% !important;
                        height: 40% !important;
                        left: 0 !important;
                        padding: 20px !important;
                    }
                    
                    .form {
                        width: 100% !important;
                        height: 60% !important;
                        left: 0 !important;
                        padding: 30px 24px !important;
                    }
                    
                    /* Layout coordinates for non-active positions */
                    .hero.signin {
                        top: 60% !important;
                        translate: 0 25% !important;
                    }
                    
                    .form.signup {
                        top: 40% !important;
                    }
                    
                    .form.signin {
                        top: 0 !important;
                        translate: 0 50% !important;
                    }
                    
                    .hero.signup {
                        top: 0 !important;
                    }
                    
                    /* Checked state transitions */
                    .toggle:checked ~ .hero.signup {
                        opacity: 0 !important;
                        visibility: hidden !important;
                        translate: 0 -25% !important;
                    }
                    
                    .toggle:checked ~ .form.signup {
                        opacity: 0 !important;
                        visibility: hidden !important;
                        translate: 0 -50% !important;
                    }
                    
                    .toggle:checked ~ .hero.signin,
                    .toggle:checked ~ .form.signin {
                        opacity: 1 !important;
                        visibility: visible !important;
                        translate: 0 !important;
                    }
                    
                    /* Form adjustment on mobile */
                    .form h2 {
                        font-size: 20px !important;
                        margin-bottom: 2px !important;
                    }
                    .form-subtitle {
                        font-size: 12px !important;
                        margin-bottom: 12px !important;
                    }
                    .form-group {
                        margin-bottom: 10px !important;
                    }
                    .form-input {
                        padding: 10px 12px 10px 38px !important;
                        font-size: 13px !important;
                    }
                    .form-submit-btn {
                        padding: 10px !important;
                        font-size: 13px !important;
                        margin-top: 4px !important;
                    }
                    .mobile-switch-text {
                        display: none !important;
                    }

                    /* Dynamically swap close button style to remain legible on mobile top panel */
                    .modern-close-btn {
                        color: #fff !important;
                        background: rgba(255, 255, 255, 0.15) !important;
                        border-color: rgba(255, 255, 255, 0.25) !important;
                    }
                    
                    .toggle:checked ~ .modern-close-btn {
                        color: var(--text) !important;
                        background: rgba(0, 0, 0, 0.05) !important;
                        border-color: rgba(0, 0, 0, 0.1) !important;
                    }
                    
                    .toggle:checked ~ .modern-close-btn:hover {
                        background: rgba(255, 71, 87, 0.1) !important;
                        border-color: #ff4757 !important;
                        color: #ff4757 !important;
                    }
                }
            `}</style>

            <div className="card" onClick={e => e.stopPropagation()}>
                <input
                    type="checkbox"
                    id="auth-toggle"
                    className="toggle"
                    checked={isLogin}
                    onChange={handleToggle}
                />
                <div className="card-bg"></div>

                <button className="modern-close-btn" onClick={onClose} aria-label="Close modal"><FiX /></button>

                {/* Heroes (Graphic Panels overlaying card-bg) */}
                <div className="hero signup">
                    <h2>Welcome Back.</h2>
                    <p>Log in to access your curated playlists, top tracks, and personal history.</p>
                    <label htmlFor="auth-toggle">SIGN IN</label>
                </div>

                <div className="hero signin">
                    <h2>Start Listening.</h2>
                    <p>Join the fastest-growing next-generation music streaming community today.</p>
                    <label htmlFor="auth-toggle">SIGN UP</label>
                </div>

                {/* Forms */}
                <form onSubmit={handleSubmit} className="form signup">
                    <h2>Create Account</h2>
                    <div className="form-subtitle">Takes less than 30 seconds.</div>
                    
                    <div className="form-group">
                        <div className="form-input-wrapper">
                            <FiUser className="form-input-icon" />
                            <input
                                className="form-input"
                                type="text"
                                placeholder="Full Name"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                disabled={isLogin}
                                required={!isLogin}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <div className="form-input-wrapper">
                            <FiMail className="form-input-icon" />
                            <input
                                className="form-input"
                                type="email"
                                placeholder="Email Address"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                disabled={isLogin}
                                required={!isLogin}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <PasswordStrength
                            id="signup-password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={val => setFormData({ ...formData, password: val })}
                            disabled={isLogin}
                            required={!isLogin}
                            showStrength={true}
                        />
                    </div>

                    {error && !isLogin && <p className="form-error">{error}</p>}

                    <button className="form-submit-btn" type="submit" disabled={loading}>
                        {loading ? 'Processing...' : 'Register Now'}
                    </button>
                    
                    <div className="mobile-switch-text">
                        Already a member? <span className="mobile-switch-link" onClick={handleToggle}>Log in here</span>
                    </div>
                </form>

                <form onSubmit={handleSubmit} className="form signin">
                    <h2>Sign In</h2>
                    <div className="form-subtitle">Let the music play!</div>
                    
                    <div className="form-group">
                        <div className="form-input-wrapper">
                            <FiMail className="form-input-icon" />
                            <input
                                className="form-input"
                                type="email"
                                placeholder="Email Address"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                disabled={!isLogin}
                                required={isLogin}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <PasswordStrength
                            id="signin-password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={val => setFormData({ ...formData, password: val })}
                            disabled={!isLogin}
                            required={isLogin}
                            showStrength={false}
                        />
                    </div>

                    {error && isLogin && <p className="form-error">{error}</p>}

                    <button className="form-submit-btn" type="submit" disabled={loading}>
                        {loading ? 'Processing...' : 'Sign In to Account'}
                    </button>
                    
                    <div className="mobile-switch-text">
                        Don't have an account? <span className="mobile-switch-link" onClick={handleToggle}>Create one now</span>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AuthModal;
