# 🎵 MelodyVerse - Music Streaming Platform

MelodyVerse is a full-stack, responsive music streaming web application. It features real-time search (powered by the YouTube Data API), a beautiful and dynamic user interface, secure user authentication with JWT, and an intuitive custom audio player.

## 🚀 Features

- **Dynamic Search:** Live search suggestions and seamless music querying using the YouTube API.
- **Custom Player:** Beautiful persistent music player with play/pause, progress tracking, and volume controls.
- **Authentication:** Secure user registration, login, and profile management with JWT.
- **Admin Dashboard:** Specific roles for managing platform data.
- **Modern UI:** Built with React, Vite, and detailed CSS for a premium aesthetic and glassmorphism design.

## 🛠 Tech Stack

- **Frontend:** React, Vite, Context API for state management.
- **Backend:** Node.js, Express.js.
- **Database:** MongoDB & Mongoose.
- **Security:** JSON Web Tokens (JWT), bcrypt.
- **External API:** YouTube v3 Search API.

## 📁 Repository Structure

The code is located in the `/melodyverse` folder, which contains both the frontend and backend:

- `/melodyverse/client` - The Vite React frontend.
- `/melodyverse/server` - The Node.js/Express backend.

## 🚦 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16+)
- [MongoDB](https://www.mongodb.com/) (Local instance running horizontally or MongoDB Atlas URI)
- A YouTube Data API v3 Key.

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
   **Update the `.env` variables** with your active MongoDB URI, JWT Secret, and YouTube API Key.

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

## 🤝 Contributing

Contributions, issues, and feature requests are welcome. Feel free to check the issues page.

## 📝 License

This project is open-source and available under the [MIT License](LICENSE).
