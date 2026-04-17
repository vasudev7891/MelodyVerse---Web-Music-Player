import { useState, useEffect, useCallback, useRef } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useMusic } from './context/MusicContext';
import TopNavbar from './components/TopNavbar';
import Sidebar from './components/Sidebar';
import MusicPlayer from './components/MusicPlayer';
import AIAssistant from './components/AIAssistant';
import MoodCamera from './components/MoodCamera';
import Home from './pages/Home';
import Search from './pages/Search';
import Artists from './pages/Artists';
import ArtistPage from './pages/ArtistPage';
import CategoryPage from './pages/CategoryPage';
import Favorites from './pages/Favorites';
import Playlists from './pages/Playlists';
import TimeMachine from './pages/TimeMachine';
import Admin from './pages/Admin';
import About from './pages/About';
import Settings from './pages/Settings';
import './App.css';

const MIN_SIDEBAR = 180;
const MAX_SIDEBAR = 400;
const DEFAULT_SIDEBAR = 240;

function App() {
  const { showPlayer } = useMusic();
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth > 768);
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDEBAR);
  const isResizing = useRef(false);
  const [isResizingState, setIsResizingState] = useState(false);

  // Auto-close on mobile resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) setIsSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

  // ─── Sidebar resize logic ─────────────────────
  const startResize = useCallback((e) => {
    e.preventDefault();
    isResizing.current = true;
    setIsResizingState(true);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const handleMouseMove = (e) => {
      if (!isResizing.current) return;
      const newWidth = Math.max(MIN_SIDEBAR, Math.min(MAX_SIDEBAR, e.clientX));
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      isResizing.current = false;
      setIsResizingState(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, []);

  // CSS variable for sidebar width
  const containerStyle = {
    '--sidebar-width': isSidebarOpen ? `${sidebarWidth}px` : '68px',
  };

  return (
    <div
      className={`app-container ${!isSidebarOpen ? 'sidebar-closed' : ''} ${isResizingState ? 'is-resizing' : ''}`}
      style={containerStyle}
    >
      {isSidebarOpen && window.innerWidth <= 768 && (
        <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />
      )}
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        onResizeStart={startResize}
      />
      <div className="app-main-content">
        <TopNavbar onToggleSidebar={toggleSidebar} />
        <main className={`main-scroll ${showPlayer ? 'player-active' : ''}`}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/artists" element={<Artists />} />
            <Route path="/artist/:id" element={<ArtistPage />} />
            <Route path="/category/:name" element={<CategoryPage />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/playlists" element={<Playlists />} />
            <Route path="/time-machine" element={<TimeMachine />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/about" element={<About />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
        {showPlayer && <MusicPlayer />}
        <MoodCamera />
        <AIAssistant />
        <Toaster position="bottom-right" toastOptions={{ className: 'toast-custom', duration: 3000 }} />
      </div>
    </div>
  );
}

export default App;
