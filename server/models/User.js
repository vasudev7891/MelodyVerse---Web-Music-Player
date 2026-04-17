const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: 50
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 6,
        select: false
    },
    avatar: {
        type: String,
        default: ''
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    favorites: [{
        videoId: String,
        title: String,
        thumbnail: String,
        channelTitle: String,
        addedAt: { type: Date, default: Date.now }
    }],
    playlists: [{
        name: String,
        description: String,
        songs: [{
            videoId: String,
            title: String,
            thumbnail: String,
            channelTitle: String
        }],
        createdAt: { type: Date, default: Date.now }
    }],
    recentlyPlayed: [{
        videoId: String,
        title: String,
        thumbnail: String,
        channelTitle: String,
        playedAt: { type: Date, default: Date.now }
    }]
}, {
    timestamps: true
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
