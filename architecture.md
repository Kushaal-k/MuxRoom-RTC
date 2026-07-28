# MuxRoom Architecture

## Overview

MuxRoom is a peer-to-peer video conferencing experience built around WebRTC and Socket.IO. The frontend handles the user experience, media permissions, and WebRTC connection lifecycle, while the backend acts as a lightweight signaling server and TURN credential proxy.

## High-Level Architecture

```text
User Browser A        Socket.IO Server        User Browser B
      |                       |                     |
      |--- join-room / offer / answer / ICE --->|
      |<-- existing-users / user-joined ------|
      |                                         |
      |--- WebRTC media streams (direct) ------|
```

## Frontend Architecture

### Core UI flow

- Landing page: creates a new room or navigates to an existing one.
- Prejoin screen: requests camera and microphone access and lets the user confirm their setup.
- Meeting room: renders local and remote video tiles and provides meeting controls.

### Main frontend modules

- App.tsx
  - Defines the React Router routes:
    - / for the landing page
    - /preview/:roomId for the prejoin screen
    - /:roomId for the meeting room

- components/
  - LandingPage.tsx: marketing-style landing experience and room creation/join flow
  - PrejoinScreen.tsx: local media preview and identity setup
  - MeetingRoom.tsx: main meeting UI with video tiles and controls

- hooks/
  - useRTC.ts: encapsulates WebRTC lifecycle, media capture, peer connections, screen sharing, and Socket.IO listeners
  - useToast.ts: reusable toast notifications for join/leave/share events

- config/socket.ts
  - Creates the Socket.IO client instance and connects to the backend URL from environment variables

## Backend Architecture

### Responsibilities

- Accept incoming Socket.IO connections
- Maintain room membership in memory
- Relay signaling messages between peers
- Provide a TURN credentials endpoint for ICE server discovery

### Main backend modules

- server.js
  - Initializes Express and Socket.IO
  - Registers the /api/turn endpoint
  - Handles join-room, offer, answer, ice-candidate, and peer-left events
  - Tracks users by room in an in-memory Map

## Signaling Flow

1. A participant joins a room by emitting join-room.
2. The backend stores the user in the room's member list and emits existing-users to the joining client.
3. When a new participant joins, the backend notifies existing participants with user-joined.
4. The frontend then creates WebRTC offers and answers and exchanges ICE candidates over the socket connection.

## Media Flow

- Local media is captured from the browser using getUserMedia.
- Each peer connection receives audio and video tracks from the local stream.
- Remote streams are attached to video elements in the meeting UI.
- Screen sharing replaces the video sender track for connected peers.

## Connection and NAT Handling

- STUN is used initially for basic ICE connectivity.
- TURN credentials are fetched from Cloudflare through the backend endpoint /api/turn.
- This helps peers establish connections when they are behind restrictive networks.

## Current Design Constraints

- Room membership is stored in memory only, so restarting the backend clears all rooms.
- The server does not include persistent storage, authentication, or database-backed rooms yet.
- The app is designed as a lightweight demo or prototype rather than a production-grade conferencing platform.

## Suggested Future Improvements

- Persist rooms and participant state in a database
- Add authentication and authorization
- Support chat, recording, and breakout rooms
- Add server-side room cleanup and reconnection handling
- Improve scalability with a dedicated signaling service or SFU architecture
