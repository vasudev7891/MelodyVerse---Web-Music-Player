# 🎵 MelodyVerse - Frontend Client

This is the frontend component of MelodyVerse, built heavily focused on delivering a rich, responsive, and cinematic music streaming experience. 

## ⚡ Built With
- **React.js** (Bootstrapped with [Vite](https://vitejs.dev/))
- **Context API** (Global state management for Auth and Audio Player)
- **Vanilla CSS** (Custom, hand-crafted styles including glassmorphism and modern aesthetics)

## 🚀 Getting Started

Ensure you have run `npm install` in this directory (or executed `npm run install:all` from the parent directory).

### Development Server

Run the development instance locally with auto-reloading:

```bash
npm run dev
```
The application will be accessible at typically `http://localhost:5173/`.

### Build for Production

To create an optimized production bundle:

```bash
npm run build
```
This generates static files inside the `dist` directory, which can be served by our Express server natively.

## 🎨 Design System & CSS
The client does not rely on heavy CSS frameworks; styles are predominantly defined manually in vanilla CSS utilizing CSS Variables (`index.css`) to enforce a clean and consistent Design System (dark themes, fluid typography, subtle glowing effects, etc.).

## 📡 API Integration
The client communicates with:
1. `localhost:5000/api/*` (The local Express Backend for user, auth, and logic)
2. `YouTube Data API v3` (If configured on the server, ensuring audio results stream smoothly).
