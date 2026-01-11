import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import '../styles/HomePage.css';

const SERVER_URL = window.location.origin;

function HomePage() {
  const [roomId, setRoomId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const socketRef = useRef(null);

  useEffect(() => {
    return () => {
      // Cleanup socket on unmount (when navigating away)
      // Give GamePage time to connect before closing this socket
      if (socketRef.current) {
        const socket = socketRef.current;
        // Small delay to allow GamePage to connect first
        setTimeout(() => {
          if (socket && socket.connected) {
            socket.close();
          }
        }, 500);
        socketRef.current = null;
      }
    };
  }, []);

  const attemptJoin = (room, name, isCreate) => {
    if (!room.trim() || !name.trim()) {
      setError('Please enter both room ID and player name');
      return;
    }
    
    // Validate inputs
    if (room.trim().length === 0 || name.trim().length === 0) {
      setError('Room ID and player name cannot be empty');
      return;
    }
    
    setError('');
    setLoading(true);
    
    // Create temporary socket connection to validate join
    const tempSocket = io(SERVER_URL, {
      autoConnect: true
    });
    
    socketRef.current = tempSocket;
    
    const cleanup = () => {
      if (tempSocket && tempSocket.connected) {
        tempSocket.close();
      }
      setLoading(false);
      socketRef.current = null;
    };
    
    const timeout = setTimeout(() => {
      setError('Connection timeout. Please try again.');
      cleanup();
    }, 5000);
    
    tempSocket.on('connect', () => {
      tempSocket.emit('join-room', { room: room.trim(), playerName: name.trim() });
    });
    
    tempSocket.on('room-joined', () => {
      clearTimeout(timeout);
      setLoading(false);
      // Navigate immediately on success
      // The socket will stay connected briefly and be cleaned up when component unmounts
      // GamePage will create its own socket connection and join again
      navigate(`/${encodeURIComponent(room.trim())}/${encodeURIComponent(name.trim())}`);
      // Note: Don't call cleanup() here - let it happen on unmount after navigation
    });
    
    tempSocket.on('error', (data) => {
      clearTimeout(timeout);
      setError(data.message || 'Failed to join room');
      cleanup();
    });
    
    tempSocket.on('connect_error', () => {
      clearTimeout(timeout);
      setError('Failed to connect to server');
      cleanup();
    });
  };

  const handleCreateRoom = () => {
    attemptJoin(roomId, playerName, true);
  };

  const handleJoinRoom = () => {
    attemptJoin(roomId, playerName, false);
  };

  const handleKeyPress = (e, action) => {
    if (e.key === 'Enter') {
      action();
    }
  };

  return (
    <div className="home-page">
      <div className="home-container">
        <h1 className="home-title">Red Tetris</h1>
        <p className="home-subtitle">Multiplayer Tetris Network</p>
        
        <div className="home-form">
          <div className="form-group">
            <label htmlFor="roomId">Room ID</label>
            <input
              id="roomId"
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, handleJoinRoom)}
              placeholder="Enter room ID"
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="playerName">Player Name</label>
            <input
              id="playerName"
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, handleJoinRoom)}
              placeholder="Enter your name"
              className="form-input"
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <div className="button-group">
            <button 
              onClick={handleCreateRoom}
              className="btn btn-create"
              disabled={loading}
            >
              {loading ? 'Connecting...' : 'Create Room'}
            </button>
            <button 
              onClick={handleJoinRoom}
              className="btn btn-join"
              disabled={loading}
            >
              {loading ? 'Connecting...' : 'Join Room'}
            </button>
          </div>
          
          <div className="info-text">
            <p>• Create Room: Creates a new room (you'll be the host)</p>
            <p>• Join Room: Joins an existing room</p>
            <p>• Maximum 4 players per room</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
