# 🎵 MelodyVerse - Backend Server

The backend architecture powering MelodyVerse. It handles secure user authentication, interacts intelligently with external services (like YouTube search APIs), and serves the client's production bundle.

## ⚡ Built With
- **Node.js** & **Express.js** 
- **MongoDB** & **Mongoose**
- **JWT (JSON Web Tokens)** for stateless authentication.
- **bcrypt** for robust password encryption.

## 🚀 Getting Started

Ensure you have run `npm install` inside this environment.

### Environment Variable Setup
For this application to function correctly, an environment file is strictly required. 
1. Duplicate `.env.example` and rename it immediately to `.env`.
2. Fill your `.env` with actual development strings:
   - `MONGODB_URI` (Your local or remote mongo connection string)
   - `JWT_SECRET` (A strong, unique cryptographic passphrase)
   - `YOUTUBE_API_KEY` (Sourced securely from your Google Developer Console)
   - `PORT=5000`

### Starting the Server

**For Auto-Reloading Development (using nodemon):**
```bash
npm run dev
```

**For Standard Execution:**
```bash
npm start
```
The Express API will boot seamlessly on `http://localhost:5000/`.

## 🗄️ Database Seeding

We provide an initial database seeding script and promotion utility scripts to swiftly create valid mock data globally.
- Seed database instances: `node seed.js`
- Promote existing users to admin level: `node promote_user.js`

## 🔀 API Endpoints

- `POST /api/auth/register` - Create an account.
- `POST /api/auth/login` - Receive JWT token.
- `GET /api/music/search?q=query` - Fetches track results utilizing logic over the YT API.
