import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import GameBoard from '../components/GameBoard';
import PlayerList from '../components/PlayerList';
import SpectrumView from '../components/SpectrumView';
import GameControls from '../components/GameControls';
import '../styles/GamePage.css';
import { createSocket } from '../middleware/socketMiddleware';

function GamePage() {
  const { room, playerName } = useParams();
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [players, setPlayers] = useState([]);
  const [isHost, setIsHost] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameActive, setGameActive] = useState(false);
  const [myBoard, setMyBoard] = useState(null);
  const [myPiece, setMyPiece] = useState(null);
  const [myNextPiece, setMyNextPiece] = useState(null);
  const [myHeldPiece, setMyHeldPiece] = useState(null);
  const [myScore, setMyScore] = useState(0);
  const [myLines, setMyLines] = useState(0);
  const [myLevel, setMyLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [error, setError] = useState(null);
  const [opponents, setOpponents] = useState([]);
  const [showGameOverModal, setShowGameOverModal] = useState(true);

  useEffect(() => {
    const newSocket = createSocket();
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setConnected(true);
      newSocket.emit('join-room', { room, playerName });
    });

    newSocket.on('room-joined', (data) => {
      setIsHost(data.isHost);
      setPlayers(data.players || []);
    });

    newSocket.on('player-joined', (data) => {
      setPlayers(data.players || []);
      // Find current player in the updated players list to check host status
      const me = data.players.find(p => p.playerName === playerName);
      if (me) {
        setIsHost(me.isHost);
      }
    });

    newSocket.on('player-left', (data) => {
      setPlayers(data.players || []);
      if (data.newHost) {
        // Check if I'm the new host
        const me = data.players.find(p => p.playerName === playerName);
        if (me && me.isHost) {
          setIsHost(true);
        }
      }
    });

    newSocket.on('room-state', (data) => {
      if (data.gameState) {
        setGameStarted(data.gameState.isStarted);
        setGameActive(data.gameState.isActive);
        setOpponents(data.gameState.players || []);
        
        const me = data.gameState.players.find(p => p.playerName === playerName);
        if (me) {
          setMyBoard(me.board);
          setMyPiece(me.currentPiece);
          setMyNextPiece(me.nextPiece);
          setMyHeldPiece(me.heldPiece);
          setMyScore(me.score);
          setMyLines(me.lines);
          setMyLevel(me.level);
          setGameOver(me.gameOver);
        }
      } else {
        setPlayers(data.players || []);
      }
    });

    newSocket.on('game-started', (data) => {
      setGameStarted(true);
      setGameActive(true);
      setOpponents(data.gameState.players || []);
      
      const me = data.gameState.players.find(p => p.playerName === playerName);
      if (me) {
        setMyBoard(me.board);
        setMyPiece(me.currentPiece);
        setMyNextPiece(me.nextPiece);
        setMyHeldPiece(me.heldPiece);
        setMyScore(me.score);
        setMyLines(me.lines);
        setMyLevel(me.level);
        setGameOver(me.gameOver);
      }
    });

    newSocket.on('game-restarted', (data) => {
      setGameStarted(true);
      setGameActive(true);
      setGameOver(false);
      setWinner(null);
      setShowGameOverModal(true);
      setOpponents(data.gameState.players || []);
      
      const me = data.gameState.players.find(p => p.playerName === playerName);
      if (me) {
        setMyBoard(me.board);
        setMyPiece(me.currentPiece);
        setMyNextPiece(me.nextPiece);
        setMyHeldPiece(me.heldPiece);
        setMyScore(me.score);
        setMyLines(me.lines);
        setMyLevel(me.level);
        setGameOver(me.gameOver);
      }
    });

    newSocket.on('game-update', (data) => {
      // Check for winner
      if (data.winner) {
        setWinner(data.winner);
        setGameActive(false);
      }
      
      if (data.gameState) {
        setGameActive(data.gameState.isActive);
        setOpponents(data.gameState.players || []);
        
        const me = data.gameState.players.find(p => p.playerName === playerName);
        if (me) {
          setMyBoard(me.board);
          setMyPiece(me.currentPiece);
          setMyNextPiece(me.nextPiece);
          setMyHeldPiece(me.heldPiece);
          setMyScore(me.score);
          setMyLines(me.lines);
          setMyLevel(me.level);
          setGameOver(me.gameOver);
        }
      }
    });

    newSocket.on('spectrum-update', (data) => {
      setOpponents(data.players || []);
    });

    newSocket.on('error', (data) => {
      setError(data.message);
    });

    return () => {
      newSocket.close();
    };
  }, [room, playerName]);

  const handleStartGame = useCallback(() => {
    if (socket && isHost && !gameStarted) {
      socket.emit('start-game', { room });
    }
  }, [socket, isHost, gameStarted, room]);

  const handleRestartGame = useCallback(() => {
    if (socket && isHost) {
      socket.emit('restart-game', { room });
    }
  }, [socket, isHost, room]);

  const handleGoHome = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const handleCloseModal = useCallback(() => {
    setShowGameOverModal(false);
  }, []);

  const handleGameAction = useCallback((action, data) => {
    if (socket && gameActive && !gameOver) {
      socket.emit('game-action', { room, action, data });
    }
  }, [socket, gameActive, gameOver, room]);

  // Handle keyboard input
  useEffect(() => {
    if (!gameActive || gameOver) return;

    const handleKeyPress = (e) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          handleGameAction('move-left');
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleGameAction('move-right');
          break;
        case 'ArrowDown':
          e.preventDefault();
          handleGameAction('move-down');
          break;
        case 'ArrowUp':
        case 'x':
          e.preventDefault();
          handleGameAction('rotate');
          break;
        case 'z':
          e.preventDefault();
          handleGameAction('rotate-counter');
          break;
        case ' ':
          e.preventDefault();
          handleGameAction('hard-drop');
          break;
        case 'h':
        case 'H':
          e.preventDefault();
          handleGameAction('hold');
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameActive, gameOver, handleGameAction]);

  // Auto-drop piece
  useEffect(() => {
    if (!gameActive || gameOver || !myBoard) return;

    const interval = setInterval(() => {
      handleGameAction('move-down');
    }, 1000 - (myLevel - 1) * 50); // Speed increases with level

    return () => clearInterval(interval);
  }, [gameActive, gameOver, myLevel, myBoard, handleGameAction]);

  if (error) {
    return (
      <div className="game-page error">
        <h1>Error</h1>
        <p>{error}</p>
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="game-page loading">
        <h1>Connecting...</h1>
      </div>
    );
  }

  return (
    <div className="game-page">
      <div className="game-header">
        <h1>Red Tetris - {room}</h1>
        <div className="player-info">
          <span>Player: {playerName}</span>
          {isHost && <span className="host-badge">Host</span>}
          <button className="home-button" onClick={handleGoHome} title="Go to Home">
            Home
          </button>
        </div>
      </div>

      <div className="game-container">
        <div className="game-main">
          <div className="game-board-container">
            <div className="score-info">
              <div>Score: {myScore}</div>
              <div>Lines: {myLines}</div>
              <div>Level: {myLevel}</div>
            </div>
            <GameBoard 
              board={myBoard} 
              currentPiece={myPiece}
              gameOver={gameOver}
            />
            <div className="piece-preview-container">
              {myHeldPiece && (
                <div className="held-piece">
                  <h3>Hold</h3>
                  <NextPieceDisplay piece={myHeldPiece} />
                </div>
              )}
              {myNextPiece && (
                <div className="next-piece">
                  <h3>Next</h3>
                  <NextPieceDisplay piece={myNextPiece} />
                </div>
              )}
            </div>
          </div>

          <GameControls
            isHost={isHost}
            gameStarted={gameStarted}
            gameActive={gameActive}
            onStart={handleStartGame}
            onRestart={handleRestartGame}
          />
        </div>

        <div className="game-sidebar">
          <PlayerList players={players} currentPlayer={playerName} />
          <SpectrumView opponents={opponents} currentPlayer={playerName} />
        </div>
      </div>

      {winner && winner === playerName && showGameOverModal && (
        <div className="game-over-overlay">
          <div className="game-over-modal winner-modal">
            <button className="close-button" onClick={handleCloseModal} title="Close">
              ×
            </button>
            <h2 className="winner-title">🎉 You Win! 🎉</h2>
            <p className="winner-message">Congratulations! You are the winner!</p>
            <p>Final Score: {myScore}</p>
            <div className="modal-buttons">
              {isHost && (
                <button onClick={handleRestartGame}>Restart Game</button>
              )}
              <button onClick={handleGoHome}>Go to Home</button>
            </div>
          </div>
        </div>
      )}
      
      {gameOver && !winner && showGameOverModal && (
        <div className="game-over-overlay">
          <div className="game-over-modal">
            <button className="close-button" onClick={handleCloseModal} title="Close">
              ×
            </button>
            <h2>Game Over</h2>
            <p>Final Score: {myScore}</p>
            <div className="modal-buttons">
              {isHost && (
                <button onClick={handleRestartGame}>Restart Game</button>
              )}
              <button onClick={handleGoHome}>Go to Home</button>
            </div>
          </div>
        </div>
      )}
      
      {winner && winner !== playerName && showGameOverModal && (
        <div className="game-over-overlay">
          <div className="game-over-modal">
            <button className="close-button" onClick={handleCloseModal} title="Close">
              ×
            </button>
            <h2>Game Over</h2>
            <p className="loser-message">The winner is: <strong>{winner}</strong></p>
            <p>Your Score: {myScore}</p>
            <div className="modal-buttons">
              {isHost && (
                <button onClick={handleRestartGame}>Restart Game</button>
              )}
              <button onClick={handleGoHome}>Go to Home</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NextPieceDisplay({ piece }) {
  if (!piece) return null;

  const shape = getPieceShape(piece.type, piece.rotation);
  const cellSize = 20;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${shape[0]?.length || 4}, ${cellSize}px)`,
      gap: '1px',
      marginTop: '0.5rem'
    }}>
      {shape.flatMap((row, y) =>
        row.map((cell, x) => (
          <div
            key={`${y}-${x}`}
            style={{
              width: `${cellSize}px`,
              height: `${cellSize}px`,
              backgroundColor: cell ? piece.color : 'transparent',
              border: cell ? '1px solid #333' : 'none'
            }}
          />
        ))
      )}
    </div>
  );
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

export default GamePage;
