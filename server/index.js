const express= require('express');
const ejs= require('ejs');
const cors= require("cors");
const bcrypt = require('bcrypt');
var bodyParser = require('body-parser');

const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const app= express();
const redis = require('redis');
const pool = require('./db.js');

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(cors({
  origin: 'http://localhost:3000', 
  credentials: true
}));
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
require('./prod.env').config();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';
// Initialize Redis client
const redisClient = redis.createClient({
  host: 'localhost',
  port: 6379,        
  // password: 'your_redis_password', 
});


const { promisify } = require('util');
const lpopAsync = promisify(redisClient.lpop).bind(redisClient);
const rpushAsync = promisify(redisClient.rpush).bind(redisClient);
const lremAsync = promisify(redisClient.lrem).bind(redisClient);


redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

redisClient.on('error', (err) => {
  console.error('Redis error:', err);
});


// POST /login - Authenticate a user and provide a JWT token
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password.' });
    }

  
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const user = rows[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Generate a JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: '24h' } // Token validity duration
    );

    // Set the token in an HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Set to true in production
      sameSite: 'Strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    // Respond with success
    return res.status(200).json({
      success: true,
      message: 'Login successful.',
    });
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json({ success: false, message: 'An error occurred during login.' });
  }
});

const authenticateToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ success: false, message: 'No token provided.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ success: false, message: 'Invalid token.' });
    req.user = user;
    next();
  });
};

//Protected endpoint
app.get('/me', authenticateToken, (req, res) => {
  return res.status(200).json({
    success: true,
    user: {
      userId: req.user.userId,
      username: req.user.username,
      email: req.user.email,
    },
  });
});

// GET /users/:id
// Fetch a user from the "users" table by their id
app.get('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id; 
  
    if (!userId) {
      return res.status(400).json({ error: 'Missing user ID parameter' });
    }
    
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    } 
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json({ error: 'Database error' });
  }
});

// GET /games/:userId
// Fetch games for a given user from the `games` table
app.get('/games/:userId', async (req, res) => {
  const userId = req.params.userId;

  if (!userId) {
    return res.status(400).json({ error: "Missing user ID parameter" });
  }

  try {
    const [result] = await pool.query(
      'SELECT * FROM games WHERE white_player_id = ? OR black_player_id = ?',
      [userId, userId]
    );

    if (result.length === 0) {
      return res.status(404).json({ error: 'No games found for that user' });
    }

    return res.status(200).json(result);
  } catch (err) {
    console.error('Error fetching games:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

// GET /moves/:gameId
// FETCH moves of a game with gameID from moves table
app.get('/moves/:gameId', async(req,res)=> {
  const gameID = req.params.gameId;

  if(!gameID)  return res.status(400).json({error: 'Missing gameId'});

  try{
    const [result] = await pool.query('SELECT * from moves WHERE game_id = ? ORDER BY move_number',[gameID]);

    if(result.length == 0) res.status(404).json({error: 'No moves found for this game'});
    return res.status(200).json({result});
  } catch (err){
    console.error('Error fetching moves for game:', err);
    return res.status(500).json({ error: 'Database error' });
  }
})
/*
req.body
{
 username: String,
 email: string,
 password: String
}
*/
app.post('/user', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = 'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)';
    const [result] = await pool.query(sql, [username, email, hashedPassword]);

    return res.status(201).json({ 
      success: true,
      userId: result.insertId,
      message: 'User created successfully' 
    });
  } catch (error) {
    console.error('Error inserting user:', error);
    return res.status(500).json({ error: 'Database error' });
  }
});

/*
{
black: id,
white: id,
status: "in progress" or "completed"
winner: id or null
}
*/
app.post('/games', async (req, res) => {
  try {
    const { white_player_id, black_player_id, winner_id } = req.body;

    if (!white_player_id || !black_player_id) {
      return res.status(400).json({ error: 'Missing white_player_id or black_player_id.' });
    }

    const sql = `
      INSERT INTO games (white_player_id, black_player_id, winner_id)
      VALUES (?, ?, ?)
    `;
    const [result] = await pool.query(sql, [white_player_id, black_player_id, winner_id]);

    return res.status(201).json({
      success: true,
      gameId: result.insertId,
      message: 'New game created successfully.'
    });
  } catch (error) {
    console.error('Error creating new game:', error);
    return res.status(500).json({ error: 'Database error' });
  }
});

/**
 * POST /moves/bulk
 * Inserts multiple moves at once for a given game.
 * 
 * Expects req.body like:
 * {
 *   "moves": [
 *     {
 *       "game_id": 10,
 *       "player_id": 1,
 *       "move_number": 1,
 *       "piece": "pawn",
 *       "from_square": "e2",
 *       "to_square": "e4",
 *       "captured_piece": null
 *     },
 *     {
 *       "game_id": 10,
 *       "player_id": 2,
 *       "move_number": 2,
 *       "piece": "pawn",
 *       "from_square": "d7",
 *       "to_square": "d5",
 *       "captured_piece": null
 *     }
 *     // ... more moves
 *   ]
 * }
 */
app.post('/moves/bulk', async (req, res) => {
  try {
    const { moves } = req.body;

    if (!Array.isArray(moves) || moves.length === 0) {
      return res.status(400).json({ error: 'Moves must be a non-empty array.' });
    }

    // We can do this in a transaction if we want all-or-nothing behavior
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Loop over each move and insert individually
      const sql = `
        INSERT INTO moves 
          (game_id, player_id, move_number, piece, from_square, to_square, captured_piece) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      for (const move of moves) {
        const {
          game_id,
          player_id,
          move_number,
          piece,
          from_square,
          to_square,
          captured_piece
        } = move;

        if (
          !game_id || 
          !player_id ||
          !move_number ||
          !piece ||
          !from_square ||
          !to_square
        ) {
          throw new Error('Missing required move fields in one of the moves.');
        }

        await connection.query(sql, [
          game_id,
          player_id,
          move_number,
          piece,
          from_square,
          to_square,
          captured_piece || null
        ]);
      }

      // If all inserts succeeded, commit
      await connection.commit();

      return res.status(201).json({
        success: true,
        message: 'All moves inserted successfully.'
      });
    } catch (bulkError) {
      await connection.rollback();
      console.error('Error inserting bulk moves:', bulkError);
      return res.status(500).json({ error: 'Bulk insert failed.', details: bulkError.message });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error in /moves/bulk route:', error);
    return res.status(500).json({ error: 'Database error' });
  }
});

const http = require('http');
const serverInstance = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(serverInstance, {
  cors: { origin: '*' } // Update with your frontend URL in production for security
});

const userSockets = {};

const games = {};

const createGameRecord = async (whitePlayerId, blackPlayerId) => {
  try {
    const [result] = await pool.query(
      'INSERT INTO games (white_player_id, black_player_id, status, winner_id, created_at) VALUES (?, ?, ?, ?, NOW())',
      [whitePlayerId, blackPlayerId, 'in_progress', null]
    );
    return result.insertId; 
  } catch (error) {
    console.error('Error creating game record:', error);
    throw error;
  }
};

const insertMove = async (gameId, playerId, moveNumber, piece, fromSquare, toSquare, capturedPiece) => {
  try {
    await pool.query(
      'INSERT INTO moves (game_id, player_id, move_number, piece, from_square, to_square, captured_piece) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [gameId, playerId, moveNumber, piece, fromSquare, toSquare, capturedPiece]
    );
  } catch (error) {
    console.error('Error inserting move:', error);
    throw error;
  }
};

const getNextMoveNumber = async (gameId) => {
  try {
    const [rows] = await pool.query(
      'SELECT COUNT(*) as moveCount FROM moves WHERE game_id = ?',
      [gameId]
    );
    return rows[0].moveCount + 1;
  } catch (error) {
    console.error('Error getting next move number:', error);
    throw error;
  }
};

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('authenticate', (data) => {
    const { userId } = data;
    if (userId) {
      userSockets[userId] = socket.id;
      socket.userId = userId; 
      console.log(`User authenticated: ${userId}`);
      socket.emit('authenticated', { success: true });
    } else {
      socket.emit('authenticated', { success: false, message: 'Invalid userId' });
    }
  });

  // Listen for 'findGame' event
  socket.on('findGame', async () => {
    const userId = socket.userId;
    if (!userId) {
      socket.emit('error', { message: 'User not authenticated' });
      return;
    }

    try {
      const matchedUserId = await lpopAsync('waitingPlayers');

      if (matchedUserId && matchedUserId !== userId) {
        // Match found, create a game
        const gameId = await createGameRecord(userId, matchedUserId);

        // Store game details
        games[gameId] = {
          players: [userId, matchedUserId],
          createdAt: Date.now(),
          status: 'in_progress',
        };

        // Notify both players
        const matchedSocketId = userSockets[matchedUserId];
        if (matchedSocketId) {
          io.to(matchedSocketId).emit('gameMatched', { gameId, opponent: userId });
          // Optionally, join both sockets to a Socket.io room
          io.to(matchedSocketId).socketsJoin(`game_${gameId}`);
        }

        io.to(socket.id).emit('gameMatched', { gameId, opponent: matchedUserId });
        socket.join(`game_${gameId}`);

        console.log(`Game created: ${gameId} between ${userId} and ${matchedUserId}`);
      } else {
        // No match found, add the current user to the waiting queue
        await rpushAsync('waitingPlayers', userId);
        socket.emit('waitingForMatch', { message: 'Waiting for an opponent...' });
        console.log(`User ${userId} added to waitingPlayers queue`);
      }
    } catch (error) {
      console.error('Error during matchmaking:', error);
      socket.emit('error', { message: 'Matchmaking failed' });
    }
  });

  // Handle 'makeMove' event
  socket.on('makeMove', async (data) => {
    const { gameId, move } = data; // move should include necessary details
    const userId = socket.userId;

    if (!gameId || !move) {
      socket.emit('error', { message: 'Invalid move data' });
      return;
    }

    const game = games[gameId];
    if (!game) {
      socket.emit('error', { message: 'Game not found' });
      return;
    }

    // Determine opponent
    const opponentId = game.players.find(id => id !== userId);
    if (!opponentId) {
      socket.emit('error', { message: 'Opponent not found' });
      return;
    }

    const opponentSocketId = userSockets[opponentId];
    if (opponentSocketId) {
      // Broadcast the move to the opponent
      io.to(opponentSocketId).emit('opponentMove', { move });
      console.log(`Move from ${userId} to ${opponentId} in game ${gameId}:`, move);
    } else {
      socket.emit('error', { message: 'Opponent disconnected' });
    }

    // Insert move into the database - maybe?
  });

  // Handle 'endGame' event
  socket.on('endGame', async (data) => {
    const { gameId, winnerId } = data;
    const game = games[gameId];
    if (!game) {
      socket.emit('error', { message: 'Game not found' });
      return;
    }

    try {
      // Update game status in the database
      await pool.query(
        'UPDATE games SET status = ?, winner_id = ? WHERE id = ?',
        ['completed', winnerId, gameId]
      );

      // Notify both players
      game.players.forEach(playerId => {
        const socketId = userSockets[playerId];
        if (socketId) {
          io.to(socketId).emit('gameEnded', { gameId, winnerId });
        }
      });

      // Remove the game from the in-memory store
      delete games[gameId];
      console.log(`Game ${gameId} ended. Winner: ${winnerId}`);
    } catch (error) {
      console.error('Error ending game:', error);
      socket.emit('error', { message: 'Failed to end game' });
    }
  });

  // Handle 'joinRoom' event (optional, as rooms are handled during matchmaking)
  socket.on('joinRoom', (gameId) => {
    socket.join(gameId);
    console.log(`User ${socket.userId} joined room ${gameId}`);
  });

  // Handle user disconnect
  socket.on('disconnect', async () => {
    console.log(`User disconnected: ${socket.id}`);
    const userId = socket.userId;

    if (userId) {
      delete userSockets[userId];

      // Remove user from waitingPlayers queue if present
      try {
        // Remove all occurrences of userId from 'waitingPlayers'
        await lremAsync('waitingPlayers', 0, userId);
        console.log(`User ${userId} removed from waitingPlayers queue`);
      } catch (error) {
        console.error('Error removing user from waitingPlayers:', error);
      }

      // Check if user was in any ongoing games
      for (const [gameId, game] of Object.entries(games)) {
        if (game.players.includes(userId)) {
          const opponentId = game.players.find(id => id !== userId);
          const opponentSocketId = userSockets[opponentId];
          if (opponentSocketId) {
            io.to(opponentSocketId).emit('opponentDisconnected', { message: 'Opponent has disconnected.' });
          }
          delete games[gameId];
          console.log(`Game ${gameId} ended due to disconnection of ${userId}`);

          try {
            await pool.query(
              'UPDATE games SET status = ?, winner_id = ? WHERE id = ?',
              ['completed', opponentId, gameId]
            );
            console.log(`Game ${gameId} marked as completed. Winner: ${opponentId}`);
          } catch (error) {
            console.error('Error updating game status after disconnection:', error);
          }
        }
      }
    }
  });
});
server.listen(3001, () => {
  console.log('Server is running (Express + Socket.io) on port 3001');
});
