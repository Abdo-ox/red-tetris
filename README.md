# Red Tetris - Multiplayer Tetris Network

A full-stack multiplayer Tetris game built with Node.js, Socket.io, and React.

## Features

- Real-time multiplayer Tetris gameplay
- Room-based game sessions
- Host controls (start/restart game)
- Spectrum view of opponents' boards
- Penalty system when lines are cleared
- Shared piece sequence for all players
- Functional programming on client (React with hooks)
- OOP using prototypes on server

## Project Structure

```
red-tetris/
├── backend/           # Node.js backend server
│   ├── src/          # Source code
│   │   ├── Piece.js  # Piece class (OOP with prototypes)
│   │   ├── Player.js # Player class (OOP with prototypes)
│   │   ├── Game.js   # Game class (OOP with prototypes)
│   │   ├── GameManager.js # Game manager
│   │   └── __tests__/ # Unit tests
│   ├── server.js     # Express + Socket.io server
│   └── package.json
├── frontend/         # React SPA
│   ├── src/
│   │   ├── pages/    # Page components
│   │   ├── components/ # React components
│   │   ├── styles/   # CSS files
│   │   └── utils/    # Utility functions
│   └── package.json
└── README.md
```

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd red-tetris
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

## Configuration

1. Create a `.env` file in the `backend` directory:
```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```
PORT=3000
NODE_ENV=development
```

## Running the Application

### Development Mode

1. Start the backend server:
```bash
cd backend
npm run dev
```
The server will run on `http://localhost:3000`

2. Start the frontend development server (in a new terminal):
```bash
cd frontend
npm run dev
```
The frontend will run on `http://localhost:5173` with proxy to backend

### Production Mode

1. Build the frontend:
```bash
cd frontend
npm run build
```

2. Start the backend server (which serves the built frontend):
```bash
cd backend
npm start
```

The application will be available at `http://localhost:3000`

## Game URL Format

Join a game room using the following URL format:

```
http://server:port/<room>/<player_name>
```

Examples:
- `http://localhost:3000/room1/Player1`
- `http://localhost:3000/mygame/Alice`
- `http://localhost:3000/battle/Bob`

## Game Rules

- First player to join a room becomes the host
- Host can start/restart the game
- Players cannot join after the game has started
- All players receive the same piece sequence in the same order
- Pieces spawn at the same position (3, 0) for all players
- When a player clears lines, other players receive penalty lines
- Game ends when a player's board is filled

## Controls

- **← →** : Move piece left/right
- **↓** : Soft drop (move down)
- **↑ / X** : Rotate clockwise
- **Z** : Rotate counter-clockwise
- **Space** : Hard drop (instant drop)

## Testing

### Backend Tests

Run backend tests:
```bash
cd backend
npm test
```

Run tests with coverage:
```bash
cd backend
npm run test:coverage
```

Coverage requirements:
- ≥70% for statements, lines, and functions
- ≥50% for branches

### Frontend Tests

Run frontend tests:
```bash
cd frontend
npm test
```

Run tests with coverage:
```bash
cd frontend
npm run test:coverage
```

## Socket Protocol

See [SOCKET_PROTOCOL.md](SOCKET_PROTOCOL.md) for detailed socket communication protocol documentation.

## Architecture

### Backend

- **Server**: Express.js HTTP server with Socket.io
- **OOP**: Classes implemented using JavaScript prototypes (no ES6 classes)
- **Classes**:
  - `Piece`: Tetromino piece representation
  - `Player`: Player state and board
  - `Game`: Game logic and state management
  - `GameManager`: Manages all rooms and games

### Frontend

- **Framework**: React 18 with functional components and hooks
- **Routing**: React Router for SPA navigation
- **Style**: CSS with Flexbox/Grid (no Canvas, no SVG)
- **Communication**: Socket.io-client for real-time updates
- **Programming Style**: Functional programming (no `this` keyword in logic)

## Technologies

- **Backend**: Node.js, Express.js, Socket.io
- **Frontend**: React, React Router, Vite
- **Testing**: Jest (backend), Vitest (frontend)
- **Build Tool**: Vite

## License

ISC
