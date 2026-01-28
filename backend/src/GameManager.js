import Player from './Player.js';
import Game from './Game.js';

/**
 * GameManager class using prototype-based OOP
 * Manages all rooms and games
 */
function GameManager() {
  this.rooms = new Map(); // room -> Game
  this.players = new Map(); // socketId -> { room, playerName }
}

GameManager.prototype = {
  /**
   * Create a new room
   */
  createRoom(socketId, room, playerName) {
    if (!room || !playerName) {
      return { success: false, message: 'Room and player name required' };
    }
    
    // Normalize room ID (trim whitespace)
    const normalizedRoom = room.trim();
    
    // Check if room already exists
    const existingGame = this.rooms.get(normalizedRoom);
    if (existingGame) {
      return { success: false, message: 'Room ID already taken' };
    }
    
    // Create new room
    const game = new Game(normalizedRoom, new Map());
    this.rooms.set(normalizedRoom, game);
    
    // Create player as host
    const player = new Player(socketId, playerName, true);
    game.players.set(socketId, player);
    
    // Store player mapping
    this.players.set(socketId, { room: normalizedRoom, playerName });
    
    const playersList = Array.from(game.players.values()).map((p) => p.toJSON());
    
    return {
      success: true,
      room: normalizedRoom,
      playerName,
      isHost: true,
      players: playersList
    };
  },

  /**
   * Join a room
   */
  joinRoom(socketId, room, playerName) {
    if (!room || !playerName) {
      return { success: false, message: 'Room and player name required' };
    }
    
    // Check if room exists and game has started
    const game = this.rooms.get(room);
    if (game && game.isStarted) {
      return { success: false, message: 'Game has already started' };
    }
    
    // Check maximum players (4)
    if (game && game.players.size >= 4) {
      return { success: false, message: 'Room is full (maximum 4 players)' };
    }
    
    // Check if player name is already taken in the room
    if (game) {
      for (const player of game.players.values()) {
        if (player.playerName === playerName) {
          return { success: false, message: 'Player name already taken' };
        }
      }
    }
    
    // Create room if it doesn't exist
    if (!game) {
      this.rooms.set(room, new Game(room, new Map()));
    }
    
    const currentGame = this.rooms.get(room);
    const isHost = currentGame.players.size === 0;
    
    // Create player
    const player = new Player(socketId, playerName, isHost);
    currentGame.players.set(socketId, player);
    
    // Store player mapping
    this.players.set(socketId, { room, playerName });
    
    const playersList = Array.from(currentGame.players.values()).map((p) => p.toJSON());
    
    return {
      success: true,
      room,
      playerName,
      isHost,
      players: playersList
    };
  },
  
  /**
   * Start a game
   */
  startGame(room, socketId) {
    const game = this.rooms.get(room);
    if (!game) {
      return { success: false, message: 'Room not found' };
    }
    
    const player = game.players.get(socketId);
    if (!player) {
      return { success: false, message: 'Player not found' };
    }
    
    if (!player.isHost) {
      return { success: false, message: 'Only host can start the game' };
    }
    
    if (game.isStarted) {
      return { success: false, message: 'Game already started' };
    }
    
    const result = game.start();
    if (result.success) {
      return {
        success: true,
        gameState: game.getState()
      };
    }
    
    return result;
  },
  
  /**
   * Restart a game
   */
  restartGame(room, socketId) {
    const game = this.rooms.get(room);
    if (!game) {
      return { success: false, message: 'Room not found' };
    }
    
    const player = game.players.get(socketId);
    if (!player) {
      return { success: false, message: 'Player not found' };
    }
    
    if (!player.isHost) {
      return { success: false, message: 'Only host can restart the game' };
    }
    
    const result = game.restart();
    if (result.success) {
      return {
        success: true,
        gameState: game.getState()
      };
    }
    
    return result;
  },
  
  /**
   * Handle a game action
   */
  handleGameAction(room, socketId, action, data) {
    const game = this.rooms.get(room);
    if (!game) {
      return { success: false, message: 'Room not found' };
    }
    
    const result = game.handleAction(socketId, action, data);
    
    if (result.success) {
      const update = {
        playerName: game.players.get(socketId).playerName,
        action,
        gameState: result.broadcast ? game.getState() : null,
        winner: result.winner || null,
        gameEnded: result.gameEnded || false
      };
      
      const spectrumUpdate = {
        room,
        players: Array.from(game.players.values()).map((p) => p.getSpectrum())
      };
      
      return {
        success: true,
        broadcast: result.broadcast,
        update,
        spectrumUpdate
      };
    }
    
    return result;
  },
  
  /**
   * Handle player disconnect
   */
  handleDisconnect(socketId) {
    const playerInfo = this.players.get(socketId);
    if (!playerInfo) {
      return null;
    }
    
    const game = this.rooms.get(playerInfo.room);
    if (!game) {
      this.players.delete(socketId);
      return null;
    }
    
    const player = game.players.get(socketId);
    if (!player) {
      this.players.delete(socketId);
      return null;
    }
    
    const wasHost = player.isHost;
    const playerName = player.playerName;
    
    // Remove player
    game.players.delete(socketId);
    this.players.delete(socketId);
    
    // If room is empty, remove it
    if (game.players.size === 0) {
      this.rooms.delete(playerInfo.room);
      return {
        room: playerInfo.room,
        playerName,
        players: []
      };
    }
    
    // If host left, assign new host (first player)
    let newHost = null;
    if (wasHost) {
      const firstPlayer = game.players.values().next().value;
      if (firstPlayer) {
        firstPlayer.setHost(true);
        newHost = firstPlayer.playerName;
      }
    }
    
    const playersList = Array.from(game.players.values()).map((p) => p.toJSON());
    
    return {
      room: playerInfo.room,
      playerName,
      newHost,
      players: playersList
    };
  },
  
  /**
   * Get room state
   */
  getRoomState(room) {
    const game = this.rooms.get(room);
    if (!game) {
      return null;
    }
    
    return {
      room,
      isStarted: game.isStarted,
      isActive: game.isActive,
      players: Array.from(game.players.values()).map((p) => p.toJSON()),
      gameState: game.isStarted ? game.getState() : null
    };
  }
};

export default GameManager;
