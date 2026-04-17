import { FiPlay, FiHeart } from 'react-icons/fi';
import { useMusic } from '../context/MusicContext';
import { useAuth } from '../context/AuthContext';
import { addToFavorites, addToRecentlyPlayed } from '../services/api';
import toast from 'react-hot-toast';

const SongCard = ({ song, songList = [], animDelay = 0 }) => {
    const { playVideo } = useMusic();
    const { user } = useAuth();

    const handlePlay = async () => {
        playVideo(song, songList);
        if (user) {
            try {
                await addToRecentlyPlayed({
                    videoId: song.videoId,
                    title: song.title,
                    thumbnail: song.thumbnail,
                    channelTitle: song.channelTitle
                });
            } catch (e) { }
        }
    };

    const handleFavorite = async (e) => {
        e.stopPropagation();
        if (!user) {
            toast.error('Please login to save favorites');
            return;
        }
        try {
            await addToFavorites({
                videoId: song.videoId,
                title: song.title,
                thumbnail: song.thumbnail,
                channelTitle: song.channelTitle
            });
            toast.success('Added to favorites! ❤️');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Already in favorites');
        }
    };

    return (
        <div
            className="song-card animate-in"
            style={{ animationDelay: `${animDelay * 0.05}s` }}
            onClick={handlePlay}
        >
            <div className="song-thumb-wrapper">
                <img
                    className="song-img"
                    src={song.thumbnail || `https://img.youtube.com/vi/${song.videoId}/mqdefault.jpg`}
                    alt={song.title}
                    loading="lazy"
                />
                <div className="song-play-btn-overlay">
                    <FiPlay />
                </div>
            </div>
            <div className="song-card-details">
                <div className="song-card-title">{song.title}</div>
                <div className="song-card-artist">{song.channelTitle}</div>
            </div>
        </div>
    );
};

export default SongCard;
