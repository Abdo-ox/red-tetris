import '../styles/PlayerList.css';

function PlayerList({ players, currentPlayer }) {
  return (
    <div className="player-list">
      <h3>Players</h3>
      <div className="players">
        {players.map((player) => (
          <div 
            key={player.socketId || player.playerName}
            className={`player-item ${player.playerName === currentPlayer ? 'current' : ''}`}
          >
            <span className="player-name">{player.playerName}</span>
            {player.isHost && <span className="host-badge">Host</span>}
            <div className="player-stats">
              <span>Score: {player.score || 0}</span>
              <span>Lines: {player.lines || 0}</span>
              {player.gameOver && <span className="game-over-badge">Game Over</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PlayerList;
