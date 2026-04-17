require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const promoteUser = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const user = await User.findOneAndUpdate(
            { email: 'aayushtyagi728@gmail.com' },
            { role: 'admin' },
            { new: true }
        );
        if (user) {
            console.log(`✅ User ${user.email} promoted to ${user.role}`);
        } else {
            console.log('❌ User not found');
        }
        process.exit(0);
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
        process.exit(1);
    }
};

promoteUser();
