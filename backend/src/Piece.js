// Tetris pieces (tetrominoes) represented as 2D arrays
const TETROMINOES = {
  I: [[1, 1, 1, 1]],
  O: [
    [1, 1],
    [1, 1]
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1]
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0]
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1]
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1]
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1]
  ]
};

const COLORS = {
  I: '#00f0f0',
  O: '#f0f000',
  T: '#a000f0',
  S: '#00f000',
  Z: '#f00000',
  J: '#0000f0',
  L: '#f0a000'
};

/**
 * Piece class using prototype-based OOP
 */
function Piece(type, x, y, rotation = 0) {
  if (!TETROMINOES[type]) {
    throw new Error(`Invalid piece type: ${type}`);
  }
  
  this.type = type;
  this.x = x;
  this.y = y;
  this.rotation = rotation;
  this.shape = TETROMINOES[type];
  this.color = COLORS[type];
}

Piece.prototype = {
  /**
   * Get the current shape with rotation applied
   */
  getShape() {
    let shape = this.shape;
    
    for (let i = 0; i < this.rotation; i++) {
      shape = this.rotate90(shape);
    }
    
    return shape;
  },
  
  /**
   * Rotate a 2D array 90 degrees clockwise
   */
  rotate90(matrix) {
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
  },
  
  /**
   * Rotate the piece clockwise
   */
  rotate() {
    const rotated = this.rotation + 1;
    this.rotation = rotated % 4;
  },
  
  /**
   * Rotate the piece counter-clockwise
   */
  rotateCounter() {
    const rotated = this.rotation - 1;
    this.rotation = rotated < 0 ? 3 : rotated;
  },
  
  /**
   * Move the piece
   */
  move(dx, dy) {
    this.x += dx;
    this.y += dy;
  },
  
  /**
   * Get the absolute positions of the piece cells
   */
  getCells() {
    const shape = this.getShape();
    const cells = [];
    
    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col]) {
          cells.push({
            x: this.x + col,
            y: this.y + row
          });
        }
      }
    }
    
    return cells;
  },
  
  /**
   * Clone the piece
   */
  clone() {
    const cloned = new Piece(this.type, this.x, this.y, this.rotation);
    return cloned;
  },
  
  /**
   * Get piece data for serialization
   */
  toJSON() {
    return {
      type: this.type,
      x: this.x,
      y: this.y,
      rotation: this.rotation,
      color: this.color
    };
  }
};

// Static method to get all piece types
Piece.getTypes = function() {
  return Object.keys(TETROMINOES);
};

// Static method to create a random piece type
Piece.getRandomType = function() {
  const types = Piece.getTypes();
  return types[Math.floor(Math.random() * types.length)];
};

export default Piece;
