import { useState, useRef, useEffect, useCallback } from 'react';
import * as faceapi from 'face-api.js';
import { FiCamera, FiX, FiPlay, FiRefreshCw } from 'react-icons/fi';
import { useMusic } from '../context/MusicContext';
import { searchMusic } from '../services/api';
import toast from 'react-hot-toast';

// Module-level flag: models persist in memory once loaded, no need to re-fetch on every mount
let modelsLoadedGlobal = false;

const MOODS = {
    happy: {
        emoji: '😃',
        label: 'Happy & Excited!',
        color: '#fdcb6e',
        suggestion: 'Playing upbeat & energetic songs to match your vibe!',
        queries: ['happy upbeat songs', 'dance party music', 'feel good bollywood songs', 'happy pop music 2024']
    },
    sad: {
        emoji: '😢',
        label: 'Feeling Sad',
        color: '#74b9ff',
        suggestion: 'Here are some soulful melodies to comfort you...',
        queries: ['sad emotional songs', 'heartbreak bollywood songs', 'sad romantic songs', 'soothing sad music']
    },
    angry: {
        emoji: '😡',
        label: 'Feeling Angry',
        color: '#ff6b6b',
        suggestion: 'Let\'s calm you down with some peaceful music...',
        queries: ['calm peaceful music', 'meditation relaxing music', 'soothing instrumental music', 'nature sounds relaxation']
    },
    surprised: {
        emoji: '😲',
        label: 'Surprised!',
        color: '#a29bfe',
        suggestion: 'Playing some amazing tracks to keep the excitement going!',
        queries: ['epic music playlist', 'mind blowing songs', 'amazing music mix', 'best music ever']
    },
    neutral: {
        emoji: '😐',
        label: 'Feeling Neutral',
        color: '#dfe6e9',
        suggestion: 'Playing a mix of chill and groovy tunes for you!',
        queries: ['chill music mix', 'lo-fi beats relaxing', 'café music playlist', 'chill bollywood songs']
    },
    fearful: {
        emoji: '😰',
        label: 'Feeling Anxious',
        color: '#00cec9',
        suggestion: 'Relaxing melodies to ease your mind...',
        queries: ['calming anxiety music', 'peaceful piano music', 'stress relief music', 'healing meditation music']
    },
    disgusted: {
        emoji: '🤢',
        label: 'Not Feeling Great',
        color: '#00b894',
        suggestion: 'Some fresh, uplifting music to brighten your mood!',
        queries: ['mood booster songs', 'motivational music', 'inspiring songs playlist', 'uplifting bollywood songs']
    }
};

const MoodCamera = () => {
    const { showMoodCamera: isOpen, setShowMoodCamera: setIsOpen, playVideo } = useMusic();
    const [stream, setStream] = useState(null);
    const [mood, setMood] = useState(null);
    const [scanning, setScanning] = useState(false);
    const [moodSongs, setMoodSongs] = useState([]);
    const [countdown, setCountdown] = useState(null);
    const [modelsLoaded, setModelsLoaded] = useState(modelsLoadedGlobal);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);      // Ref mirrors stream state to avoid stale closures
    const scanningRef = useRef(false);   // Guard against rapid double-click scanning

    const startCamera = useCallback(async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: 400, height: 300 }
            });
            streamRef.current = mediaStream;
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            toast.error('Camera access denied. Please allow camera permissions.');
            console.error('Camera error:', err);
        }
    }, []);

    const stopCamera = useCallback(() => {
        // Always read from ref to get the latest stream (avoids stale closure)
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
            setStream(null);
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            const init = async () => {
                // Only load models once across the app lifetime
                if (!modelsLoadedGlobal) {
                    try {
                        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
                        await faceapi.nets.faceExpressionNet.loadFromUri('/models');
                        modelsLoadedGlobal = true;
                        setModelsLoaded(true);
                    } catch (error) {
                        console.error("Error loading face-api models:", error);
                        toast.error("Failed to load mood detection models.");
                        return;
                    }
                } else {
                    setModelsLoaded(true);
                }
                await startCamera();
            };
            init();
        } else {
            stopCamera();
            setMood(null);
            setMoodSongs([]);
            setScanning(false);
            scanningRef.current = false;
            speechSynthesis.cancel(); // Stop any ongoing speech when modal closes
        }
        return () => {
            stopCamera();
            speechSynthesis.cancel();
        };
    }, [isOpen, startCamera, stopCamera]);

    // Re-attach stream to the video element (e.g., after React re-renders)
    useEffect(() => {
        if (streamRef.current && videoRef.current) {
            videoRef.current.srcObject = streamRef.current;
        }
    }, [stream, mood]);

    // Analyze the video frame for mood detection using face-api.js
    // Uses multi-frame sampling to overcome the model's neutral bias
    const analyzeMood = useCallback(async () => {
        if (!videoRef.current || !modelsLoaded || scanningRef.current) return;

        // Ensure the video is actually playing with valid frame data
        if (videoRef.current.readyState < 2) {
            toast.error("Camera is still initializing. Please wait a moment and try again.");
            return;
        }

        scanningRef.current = true;
        setScanning(true);
        setCountdown(3);

        // Countdown animation
        for (let i = 3; i > 0; i--) {
            setCountdown(i);
            await new Promise(r => setTimeout(r, 1000));
        }
        setCountdown(null);

        try {
            // ── Multi-frame sampling for accurate expression detection ──
            // A single frame often returns neutral. Sampling 5 frames over ~1.5s
            // and averaging the scores gives much more reliable results.
            const SAMPLE_COUNT = 5;
            const SAMPLE_DELAY_MS = 300;
            const expressionTotals = {};
            let successfulSamples = 0;

            const detectorOptions = new faceapi.TinyFaceDetectorOptions({
                inputSize: 320,        // Slightly smaller = faster per-frame, still accurate
                scoreThreshold: 0.3    // Lower threshold so faces are detected more reliably
            });

            for (let s = 0; s < SAMPLE_COUNT; s++) {
                try {
                    const detection = await faceapi.detectSingleFace(videoRef.current, detectorOptions)
                        .withFaceExpressions();

                    if (detection && detection.expressions) {
                        successfulSamples++;
                        for (const [expr, score] of Object.entries(detection.expressions)) {
                            expressionTotals[expr] = (expressionTotals[expr] || 0) + score;
                        }
                    }
                } catch (frameErr) {
                    // Individual frame failures are tolerated; we continue sampling
                    console.warn(`Sample ${s + 1} failed:`, frameErr);
                }

                // Wait between samples (except after the last one)
                if (s < SAMPLE_COUNT - 1) {
                    await new Promise(r => setTimeout(r, SAMPLE_DELAY_MS));
                }
            }

            let detectedMood = 'neutral';

            if (successfulSamples > 0) {
                // Average the accumulated scores
                const averaged = {};
                for (const [expr, total] of Object.entries(expressionTotals)) {
                    averaged[expr] = total / successfulSamples;
                }

                // Sort expressions by averaged confidence
                const sorted = Object.entries(averaged).sort((a, b) => b[1] - a[1]);
                const [topExpression, topScore] = sorted[0];

                // ── Neutral-bias correction ──
                // face-api.js frequently returns neutral as the top expression even when
                // the user is clearly showing emotion. If neutral wins, check whether the
                // strongest *non-neutral* expression has meaningful confidence (≥ 12%).
                if (topExpression === 'neutral' && sorted.length > 1) {
                    const bestNonNeutral = sorted.find(([expr]) => expr !== 'neutral');
                    if (bestNonNeutral) {
                        const [altExpr, altScore] = bestNonNeutral;
                        if (altScore >= 0.12 && MOODS[altExpr]) {
                            detectedMood = altExpr;
                        }
                        // else: truly neutral — keep default
                    }
                } else if (MOODS[topExpression]) {
                    detectedMood = topExpression;
                }
            } else {
                toast.error("Couldn't detect a face in any frame. Ensure good lighting and face the camera.");
            }

            setMood(detectedMood);
            setScanning(false);
            scanningRef.current = false;

            // Speak the result — uses the ACTUAL detected mood consistently
            const moodData = MOODS[detectedMood];
            speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(
                `I can see you're feeling ${moodData.label}. ${moodData.suggestion}`
            );
            utterance.rate = 1;
            utterance.pitch = 1.1;
            speechSynthesis.speak(utterance);

            // Fetch mood-based songs — separate try/catch so detection success isn't masked
            try {
                const randomQuery = moodData.queries[Math.floor(Math.random() * moodData.queries.length)];
                const res = await searchMusic(randomQuery);
                setMoodSongs(res.data.videos || []);
            } catch (songError) {
                console.error("Failed to fetch mood songs:", songError);
                toast.error("Mood detected successfully, but couldn't load songs. Please try again.");
            }

        } catch (error) {
            console.error("Face detection failed:", error);
            setScanning(false);
            scanningRef.current = false;
            toast.error("Face detection failed. Ensure your camera is working and you're well-lit.");
        }
    }, [modelsLoaded]);

    const playMoodMusic = () => {
        if (moodSongs.length > 0) {
            playVideo(moodSongs[0], moodSongs);
            toast.success(`🎵 Now playing ${mood} mood music!`);
            setIsOpen(false);
        }
    };

    const handleRescan = () => {
        setMood(null);
        setMoodSongs([]);
        speechSynthesis.cancel();
    };

    const moodData = mood ? MOODS[mood] : null;

    return (
        <>
            {isOpen && (
                <div className="modern-auth-overlay" onClick={() => setIsOpen(false)}>
                    <style>{`
                        .modern-auth-overlay {
                            position: fixed; inset: 0; background: rgba(0, 0, 0, 0.85); backdrop-filter: blur(8px);
                            display: flex; align-items: center; justify-content: center; z-index: 100000;
                        }
                        .modern-close-btn {
                            width: 40px; height: 40px; border-radius: 50%; background: rgba(255,255,255,0.1);
                            border: none; color: white; font-size: 1.5rem; display: flex; align-items: center; justify-content: center;
                            cursor: pointer; transition: 0.2s;
                        }
                        .modern-close-btn:hover { background: rgba(255,255,255,0.2); transform: scale(1.1); }
                        
                        .mood-split-container {
                            display: flex; width: 950px; height: 600px; max-width: 90vw; max-height: 90vh;
                            background: rgba(13, 13, 18, 0.95); border-radius: 24px;
                            border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
                            overflow: hidden; position: relative;
                            transform: scale(0.95); animation: scaleUp 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
                        }
                        
                        .mood-info-side {
                            flex: 0 0 380px; background: linear-gradient(135deg, rgba(45, 52, 54, 0.9), rgba(9, 132, 227, 0.8)), url('https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1000&auto=format&fit=crop');
                            background-size: cover; background-position: center; position: relative;
                            padding: 50px 40px; color: white; display: flex; flex-direction: column; justify-content: center;
                        }
                        .mood-info-side::after {
                            content: ''; position: absolute; inset: 0; background: linear-gradient(to right, rgba(13,13,18,0.3), rgba(13,13,18,0.95)); z-index: 1;
                        }
                        .mood-info-content { position: relative; z-index: 10; }
                        
                        .mood-camera-side {
                            flex: 1; padding: 40px; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; position: relative;
                            overflow-y: auto; overflow-x: hidden;
                        }
                        .mood-camera-side::-webkit-scrollbar { width: 6px; }
                        .mood-camera-side::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
                        
                        .mood-instructions { margin-top: 30px; display: flex; flex-direction: column; gap: 20px; }
                        .mood-step { display: flex; gap: 15px; align-items: flex-start; }
                        .mood-step-num { width: 28px; height: 28px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0; color: #74b9ff; }
                        .mood-step-text h4 { margin: 0 0 5px 0; font-size: 1.1rem; color: white; }
                        .mood-step-text p { margin: 0; font-size: 0.85rem; color: rgba(255,255,255,0.7); line-height: 1.4; }
                        
                        .camera-frame {
                            width: 100%; aspect-ratio: 4/3; background: #000; border-radius: 20px; overflow: hidden;
                            position: relative; box-shadow: 0 10px 30px rgba(0,0,0,0.5); border: 2px solid rgba(255,255,255,0.05);
                        }
                        .camera-frame video { width: 100%; height: 100%; object-fit: cover; transform: scaleX(-1); }
                        
                        .scanner-line {
                            position: absolute; top: 0; left: 0; width: 100%; height: 3px; background: #00cec9;
                            box-shadow: 0 0 15px #00cec9, 0 0 30px #00cec9;
                            animation: scanAnim 2s infinite linear; z-index: 10; opacity: 0.8;
                        }
                        @keyframes scanAnim { 0% { top: 0; } 50% { top: 100%; } 100% { top: 0; } }
                        
                        .modern-mood-btn {
                            width: 100%; padding: 18px; border-radius: 16px; border: none; background: linear-gradient(135deg, #0984e3, #00cec9);
                            color: white; font-family: 'Inter', sans-serif; font-weight: 700; font-size: 16px; cursor: pointer;
                            display: flex; align-items: center; justify-content: center; gap: 10px; transition: 0.3s; margin-top: 30px; box-shadow: 0 10px 25px rgba(9, 132, 227, 0.3);
                        }
                        .modern-mood-btn:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 15px 35px rgba(9, 132, 227, 0.4); }
                        .modern-mood-btn.rescan { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); box-shadow: none; margin-top: 10px; }
                        .modern-mood-btn.rescan:hover { background: rgba(255,255,255,0.1); }
                        
                        .mood-result-card {
                            background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px;
                            padding: 25px; width: 100%; backdrop-filter: blur(10px); animation: fadeIn 0.5s ease;
                        }
                        
                        .song-suggestion-card {
                            display: flex; align-items: center; gap: 12px; background: rgba(0,0,0,0.3); padding: 10px;
                            border-radius: 12px; margin-top: 10px; cursor: pointer; transition: 0.2s; border: 1px solid transparent;
                        }
                        .song-suggestion-card:hover { background: rgba(0,0,0,0.5); border-color: rgba(255,255,255,0.1); transform: translateX(5px); }
                        .song-suggestion-card img { width: 50px; height: 50px; border-radius: 8px; object-fit: cover; }
                        
                        .spin-icon { animation: spin 1s linear infinite; }
                        @keyframes spin { to { transform: rotate(360deg); } }

                        .neural-overlay {
                            position: absolute; inset: 0; background: radial-gradient(circle at center, transparent 30%, rgba(0, 206, 201, 0.1) 100%);
                            z-index: 15; pointer-events: none;
                        }

                        .scanning-hud {
                            position: absolute; inset: 0; border: 2px solid #00cec9; border-radius: 20px;
                            box-shadow: inset 0 0 50px rgba(0, 206, 201, 0.2); z-index: 16; pointer-events: none;
                            animation: hudPulse 2s infinite ease-in-out;
                        }

                        .scanning-grid {
                            position: absolute; inset: 0; background-image: 
                                linear-gradient(rgba(0, 206, 201, 0.1) 1px, transparent 1px),
                                linear-gradient(90deg, rgba(0, 206, 201, 0.1) 1px, transparent 1px);
                            background-size: 30px 30px; z-index: 12; opacity: 0.3; pointer-events: none;
                        }

                        .scanning-status-card {
                            position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%);
                            background: rgba(0,0,0,0.8); backdrop-filter: blur(12px); padding: 12px 24px;
                            border-radius: 50px; border: 1px solid rgba(0, 206, 201, 0.5);
                            display: flex; align-items: center; gap: 12px; z-index: 30;
                            color: #00cec9; font-weight: 600; font-size: 0.9rem; letter-spacing: 0.5px;
                            box-shadow: 0 10px 30px rgba(0,0,0,0.5); width: max-content;
                        }

                        .thinking-dot {
                            width: 8px; height: 8px; background: #00cec9; border-radius: 50%;
                            animation: dotPulse 1.5s infinite ease-in-out;
                        }

                        @keyframes dotPulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.5); opacity: 0.5; } }

                        @keyframes scaleUp {
                            from { transform: scale(0.95); opacity: 0; }
                            to { transform: scale(1); opacity: 1; }
                        }

                        @keyframes fadeIn {
                            from { opacity: 0; transform: translateY(10px); }
                            to { opacity: 1; transform: translateY(0); }
                        }

                        @keyframes hudPulse {
                            0%, 100% { box-shadow: inset 0 0 50px rgba(0, 206, 201, 0.2); border-color: #00cec9; }
                            50% { box-shadow: inset 0 0 80px rgba(0, 206, 201, 0.4); border-color: #55efc4; }
                        }

                        @media (max-width: 768px) {
                            .mood-split-container {
                                flex-direction: column !important;
                                width: 100vw !important;
                                height: 100vh !important;
                                max-width: 100vw !important;
                                max-height: 100vh !important;
                                border-radius: 0 !important;
                                transform: scale(1) !important;
                                animation: none !important;
                            }
                            .mood-info-side {
                                display: none !important;
                            }
                            .mood-camera-side {
                                padding: 20px !important;
                                justify-content: center !important;
                            }
                        }
                    `}</style>

                    <div className="mood-split-container" onClick={e => e.stopPropagation()}>

                        <div className="mood-info-side">
                            <div className="mood-info-content">
                                <h2 style={{ fontFamily: 'Outfit', fontSize: '2.5rem', fontWeight: 900, marginBottom: '10px', background: 'linear-gradient(135deg, #74b9ff, #00cec9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                    Mood AI
                                </h2>
                                <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.8)', marginBottom: '30px' }}>
                                    Let our visual artificial intelligence curate the perfect playlist for your current emotional frequency.
                                </p>

                                <div className="mood-instructions">
                                    <div className="mood-step">
                                        <div className="mood-step-num">1</div>
                                        <div className="mood-step-text">
                                            <h4>Face the Camera</h4>
                                            <p>Ensure you are well-lit and your face is visible within the frame.</p>
                                        </div>
                                    </div>
                                    <div className="mood-step">
                                        <div className="mood-step-num">2</div>
                                        <div className="mood-step-text">
                                            <h4>AI Scanning</h4>
                                            <p>Our local neural network scans 68 facial landmarks to accurately detect your true micro-expressions.</p>
                                        </div>
                                    </div>
                                    <div className="mood-step">
                                        <div className="mood-step-num">3</div>
                                        <div className="mood-step-text">
                                            <h4>Instant Music</h4>
                                            <p>A customized playlist is generated instantly to elevate or match your vibe.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mood-camera-side">
                            <button className="modern-close-btn" style={{ position: 'absolute', top: 20, right: 20, zIndex: 100 }} onClick={() => setIsOpen(false)}>
                                <FiX />
                            </button>

                            {/* Camera frame — ALWAYS in the DOM to prevent stream detachment on rescan */}
                            <div className="camera-frame" style={{ display: moodData ? 'none' : '' }}>
                                <video 
                                    ref={videoRef} 
                                    autoPlay 
                                    playsInline 
                                    muted 
                                    style={{ filter: scanning ? 'blur(4px) grayscale(40%) contrast(1.2)' : 'none', transition: 'filter 0.5s ease' }} 
                                />
                                
                                {scanning && (
                                    <>
                                        <div className="scanning-grid" />
                                        <div className="neural-overlay" />
                                        <div className="scanning-hud" />
                                        <div className="scanner-line" />
                                        <div className="scanning-status-card">
                                            <div className="thinking-dot" />
                                            <span>{countdown ? `Identifying Pose... ${countdown}` : "Neural Vectors: Mapping Expressions..."}</span>
                                        </div>
                                    </>
                                )}
                            </div>

                            {!moodData ? (
                                <button
                                    className="modern-mood-btn"
                                    onClick={analyzeMood}
                                    disabled={scanning || !stream}
                                    style={{ background: scanning ? 'rgba(0, 206, 201, 0.1)' : '', borderColor: scanning ? '#00cec9' : '' }}
                                >
                                    {scanning ? <><FiRefreshCw className="spin-icon" /> Neural Processing...</> : <><FiCamera /> Initialize Scan</>}
                                </button>
                            ) : (
                                <div className="mood-result-card" style={{ boxShadow: `0 0 40px ${moodData.color}22`, borderColor: `${moodData.color}55` }}>
                                    <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                                        <div style={{ fontSize: '4.5rem', marginBottom: '10px', animation: 'scaleUp 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>{moodData.emoji}</div>
                                        <h3 style={{ fontSize: '1.8rem', color: moodData.color, marginBottom: '5px' }}>{moodData.label}</h3>
                                        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem' }}>{moodData.suggestion}</p>
                                    </div>

                                    {moodSongs.length > 0 && (
                                        <div style={{ marginTop: '20px' }}>
                                            <div style={{ fontSize: '0.85rem', color: '#a0a0b0', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Curated Tracks</div>
                                            <div style={{ maxHeight: '150px', overflowY: 'auto', paddingRight: '5px' }}>
                                                {moodSongs.slice(0, 3).map((song, i) => (
                                                    <div key={i} className="song-suggestion-card" onClick={() => { playVideo(song, moodSongs); setIsOpen(false); toast.success('🎵 Playlist loaded!'); }}>
                                                        <img src={song.thumbnail} alt="" />
                                                        <div style={{ flex: 1, overflow: 'hidden' }}>
                                                            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'white', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{song.title}</div>
                                                            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>{song.channelTitle || 'Unknown Artist'}</div>
                                                        </div>
                                                        <FiPlay style={{ color: moodData.color, fontSize: '1.2rem' }} />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <button className="modern-mood-btn" onClick={playMoodMusic} style={{ background: `linear-gradient(135deg, ${moodData.color}, ${moodData.color}dd)` }}>
                                        <FiPlay /> Launch Playlist
                                    </button>
                                    <button className="modern-mood-btn rescan" onClick={handleRescan}>
                                        <FiRefreshCw /> Rescan Again
                                    </button>
                                </div>
                            )}
                            <canvas ref={canvasRef} style={{ display: 'none' }} />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default MoodCamera;
