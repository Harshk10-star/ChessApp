// src/screens/Dashboard.js

import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { io } from 'socket.io-client';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);
  const [status, setStatus] = useState('');
  const [gameId, setGameId] = useState(null);
  const [opponent, setOpponent] = useState(null);
  const [moves, setMoves] = useState([]);
  const [moveInput, setMoveInput] = useState('');

  useEffect(() => {
    // Initialize Socket.io client
    const newSocket = io('http://localhost:3001', {
      withCredentials: true,
    });

    setSocket(newSocket);

    // Authenticate the socket connection
    newSocket.emit('authenticate', { token: null }); // Token is sent via cookies

    // Handle authentication response
    newSocket.on('authenticated', (data) => {
      if (data.success) {
        console.log('Socket authenticated successfully.');
      } else {
        console.error('Socket authentication failed:', data.message);
      }
    });

    // Handle gameMatched event
    newSocket.on('gameMatched', (data) => {
      const { gameId, opponent } = data;
      newSocket.emit('joinRoom', {gameId});
      setGameId(gameId);
      setOpponent(opponent);
      setStatus(`Matched with ${opponent}. Game ID: ${gameId}`);
    });

    // Handle waitingForMatch event
    newSocket.on('waitingForMatch', (data) => {
      setStatus(data.message);
    });

    // Handle opponentMove event
    newSocket.on('opponentMove', (data) => {
      const { move } = data;
      setMoves((prevMoves) => [...prevMoves, { player: opponent, move }]);
    });

    // Handle gameEnded event
    newSocket.on('gameEnded', (data) => {
      const { gameId, winnerId } = data;
      if (winnerId === user.userId) {
        setStatus('You won the game!');
      } else {
        setStatus('You lost the game.');
      }
      setGameId(null);
      setOpponent(null);
      setMoves([]);
    });

    // Handle opponentDisconnected event
    newSocket.on('opponentDisconnected', (data) => {
      setStatus(data.message);
      setGameId(null);
      setOpponent(null);
      setMoves([]);
    });

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, [user, opponent]);

  const handleFindGame = () => {
    if (socket) {
      socket.emit('findGame');
      setStatus('Searching for a game...');
    }
  };

  const handleMakeMove = () => {
    if (socket && gameId && moveInput.trim() !== '') {
      const move = moveInput.trim();
      // Example move structure; adjust according to your game's requirements
      const moveData = {
        gameId,
        move: {
          piece: 'pawn', // Example; should be dynamic based on game state
          from_square: 'e2',
          to_square: move,
          captured_piece: null, // Example; set if a piece was captured
        },
      };

      socket.emit('makeMove', moveData);
      setMoves((prevMoves) => [...prevMoves, { player: 'You', move }]);
      setMoveInput('');
    }
  };

  const handleLogoutAndDisconnect = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <h2>Welcome, {user.username} (ID: {user.userId})!</h2>
      <button onClick={handleFindGame} className="auth-button" disabled={!!gameId}>
        {gameId ? 'In Game' : 'Find Game'}
      </button>
      <p>{status}</p>

      {gameId && (
        <div className="game-section">
          <h3>Game ID: {gameId}</h3>
          <h4>Opponent: {opponent}</h4>
          <div className="moves-section">
            <h5>Moves:</h5>
            <ul>
              {moves.map((m, index) => (
                <li key={index}>
                  <strong>{m.player}:</strong> {m.move.to_square}
                </li>
              ))}
            </ul>
          </div>
          <div className="move-input">
            <input
              type="text"
              value={moveInput}
              onChange={(e) => setMoveInput(e.target.value)}
              placeholder="Enter your move (e.g., e4)"
              disabled={!gameId}
            />
            <button onClick={handleMakeMove} disabled={!gameId || moveInput.trim() === ''}>
              Make Move
            </button>
          </div>
        </div>
      )}

      <button onClick={handleLogoutAndDisconnect} className="logout-button">
        Logout
      </button>
    </div>
  );
};

export default Dashboard;
