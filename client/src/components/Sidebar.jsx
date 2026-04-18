import { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { FiHome, FiCompass, FiMusic, FiClock, FiHeart, FiFolder, FiPlusCircle, FiBarChart, FiInfo, FiSettings } from 'react-icons/fi';

const Sidebar = ({ isOpen, setIsOpen, onResizeStart }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const isItemActive = (to) => {
        const url = new URL(to, 'http://x');
        const itemPath = url.pathname;
        const itemSearch = url.search;
        if (itemSearch) {
            return location.pathname === itemPath && location.search === itemSearch;
        }
        // For items without query strings, require no query params on current URL
        return location.pathname === itemPath && location.search === '';
    };

    const menuItems = [
        { icon: <FiHome />, label: 'Home', to: '/' },
        { icon: <FiCompass />, label: 'Explore', to: '/search' },
        { icon: <FiMusic />, label: 'Album', to: '/search?q=albums' },
    ];

    const libraryItems = [
        { icon: <FiClock />, label: 'Recents', to: '/search?q=recent' },
        { icon: <FiHeart />, label: 'Favourites', to: '/favorites' },
        { icon: <FiFolder />, label: 'Local', to: '/search?q=local' },
    ];

    const playlistItems = [
        { label: 'Hip-Hop', to: '/category/Hip%20Hop' },
        { label: 'Classical', to: '/category/Classical' },
        { label: 'Bollywood', to: '/category/Bollywood' },
    ];

    const otherItems = [
        { icon: <FiInfo />, label: 'About', to: '/about' },
        { icon: <FiSettings />, label: 'Settings', to: '/settings' },
    ];

    const closeSidebarOnMobile = () => {
        if (window.innerWidth <= 768) setIsOpen(false);
    };

    return (
        <aside className={`sidebar ${isOpen ? '' : 'collapsed'}`}>
            {/* Resize handle — only show when sidebar is open */}
            {isOpen && (
                <div
                    className="sidebar-resize-handle"
                    onMouseDown={onResizeStart}
                    title="Drag to resize"
                />
            )}

            <div className="sidebar-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px', padding: '0 10px' }}>
                <div className="sidebar-logo" onClick={() => { navigate('/'); closeSidebarOnMobile(); }} style={{ margin: 0 }}>
                    <div className="logo-icon-side">
                        <img src="/favicon.svg" alt="MelodyVerse Logo" className="app-logo-img" />
                    </div>
                    <div className="logo-text-side">
                        MELODY<span className="logo-accent">VERSE</span>
                    </div>
                </div>
            </div>

            <div className="sidebar-section">
                <div className="sidebar-section-title">RECOMMEND</div>
                {menuItems.map(item => (
                    <div
                        key={item.to}
                        className={`sidebar-item ${isItemActive(item.to) ? 'active' : ''}`}
                        onClick={() => { navigate(item.to); closeSidebarOnMobile(); }}
                        data-tooltip={item.label}
                    >
                        <span className="sidebar-icon">{item.icon}</span>
                        <span className="sidebar-label">{item.label}</span>
                    </div>
                ))}
            </div>

            <div className="sidebar-section">
                <div className="sidebar-section-title">LIBRARY</div>
                {libraryItems.map(item => (
                    <div
                        key={item.to}
                        className={`sidebar-item ${isItemActive(item.to) ? 'active' : ''}`}
                        onClick={() => { navigate(item.to); closeSidebarOnMobile(); }}
                        data-tooltip={item.label}
                    >
                        <span className="sidebar-icon">{item.icon}</span>
                        <span className="sidebar-label">{item.label}</span>
                    </div>
                ))}
            </div>

            <div className="sidebar-section">
                <div className="sidebar-section-title">PLAYLIST</div>
                <div
                    className="sidebar-item"
                    onClick={() => { closeSidebarOnMobile(); }}
                    style={{ cursor: 'pointer' }}
                    data-tooltip="Create New"
                >
                    <span className="sidebar-icon"><FiPlusCircle /></span>
                    <span className="sidebar-label">Create New</span>
                </div>
                {playlistItems.map(item => (
                    <div
                        key={item.to}
                        className={`sidebar-item ${isItemActive(item.to) ? 'active' : ''}`}
                        onClick={() => { navigate(item.to); closeSidebarOnMobile(); }}
                        data-tooltip={item.label}
                    >
                        <span className="sidebar-icon"><FiBarChart /></span>
                        <span className="sidebar-label">{item.label}</span>
                    </div>
                ))}
            </div>

            <div className="sidebar-section">
                <div className="sidebar-section-title">OTHER</div>
                {otherItems.map(item => (
                    <div
                        key={item.to}
                        className={`sidebar-item ${isItemActive(item.to) ? 'active' : ''}`}
                        onClick={() => { navigate(item.to); closeSidebarOnMobile(); }}
                        data-tooltip={item.label}
                    >
                        <span className="sidebar-icon">{item.icon}</span>
                        <span className="sidebar-label">{item.label}</span>
                    </div>
                ))}
            </div>
        </aside>
    );
};

export default Sidebar;
