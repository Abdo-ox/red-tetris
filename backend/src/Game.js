import Piece from './Piece.js';

/**
 * Game class using prototype-based OOP
 */
function Game(room, players) {
  this.room = room;
  this.players = players; // Map of socketId -> Player
  this.isActive = false;
  this.isStarted = false;
  this.pieceSequence = []; // Shared piece sequence for all players
}

Game.prototype = {
  /**
   * Start the game
   */
  start() {
    if (this.isStarted) {
      return { success: false, message: 'Game already started' };
    }
    
    if (this.players.size < 1) {
      return { success: false, message: 'Need at least one player' };
    }
    
    this.isActive = true;
    this.isStarted = true;
    this.pieceSequence = [];
    
    // Generate initial piece sequence (first 100 pieces)
    for (let i = 0; i < 100; i++) {
      this.pieceSequence.push(Piece.getRandomType());
    }
    
    // Reset all players and spawn first pieces
    this.players.forEach((player) => {
      player.reset();
      // All players start with the same first piece (index 0)
      player.currentPiece = new Piece(this.pieceSequence[0], 3, 0);
      // pieceIndex starts at 1 because they already have piece 0
      player.pieceIndex = 1;
      
      // Ensure sequence is long enough
      if (this.pieceSequence.length <= 1) {
        this.generateMorePieces(50);
      }
      // All players get the same next piece (index 1)
      player.nextPiece = new Piece(this.pieceSequence[1], 3, 0);
    });
    
    return { success: true };
  },
  
  /**
   * Generate more pieces for the sequence
   */
  generateMorePieces(count) {
    for (let i = 0; i < count; i++) {
      this.pieceSequence.push(Piece.getRandomType());
    }
  },
  
  /**
   * Restart the game
   */
  restart() {
    this.isActive = false;
    this.isStarted = false;
    this.pieceSequence = [];
    
    this.players.forEach((player) => {
      player.reset();
    });
    
    return this.start();
  },
  
  /**
   * Get the next piece from the shared sequence for a player
   */
  getNextPiece(player) {
    // Ensure sequence is long enough
    if (this.pieceSequence.length <= player.pieceIndex + 2) {
      this.generateMorePieces(50);
    }
    
    // Get the piece at the player's current index and advance
    const pieceType = this.pieceSequence[player.pieceIndex];
    player.pieceIndex++;
    
    return pieceType;
  },
  
  /**
   * Handle a game action from a player
   */
  handleAction(socketId, action, data) {
    const player = this.players.get(socketId);
    if (!player) {
      return { success: false, message: 'Player not found' };
    }
    
    if (!this.isActive || player.gameOver) {
      return { success: false, message: 'Game not active' };
    }
    
    switch (action) {
      case 'move-left':
        return this.movePiece(player, -1, 0);
      case 'move-right':
        return this.movePiece(player, 1, 0);
      case 'move-down':
        return this.movePiece(player, 0, 1);
      case 'rotate':
        return this.rotatePiece(player);
      case 'rotate-counter':
        return this.rotatePiece(player, true);
      case 'hard-drop':
        return this.hardDrop(player);
      case 'hold':
        return this.holdPiece(player);
      default:
        return { success: false, message: 'Unknown action' };
    }
  },
  
  /**
   * Move a player's piece
   */
  movePiece(player, dx, dy) {
    if (!player.currentPiece) {
      return { success: false, message: 'No active piece' };
    }
    
    const testPiece = player.currentPiece.clone();
    testPiece.move(dx, dy);
    
    if (this.isValidPosition(player, testPiece)) {
      player.currentPiece.move(dx, dy);
      return { success: true, broadcast: true };
    }
    
    // If moving down and can't move, lock the piece
    if (dy > 0) {
      return this.lockPiece(player);
    }
    
    return { success: false, message: 'Invalid move' };
  },
  
  /**
   * Rotate a player's piece
   */
  rotatePiece(player, counterClockwise = false) {
    if (!player.currentPiece) {
      return { success: false, message: 'No active piece' };
    }
    
    const testPiece = player.currentPiece.clone();
    if (counterClockwise) {
      testPiece.rotateCounter();
    } else {
      testPiece.rotate();
    }
    
    // Try wall kicks (simple implementation)
    const offsets = [
      [0, 0],
      [-1, 0],
      [1, 0],
      [0, -1],
      [-1, -1],
      [1, -1]
    ];
    
    for (const [dx, dy] of offsets) {
      const kickPiece = testPiece.clone();
      kickPiece.move(dx, dy);
      
      if (this.isValidPosition(player, kickPiece)) {
        player.currentPiece.rotation = testPiece.rotation;
        player.currentPiece.x += dx;
        player.currentPiece.y += dy;
        return { success: true, broadcast: true };
      }
    }
    
    return { success: false, message: 'Cannot rotate' };
  },
  
  /**
   * Hard drop a piece
   */
  hardDrop(player) {
    if (!player.currentPiece) {
      return { success: false, message: 'No active piece' };
    }
    
    let dropDistance = 0;
    while (true) {
      const testPiece = player.currentPiece.clone();
      testPiece.move(0, dropDistance + 1);
      
      if (!this.isValidPosition(player, testPiece)) {
        break;
      }
      
      dropDistance++;
    }
    
    if (dropDistance > 0) {
      player.currentPiece.move(0, dropDistance);
      player.score += dropDistance * 2; // Bonus points for hard drop
      return this.lockPiece(player);
    }
    
    return this.lockPiece(player);
  },
  
  /**
   * Hold a piece
   */
  holdPiece(player) {
    if (!player.currentPiece) {
      return { success: false, message: 'No active piece' };
    }
    
    if (!player.canHold) {
      return { success: false, message: 'Cannot hold right now' };
    }
    
    // If no held piece, hold current and get next piece
    if (!player.heldPiece) {
      player.heldPiece = player.currentPiece.clone();
      player.heldPiece.x = 3;
      player.heldPiece.y = 0;
      player.heldPiece.rotation = 0;
      
      // Spawn next piece as current
      const nextPieceType = this.getNextPiece(player);
      player.currentPiece = new Piece(nextPieceType, 3, 0);
    } else {
      // Swap current and held piece
      const temp = player.currentPiece.clone();
      temp.x = 3;
      temp.y = 0;
      temp.rotation = 0;
      
      player.currentPiece = player.heldPiece.clone();
      player.currentPiece.x = 3;
      player.currentPiece.y = 0;
      
      player.heldPiece = temp;
    }
    
    // Check if new piece can be placed
    if (!this.isValidPosition(player, player.currentPiece)) {
      player.gameOver = true;
      const winnerCheck = this.checkAllPlayersGameOver();
      if (winnerCheck.winner) {
        return { success: true, broadcast: true, gameOver: true, winner: winnerCheck.winner, gameEnded: true };
      }
      return { success: true, broadcast: true, gameOver: true };
    }
    
    player.canHold = false; // Can't hold again until piece is placed
    
    return { success: true, broadcast: true };
  },
  
  /**
   * Lock a piece onto the board
   */
  lockPiece(player) {
    const cells = player.currentPiece.getCells();
    
    // Place piece on board
    cells.forEach((cell) => {
      if (cell.y >= 0 && cell.y < 20 && cell.x >= 0 && cell.x < 10) {
        player.board[cell.y][cell.x] = player.currentPiece.color;
      }
    });
    
    // Check for game over
    if (cells.some((cell) => cell.y < 0)) {
      player.gameOver = true;
      const winnerCheck = this.checkAllPlayersGameOver();
      if (winnerCheck.winner) {
        return { success: true, broadcast: true, gameOver: true, winner: winnerCheck.winner, gameEnded: true };
      }
      return { success: true, broadcast: true, gameOver: true };
    }
    
    // Clear full lines
    const linesCleared = this.clearLines(player);
    
    if (linesCleared > 0) {
      // Calculate score and level
      const linePoints = [0, 40, 100, 300, 1200];
      player.score += linePoints[linesCleared] * (player.level + 1);
      player.lines += linesCleared;
      player.level = Math.floor(player.lines / 10) + 1;
      
      // Apply penalties to other players (add lines at bottom)
      this.applyPenalties(player, linesCleared);
      // Check if winner after penalties
      const winnerCheck = this.checkAllPlayersGameOver();
      if (winnerCheck.winner) {
        return { success: true, broadcast: true, linesCleared, winner: winnerCheck.winner, gameEnded: true };
      }
    }
    
    // Spawn next piece using player's index
    const nextPieceType = this.getNextPiece(player);
    player.currentPiece = new Piece(nextPieceType, 3, 0);
    
    // Ensure sequence is long enough for next piece
    if (this.pieceSequence.length <= player.pieceIndex + 1) {
      this.generateMorePieces(50);
    }
    // Set next piece preview using player's current index
    player.nextPiece = new Piece(this.pieceSequence[player.pieceIndex], 3, 0);
    
    // Reset canHold so player can hold again
    player.canHold = true;
    
    // Check if new piece can be placed
    if (!this.isValidPosition(player, player.currentPiece)) {
      player.gameOver = true;
      const winnerCheck = this.checkAllPlayersGameOver();
      if (winnerCheck.winner) {
        return { success: true, broadcast: true, linesCleared, winner: winnerCheck.winner, gameEnded: true };
      }
    }
    
    return { success: true, broadcast: true, linesCleared };
  },
  
  /**
   * Clear full lines on a player's board
   */
  clearLines(player) {
    let linesCleared = 0;
    const newBoard = [];
    
    for (let row = 19; row >= 0; row--) {
      const isFull = player.board[row].every((cell) => cell !== 0);
      
      if (!isFull) {
        newBoard.unshift([...player.board[row]]);
      } else {
        linesCleared++;
      }
    }
    
    // Add empty lines at the top
    while (newBoard.length < 20) {
      newBoard.unshift(new Array(10).fill(0));
    }
    
    player.board = newBoard;
    return linesCleared;
  },
  
  /**
   * Apply penalties to other players
   */
  applyPenalties(clearingPlayer, linesCleared) {
    const penaltyLines = Math.floor(linesCleared / 2); // Half of cleared lines as penalty
    
    if (penaltyLines > 0) {
      this.players.forEach((player) => {
        if (player.socketId !== clearingPlayer.socketId && !player.gameOver) {
          // Add penalty lines at the bottom
          for (let i = 0; i < penaltyLines; i++) {
            // Shift board up
            player.board.shift();
            // Add garbage line at bottom (with one random hole)
            const garbageLine = new Array(10).fill('#666666');
            const holePosition = Math.floor(Math.random() * 10);
            garbageLine[holePosition] = 0;
            player.board.push(garbageLine);
            
            // Check for game over
            if (player.currentPiece) {
              const cells = player.currentPiece.getCells();
              if (cells.some((cell) => cell.y >= 20 || (cell.y >= 0 && player.board[cell.y] && player.board[cell.y][cell.x] !== 0))) {
                player.gameOver = true;
              }
            }
          }
        }
      });
      
      // Check if winner after applying penalties
      this.checkAllPlayersGameOver();
    }
  },
  
  /**
   * Check if all players are game over or if one player won
   */
  checkAllPlayersGameOver() {
    let activePlayers = 0;
    let gameOverPlayers = 0;
    let winner = null;
    
    this.players.forEach((player) => {
      if (player.gameOver) {
        gameOverPlayers++;
      } else {
        activePlayers++;
        winner = player;
      }
    });
    
    // If multiple players started, and only one remains active, that player wins
    if (this.players.size > 1 && activePlayers === 1 && gameOverPlayers > 0) {
      this.isActive = false;
      return { winner: winner.playerName, gameEnded: true };
    }
    
    // If all players are game over
    if (activePlayers === 0) {
      this.isActive = false;
      return { winner: null, gameEnded: true };
    }
    
    return { winner: null, gameEnded: false };
  },
  
  /**
   * Check if a piece position is valid
   */
  isValidPosition(player, piece) {
    const cells = piece.getCells();
    
    for (const cell of cells) {
      // Check bounds
      if (cell.x < 0 || cell.x >= 10 || cell.y >= 20) {
        return false;
      }
      
      // Check if cell is above board (spawn position)
      if (cell.y < 0) {
        continue;
      }
      
      // Check collision with board
      if (player.board[cell.y][cell.x] !== 0) {
        return false;
      }
    }
    
    return true;
  },
  
  /**
   * Get game state for all players
   */
  getState() {
    const players = [];
    this.players.forEach((player) => {
      players.push(player.getSpectrum());
    });
    
    return {
      room: this.room,
      isActive: this.isActive,
      isStarted: this.isStarted,
      players
    };
  }
};

export default Game;
