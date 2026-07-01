import { createContext, useContext, useState, useRef, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { addToRecentlyPlayed } from '../services/api';

const MusicContext = createContext();

export const useMusic = () => useContext(MusicContext);

export const MusicProvider = ({ children }) => {
    const { user, loadUser } = useAuth();
    const [currentVideo, setCurrentVideo] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [queue, setQueue] = useState([]);
    const [queueIndex, setQueueIndex] = useState(0);

    // Automatically record to Recently Played on video change
    useEffect(() => {
        if (user && currentVideo) {
            addToRecentlyPlayed({
                videoId: currentVideo.videoId,
                title: currentVideo.title,
                thumbnail: currentVideo.thumbnail,
                channelTitle: currentVideo.channelTitle
            })
            .then(() => {
                // Sync user profile state globally
                loadUser();
            })
            .catch(err => console.error('Failed to save to recently played:', err));
        }
    }, [currentVideo, user]);
    const [showPlayer, setShowPlayer] = useState(false);
    const [showAIAssistant, setShowAIAssistant] = useState(false);
    const [showMoodCamera, setShowMoodCamera] = useState(false);
    const [showVideo, setShowVideo] = useState(false);
    const [isTheaterMode, setIsTheaterMode] = useState(false);
    const [volume, setVolume] = useState(80);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const playerRef = useRef(null);

    useEffect(() => {
        let link = document.querySelector("link[rel~='icon']");
        if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
        }

        const accent = '%236c5ce7'; // #6c5ce7 url encoded
        const glowColor = '%23fd79a8'; // #fd79a8 url encoded
        
        const style = isPlaying 
            ? `<style>
                @keyframes pulse {
                    0% { filter: drop-shadow(0 0 10px ${accent}); transform: scale(0.95); transform-origin: center; }
                    50% { filter: drop-shadow(0 0 40px ${glowColor}); transform: scale(1.05); transform-origin: center; }
                    100% { filter: drop-shadow(0 0 10px ${accent}); transform: scale(0.95); transform-origin: center; }
                }
                path { animation: pulse 2s infinite; fill: ${accent}; }
               </style>`
            : `<style>path { fill: ${accent}; }</style>`;

        const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" width="64" height="64">${style}<path d="M96 128L96 476.9C96 533.1 184 535 184 476.9L184 238.3C191.9 185.4 272 187.9 272 244.8L272 420.1C272 478 368 478.1 368 420.1L368 304C373.3 249.3 456 251.5 456 308.3L456 332.1C456 392 544 388.7 544 332.1L544 128L96 128z"/></svg>`;
        
        const dataUri = `data:image/svg+xml;charset=utf-8,${svgString.replace(/"/g, "'").replace(/#/g, "%23").replace(/</g, "%3C").replace(/>/g, "%3E")}`;

        if (currentVideo) {
            const prefix = isPlaying ? '▶ ' : '';
            document.title = `${prefix}${currentVideo.title} | MelodyVerse`;
            link.href = dataUri;
        } else {
            document.title = 'MelodyVerse';
            link.href = dataUri; // Use same icon but without animation if no video playing
        }
    }, [currentVideo, isPlaying]);

    const playVideo = (video, videoList = []) => {
        setCurrentVideo(video);
        setIsPlaying(true);
        setShowPlayer(true);
        if (videoList.length > 0) {
            setQueue(videoList);
            const idx = videoList.findIndex(v => v.videoId === video.videoId);
            setQueueIndex(idx >= 0 ? idx : 0);
        }
    };

    const togglePlay = () => {
        setIsPlaying(!isPlaying);
    };

    const playNext = () => {
        if (queue.length > 0 && queueIndex < queue.length - 1) {
            const nextIdx = queueIndex + 1;
            setQueueIndex(nextIdx);
            setCurrentVideo(queue[nextIdx]);
            setIsPlaying(true);
        }
    };

    const playPrev = () => {
        if (queue.length > 0 && queueIndex > 0) {
            const prevIdx = queueIndex - 1;
            setQueueIndex(prevIdx);
            setCurrentVideo(queue[prevIdx]);
            setIsPlaying(true);
        }
    };

    const closePlayer = () => {
        setShowPlayer(false);
        setIsPlaying(false);
        setCurrentVideo(null);
    };

    return (
        <MusicContext.Provider value={{
            currentVideo, isPlaying, queue, queueIndex, showPlayer, 
            showAIAssistant, setShowAIAssistant, showMoodCamera, setShowMoodCamera,
            volume, progress, duration, playerRef, showVideo, isTheaterMode,
            playVideo, togglePlay, playNext, playPrev, closePlayer, setVolume, setProgress, setDuration, setIsPlaying, setShowVideo, setIsTheaterMode
        }}>
            {children}
        </MusicContext.Provider>
    );
};
