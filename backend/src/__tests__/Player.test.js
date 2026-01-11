import Player from '../Player.js';

describe('Player', () => {
  test('should create a player', () => {
    const player = new Player('socket1', 'Player1', false);
    expect(player.socketId).toBe('socket1');
    expect(player.playerName).toBe('Player1');
    expect(player.isHost).toBe(false);
    expect(player.score).toBe(0);
    expect(player.lines).toBe(0);
    expect(player.level).toBe(1);
    expect(player.gameOver).toBe(false);
  });

  test('should create host player', () => {
    const player = new Player('socket1', 'Player1', true);
    expect(player.isHost).toBe(true);
  });

  test('should initialize board correctly', () => {
    const player = new Player('socket1', 'Player1', false);
    expect(player.board.length).toBe(20);
    expect(player.board[0].length).toBe(10);
    expect(player.board[0][0]).toBe(0);
  });

  test('should reset player state', () => {
    const player = new Player('socket1', 'Player1', false);
    player.score = 100;
    player.lines = 5;
    player.level = 2;
    player.gameOver = true;
    player.board[0][0] = 1;
    
    player.reset();
    
    expect(player.score).toBe(0);
    expect(player.lines).toBe(0);
    expect(player.level).toBe(1);
    expect(player.gameOver).toBe(false);
    expect(player.board[0][0]).toBe(0);
  });

  test('should set host status', () => {
    const player = new Player('socket1', 'Player1', false);
    player.setHost(true);
    expect(player.isHost).toBe(true);
    player.setHost(false);
    expect(player.isHost).toBe(false);
  });

  test('should get spectrum', () => {
    const player = new Player('socket1', 'Player1', false);
    const spectrum = player.getSpectrum();
    expect(spectrum.playerName).toBe('Player1');
    expect(spectrum.board).toBeDefined();
    expect(spectrum.score).toBe(0);
    expect(spectrum.lines).toBe(0);
    expect(spectrum.level).toBe(1);
    expect(spectrum.gameOver).toBe(false);
  });

  test('should serialize to JSON', () => {
    const player = new Player('socket1', 'Player1', true);
    const json = player.toJSON();
    expect(json).toHaveProperty('socketId', 'socket1');
    expect(json).toHaveProperty('playerName', 'Player1');
    expect(json).toHaveProperty('isHost', true);
    expect(json).toHaveProperty('score', 0);
    expect(json).toHaveProperty('lines', 0);
    expect(json).toHaveProperty('level', 1);
    expect(json).toHaveProperty('gameOver', false);
  });
});
