# 🎵 MelodyVerse - Music Streaming Platform

MelodyVerse is a full-stack, responsive music streaming web application. It features real-time search (powered by the YouTube Data API), a beautiful and dynamic user interface, secure user authentication with JWT, and an intuitive custom audio player.

## 🚀 Features

- **MelodyBot AI Assistant:** A sophisticated voice-activated chatbot powered by the Google Gemini AI API, capable of taking natural language commands to auto-play songs, navigate the app, and recommend dynamic playlists.
- **Deep-Learning Mood Camera:** Uses the `face-api.js` SDK running an offline Neural Network in your browser to accurately detect your facial expressions (Happy, Sad, Angry, etc.) and auto-play music to match your mood—with 100% privacy!
- **Dynamic Search:** Live search suggestions and seamless music querying using the YouTube API, with intelligent caching and quota optimization.
- **Recently Played:** A dedicated Recents page that shows your real listening history — just like a real music player app.
- **Custom Player:** Beautiful persistent music player with play/pause, progress tracking, and volume controls.
- **Authentication:** Secure user registration, login, and profile management with JWT.
- **Premium UI:** Built with React, Vite, and detailed CSS for a premium glassmorphic aesthetic.

## 🛠 Tech Stack

- **Frontend:** React, Vite, Context API for state management.
- **Backend:** Node.js, Express.js.
- **Database:** MongoDB & Mongoose.
- **Security:** JSON Web Tokens (JWT), bcrypt.
- **External API:** YouTube v3 Search API, Google Gemini API Key.
- **Caching:** `node-cache` (server-side, 15-min TTL) + custom LRU cache (client-side).

## 📁 Repository Structure

The code is located in the `/melodyverse` folder, which contains both the frontend and backend:

- `/melodyverse/client` - The Vite React frontend.
- `/melodyverse/server` - The Node.js/Express backend.

## 🚦 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16+)
- [MongoDB](https://www.mongodb.com/) (Local instance running horizontally or MongoDB Atlas URI)
- A **YouTube Data API v3 Key** (for fast music searching).
- A **Google Gemini API Key** (for powering the AI Chatbot backend).

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repository-url>
   cd melodyverse
   ```

2. **Install all dependencies:**
   From the `melodyverse` directory, run:
   ```bash
   npm run install:all
   ```
   *This command neatly installs root, client, and server dependencies respectively.*

3. **Environment Setup:**
   Navigate into the `server` directory and rename or copy `.env.example` to `.env`:
   ```bash
   cd server
   cp .env.example .env
   ```
   **Update the `.env` variables** with your active MongoDB URI, JWT Secret, YouTube API Key, and your Gemini API Key (`GEMINI_API_KEY`).

### Running the Application Locally

You can run the frontend and backend simultaneously or independently.

**To run both concurrently** (using root scripts in the `melodyverse` directory):
```bash
npm run dev:server
npm run dev:client
```
*(Open two terminal tabs to run them side-by-side).*

**Deploy Mode (Build client and run server serving client files):**
```bash
npm run deploy
```
## ⚡ YouTube API Quota Optimization

The YouTube Data API v3 has a strict daily quota of **10,000 units** (each `search.list` call costs 100 units). MelodyVerse implements 7 layers of optimization to reduce quota usage by **~70-85%**:

| # | Optimization | Impact |
|---|---|---|
| 1 | **Server-side cache** (`node-cache`, 15-min TTL) on all 6 YouTube endpoints | Eliminates 60-80% of redundant calls |
| 2 | **Client-side LRU cache** with TTL for search results, suggestions, and trending data | 20-30% additional savings for returning users |
| 3 | **Debounced search** (600ms) on live typing suggestions | Prevents API spam during typing |
| 4 | **Minimum query length** (3 chars) — server + client guard | Cuts useless short-query API calls |
| 5 | **Duplicate call prevention** — tracks last fetched query | Prevents re-fetching same results |
| 6 | **Reduced maxResults** (20→10 for search, 15→8 for related) | Smaller payloads, less data transfer |
| 7 | **Smart preloading** — uses `videos.list` (1 unit) instead of `search.list` (100 units) for Explore page | 99% cost reduction for Explore |

**Monitor usage:** Watch the server terminal for `⚡ CACHE HIT` vs `🌐 API CALL` logs to track real-time savings.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome. Feel free to check the issues page.

## 📝 License

This project is open-source and available under the [MIT License](LICENSE).
