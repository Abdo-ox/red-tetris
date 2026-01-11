import '../styles/GameControls.css';

function GameControls({ isHost, gameStarted, gameActive, onStart, onRestart }) {
  return (
    <div className="game-controls">
      <h3>Controls</h3>
      <div className="controls-list">
        <div className="control-item">
          <span className="control-key">← →</span>
          <span className="control-desc">Move</span>
        </div>
        <div className="control-item">
          <span className="control-key">↓</span>
          <span className="control-desc">Soft Drop</span>
        </div>
        <div className="control-item">
          <span className="control-key">↑ / X</span>
          <span className="control-desc">Rotate</span>
        </div>
        <div className="control-item">
          <span className="control-key">Z</span>
          <span className="control-desc">Rotate CCW</span>
        </div>
        <div className="control-item">
          <span className="control-key">Space</span>
          <span className="control-desc">Hard Drop</span>
        </div>
        <div className="control-item">
          <span className="control-key">H</span>
          <span className="control-desc">Hold Piece</span>
        </div>
      </div>
      
      {
      isHost && 
      (
        <div className="host-controls">
          {!gameStarted ? (
            <button 
              className="control-button start-button"
              onClick={onStart}
            >
              Start Game
            </button>
          ) : (
            <button 
              className="control-button restart-button"
              onClick={onRestart}
              disabled={gameActive}
            >
              Restart Game
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default GameControls;
