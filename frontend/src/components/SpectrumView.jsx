import '../styles/SpectrumView.css';

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const CELL_SIZE = 12;

function SpectrumView({ opponents, currentPlayer }) {
  // Filter out current player
  const otherPlayers = opponents.filter(p => p.playerName !== currentPlayer);

  if (otherPlayers.length === 0) {
    return (
      <div className="spectrum-view">
        <h3>Opponents</h3>
        <p className="no-opponents">No other players</p>
      </div>
    );
  }

  return (
    <div className="spectrum-view">
      <h3>Opponents</h3>
      <div className="spectrum-list">
        {otherPlayers.map((player) => (
          <div key={player.playerName} className="spectrum-item">
            <div className="spectrum-header">
              <span className="spectrum-name">{player.playerName}</span>
              <span className="spectrum-score">Score: {player.score || 0}</span>
            </div>
            <SpectrumBoard board={player.board} currentPiece={player.currentPiece} />
          </div>
        ))}
      </div>
    </div>
  );
}

function SpectrumBoard({ board, currentPiece }) {
  const visualBoard = createVisualBoard(board, currentPiece);

  return (
    <div 
      className="spectrum-grid"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${BOARD_WIDTH}, ${CELL_SIZE}px)`,
        gridTemplateRows: `repeat(${BOARD_HEIGHT}, ${CELL_SIZE}px)`,
        gap: '0.5px',
        backgroundColor: '#000',
        padding: '1px',
        marginTop: '0.5rem'
      }}
    >
      {visualBoard.map((row, y) =>
        row.map((cell, x) => (
          <div
            key={`${y}-${x}`}
            style={{
              width: `${CELL_SIZE}px`,
              height: `${CELL_SIZE}px`,
              backgroundColor: cell || '#111',
              border: cell ? 'none' : '0.5px solid #222'
            }}
          />
        ))
      )}
    </div>
  );
}

function createVisualBoard(board, currentPiece) {
  const visualBoard = [];
  
  for (let y = 0; y < BOARD_HEIGHT; y++) {
    visualBoard[y] = [];
    for (let x = 0; x < BOARD_WIDTH; x++) {
      visualBoard[y][x] = board && board[y] && board[y][x] ? board[y][x] : 0;
    }
  }

  if (currentPiece) {
    const pieceCells = getPieceCells(currentPiece);
    pieceCells.forEach((cell) => {
      if (cell.y >= 0 && cell.y < BOARD_HEIGHT && cell.x >= 0 && cell.x < BOARD_WIDTH) {
        visualBoard[cell.y][cell.x] = currentPiece.color || '#fff';
      }
    });
  }

  return visualBoard;
}

function getPieceCells(piece) {
  if (!piece || !piece.type) return [];
  
  const shape = getPieceShape(piece.type, piece.rotation || 0);
  const cells = [];
  
  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      if (shape[row][col]) {
        cells.push({
          x: (piece.x || 0) + col,
          y: (piece.y || 0) + row
        });
      }
    }
  }
  
  return cells;
}

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

export default SpectrumView;
