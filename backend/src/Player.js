/**
 * Player class using prototype-based OOP
 */
function Player(socketId, playerName, isHost = false) {
  this.socketId = socketId;
  this.playerName = playerName;
  this.isHost = isHost;
  this.score = 0;
  this.lines = 0;
  this.level = 1;
  this.gameOver = false;
  this.board = null; // Will be a 2D array (20 rows x 10 cols)
  this.currentPiece = null;
  this.nextPiece = null;
  this.heldPiece = null; // Held piece for swapping
  this.canHold = true; // Whether player can hold (reset when piece is placed)
  this.pieceIndex = 0; // Index in the shared piece sequence
  
  // Initialize empty board
  this.initBoard();
}

Player.prototype = {
  /**
   * Initialize an empty board (20 rows x 10 columns)
   */
  initBoard() {
    this.board = [];
    for (let row = 0; row < 20; row++) {
      this.board[row] = [];
      for (let col = 0; col < 10; col++) {
        this.board[row][col] = 0;
      }
    }
  },
  
  /**
   * Reset player state for a new game
   */
  reset() {
    this.score = 0;
    this.lines = 0;
    this.level = 1;
    this.gameOver = false;
    this.initBoard();
    this.currentPiece = null;
    this.nextPiece = null;
    this.heldPiece = null;
    this.canHold = true;
    this.pieceIndex = 0;
  },
  
  /**
   * Set the host status
   */
  setHost(isHost) {
    this.isHost = isHost;
  },
  
  /**
   * Get the board state (spectrum)
   */
  getSpectrum() {
    return {
      playerName: this.playerName,
      board: this.board,
      score: this.score,
      lines: this.lines,
      level: this.level,
      gameOver: this.gameOver,
      currentPiece: this.currentPiece ? this.currentPiece.toJSON() : null,
      nextPiece: this.nextPiece ? this.nextPiece.toJSON() : null,
      heldPiece: this.heldPiece ? this.heldPiece.toJSON() : null
    };
  },
  
  /**
   * Get player data for serialization
   */
  toJSON() {
    return {
      socketId: this.socketId,
      playerName: this.playerName,
      isHost: this.isHost,
      score: this.score,
      lines: this.lines,
      level: this.level,
      gameOver: this.gameOver
    };
  }
};

export default Player;
