const axios = require('axios');

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

exports.searchMusic = async (req, res) => {
    try {
        const { q, pageToken, maxResults = 20 } = req.query;
        const response = await axios.get(`${YOUTUBE_API_BASE}/search`, {
            params: {
                part: 'snippet',
                q: `${q} music`,
                type: 'video',
                videoCategoryId: '10',
                maxResults,
                pageToken,
                key: process.env.YOUTUBE_API_KEY
            }
        });
        const videos = response.data.items.map(item => ({
            videoId: item.id.videoId,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
            channelTitle: item.snippet.channelTitle,
            publishedAt: item.snippet.publishedAt
        }));
        res.json({
            success: true,
            videos,
            nextPageToken: response.data.nextPageToken,
            totalResults: response.data.pageInfo.totalResults
        });
    } catch (error) {
        console.error('YouTube Search Error:', error.response?.data || error.message);
        res.status(500).json({ success: false, message: 'Failed to search music' });
    }
};

exports.getTrending = async (req, res) => {
    try {
        const { regionCode = 'IN', maxResults = 20 } = req.query;
        const response = await axios.get(`${YOUTUBE_API_BASE}/videos`, {
            params: {
                part: 'snippet,statistics,contentDetails',
                chart: 'mostPopular',
                videoCategoryId: '10',
                regionCode,
                maxResults,
                key: process.env.YOUTUBE_API_KEY
            }
        });
        const videos = response.data.items.map(item => ({
            videoId: item.id,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
            channelTitle: item.snippet.channelTitle,
            publishedAt: item.snippet.publishedAt,
            viewCount: item.statistics?.viewCount,
            likeCount: item.statistics?.likeCount,
            duration: item.contentDetails?.duration
        }));
        res.json({ success: true, videos });
    } catch (error) {
        console.error('YouTube Trending Error:', error.response?.data || error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch trending music' });
    }
};

exports.getVideoDetails = async (req, res) => {
    try {
        const { videoId } = req.params;
        const response = await axios.get(`${YOUTUBE_API_BASE}/videos`, {
            params: {
                part: 'snippet,statistics,contentDetails',
                id: videoId,
                key: process.env.YOUTUBE_API_KEY
            }
        });
        if (!response.data.items.length) {
            return res.status(404).json({ success: false, message: 'Video not found' });
        }
        const item = response.data.items[0];
        res.json({
            success: true,
            video: {
                videoId: item.id,
                title: item.snippet.title,
                description: item.snippet.description,
                thumbnail: item.snippet.thumbnails.high?.url,
                channelTitle: item.snippet.channelTitle,
                publishedAt: item.snippet.publishedAt,
                viewCount: item.statistics?.viewCount,
                likeCount: item.statistics?.likeCount,
                duration: item.contentDetails?.duration,
                tags: item.snippet.tags
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch video details' });
    }
};

exports.getRelatedVideos = async (req, res) => {
    try {
        const { videoId } = req.params;
        const response = await axios.get(`${YOUTUBE_API_BASE}/search`, {
            params: {
                part: 'snippet',
                relatedToVideoId: videoId,
                type: 'video',
                videoCategoryId: '10',
                maxResults: 15,
                key: process.env.YOUTUBE_API_KEY
            }
        });
        const videos = response.data.items
            .filter(item => item.snippet)
            .map(item => ({
                videoId: item.id.videoId,
                title: item.snippet.title,
                thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
                channelTitle: item.snippet.channelTitle
            }));
        res.json({ success: true, videos });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch related videos' });
    }
};

exports.getByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const { pageToken, maxResults = 20 } = req.query;
        const response = await axios.get(`${YOUTUBE_API_BASE}/search`, {
            params: {
                part: 'snippet',
                q: `${category} music songs`,
                type: 'video',
                videoCategoryId: '10',
                maxResults,
                pageToken,
                key: process.env.YOUTUBE_API_KEY
            }
        });
        const videos = response.data.items.map(item => ({
            videoId: item.id.videoId,
            title: item.snippet.title,
            thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
            channelTitle: item.snippet.channelTitle,
            publishedAt: item.snippet.publishedAt
        }));
        res.json({
            success: true,
            videos,
            nextPageToken: response.data.nextPageToken
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch category music' });
    }
};

exports.getArtistMusic = async (req, res) => {
    try {
        const { artistName } = req.params;
        const { pageToken, maxResults = 20 } = req.query;
        const response = await axios.get(`${YOUTUBE_API_BASE}/search`, {
            params: {
                part: 'snippet',
                q: `${artistName} songs music`,
                type: 'video',
                videoCategoryId: '10',
                maxResults,
                pageToken,
                key: process.env.YOUTUBE_API_KEY
            }
        });
        const videos = response.data.items.map(item => ({
            videoId: item.id.videoId,
            title: item.snippet.title,
            thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
            channelTitle: item.snippet.channelTitle,
            publishedAt: item.snippet.publishedAt
        }));
        res.json({
            success: true,
            videos,
            nextPageToken: response.data.nextPageToken
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch artist music' });
    }
};
