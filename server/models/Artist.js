const mongoose = require('mongoose');

const artistSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    bio: {
        type: String,
        default: ''
    },
    image: {
        type: String,
        default: ''
    },
    genre: [{
        type: String
    }],
    nationality: {
        type: String,
        default: 'Indian'
    },
    era: {
        type: String,
        default: ''
    },
    youtubeChannelId: {
        type: String,
        default: ''
    },
    featured: {
        type: Boolean,
        default: false
    },
    searchQuery: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Artist', artistSchema);
