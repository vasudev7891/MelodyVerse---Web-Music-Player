import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { FiPlay, FiPause, FiSkipBack, FiSkipForward, FiVolume2, FiVolumeX, FiX, FiTv, FiMaximize, FiAirplay, FiSettings, FiSquare, FiMinimize2, FiChevronsRight, FiChevronsLeft, FiShuffle, FiRepeat, FiMove } from 'react-icons/fi';
import { FaYoutube } from 'react-icons/fa';
import { useMusic } from '../context/MusicContext';

const MusicPlayer = () => {
    const {
        currentVideo, isPlaying, queue, queueIndex,
        playNext, playPrev, togglePlay, closePlayer,
        volume, setVolume, setIsPlaying, setProgress, setDuration, progress, duration,
        showVideo, setShowVideo, isTheaterMode, setIsTheaterMode
    } = useMusic();

    const playerRef = useRef(null);
    const iframeRef = useRef(null);
    const containerRef = useRef(null);
    const [ytPlayer, setYtPlayer] = useState(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [totalTime, setTotalTime] = useState(0);
    const progressInterval = useRef(null);
    const [videoSize, setVideoSize] = useState({ width: 320, height: 180 });
    const isResizing = useRef(false);
    const [isNativeFullscreen, setIsNativeFullscreen] = useState(false);
    const [showQualityMenu, setShowQualityMenu] = useState(false);
    const [quality, setQuality] = useState('auto');
    const [seekFeedback, setSeekFeedback] = useState(null);
    const [isMuted, setIsMuted] = useState(false);

    // ─── Drag-to-move state ────────────────────────────────────────────────────
    const [videoPos, setVideoPos] = useState({ x: window.innerWidth - 420, y: window.innerHeight - 350 });
    const isDragging = useRef(false);
    const dragOffset = useRef({ x: 0, y: 0 });

    // ─── Global Keyboard Shortcuts ─────────────────────────────────────────────
    const handleKeyDown = useCallback((e) => {
        // Don't intercept when user is typing in an input/textarea
        const tag = e.target.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) return;

        if (e.code === 'Space') {
            e.preventDefault();
            togglePlay();
        } else if (e.code === 'ArrowUp') {
            e.preventDefault();
            setVolume(v => Math.min(100, v + 5));
        } else if (e.code === 'ArrowDown') {
            e.preventDefault();
            setVolume(v => Math.max(0, v - 5));
        } else if (e.code === 'ArrowRight') {
            e.preventDefault();
            if (ytPlayer && totalTime) {
                ytPlayer.seekTo(Math.min(ytPlayer.getCurrentTime() + 10, totalTime), true);
            }
        } else if (e.code === 'ArrowLeft') {
            e.preventDefault();
            if (ytPlayer && totalTime) {
                ytPlayer.seekTo(Math.max(ytPlayer.getCurrentTime() - 10, 0), true);
            }
        } else if (e.code === 'KeyM') {
            setIsMuted(m => {
                const next = !m;
                if (ytPlayer) next ? ytPlayer.mute() : ytPlayer.unMute();
                return next;
            });
        }
    }, [togglePlay, setVolume, ytPlayer, totalTime]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    // ─── Volume toast for keyboard feedback ────────────────────────────────────
    const [volumeToast, setVolumeToast] = useState(null);
    const volumeToastTimer = useRef(null);
    useEffect(() => {
        clearTimeout(volumeToastTimer.current);
        setVolumeToast(volume);
        volumeToastTimer.current = setTimeout(() => setVolumeToast(null), 1200);
    }, [volume]);

    // ─── YouTube API ───────────────────────────────────────────────────────────
    useEffect(() => {
        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            const firstScript = document.getElementsByTagName('script')[0];
            firstScript.parentNode.insertBefore(tag, firstScript);
        }
    }, []);

    useEffect(() => {
        if (!currentVideo) return;

        const createPlayer = () => {
            if (ytPlayer) {
                ytPlayer.loadVideoById(currentVideo.videoId);
                return;
            }
            if (!window.YT || !window.YT.Player) {
                window.onYouTubeIframeAPIReady = () => initPlayer();
                return;
            }
            initPlayer();
        };

        const initPlayer = () => {
            const player = new window.YT.Player('yt-player', {
                height: '100%',
                width: '100%',
                videoId: currentVideo.videoId,
                playerVars: {
                    autoplay: 1, controls: 0, disablekb: 1,
                    fs: 1, modestbranding: 1, rel: 0,
                    origin: window.location.origin
                },
                events: {
                    onReady: (event) => {
                        event.target.setVolume(volume);
                        event.target.playVideo();
                        setYtPlayer(event.target);
                    },
                    onStateChange: (event) => {
                        if (event.data === window.YT.PlayerState.PLAYING) {
                            setIsPlaying(true);
                            startProgressTracking(event.target);
                        } else if (event.data === window.YT.PlayerState.PAUSED) {
                            setIsPlaying(false);
                        } else if (event.data === window.YT.PlayerState.ENDED) {
                            playNext();
                        }
                    }
                }
            });
            setYtPlayer(player);
        };

        createPlayer();
        return () => { if (progressInterval.current) clearInterval(progressInterval.current); };
    }, [currentVideo?.videoId]);

    useEffect(() => {
        if (!ytPlayer) return;
        try { isPlaying ? ytPlayer.playVideo() : ytPlayer.pauseVideo(); } catch (e) { }
    }, [isPlaying, ytPlayer]);

    useEffect(() => {
        if (ytPlayer) { try { ytPlayer.setVolume(volume); } catch (e) { } }
    }, [volume, ytPlayer]);

    const startProgressTracking = (player) => {
        if (progressInterval.current) clearInterval(progressInterval.current);
        progressInterval.current = setInterval(() => {
            try {
                const current = player.getCurrentTime();
                const total = player.getDuration();
                setCurrentTime(current);
                setTotalTime(total);
                if (total > 0) { setProgress((current / total) * 100); setDuration(total); }
            } catch (e) { }
        }, 500);
    };

    const handleProgressClick = (e) => {
        if (!ytPlayer || !totalTime) return;
        const rect = e.currentTarget.getBoundingClientRect();
        ytPlayer.seekTo(((e.clientX - rect.left) / rect.width) * totalTime, true);
    };

    const handleSeek = (offset) => {
        if (!ytPlayer || !totalTime) return;
        ytPlayer.seekTo(Math.max(0, Math.min(ytPlayer.getCurrentTime() + offset, totalTime)), true);
        setSeekFeedback(offset > 0 ? '+10s' : '-10s');
        setTimeout(() => setSeekFeedback(null), 800);
    };

    const formatTime = (s) => {
        if (!s || isNaN(s)) return '0:00';
        return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
    };

    const handleYouTube = () => {
        if (currentVideo) window.open(`https://www.youtube.com/watch?v=${currentVideo.videoId}`, '_blank');
    };

    const changeQuality = (level) => {
        if (ytPlayer) { try { ytPlayer.setPlaybackQuality(level); setQuality(level); setShowQualityMenu(false); } catch (e) { } }
    };

    // Resize logic
    const startResize = (e) => {
        e.preventDefault();
        isResizing.current = true;
        document.body.style.cursor = 'nwse-resize';
        document.body.style.userSelect = 'none';
        document.addEventListener('mousemove', handleResize);
        document.addEventListener('mouseup', stopResize);
    };
    const handleResize = (e) => {
        if (!isResizing.current) return;
        const rect = document.querySelector('.youtube-embed-container').getBoundingClientRect();
        const newWidth = Math.max(200, Math.min(800, e.clientX - rect.left));
        setVideoSize({ width: newWidth, height: newWidth * (9 / 16) });
    };
    const stopResize = () => {
        isResizing.current = false;
        document.body.style.cursor = 'default';
        document.body.style.userSelect = 'auto';
        document.removeEventListener('mousemove', handleResize);
        document.removeEventListener('mouseup', stopResize);
    };
    useEffect(() => {
        const handleFsChange = () => {
            setIsNativeFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFsChange);
        return () => document.removeEventListener('fullscreenchange', handleFsChange);
    }, []);

    const toggleNativeFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    // ─── Drag handlers for free-move ───────────────────────────────────────────
    const startDrag = useCallback((e) => {
        if (isTheaterMode) return;
        e.preventDefault();
        isDragging.current = true;
        const containerEl = e.target.closest('.youtube-embed-container');
        if (!containerEl) return;
        const rect = containerEl.getBoundingClientRect();
        dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        document.body.style.cursor = 'grabbing';
        document.body.style.userSelect = 'none';

        const onMove = (e) => {
            if (!isDragging.current) return;
            const newX = Math.max(0, Math.min(window.innerWidth - 100, e.clientX - dragOffset.current.x));
            const newY = Math.max(0, Math.min(window.innerHeight - 60, e.clientY - dragOffset.current.y));
            setVideoPos({ x: newX, y: newY });
        };
        const onUp = () => {
            isDragging.current = false;
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
        };
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
    }, [isTheaterMode]);

    if (!currentVideo) return null;

    const thumbSrc = currentVideo.thumbnail || `https://img.youtube.com/vi/${currentVideo.videoId}/mqdefault.jpg`;

    // Video position style — only used in non-theater PiP mode
    const videoPosStyle = (!isTheaterMode && !isNativeFullscreen) ? {
        width: `${videoSize.width}px`,
        height: `${videoSize.height}px`,
        left: `${videoPos.x}px`,
        top: `${videoPos.y}px`,
        right: 'auto',
    } : {};

    // Render video via portal to escape music-player's backdrop-filter stacking context
    const videoPortal = createPortal(
        <div
            ref={containerRef}
            className={`youtube-embed-container ${showVideo ? 'show-video' : 'hide-video'} ${isTheaterMode ? 'theater-mode' : ''} ${isNativeFullscreen ? 'native-fs' : ''}`}
            style={videoPosStyle}
        >
            {/* Drag handle bar */}
            {!isTheaterMode && showVideo && (
                <div className="video-drag-bar" onMouseDown={startDrag}>
                    <FiMove size={12} />
                    <span className="video-drag-title">{currentVideo.title?.substring(0, 36)}{currentVideo.title?.length > 36 ? '…' : ''}</span>
                </div>
            )}
            <div className="video-inner">
                <div id="yt-player" />
                <div className="seek-overlay backward" onDoubleClick={() => handleSeek(-10)} />
                <div className="seek-overlay forward" onDoubleClick={() => handleSeek(10)} />
                {seekFeedback && (
                    <div className={`seek-feedback ${seekFeedback === '+10s' ? 'forward-fb' : 'backward-fb'}`}>
                        {seekFeedback === '+10s' ? <FiChevronsRight /> : <FiChevronsLeft />}
                        <span>10s</span>
                    </div>
                )}
                {showVideo && (
                    <>
                        {isTheaterMode ? (
                            <button className="video-close-btn" style={{ right: '50px' }} onClick={() => setIsTheaterMode(false)} title="Exit Theater Mode (Minimize)"><FiMinimize2 /></button>
                        ) : null}
                        <button className="video-close-btn" style={{ right: '10px' }} onClick={() => setShowVideo(false)} title="Close Video"><FiX /></button>
                        <div className="video-controls-top">
                            <div className="quality-menu-container">
                                <button className={`video-control-btn ${showQualityMenu ? 'active' : ''}`} onClick={() => setShowQualityMenu(!showQualityMenu)} title="Quality"><FiSettings /></button>
                                {showQualityMenu && (
                                    <div className="quality-dropdown">
                                        <div className="quality-title">Quality</div>
                                        {['hd1080', 'hd720', 'large', 'medium', 'small', 'auto'].map(q => (
                                            <button key={q} className={`quality-item ${quality === q ? 'active' : ''}`} onClick={() => changeQuality(q)}>
                                                {q === 'hd1080' ? '1080p HD' : q === 'hd720' ? '720p HD' : q === 'large' ? '480p' : q === 'medium' ? '360p' : q === 'small' ? '240p' : 'Auto'}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <button className="video-control-btn" onClick={() => setIsTheaterMode(!isTheaterMode)} title="Theater Mode"><FiAirplay /></button>
                            <button className="video-control-btn" onClick={toggleNativeFullscreen} title={isNativeFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
                                {isNativeFullscreen ? <FiMinimize2 /> : <FiMaximize />}
                            </button>
                        </div>
                        {!isTheaterMode && <div className="video-resize-handle" onMouseDown={startResize} title="Drag to Resize" />}
                    </>
                )}
            </div>
        </div>,
        document.body
    );

    return (
        <>
            {/* Video rendered via portal — escapes backdrop-filter stacking context */}
            {videoPortal}

            {/* Bottom player bar */}
            <div className="music-player">
                {/* Track Info */}
                <div className="player-track-info">
                    <div className={`player-thumb-wrapper ${isPlaying ? 'is-playing' : ''}`}>
                        <img
                            className="player-thumb"
                            src={thumbSrc}
                            alt={currentVideo.title}
                            onError={e => { e.target.src = `https://img.youtube.com/vi/${currentVideo.videoId}/mqdefault.jpg`; }}
                        />
                    </div>
                    <div className="player-track-info-text">
                        <div className="player-track-title">{currentVideo.title}</div>
                        <div className="player-track-artist">{currentVideo.channelTitle}</div>
                    </div>
                </div>

                {/* Center Controls */}
                <div className="player-controls">
                    <div className="player-buttons">
                        <button className="player-btn" onClick={playPrev} title="Previous (←)"><FiSkipBack /></button>
                        <button
                            className="player-btn play-pause"
                            onClick={togglePlay}
                            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
                        >
                            {isPlaying ? <FiPause /> : <FiPlay style={{ marginLeft: '2px' }} />}
                        </button>
                        <button className="player-btn" onClick={playNext} title="Next (→)"><FiSkipForward /></button>
                    </div>
                    <div className="player-progress">
                        <span className="player-time">{formatTime(currentTime)}</span>
                        <div className="progress-bar" onClick={handleProgressClick}>
                            <div className="progress-fill" style={{ width: `${progress}%` }} />
                        </div>
                        <span className="player-time">{formatTime(totalTime)}</span>
                    </div>
                </div>

                {/* Right: Extra Controls */}
                <div className="player-extra">
                    <button className={`player-btn ${showVideo ? 'active' : ''}`} onClick={() => setShowVideo(!showVideo)} title="Toggle Video (V)">
                        <FiTv />
                    </button>
                    <button className="player-btn" onClick={handleYouTube} title="Open in YouTube">
                        <FaYoutube />
                    </button>
                    <div className="volume-control" title={`Volume: ${volume}% (↑↓ to adjust, M to mute)`}>
                        <button className="player-btn" onClick={() => setVolume(volume === 0 ? 80 : 0)}>
                            {volume === 0 ? <FiVolumeX /> : <FiVolume2 />}
                        </button>
                        <input
                            type="range"
                            className="volume-slider"
                            min="0"
                            max="100"
                            value={volume}
                            onChange={e => setVolume(Number(e.target.value))}
                            style={{
                                background: `linear-gradient(to right, #6c5ce7 0%, #a29bfe ${volume/2}%, #fd79a8 ${volume}%, rgba(255, 255, 255, 0.15) ${volume}%)`
                            }}
                        />
                    </div>
                    <button className="player-close" onClick={closePlayer} title="Close Player">
                        <FiX />
                    </button>
                </div>

                {/* Volume Toast (keyboard feedback) */}
                {volumeToast !== null && (
                    <div className="player-volume-toast">
                        {volumeToast === 0 ? '🔇' : volumeToast < 40 ? '🔈' : volumeToast < 70 ? '🔉' : '🔊'} {volumeToast}%
                    </div>
                )}
            </div>
        </>
    );
};

export default MusicPlayer;
