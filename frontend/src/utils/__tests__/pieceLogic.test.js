import { describe, test, expect } from 'vitest';

function getPieceShape(type, rotation) {
  const shapes = {
    I: [[1, 1, 1, 1]],
    O: [[1, 1], [1, 1]],
    T: [[0, 1, 0], [1, 1, 1]],
    S: [[0, 1, 1], [1, 1, 0]],
    Z: [[1, 1, 0], [0, 1, 1]],
    J: [[1, 0, 0], [1, 1, 1]],
    L: [[0, 0, 1], [1, 1, 1]]
  };

  let shape = shapes[type] || shapes.I;
  
  for (let i = 0; i < rotation; i++) {
    shape = rotate90(shape);
  }
  
  return shape;
}

function rotate90(matrix) {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const rotated = [];
  
  for (let col = 0; col < cols; col++) {
    rotated[col] = [];
    for (let row = rows - 1; row >= 0; row--) {
      rotated[col].push(matrix[row][col]);
    }
  }
  
  return rotated;
}

describe('Piece Logic', () => {
  test('should get I piece shape', () => {
    const shape = getPieceShape('I', 0);
    expect(shape).toEqual([[1, 1, 1, 1]]);
  });

  test('should get O piece shape', () => {
    const shape = getPieceShape('O', 0);
    expect(shape).toEqual([[1, 1], [1, 1]]);
  });

  test('should rotate piece', () => {
    const shape = getPieceShape('I', 1);
    expect(shape.length).toBe(4);
    expect(shape[0].length).toBe(1);
  });

  test('should rotate 90 degrees correctly', () => {
    const matrix = [[1, 2], [3, 4]];
    const rotated = rotate90(matrix);
    expect(rotated).toEqual([[3, 1], [4, 2]]);
  });

  test('should handle multiple rotations', () => {
    const shape1 = getPieceShape('I', 0);
    const shape2 = getPieceShape('I', 4);
    expect(shape1).toEqual(shape2);
  });
});
