import { createContext, useContext, useState, useRef, useEffect } from 'react';

const MusicContext = createContext();

export const useMusic = () => useContext(MusicContext);

export const MusicProvider = ({ children }) => {
    const [currentVideo, setCurrentVideo] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [queue, setQueue] = useState([]);
    const [queueIndex, setQueueIndex] = useState(0);
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
        if (currentVideo) {
            const prefix = isPlaying ? '▶ ' : '';
            document.title = `${prefix}${currentVideo.title} | MelodyVerse`;
        } else {
            document.title = 'MelodyVerse';
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
