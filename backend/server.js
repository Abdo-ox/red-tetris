import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import GameManager from './src/GameManager.js';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const gameManager = new GameManager();

// Serve static files from frontend build
app.use(express.static(join(__dirname, '../frontend/dist')));

// Handle all routes - let React Router handle routing
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../frontend/dist/index.html'));
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join-room', ({ room, playerName }) => {
    try {
      const result = gameManager.joinRoom(socket.id, room, playerName);
      
      if (result.success) {
        socket.join(room);
        socket.emit('room-joined', result);
        
        // Notify other players in the room
        socket.to(room).emit('player-joined', {
          playerName: result.playerName,
          isHost: result.isHost,
          players: result.players
        });
        
        // Send current room state to the new player
        const roomState = gameManager.getRoomState(room);
        if (roomState) {
          socket.emit('room-state', roomState);
        }
      } else {
        socket.emit('error', { message: result.message });
      }
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  socket.on('start-game', ({ room }) => {
    try {
      const result = gameManager.startGame(room, socket.id);
      
      if (result.success) {
        io.to(room).emit('game-started', result);
      } else {
        socket.emit('error', { message: result.message });
      }
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  socket.on('restart-game', ({ room }) => {
    try {
      const result = gameManager.restartGame(room, socket.id);
      
      if (result.success) {
        io.to(room).emit('game-restarted', result);
      } else {
        socket.emit('error', { message: result.message });
      }
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  socket.on('game-action', ({ room, action, data }) => {
    try {
      const result = gameManager.handleGameAction(room, socket.id, action, data);
      
      if (result.success && result.broadcast) {
        io.to(room).emit('game-update', result.update);
      }
      
      if (result.spectrumUpdate) {
        io.to(room).emit('spectrum-update', result.spectrumUpdate);
      }
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  socket.on('disconnect', () => {
    const result = gameManager.handleDisconnect(socket.id);
    
    if (result) {
      if (result.room) {
        io.to(result.room).emit('player-left', {
          playerName: result.playerName,
          newHost: result.newHost,
          players: result.players
        });
      }
    }
    
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
