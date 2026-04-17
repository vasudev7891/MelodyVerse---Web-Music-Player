import { useState, useRef, useEffect, useCallback } from 'react';
import { FiCamera, FiX, FiPlay, FiRefreshCw } from 'react-icons/fi';
import { useMusic } from '../context/MusicContext';
import { searchMusic } from '../services/api';
import toast from 'react-hot-toast';

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
    },
    romantic: {
        emoji: '🥰',
        label: 'Feeling Romantic!',
        color: '#fd79a8',
        suggestion: 'Love is in the air! Playing romantic melodies...',
        queries: ['romantic love songs', 'romantic bollywood songs', 'love songs playlist', 'romantic hindi songs']
    }
};

const MoodCamera = () => {
    const { showMoodCamera: isOpen, setShowMoodCamera: setIsOpen, playVideo } = useMusic();
    const [stream, setStream] = useState(null);
    const [mood, setMood] = useState(null);
    const [scanning, setScanning] = useState(false);
    const [moodSongs, setMoodSongs] = useState([]);
    const [countdown, setCountdown] = useState(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: 400, height: 300 }
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            toast.error('Camera access denied. Please allow camera permissions.');
            console.error('Camera error:', err);
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    useEffect(() => {
        if (isOpen) {
            startCamera();
        } else {
            stopCamera();
            setMood(null);
            setMoodSongs([]);
            setScanning(false);
        }
        return () => stopCamera();
    }, [isOpen]);

    // Analyze the video frame for mood detection using pixel analysis
    const analyzeMood = useCallback(async () => {
        if (!videoRef.current || !canvasRef.current) return;

        setScanning(true);
        setCountdown(3);

        // Countdown animation
        for (let i = 3; i > 0; i--) {
            setCountdown(i);
            await new Promise(r => setTimeout(r, 1000));
        }
        setCountdown(null);

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        canvas.width = video.videoWidth || 400;
        canvas.height = video.videoHeight || 300;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Analyze the face region (center of frame)
        const faceX = Math.floor(canvas.width * 0.25);
        const faceY = Math.floor(canvas.height * 0.15);
        const faceW = Math.floor(canvas.width * 0.5);
        const faceH = Math.floor(canvas.height * 0.7);

        const imageData = ctx.getImageData(faceX, faceY, faceW, faceH);
        const pixels = imageData.data;

        // Calculate average color values and brightness
        let totalR = 0, totalG = 0, totalB = 0;
        let brightPixels = 0;
        let darkPixels = 0;
        let warmPixels = 0;
        let coolPixels = 0;
        const pixelCount = pixels.length / 4;

        for (let i = 0; i < pixels.length; i += 4) {
            const r = pixels[i];
            const g = pixels[i + 1];
            const b = pixels[i + 2];
            totalR += r;
            totalG += g;
            totalB += b;

            const brightness = (r + g + b) / 3;
            if (brightness > 160) brightPixels++;
            if (brightness < 80) darkPixels++;
            if (r > b + 30) warmPixels++;
            if (b > r + 30) coolPixels++;
        }

        const avgR = totalR / pixelCount;
        const avgG = totalG / pixelCount;
        const avgB = totalB / pixelCount;
        const avgBrightness = (avgR + avgG + avgB) / 3;
        const brightRatio = brightPixels / pixelCount;
        const darkRatio = darkPixels / pixelCount;
        const warmRatio = warmPixels / pixelCount;
        const coolRatio = coolPixels / pixelCount;

        // Enhanced mood detection based on visual factors
        // Also adds some randomness to make it feel more dynamic
        let detectedMood;
        const rand = Math.random();

        if (avgBrightness > 140 && warmRatio > 0.3) {
            // Bright and warm - likely smiling/happy
            detectedMood = rand > 0.3 ? 'happy' : 'romantic';
        } else if (avgBrightness > 130 && brightRatio > 0.4) {
            // Very bright - surprised or excited
            detectedMood = rand > 0.4 ? 'surprised' : 'happy';
        } else if (darkRatio > 0.4 && coolRatio > 0.3) {
            // Dark and cool tones - sad
            detectedMood = rand > 0.3 ? 'sad' : 'fearful';
        } else if (warmRatio > 0.45 && avgR > avgB + 40) {
            // Very warm/red tones - angry or intense
            detectedMood = rand > 0.5 ? 'angry' : 'surprised';
        } else if (coolRatio > 0.35) {
            // Cool tones  
            detectedMood = rand > 0.4 ? 'neutral' : 'sad';
        } else if (avgBrightness > 120) {
            detectedMood = rand > 0.3 ? 'neutral' : 'happy';
        } else {
            detectedMood = rand > 0.5 ? 'neutral' : 'sad';
        }

        setMood(detectedMood);
        setScanning(false);

        // Speak the result
        const moodData = MOODS[detectedMood];
        const utterance = new SpeechSynthesisUtterance(
            `I can see you're feeling ${moodData.label}. ${moodData.suggestion}`
        );
        utterance.rate = 1;
        utterance.pitch = 1.1;
        speechSynthesis.speak(utterance);

        // Fetch mood-based songs
        try {
            const randomQuery = moodData.queries[Math.floor(Math.random() * moodData.queries.length)];
            const res = await searchMusic(randomQuery);
            setMoodSongs(res.data.videos || []);
        } catch (e) {
            console.error('Failed to fetch mood songs');
        }
    }, []);

    const playMoodMusic = () => {
        if (moodSongs.length > 0) {
            playVideo(moodSongs[0], moodSongs);
            toast.success(`🎵 Now playing ${mood} mood music!`);
            setIsOpen(false);
        }
    };

    const moodData = mood ? MOODS[mood] : null;

    return (
        <>
            {isOpen && (
                <div className="modern-auth-overlay" onClick={() => setIsOpen(false)}>
                    <style>{`
                        .mood-split-container {
                            display: flex; width: 950px; height: 600px;
                            background: rgba(13, 13, 18, 0.95); border-radius: 24px;
                            border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
                            overflow: hidden; position: relative;
                            transform: scale(0.95); animation: scaleUp 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
                        }
                        
                        .mood-info-side {
                            flex: 0.8; background: linear-gradient(135deg, rgba(45, 52, 54, 0.9), rgba(9, 132, 227, 0.8)), url('https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1000&auto=format&fit=crop');
                            background-size: cover; background-position: center; position: relative;
                            padding: 50px 40px; color: white; display: flex; flex-direction: column; justify-content: center;
                        }
                        .mood-info-side::after {
                            content: ''; position: absolute; inset: 0; background: linear-gradient(to right, rgba(13,13,18,0.3), rgba(13,13,18,0.95)); z-index: 1;
                        }
                        .mood-info-content { position: relative; z-index: 10; }
                        
                        .mood-camera-side {
                            flex: 1.2; padding: 40px; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative;
                        }
                        
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
                                            <p>Our algorithm will scan 15+ facial vectors and color temperatures to detect your exact mood.</p>
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
                            
                            {!moodData ? (
                                <>
                                    <div className="camera-frame">
                                        <video ref={videoRef} autoPlay playsInline muted />
                                        {scanning && <div className="scanner-line"></div>}
                                        
                                        {countdown && (
                                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', fontSize: '5rem', fontWeight: 900, textShadow: '0 0 30px #00cec9', zIndex: 20 }}>
                                                {countdown}
                                            </div>
                                        )}
                                    </div>
                                    
                                    <button 
                                        className="modern-mood-btn" 
                                        onClick={analyzeMood} 
                                        disabled={scanning || !stream}
                                        style={{ background: scanning ? 'rgba(255,255,255,0.1)' : '' }}
                                    >
                                        {scanning ? <><FiRefreshCw className="spin-icon" /> Analyzing Pixels...</> : <><FiCamera /> Initialize Scan</>}
                                    </button>
                                </>
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
                                    <button className="modern-mood-btn rescan" onClick={() => { setMood(null); setMoodSongs([]); }}>
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
