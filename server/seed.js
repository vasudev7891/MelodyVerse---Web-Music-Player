require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Artist = require('./models/Artist');
const Category = require('./models/Category');

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB for seeding...');

        // Clear existing data
        await Artist.deleteMany({});
        await Category.deleteMany({});

        // Create admin user if not exists
        const adminExists = await User.findOne({ email: 'admin@melodyverse.com' });
        if (!adminExists) {
            await User.create({
                name: 'Admin',
                email: 'admin@melodyverse.com',
                password: 'admin123',
                role: 'admin'
            });
            console.log('✅ Admin user created (admin@melodyverse.com / admin123)');
        }

        // Seed Legendary Artists
        const artists = [
            {
                name: 'Lata Mangeshkar',
                bio: 'The Nightingale of India, with a career spanning over seven decades. Known for her melodious voice that has touched millions of hearts worldwide.',
                genre: ['Bollywood', 'Indian Classical', 'Ghazal', 'Devotional'],
                nationality: 'Indian',
                era: '1940s-2020s',
                featured: true,
                searchQuery: 'Lata Mangeshkar best songs',
                image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Lata_Mangeshkar_2011.jpg/800px-Lata_Mangeshkar_2011.jpg'
            },
            {
                name: 'Mukesh',
                bio: 'One of the most beloved playback singers in Hindi cinema, known for his soulful voice and emotional renditions. Voice of Raj Kapoor.',
                genre: ['Bollywood', 'Classical'],
                nationality: 'Indian',
                era: '1940s-1970s',
                featured: true,
                searchQuery: 'Mukesh singer best songs',
                image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Mukesh_singer.jpg/440px-Mukesh_singer.jpg'
            },
            {
                name: 'Kishore Kumar',
                bio: 'The legendary singer, actor, and filmmaker. Known for his versatile voice ranging from romantic melodies to energetic numbers.',
                genre: ['Bollywood', 'Pop', 'Classical'],
                nationality: 'Indian',
                era: '1940s-1980s',
                featured: true,
                searchQuery: 'Kishore Kumar hit songs',
                image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Kishore_Kumar_in_1970s.jpg/440px-Kishore_Kumar_in_1970s.jpg'
            },
            {
                name: 'Mohammed Rafi',
                bio: 'One of the greatest playback singers in Indian cinema history. Known for his extraordinary voice range and versatility.',
                genre: ['Bollywood', 'Qawwali', 'Ghazal', 'Classical'],
                nationality: 'Indian',
                era: '1940s-1980s',
                featured: true,
                searchQuery: 'Mohammed Rafi hit songs',
                image: 'https://upload.wikimedia.org/wikipedia/commons/f/f0/Mohammed_Rafi.jpg'
            },
            {
                name: 'Asha Bhosle',
                bio: 'One of the most versatile singers in Indian cinema with over 12,000 songs. Known for her adaptability across genres.',
                genre: ['Bollywood', 'Pop', 'Ghazal', 'Classical'],
                nationality: 'Indian',
                era: '1940s-present',
                featured: true,
                searchQuery: 'Asha Bhosle best songs',
                image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Asha_Bhosle_at_the_Strength_of_a_Woman_awards_2014.jpg/440px-Asha_Bhosle_at_the_Strength_of_a_Woman_awards_2014.jpg'
            },
            {
                name: 'Arijit Singh',
                bio: 'The modern voice of Bollywood. Known for his soulful and emotional singing style that has defined contemporary Indian music.',
                genre: ['Bollywood', 'Pop', 'Romantic'],
                nationality: 'Indian',
                era: '2010s-present',
                featured: true,
                searchQuery: 'Arijit Singh hit songs',
                image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Arijit_Singh_2023.jpg/440px-Arijit_Singh_2023.jpg'
            },
            {
                name: 'A.R. Rahman',
                bio: 'The Mozart of Madras. Academy Award-winning composer and singer who revolutionized Indian film music.',
                genre: ['Bollywood', 'Classical', 'Electronic', 'World Music'],
                nationality: 'Indian',
                era: '1990s-present',
                featured: true,
                searchQuery: 'AR Rahman best songs',
                image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/A._R._Rahman_at_the_2019_Toronto_International_Film_Festival.jpg/440px-A._R._Rahman_at_the_2019_Toronto_International_Film_Festival.jpg'
            },
            {
                name: 'Shreya Ghoshal',
                bio: 'Multiple National Award-winning playback singer known for her classical training and versatile voice.',
                genre: ['Bollywood', 'Classical', 'Devotional'],
                nationality: 'Indian',
                era: '2000s-present',
                featured: true,
                searchQuery: 'Shreya Ghoshal hit songs',
                image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Shreya_Ghoshal_at_Filmfare_2016.jpg/440px-Shreya_Ghoshal_at_Filmfare_2016.jpg'
            },
            {
                name: 'Freddie Mercury',
                bio: 'The legendary Queen frontman. One of the greatest singers in rock history with an extraordinary vocal range.',
                genre: ['Rock', 'Pop', 'Opera Rock'],
                nationality: 'British',
                era: '1970s-1990s',
                featured: true,
                searchQuery: 'Freddie Mercury Queen best songs',
                image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Freddie_Mercury_performing_in_New_Haven%2C_CT%2C_November_1977.jpg/800px-Freddie_Mercury_performing_in_New_Haven%2C_CT%2C_November_1977.jpg'
            },
            {
                name: 'Michael Jackson',
                bio: 'The King of Pop. The most awarded music artist in history, known for revolutionary music and iconic dance moves.',
                genre: ['Pop', 'R&B', 'Dance'],
                nationality: 'American',
                era: '1960s-2000s',
                featured: true,
                searchQuery: 'Michael Jackson greatest hits',
                image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Michael_Jackson_in_1988.jpg/440px-Michael_Jackson_in_1988.jpg'
            },
            {
                name: 'Elvis Presley',
                bio: 'The King of Rock and Roll. One of the most significant cultural icons of the 20th century.',
                genre: ['Rock', 'Pop', 'Country', 'Gospel'],
                nationality: 'American',
                era: '1950s-1970s',
                featured: true,
                searchQuery: 'Elvis Presley greatest hits',
                image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Elvis_Presley_promoting_Jailhouse_Rock.jpg/440px-Elvis_Presley_promoting_Jailhouse_Rock.jpg'
            },
            {
                name: 'Sonu Nigam',
                bio: 'One of the most versatile Indian singers, known for his melodious voice and live performances.',
                genre: ['Bollywood', 'Pop', 'Classical', 'Ghazal'],
                nationality: 'Indian',
                era: '1990s-present',
                featured: true,
                searchQuery: 'Sonu Nigam best songs',
                image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Sonu_Nigam_%28cropped%29.jpg/440px-Sonu_Nigam_%28cropped%29.jpg'
            },
            {
                name: 'Neha Kakkar',
                bio: 'The pop queen of Bollywood, known for her peppy and energetic songs.',
                genre: ['Bollywood', 'Pop', 'Dance'],
                nationality: 'Indian',
                era: '2010s-present',
                featured: true,
                searchQuery: 'Neha Kakkar hit songs',
                image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Neha_Kakkar_at_Indian_Idol_11.jpg/800px-Neha_Kakkar_at_Indian_Idol_11.jpg'
            },
            {
                name: 'Atif Aslam',
                bio: 'Pakistani sensation who has ruled both Bollywood and Lollywood with his unique vocal style.',
                genre: ['Bollywood', 'Pop', 'Rock'],
                nationality: 'Pakistani',
                era: '2000s-present',
                featured: true,
                searchQuery: 'Atif Aslam hit songs',
                image: 'https://images.summitmedia-digital.com/cosmo/images/2021/09/27/atif-aslam-bollywood-songs-1632734125.jpg'
            },
            {
                name: 'Ed Sheeran',
                bio: 'British singer-songwriter known for his soulful voice and heartfelt lyrics.',
                genre: ['Pop', 'Acoustic', 'Folk'],
                nationality: 'British',
                era: '2010s-present',
                featured: true,
                searchQuery: 'Ed Sheeran greatest hits',
                image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Ed_Sheeran-6886_%28cropped%29.jpg/800px-Ed_Sheeran-6886_%28cropped%29.jpg'
            },
            {
                name: 'The Weeknd',
                bio: 'Canadian singer known for his dark R&B style and chart-topping hits.',
                genre: ['R&B', 'Pop', 'Electronic'],
                nationality: 'Canadian',
                era: '2010s-present',
                featured: true,
                searchQuery: 'The Weeknd best songs',
                image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/The_Weeknd_with_hand_up.jpg/800px-The_Weeknd_with_hand_up.jpg'
            }
        ];

        await Artist.insertMany(artists);
        console.log(`✅ ${artists.length} artists seeded`);

        // Seed Categories
        const categories = [
            { name: 'Bollywood', description: 'Latest and classic Bollywood music', color: '#e74c3c', searchQuery: 'Bollywood songs latest', image: '🎬' },
            { name: 'Indian Classical', description: 'Ragas, sitar, tabla, and classical compositions', color: '#f39c12', searchQuery: 'Indian classical music', image: '🎵' },
            { name: 'Ghazal', description: 'Soulful Urdu and Hindi ghazals', color: '#9b59b6', searchQuery: 'best ghazals collection', image: '🌙' },
            { name: 'Devotional', description: 'Bhajans, aartis, and spiritual music', color: '#e67e22', searchQuery: 'devotional bhajans Hindi', image: '🙏' },
            { name: 'Punjabi', description: 'High-energy Punjabi music and bhangra beats', color: '#2ecc71', searchQuery: 'Punjabi songs latest hit', image: '💃' },
            { name: 'Pop', description: 'International pop hits and chart-toppers', color: '#3498db', searchQuery: 'pop music hits 2024', image: '🎤' },
            { name: 'Rock', description: 'Classic rock, alternative, and modern rock', color: '#34495e', searchQuery: 'rock music greatest hits', image: '🎸' },
            { name: 'Hip Hop', description: 'Rap, hip hop, and urban music', color: '#1abc9c', searchQuery: 'hip hop rap music hits', image: '🎧' },
            { name: 'R&B / Soul', description: 'Rhythm and blues, soul music classics', color: '#8e44ad', searchQuery: 'R&B soul music best', image: '🎷' },
            { name: 'EDM', description: 'Electronic dance music and DJ sets', color: '#00cec9', searchQuery: 'EDM dance music best', image: '🎛️' },
            { name: 'Lo-Fi', description: 'Relaxing lo-fi beats for study and chill', color: '#636e72', searchQuery: 'lofi hip hop radio beats', image: '☕' },
            { name: 'Retro Bollywood', description: 'Golden era Bollywood hits from 60s-90s', color: '#d63031', searchQuery: 'old Bollywood songs 60s 70s 80s', image: '📻' },
            { name: 'Sufi', description: 'Mystical Sufi music and qawwalis', color: '#6c5ce7', searchQuery: 'sufi music qawwali best', image: '🌀' },
            { name: 'K-Pop', description: 'Korean pop music sensation', color: '#fd79a8', searchQuery: 'K-Pop music best hits', image: '🇰🇷' },
            { name: 'Jazz', description: 'Smooth jazz, classic jazz standards', color: '#74b9ff', searchQuery: 'jazz music smooth classics', image: '🎺' },
            { name: 'Country', description: 'Country music and folk songs', color: '#a29bfe', searchQuery: 'country music best hits', image: '🤠' }
        ];

        await Category.insertMany(categories);
        console.log(`✅ ${categories.length} categories seeded`);

        console.log('\n🎉 Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding error:', error);
        process.exit(1);
    }
};

seedData();
