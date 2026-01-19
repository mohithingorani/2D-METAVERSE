
# ONLINE 2D MULTIPLAYER SPACE
A real-time multiplayer 2D space where users can sign up, sign in, move around a shared map, see other players live, and chat with nearby users.
Built using Node.js microservices and a dedicated WebSocket server for real-time communication.


## Features
- JWT Authentication (Signup / Signin)
- Realtime Multiplayer Movement
- Shared 2D World with Camera Follow
- Proximity-based Chat System
- Server-side movement validation
- Sound effects & background music
- Fully Dockerized (Backend + WS Server)
- WebSocket-based real-time sync

##  Architecture Overview

            Frontend (React + Canvas)
                    |
                    | WebSocket
                    v
            WebSocket Server (ws)
                    |
                    | HTTP (JWT protected)
                    v
            Backend API (Express + Prisma)
                    |
                    v
                Database

## Tech Stack

**Frontend:** 
- React (Vite)
- TypeScript
- HTML Canvas
- WebSocket API
- Tailwind CSS


**Backend:** 
- Node.js
- Express
- Prisma ORM
- PostgreSQL
- JWT Authentication

**WebSocket Server**
- ws
- JWT verification
- Room & user management

**Devops**
- Docker
- Docker Compose
##  Architecture Overview

    .
    ├── backend/
    │   ├── prisma/
    │   ├── routes/
    │   ├── middlewares/
    │   ├── lib/
    │   ├── Dockerfile
    │   └── src/index.ts
    │
    ├── ws-server/
    │   ├── RoomManager.ts
    │   ├── User.ts
    │   ├── utils.ts
    │   └── Dockerfile
    │
    ├── frontend/
    │   ├── components/
    │   ├── utils/
    │   ├── assets/
    │   └── Arena.tsx
    │
    ├── docker-compose.yml
    └── README.md
## Authentication Flow

    1. User signs up / signs in via REST API
    2. Backend returns a JWT token
    3. Token is stored in localStorage
    4. Token is sent while joining the WebSocket connection
    5. WebSocket server verifies JWT and fetches user data from backend

## Movement Validation (Server Side)

- Only 1 tile per move
- Must stay inside map bounds
- Blocked tiles are not allowed
- Invalid moves are rejected and corrected by server
## Docker Setup

docker-compose.yml

```bash
  services:
  backend:
    build: ./backend
    container_name: backend
    ports:
      - "3018:3000"
    env_file:
      - ./backend/.env
    restart: unless-stopped

  ws-server:
    build: ./ws-server
    container_name: ws-server
    ports:
      - "8083:8080"
    environment:
      BACKEND_URL: http://backend:3000
      JWT_PASSWORD: ${JWT_PASSWORD}
    depends_on:
      - backend
    restart: unless-stopped

```

## Running the Project

```bash
docker compose up --build
```
Then open your frontend in browser

## Controls

- ⬆️⬇️⬅️➡️ Arrow keys to move
- Enter to start chat with nearby users
- Background music plays after game starts
## Author

[Mohit Hingorani](https://www.github.com/mohithingorani)\
Full-stack Developer | WebSockets | React | Node.js | Multiplayer Systems

