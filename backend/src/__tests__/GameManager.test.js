import GameManager from '../GameManager.js';

describe('GameManager', () => {
  let manager;

  beforeEach(() => {
    manager = new GameManager();
  });

  test('should create GameManager', () => {
    expect(manager.rooms).toBeDefined();
    expect(manager.players).toBeDefined();
  });

  test('should join room successfully', () => {
    const result = manager.joinRoom('socket1', 'room1', 'Player1');
    expect(result.success).toBe(true);
    expect(result.room).toBe('room1');
    expect(result.playerName).toBe('Player1');
    expect(result.isHost).toBe(true);
  });

  test('should set first player as host', () => {
    const result1 = manager.joinRoom('socket1', 'room1', 'Player1');
    expect(result1.isHost).toBe(true);
    
    const result2 = manager.joinRoom('socket2', 'room1', 'Player2');
    expect(result2.isHost).toBe(false);
  });

  test('should not allow duplicate player names in same room', () => {
    manager.joinRoom('socket1', 'room1', 'Player1');
    const result = manager.joinRoom('socket2', 'room1', 'Player1');
    expect(result.success).toBe(false);
    expect(result.message).toBe('Player name already taken');
  });

  test('should not allow joining after game started', () => {
    manager.joinRoom('socket1', 'room1', 'Player1');
    const game = manager.rooms.get('room1');
    game.start();
    
    const result = manager.joinRoom('socket2', 'room1', 'Player2');
    expect(result.success).toBe(false);
    expect(result.message).toBe('Game has already started');
  });

  test('should start game as host', () => {
    manager.joinRoom('socket1', 'room1', 'Player1');
    const result = manager.startGame('room1', 'socket1');
    expect(result.success).toBe(true);
  });

  test('should not start game as non-host', () => {
    manager.joinRoom('socket1', 'room1', 'Player1');
    manager.joinRoom('socket2', 'room1', 'Player2');
    const result = manager.startGame('room1', 'socket2');
    expect(result.success).toBe(false);
    expect(result.message).toBe('Only host can start the game');
  });

  test('should restart game as host', () => {
    manager.joinRoom('socket1', 'room1', 'Player1');
    manager.startGame('room1', 'socket1');
    const result = manager.restartGame('room1', 'socket1');
    expect(result.success).toBe(true);
  });

  test('should handle game action', () => {
    manager.joinRoom('socket1', 'room1', 'Player1');
    manager.startGame('room1', 'socket1');
    const result = manager.handleGameAction('room1', 'socket1', 'move-left', null);
    expect(result.success).toBe(true);
  });

  test('should handle disconnect', () => {
    manager.joinRoom('socket1', 'room1', 'Player1');
    manager.joinRoom('socket2', 'room1', 'Player2');
    
    const result = manager.handleDisconnect('socket1');
    expect(result).toBeDefined();
    expect(result.room).toBe('room1');
    expect(result.playerName).toBe('Player1');
    expect(result.newHost).toBe('Player2');
  });

  test('should remove room when last player disconnects', () => {
    manager.joinRoom('socket1', 'room1', 'Player1');
    manager.handleDisconnect('socket1');
    
    expect(manager.rooms.has('room1')).toBe(false);
  });

  test('should get room state', () => {
    manager.joinRoom('socket1', 'room1', 'Player1');
    const state = manager.getRoomState('room1');
    expect(state).toBeDefined();
    expect(state.room).toBe('room1');
    expect(state.players.length).toBe(1);
  });

  test('should return null for non-existent room', () => {
    const state = manager.getRoomState('nonexistent');
    expect(state).toBeNull();
  });

  test('join invalid room or player', () => {
    const state = manager.joinRoom(null, null)
  });
});
