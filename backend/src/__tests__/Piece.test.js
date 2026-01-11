import Piece from '../Piece.js';

describe('Piece', () => {
  test('should create a piece with valid type', () => {
    const piece = new Piece('I', 3, 0);
    expect(piece.type).toBe('I');
    expect(piece.x).toBe(3);
    expect(piece.y).toBe(0);
    expect(piece.rotation).toBe(0);
  });

  test('should throw error for invalid piece type', () => {
    expect(() => new Piece('INVALID', 3, 0)).toThrow('Invalid piece type');
  });

  test('should get shape correctly', () => {
    const piece = new Piece('I', 3, 0);
    const shape = piece.getShape();
    expect(shape).toEqual([[1, 1, 1, 1]]);
  });

  test('should rotate piece', () => {
    const piece = new Piece('I', 3, 0);
    piece.rotate();
    expect(piece.rotation).toBe(1);
    piece.rotate();
    expect(piece.rotation).toBe(2);
    piece.rotate();
    expect(piece.rotation).toBe(3);
    piece.rotate();
    expect(piece.rotation).toBe(0); // Wraps around
  });

  test('should rotate counter-clockwise', () => {
    const piece = new Piece('I', 3, 0);
    piece.rotateCounter();
    expect(piece.rotation).toBe(3);
    piece.rotateCounter();
    expect(piece.rotation).toBe(2);
  });

  test('should move piece', () => {
    const piece = new Piece('I', 3, 0);
    piece.move(1, 0);
    expect(piece.x).toBe(4);
    expect(piece.y).toBe(0);
    piece.move(0, 1);
    expect(piece.x).toBe(4);
    expect(piece.y).toBe(1);
  });

  test('should get cells correctly', () => {
    const piece = new Piece('I', 3, 0);
    const cells = piece.getCells();
    expect(cells.length).toBe(4);
    expect(cells).toEqual([
      { x: 3, y: 0 },
      { x: 4, y: 0 },
      { x: 5, y: 0 },
      { x: 6, y: 0 }
    ]);
  });

  test('should clone piece', () => {
    const piece = new Piece('T', 3, 0);
    piece.rotate();
    piece.move(1, 1);
    const cloned = piece.clone();
    expect(cloned.type).toBe(piece.type);
    expect(cloned.x).toBe(piece.x);
    expect(cloned.y).toBe(piece.y);
    expect(cloned.rotation).toBe(piece.rotation);
    expect(cloned).not.toBe(piece);
  });

  test('should serialize to JSON', () => {
    const piece = new Piece('I', 3, 0);
    const json = piece.toJSON();
    expect(json).toHaveProperty('type', 'I');
    expect(json).toHaveProperty('x', 3);
    expect(json).toHaveProperty('y', 0);
    expect(json).toHaveProperty('rotation', 0);
    expect(json).toHaveProperty('color');
  });

  test('should get all piece types', () => {
    const types = Piece.getTypes();
    expect(types).toContain('I');
    expect(types).toContain('O');
    expect(types).toContain('T');
    expect(types.length).toBeGreaterThan(0);
  });

  test('should get random piece type', () => {
    const type = Piece.getRandomType();
    const types = Piece.getTypes();
    expect(types).toContain(type);
  });
});
