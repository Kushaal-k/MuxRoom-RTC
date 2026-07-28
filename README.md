# MuxRoom

MuxRoom is a browser-based real-time video conferencing app built with React, TypeScript, Socket.IO, and WebRTC. It lets users create or join meeting rooms, preview their camera and microphone, and connect with other participants in a shared room without requiring a desktop app.

## Highlights

- Instant room creation from the landing page
- Pre-join media setup and device preview
- Multi-participant video rooms with audio/video toggles
- Screen sharing support
- Real-time signaling via Socket.IO
- TURN server support for ICE traversal via Cloudflare

## Tech Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS, Framer Motion, Lucide Icons
- Backend: Node.js, Express, Socket.IO
- Media and signaling: WebRTC, Socket.IO
- Authentication/credentials: Cloudflare TURN API

## Project Structure

```text
muxroom/
├── backend/
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── config/
│   │   ├── hooks/
│   │   └── types/
│   ├── package.json
│   └── vite.config.ts
├── architecture.md
└── README.md
```

## How It Works

1. The user lands on the landing page and creates or joins a room.
2. The pre-join screen requests camera and microphone access so the user can preview their setup.
3. The frontend connects to the Socket.IO server and joins a named room.
4. The backend relays WebRTC signaling messages such as offers, answers, and ICE candidates between peers.
5. The WebRTC peer connections establish direct media streams between browsers.
6. A TURN endpoint on the backend fetches ICE server credentials from Cloudflare when needed for connectivity behind NATs.

## Prerequisites

- Node.js 20+
- npm 10+
- A modern browser with camera and microphone permissions

## Environment Setup

### Backend

Create a file named .env inside the backend folder:

```env
CF_TOKEN_ID=your_cloudflare_token_id
CF_API_TOKEN=your_cloudflare_api_token
```

The backend uses these values to request TURN credentials from Cloudflare.

### Frontend

Create a file named .env inside the frontend folder:

```env
VITE_SOCKET_URL=http://localhost:3000
```

## Installation

```bash
cd backend && npm install
cd ../frontend && npm install
```

## Running the App

Start the backend:

```bash
cd backend
npm run dev
```

In a second terminal, start the frontend:

```bash
cd frontend
npm run dev
```

Then open the frontend URL shown by Vite, usually:

```text
http://localhost:5173
```

## Useful Scripts

### Backend

- npm run dev - start the Express and Socket.IO server with nodemon

### Frontend

- npm run dev - start the Vite development server
- npm run build - build the application for production
- npm run lint - run ESLint

## Notes

- Browser permissions for camera and microphone are required for local media access.
- The current implementation uses a simple in-memory room map on the backend, so rooms are ephemeral and reset when the server restarts.
- The app is intended for local development and demo use, and can be extended with persistent room storage and authentication later.
