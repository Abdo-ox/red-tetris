import Game from '../Game.js';
import Player from '../Player.js';
import Piece from '../Piece.js';

describe('Game', () => {
  let game;
  let players;

  beforeEach(() => {
    players = new Map();
    game = new Game('room1', players);
  });

  test('should create a game', () => {
    expect(game.room).toBe('room1');
    expect(game.isActive).toBe(false);
    expect(game.isStarted).toBe(false);
  });

  test('should start game with players', () => {
    const player1 = new Player('socket1', 'Player1', true);
    players.set('socket1', player1);

    const result = game.start();
    expect(result.success).toBe(true);
    expect(game.isStarted).toBe(true);
    expect(game.isActive).toBe(true);
  });

  test('should not start game without players', () => {
    const result = game.start();
    expect(result.success).toBe(false);
    expect(result.message).toBe('Need at least one player');
  });

  test('should not start game twice', () => {
    const player1 = new Player('socket1', 'Player1', true);
    players.set('socket1', player1);

    game.start();
    const result = game.start();
    expect(result.success).toBe(false);
    expect(result.message).toBe('Game already started');
  });

  test('should restart game', () => {
    const player1 = new Player('socket1', 'Player1', true);
    players.set('socket1', player1);

    game.start();
    const result = game.restart();
    expect(result.success).toBe(true);
    expect(game.isStarted).toBe(true);
    expect(game.isActive).toBe(true);
  });

  test('should handle move-left action', () => {
    const player1 = new Player('socket1', 'Player1', true);
    players.set('socket1', player1);
    game.start();

    const result = game.handleAction('socket1', 'move-left');
    expect(result.success).toBe(true);
    expect(player1.currentPiece.x).toBe(2); // Moved left from spawn (3, 0)
  });

  test('should handle move-right action', () => {
    const player1 = new Player('socket1', 'Player1', true);
    players.set('socket1', player1);
    game.start();

    const result = game.handleAction('socket1', 'move-right');
    expect(result.success).toBe(true);
    expect(player1.currentPiece.x).toBe(4); // Moved right from spawn (3, 0)
  });

  test('should handle rotate action', () => {
    const player1 = new Player('socket1', 'Player1', true);
    players.set('socket1', player1);
    game.start();

    const originalRotation = player1.currentPiece.rotation;
    const result = game.handleAction('socket1', 'rotate');
    expect(result.success).toBe(true);
    // Rotation may or may not succeed depending on piece and position
  });

  test('should not handle action for invalid player', () => {
    const result = game.handleAction('invalid-socket', 'move-left');
    expect(result.success).toBe(false);
    expect(result.message).toBe('Player not found');
  });

  test('should clear lines correctly', () => {
    const player1 = new Player('socket1', 'Player1', true);
    players.set('socket1', player1);
    game.start();

    // Fill a row completely
    for (let x = 0; x < 10; x++) {
      player1.board[19][x] = 1;
    }

    const linesCleared = game.clearLines(player1);
    expect(linesCleared).toBe(1);
    expect(player1.board[19].every(cell => cell === 0)).toBe(true);
  });

  test('should check valid position', () => {
    const player1 = new Player('socket1', 'Player1', true);
    players.set('socket1', player1);
    game.start();

    const piece = player1.currentPiece;
    expect(game.isValidPosition(player1, piece)).toBe(true);

    // Move piece out of bounds
    piece.x = -1;
    expect(game.isValidPosition(player1, piece)).toBe(false);
  });

  test('should get game state', () => {
    const player1 = new Player('socket1', 'Player1', true);
    players.set('socket1', player1);
    game.start();

    const state = game.getState();
    expect(state.room).toBe('room1');
    expect(state.isActive).toBe(true);
    expect(state.isStarted).toBe(true);
    expect(state.players.length).toBe(1);
  });

  test('test the generate more peaces functions', () => {
    console.log("sequence length: ", game.pieceSequence.length)
    const player1 = new Player('socket1', 'Player1', true);
    for (let i = 0 ;i < 1; i++){
      game.getNextPiece(player1)
    }
  });

  test('test the generate more peaces functions', () => {
    game.generateMorePieces(50)
    expect(game.pieceSequence.length).toBe(50);
  });

  test('test the generate more peaces functions', () => {
    const player1 = new Player('socket1', 'Player1', true);
    players.set('socket1', player1);
    game.isActive = false
    game. handleAction('socket1', 'move-left')
    game.isActive = true
    game. handleAction('socket1', 'move-down')
    game. handleAction('socket1', 'rotate-counter')
    game. handleAction('socket1', 'hard-drop')
    game. handleAction('socket1', 'hold')
    game. handleAction('socket1', '')
  });

  test('test the generate more peaces functions', () => {
    const player1 = new Player('socket1', 'Player1', true);
    players.set('socket1', player1);
    game.restart()
    console.log("147 line");
    game.movePiece(player1, -100, 1) 
  });

  test('test the generate more peaces functions', () => {
    const player1 = new Player('socket1', 'Player1', true);
    players.set('socket1', player1);
    game.restart()
    game.movePiece(player1, -100, -100) 
  });

  test('test the generate more peaces functions', () => {
    const player1 = new Player('socket1', 'Player1', true);
    player1.currentPiece =  new Piece(Piece.getTypes()[0], 0, 20)
    players.set('socket1', player1);
    game.restart()
    game.rotatePiece(player1, true)
  });

  test('test hard drop functions line', () => {
    const player1 = new Player('socket1', 'Player1', true);
    player1.currentPiece =  new Piece(Piece.getTypes()[0], 0, 0)
    players.set('socket1', player1);
    game.hardDrop(player1)
  });

  test('test hard drop to invalid peaces', () => {
    const player1 = new Player('socket1', 'Player1', true);
    player1.currentPiece =  new Piece(Piece.getTypes()[0], 0, 20)
    players.set('socket1', player1);
    game.hardDrop(player1)
  });
  
  test('test can hold peace', () => {
    const player1 = new Player('socket1', 'Player1', true);
    player1.currentPiece =  new Piece(Piece.getTypes()[0], 0, 20)
    players.set('socket1', player1);
    game.holdPiece(player1)
  });

  test('test held a peace', () => {
    const player1 = new Player('socket1', 'Player1', true);
    player1.currentPiece =  new Piece(Piece.getTypes()[0], 0, 20)
    players.set('socket1', player1);
    player1.heldPiece = new Piece(Piece.getTypes()[0], 0, -1)
    game.holdPiece(player1)
  });

  test('test held a peace', () => {
    const player1 = new Player('socket1', 'Player1', true);
    player1.currentPiece =  new Piece(Piece.getTypes()[0], 0, -10)
    players.set('socket1', player1);
    game.lockPiece(player1)
  });

  test('test held a peace', () => {
    const player1 = new Player('socket1', 'Player1', true);
    player1.currentPiece =  new Piece(Piece.getTypes()[0], 0, -10)
    players.set('socket1', player1);
    const player2 = new Player('socket1', 'Player2', true)
    player2.gameOver = false
    player2.currentPiece =  new Piece(Piece.getTypes()[0], 5, 5)
    players.set('socket1', player2);
    game.lockPiece(player1)
  });

  test("test can't hold peace", () => {
    const player1 = new Player('socket1', 'Player1', true);
    player1.currentPiece =  new Piece(Piece.getTypes()[0], 0, 20)
    players.set('socket1', player1);
    player1.canHold = false
    game.holdPiece(player1)
  });

});

