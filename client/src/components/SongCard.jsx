import { FiPlay, FiHeart } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import { useMusic } from '../context/MusicContext';
import { useAuth } from '../context/AuthContext';
import { addToFavorites, removeFromFavorites } from '../services/api';
import toast from 'react-hot-toast';

const SongCard = ({ song, songList = [], animDelay = 0 }) => {
    const { playVideo } = useMusic();
    const { user, loadUser } = useAuth();

    const handlePlay = () => {
        playVideo(song, songList);
    };

    const isFavorited = user?.favorites?.some(fav => fav.videoId === song.videoId);

    const handleFavorite = async (e) => {
        e.stopPropagation();
        if (!user) {
            toast.error('Please login to save favorites');
            return;
        }

        try {
            if (isFavorited) {
                await removeFromFavorites(song.videoId);
                toast.success('Removed from favorites');
            } else {
                await addToFavorites({
                    videoId: song.videoId,
                    title: song.title,
                    thumbnail: song.thumbnail,
                    channelTitle: song.channelTitle
                });
                toast.success('Added to favorites! ❤️');
            }
            // Reload user data to synchronize favorite state
            await loadUser();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Action failed');
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
                
                {/* Floating Heart Button */}
                <button
                    className={`song-fav-btn ${isFavorited ? 'is-favorited' : ''}`}
                    onClick={handleFavorite}
                    title={isFavorited ? "Remove from favorites" : "Add to favorites"}
                >
                    {isFavorited ? <FaHeart /> : <FiHeart />}
                </button>

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
