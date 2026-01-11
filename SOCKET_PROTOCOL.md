# Socket.io Protocol Documentation

This document describes the socket.io communication protocol between the client and server for Red Tetris.

## Connection

Clients connect to the server using Socket.io client library:

```javascript
import { io } from 'socket.io-client';
const socket = io('http://localhost:3000');
```

## Events

### Client to Server Events

#### `join-room`
Join a game room.

**Payload:**
```javascript
{
  room: string,        // Room name
  playerName: string   // Player name
}
```

**Response Event:** `room-joined`

**Error Event:** `error`

---

#### `start-game`
Start the game (host only).

**Payload:**
```javascript
{
  room: string
}
```

**Response Event:** `game-started`

**Error Event:** `error`

---

#### `restart-game`
Restart the game (host only).

**Payload:**
```javascript
{
  room: string
}
```

**Response Event:** `game-restarted`

**Error Event:** `error`

---

#### `game-action`
Perform a game action (move, rotate, drop).

**Payload:**
```javascript
{
  room: string,
  action: string,      // 'move-left', 'move-right', 'move-down', 'rotate', 'rotate-counter', 'hard-drop'
  data: any            // Optional additional data
}
```

**Response Event:** `game-update` (broadcast to other players), `spectrum-update`

**Error Event:** `error`

---

### Server to Client Events

#### `room-joined`
Emitted when a player successfully joins a room.

**Payload:**
```javascript
{
  success: true,
  room: string,
  playerName: string,
  isHost: boolean,
  players: Array<{
    socketId: string,
    playerName: string,
    isHost: boolean,
    score: number,
    lines: number,
    level: number,
    gameOver: boolean
  }>
}
```

---

#### `player-joined`
Emitted to other players when a new player joins the room.

**Payload:**
```javascript
{
  playerName: string,
  isHost: boolean,
  players: Array<{
    socketId: string,
    playerName: string,
    isHost: boolean,
    score: number,
    lines: number,
    level: number,
    gameOver: boolean
  }>
}
```

---

#### `player-left`
Emitted when a player leaves the room.

**Payload:**
```javascript
{
  playerName: string,
  newHost: string | null,  // New host name if host left
  players: Array<{
    socketId: string,
    playerName: string,
    isHost: boolean,
    score: number,
    lines: number,
    level: number,
    gameOver: boolean
  }>
}
```

---

#### `room-state`
Emitted when a player joins to receive current room state.

**Payload:**
```javascript
{
  room: string,
  isStarted: boolean,
  isActive: boolean,
  players: Array<{
    socketId: string,
    playerName: string,
    isHost: boolean,
    score: number,
    lines: number,
    level: number,
    gameOver: boolean
  }>,
  gameState: {
    room: string,
    isActive: boolean,
    isStarted: boolean,
    players: Array<{
      playerName: string,
      board: number[][],          // 20x10 board
      score: number,
      lines: number,
      level: number,
      gameOver: boolean,
      currentPiece: {
        type: string,
        x: number,
        y: number,
        rotation: number,
        color: string
      },
      nextPiece: {
        type: string,
        x: number,
        y: number,
        rotation: number,
        color: string
      }
    }>
  } | null
}
```

---

#### `game-started`
Emitted to all players when the game starts.

**Payload:**
```javascript
{
  success: true,
  gameState: {
    room: string,
    isActive: boolean,
    isStarted: boolean,
    players: Array<{
      playerName: string,
      board: number[][],
      score: number,
      lines: number,
      level: number,
      gameOver: boolean,
      currentPiece: {
        type: string,
        x: number,
        y: number,
        rotation: number,
        color: string
      },
      nextPiece: {
        type: string,
        x: number,
        y: number,
        rotation: number,
        color: string
      }
    }>
  }
}
```

---

#### `game-restarted`
Emitted to all players when the game is restarted.

**Payload:**
```javascript
{
  success: true,
  gameState: {
    room: string,
    isActive: boolean,
    isStarted: boolean,
    players: Array<{
      playerName: string,
      board: number[][],
      score: number,
      lines: number,
      level: number,
      gameOver: boolean,
      currentPiece: {
        type: string,
        x: number,
        y: number,
        rotation: number,
        color: string
      },
      nextPiece: {
        type: string,
        x: number,
        y: number,
        rotation: number,
        color: string
      }
    }>
  }
}
```

---

#### `game-update`
Emitted to all players when a game action is performed.

**Payload:**
```javascript
{
  playerName: string,
  action: string,
  gameState: {
    room: string,
    isActive: boolean,
    isStarted: boolean,
    players: Array<{
      playerName: string,
      board: number[][],
      score: number,
      lines: number,
      level: number,
      gameOver: boolean,
      currentPiece: {
        type: string,
        x: number,
        y: number,
        rotation: number,
        color: string
      },
      nextPiece: {
        type: string,
        x: number,
        y: number,
        rotation: number,
        color: string
      }
    }>
  }
}
```

---

#### `spectrum-update`
Emitted to all players with updated board states for spectrum view.

**Payload:**
```javascript
{
  room: string,
  players: Array<{
    playerName: string,
    board: number[][],
    score: number,
    lines: number,
    level: number,
    gameOver: boolean,
    currentPiece: {
      type: string,
      x: number,
      y: number,
      rotation: number,
      color: string
    },
    nextPiece: {
      type: string,
      x: number,
      y: number,
      rotation: number,
      color: string
    }
  }>
}
```

---

#### `error`
Emitted when an error occurs.

**Payload:**
```javascript
{
  message: string
}
```

**Common Error Messages:**
- `"Room and player name required"`
- `"Player name already taken"`
- `"Game has already started or need to be restarted!"`
- `"Only host can start the game"`
- `"Only host can restart the game"`
- `"Room not found"`
- `"Player not found"`
- `"Game not active"`
- `"Unknown action"`

---

## Game Actions

Available game actions for the `game-action` event:

- `move-left`: Move piece one cell to the left
- `move-right`: Move piece one cell to the right
- `move-down`: Move piece one cell down (soft drop)
- `rotate`: Rotate piece clockwise
- `rotate-counter`: Rotate piece counter-clockwise
- `hard-drop`: Drop piece instantly to the bottom

## Data Structures

### Board
A 2D array representing the game board:
- Dimensions: 20 rows × 10 columns
- `0` or `null`: Empty cell
- Color string (hex): Filled cell with piece color

### Piece Types
- `I`: Line piece
- `O`: Square piece
- `T`: T-shaped piece
- `S`: S-shaped piece
- `Z`: Z-shaped piece
- `J`: J-shaped piece
- `L`: L-shaped piece

### Piece Colors
- `I`: `#00f0f0` (Cyan)
- `O`: `#f0f000` (Yellow)
- `T`: `#a000f0` (Purple)
- `S`: `#00f000` (Green)
- `Z`: `#f00000` (Red)
- `J`: `#0000f0` (Blue)
- `L`: `#f0a000` (Orange)
