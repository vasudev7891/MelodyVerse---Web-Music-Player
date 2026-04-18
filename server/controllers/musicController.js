const axios = require('axios');
const NodeCache = require('node-cache');

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

// ─── Server-Side Cache ─────────────────────────────────────────────────────────
// TTL = 15 minutes (900 seconds). YouTube results don't change per-second.
// checkperiod = 120s (cleanup expired keys every 2 minutes)
const apiCache = new NodeCache({ stdTTL: 900, checkperiod: 120 });

/**
 * Generate a deterministic cache key from endpoint + params
 */
const makeCacheKey = (endpoint, params) => {
    const sorted = Object.keys(params)
        .filter(k => k !== 'key') // never include API key in cache key
        .sort()
        .map(k => `${k}=${params[k] || ''}`)
        .join('&');
    return `${endpoint}?${sorted}`;
};

exports.searchMusic = async (req, res) => {
    try {
        const { q, pageToken, maxResults = 10 } = req.query;

        // ─── Min query length guard ────────────────────────────────────────
        if (!q || q.trim().length < 3) {
            return res.json({ success: true, videos: [], nextPageToken: null, totalResults: 0 });
        }

        const params = {
            part: 'snippet',
            q: `${q} music`,
            type: 'video',
            videoCategoryId: '10',
            maxResults,
            pageToken,
            key: process.env.YOUTUBE_API_KEY
        };

        // ─── Cache check ───────────────────────────────────────────────────
        const cacheKey = makeCacheKey('search', params);
        const cached = apiCache.get(cacheKey);
        if (cached) {
            console.log(`⚡ CACHE HIT: search "${q}"`);
            return res.json(cached);
        }

        const response = await axios.get(`${YOUTUBE_API_BASE}/search`, { params });
        const videos = response.data.items.map(item => ({
            videoId: item.id.videoId,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
            channelTitle: item.snippet.channelTitle,
            publishedAt: item.snippet.publishedAt
        }));
        const result = {
            success: true,
            videos,
            nextPageToken: response.data.nextPageToken,
            totalResults: response.data.pageInfo.totalResults
        };

        apiCache.set(cacheKey, result);
        console.log(`🌐 API CALL: search "${q}" (cached for 15 min)`);
        res.json(result);
    } catch (error) {
        console.error('YouTube Search Error:', error.response?.data || error.message);
        res.status(500).json({ success: false, message: 'Failed to search music' });
    }
};

exports.getTrending = async (req, res) => {
    try {
        const { regionCode = 'IN', maxResults = 20 } = req.query;

        const params = {
            part: 'snippet,statistics,contentDetails',
            chart: 'mostPopular',
            videoCategoryId: '10',
            regionCode,
            maxResults,
            key: process.env.YOUTUBE_API_KEY
        };

        // ─── Cache check ───────────────────────────────────────────────────
        const cacheKey = makeCacheKey('trending', params);
        const cached = apiCache.get(cacheKey);
        if (cached) {
            console.log(`⚡ CACHE HIT: trending ${regionCode}`);
            return res.json(cached);
        }

        const response = await axios.get(`${YOUTUBE_API_BASE}/videos`, { params });
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
        const result = { success: true, videos };

        apiCache.set(cacheKey, result);
        console.log(`🌐 API CALL: trending ${regionCode} (cached for 15 min)`);
        res.json(result);
    } catch (error) {
        console.error('YouTube Trending Error:', error.response?.data || error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch trending music' });
    }
};

exports.getVideoDetails = async (req, res) => {
    try {
        const { videoId } = req.params;

        const params = {
            part: 'snippet,statistics,contentDetails',
            id: videoId,
            key: process.env.YOUTUBE_API_KEY
        };

        // ─── Cache check ───────────────────────────────────────────────────
        const cacheKey = makeCacheKey('videoDetails', params);
        const cached = apiCache.get(cacheKey);
        if (cached) {
            console.log(`⚡ CACHE HIT: videoDetails ${videoId}`);
            return res.json(cached);
        }

        const response = await axios.get(`${YOUTUBE_API_BASE}/videos`, { params });
        if (!response.data.items.length) {
            return res.status(404).json({ success: false, message: 'Video not found' });
        }
        const item = response.data.items[0];
        const result = {
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
        };

        apiCache.set(cacheKey, result);
        console.log(`🌐 API CALL: videoDetails ${videoId} (cached for 15 min)`);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch video details' });
    }
};

exports.getRelatedVideos = async (req, res) => {
    try {
        const { videoId } = req.params;

        const params = {
            part: 'snippet',
            relatedToVideoId: videoId,
            type: 'video',
            videoCategoryId: '10',
            maxResults: 8,
            key: process.env.YOUTUBE_API_KEY
        };

        // ─── Cache check ───────────────────────────────────────────────────
        const cacheKey = makeCacheKey('related', params);
        const cached = apiCache.get(cacheKey);
        if (cached) {
            console.log(`⚡ CACHE HIT: related ${videoId}`);
            return res.json(cached);
        }

        const response = await axios.get(`${YOUTUBE_API_BASE}/search`, { params });
        const videos = response.data.items
            .filter(item => item.snippet)
            .map(item => ({
                videoId: item.id.videoId,
                title: item.snippet.title,
                thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
                channelTitle: item.snippet.channelTitle
            }));
        const result = { success: true, videos };

        apiCache.set(cacheKey, result);
        console.log(`🌐 API CALL: related ${videoId} (cached for 15 min)`);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch related videos' });
    }
};

exports.getByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const { pageToken, maxResults = 10 } = req.query;

        const params = {
            part: 'snippet',
            q: `${category} music songs`,
            type: 'video',
            videoCategoryId: '10',
            maxResults,
            pageToken,
            key: process.env.YOUTUBE_API_KEY
        };

        // ─── Cache check ───────────────────────────────────────────────────
        const cacheKey = makeCacheKey('category', params);
        const cached = apiCache.get(cacheKey);
        if (cached) {
            console.log(`⚡ CACHE HIT: category "${category}"`);
            return res.json(cached);
        }

        const response = await axios.get(`${YOUTUBE_API_BASE}/search`, { params });
        const videos = response.data.items.map(item => ({
            videoId: item.id.videoId,
            title: item.snippet.title,
            thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
            channelTitle: item.snippet.channelTitle,
            publishedAt: item.snippet.publishedAt
        }));
        const result = {
            success: true,
            videos,
            nextPageToken: response.data.nextPageToken
        };

        apiCache.set(cacheKey, result);
        console.log(`🌐 API CALL: category "${category}" (cached for 15 min)`);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch category music' });
    }
};

exports.getArtistMusic = async (req, res) => {
    try {
        const { artistName } = req.params;
        const { pageToken, maxResults = 10 } = req.query;

        const params = {
            part: 'snippet',
            q: `${artistName} songs music`,
            type: 'video',
            videoCategoryId: '10',
            maxResults,
            pageToken,
            key: process.env.YOUTUBE_API_KEY
        };

        // ─── Cache check ───────────────────────────────────────────────────
        const cacheKey = makeCacheKey('artist', params);
        const cached = apiCache.get(cacheKey);
        if (cached) {
            console.log(`⚡ CACHE HIT: artist "${artistName}"`);
            return res.json(cached);
        }

        const response = await axios.get(`${YOUTUBE_API_BASE}/search`, { params });
        const videos = response.data.items.map(item => ({
            videoId: item.id.videoId,
            title: item.snippet.title,
            thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
            channelTitle: item.snippet.channelTitle,
            publishedAt: item.snippet.publishedAt
        }));
        const result = {
            success: true,
            videos,
            nextPageToken: response.data.nextPageToken
        };

        apiCache.set(cacheKey, result);
        console.log(`🌐 API CALL: artist "${artistName}" (cached for 15 min)`);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch artist music' });
    }
};
