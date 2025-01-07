// server.js

// -----------------------------
// Import Required Modules
// -----------------------------
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const ejs = require('ejs');
const cors = require('cors');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const redis = require('redis');
const mysql = require('mysql2/promise');
const winston = require('winston');
const dotenv = require('dotenv');

// -----------------------------
// Load Environment Variables
// -----------------------------
dotenv.config(); // Loads variables from .env into process.env

// -----------------------------
// Configuration
// -----------------------------
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';

// -----------------------------
// Initialize Logger
// -----------------------------
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(
      ({ timestamp, level, message }) => `${timestamp} [${level.toUpperCase()}]: ${message}`
    )
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'server.log' })
  ],
});

// -----------------------------
// Initialize Redis Client
// -----------------------------
const redisClient = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
  }
 // password: process.env.REDIS_PASSWORD || undefined, // Set if Redis requires authentication
});

redisClient.on('error', (err) => {
  logger.error(`Redis Client Error: ${err}`);
});

redisClient.on('connect', () => {
  logger.info('Connected to Redis successfully.');
});

(async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    logger.error(`Could not connect to Redis: ${error}`);
    process.exit(1); // Exit if Redis connection fails
  }
})();

// -----------------------------
// Initialize MySQL Connection Pool
// -----------------------------
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Root1234',
  database: process.env.DB_NAME || 'chess_app',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// -----------------------------
// Initialize Express App
// -----------------------------
const app = express();

// Set EJS as templating engine
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// Middleware Configuration
app.use(express.static('public'));
app.use(cors({
  origin: 'http://localhost:3000', // Replace with your frontend URL
  methods: ['GET', 'POST'],
  credentials: true,
}));

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// -----------------------------
// Authentication Middleware
// -----------------------------
function authenticateToken(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ success: false, message: 'No token provided.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ success: false, message: 'Invalid token.' });
    req.user = user;
    next();
  });
}

// -----------------------------
// Define Express Routes
// -----------------------------

// Health Check Route
app.get('/health', async (req, res) => {
  try {
    await redisClient.ping();
    res.status(200).json({ status: 'OK', redis: 'Connected' });
  } catch (error) {
    logger.error(`Health Check Failed: ${error}`);
    res.status(500).json({ status: 'Error', redis: 'Disconnected' });
  }
});

// User Registration
app.post('/user', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'Missing fields.' });
    }

    // Check if user already exists
    const [existingUser] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(409).json({ success: false, message: 'User already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );

    return res.status(201).json({ 
      success: true,
      userId: result.insertId,
      message: 'User created successfully.' 
    });
  } catch (error) {
    logger.error(`Error Creating User: ${error}`);
    return res.status(500).json({ success: false, message: 'Database error.' });
  }
});

// User Login
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

    // Generate JWT Token
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set JWT in HTTP-only Cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,//process.env.NODE_ENV === 'production', // Set to true in production
      sameSite: 'Lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/'
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
    });
  } catch (error) {
    logger.error(`Error During Login: ${error}`);
    return res.status(500).json({ success: false, message: 'An error occurred during login.' });
  }
});

// Protected Route to Get User Info
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

// Get User by ID
app.get('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id; 

    if (!userId) {
      return res.status(400).json({ success: false, message: 'Missing user ID parameter.' });
    }
    
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
    
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    } 
    res.json(rows[0]);
  } catch (error) {
    logger.error(`Error Fetching User: ${error}`);
    return res.status(500).json({ success: false, message: 'Database error.' });
  }
});

// Get Games for a User
app.get('/games/:userId', async (req, res) => {
  const userId = req.params.userId;

  if (!userId) {
    return res.status(400).json({ success: false, message: "Missing user ID parameter." });
  }

  try {
    const [result] = await pool.query(
      'SELECT * FROM games WHERE white_player_id = ? OR black_player_id = ?',
      [userId, userId]
    );

    if (result.length === 0) {
      return res.status(404).json({ success: false, message: 'No games found for that user.' });
    }

    return res.status(200).json(result);
  } catch (err) {
    logger.error(`Error Fetching Games: ${err}`);
    return res.status(500).json({ success: false, message: 'Database error.' });
  }
});

// Get Moves for a Game
app.get('/moves/:gameId', async (req, res) => {
  const gameID = req.params.gameId;

  if (!gameID) {
    return res.status(400).json({ success: false, message: 'Missing gameId.' });
  }

  try {
    const [result] = await pool.query('SELECT * FROM moves WHERE game_id = ? ORDER BY move_number', [gameID]);

    if (result.length === 0) {
      return res.status(404).json({ success: false, message: 'No moves found for this game.' });
    }
    return res.status(200).json({ moves: result });
  } catch (err) {
    logger.error(`Error Fetching Moves: ${err}`);
    return res.status(500).json({ success: false, message: 'Database error.' });
  }
});

// Create a New Game
app.post('/games', async (req, res) => {
  try {
    const { white_player_id, black_player_id, winner_id } = req.body;

    if (!white_player_id || !black_player_id) {
      return res.status(400).json({ success: false, message: 'Missing white_player_id or black_player_id.' });
    }

    const [result] = await pool.query(
      'INSERT INTO games (white_player_id, black_player_id, winner_id) VALUES (?, ?, ?)',
      [white_player_id, black_player_id, winner_id || null]
    );

    return res.status(201).json({
      success: true,
      gameId: result.insertId,
      message: 'New game created successfully.',
    });
  } catch (error) {
    logger.error(`Error Creating New Game: ${error}`);
    return res.status(500).json({ success: false, message: 'Database error.' });
  }
});

// Insert Multiple Moves at Once
app.post('/moves/bulk', async (req, res) => {
  try {
    const { moves } = req.body;

    if (!Array.isArray(moves) || moves.length === 0) {
      return res.status(400).json({ success: false, message: 'Moves must be a non-empty array.' });
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

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

      await connection.commit();

      return res.status(201).json({
        success: true,
        message: 'All moves inserted successfully.',
      });
    } catch (bulkError) {
      await connection.rollback();
      logger.error(`Error Inserting Bulk Moves: ${bulkError}`);
      return res.status(500).json({ success: false, message: 'Bulk insert failed.', details: bulkError.message });
    } finally {
      connection.release();
    }
  } catch (error) {
    logger.error(`Error in /moves/bulk Route: ${error}`);
    return res.status(500).json({ success: false, message: 'Database error.' });
  }
});

// -----------------------------
// Initialize HTTP Server and Socket.io
// -----------------------------

// Create HTTP server using Express app
const serverInstance = http.createServer(app);

// Initialize Socket.io with the HTTP server
const io = new Server(serverInstance, {
  cors: { origin: 'http://localhost:3000', credentials:true } // Replace '*' with your frontend URL in production for security
});

const cookie = require('cookie'); // Ensure you have imported the 'cookie' module

io.use(async (socket, next) => {
  try {
    const cookieHeader = socket.handshake.headers.cookie;
    if (!cookieHeader) {
      logger.warn('Socket.IO connection rejected: No cookie header.');
      return next(new Error('Authentication error: No token provided.'));
    }

    const cookies = cookie.parse(cookieHeader);
    const token = cookies.token;

    if (!token) {
      logger.warn('Socket.IO connection rejected: No token found in cookies.');
      return next(new Error('Authentication error: No token provided.'));
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        logger.warn(`Socket.IO authentication failed: ${err.message}`);
        return next(new Error('Authentication error: Invalid token.'));
      }
      socket.userId = decoded.userId;
      userSockets[socket.userId] = socket.id;
      logger.info(`Socket.IO authenticated for user ID: ${socket.userId}`);
      next();
    });
  } catch (error) {
    logger.error(`Socket.IO Authentication Error: ${error}`);
    next(new Error('Authentication error'));
  }
});

// In-memory storage for games and user sockets
const games = {}; // { gameId: { players: [userId1, userId2], ... } }
const userSockets = {}; // { userId: socketId }

// Helper Function to Create Game Record in Database
async function createGameRecord(whitePlayerId, blackPlayerId) {
  try {
    const [result] = await pool.query(
      'INSERT INTO games (white_player_id, black_player_id, status, winner_id, created_at) VALUES (?, ?, ?, ?, NOW())',
      [whitePlayerId, blackPlayerId, 'in_progress', null]
    );
    return result.insertId;
  } catch (error) {
    logger.error(`Error Creating Game Record: ${error}`);
    throw error;
  }
}

// Socket.io Authentication Middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error: No token provided.'));
    }
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return next(new Error('Authentication error: Invalid token.'));
      }
      socket.userId = decoded.userId;
      userSockets[socket.userId] = socket.id;
      next();
    });
  } catch (error) {
    logger.error(`Socket.io Authentication Error: ${error}`);
    next(new Error('Authentication error'));
  }
});

// Socket.io Connection Event
io.on('connection', (socket) => {
  logger.info(`User connected: ${socket.userId} (Socket ID: ${socket.id})`);

  // Handle 'findGame' Event
  socket.on('findGame', async () => {
    const userId = socket.userId;
    if (!userId) {
      socket.emit('error', { message: 'User not authenticated.' });
      return;
    }

    try {
      const matchedUserId = await redisClient.lPop('waitingPlayers');

      if (matchedUserId && matchedUserId !== userId) {
        // Match Found, Create a Game
        const gameId = await createGameRecord(userId, matchedUserId);

        // Store Game Details In-Memory
        games[gameId] = {
          players: [userId, matchedUserId],
          createdAt: Date.now(),
          status: 'in_progress',
        };

        // Notify Both Players
        const matchedSocketId = userSockets[matchedUserId];
        if (matchedSocketId) {
          io.to(matchedSocketId).emit('gameMatched', { gameId, opponent: userId });
          // Join Both Sockets to a Room
         // io.to(matchedSocketId).socketsJoin(`game_${gameId}`);
        }

        io.to(socket.id).emit('gameMatched', { gameId, opponent: matchedUserId });
        //socket.join(`game_${gameId}`);

        logger.info(`Game created: ${gameId} between User ${userId} and User ${matchedUserId}`);
      } else {
        // No Match Found, Add User to Waiting Queue
        await redisClient.rPush('waitingPlayers', userId);
        socket.emit('waitingForMatch', { message: 'Waiting for an opponent...' });
        logger.info(`User ${userId} added to waitingPlayers queue.`);
      }
    } catch (error) {
      logger.error(`Error During Matchmaking: ${error}`);
      socket.emit('error', { message: 'Matchmaking failed.' });
    }
  });

  // Handle 'makeMove' Event
  socket.on('makeMove', async (data) => {
    const { gameId, move } = data; // move should include necessary details
    const userId = socket.userId;

    if (!gameId || !move) {
      socket.emit('error', { message: 'Invalid move data.' });
      return;
    }

    const game = games[gameId];
    if (!game) {
      socket.emit('error', { message: 'Game not found.' });
      return;
    }

    // Determine Opponent
    const opponentId = game.players.find(id => id !== userId);
    if (!opponentId) {
      socket.emit('error', { message: 'Opponent not found.' });
      return;
    }

    const opponentSocketId = userSockets[opponentId];
    if (opponentSocketId) {
      // Broadcast the Move to the Opponent
      io.to(opponentSocketId).emit('opponentMove', { move });
      logger.info(`Move from User ${userId} to User ${opponentId} in Game ${gameId}: ${JSON.stringify(move)}`);
    } else {
      socket.emit('error', { message: 'Opponent disconnected.' });
    }

    // Insert Move into the Database (Implement as Needed)
    // Example:
    // const moveNumber = await getNextMoveNumber(gameId);
    // await pool.query(
    //   'INSERT INTO moves (game_id, player_id, move_number, piece, from_square, to_square, captured_piece) VALUES (?, ?, ?, ?, ?, ?, ?)',
    //   [gameId, userId, moveNumber, move.piece, move.from, move.to, move.captured]
    // );
  });

  // Handle 'endGame' Event
  socket.on('endGame', async (data) => {
    const { gameId, winnerId } = data;
    const game = games[gameId];
    if (!game) {
      socket.emit('error', { message: 'Game not found.' });
      return;
    }

    try {
      // Update Game Status in Database
      await pool.query(
        'UPDATE games SET status = ?, winner_id = ? WHERE id = ?',
        ['completed', winnerId, gameId]
      );

      // Notify Both Players
      game.players.forEach(playerId => {
        const socketId = userSockets[playerId];
        if (socketId) {
          io.to(socketId).emit('gameEnded', { gameId, winnerId });
        }
      });

      // Remove the Game from In-Memory Store
      delete games[gameId];
      logger.info(`Game ${gameId} ended. Winner: User ${winnerId}`);
    } catch (error) {
      logger.error(`Error Ending Game: ${error}`);
      socket.emit('error', { message: 'Failed to end game.' });
    }
  });

  // Handle User Disconnect
  socket.on('disconnect', async () => {
    logger.info(`User disconnected: ${socket.userId} (Socket ID: ${socket.id})`);
    const userId = socket.userId;

    if (userId) {
      delete userSockets[userId];

      // Remove User from Waiting Queue if Present
      try {
        // Remove all occurrences of userId from 'waitingPlayers'
        await redisClient.lRem('waitingPlayers', 0, userId);
        logger.info(`User ${userId} removed from waitingPlayers queue.`);
      } catch (error) {
        logger.error(`Error Removing User from Waiting Queue: ${error}`);
      }

      // Check if User was in Any Ongoing Games
      for (const [gameId, game] of Object.entries(games)) {
        if (game.players.includes(userId)) {
          const opponentId = game.players.find(id => id !== userId);
          const opponentSocketId = userSockets[opponentId];
          if (opponentSocketId) {
            io.to(opponentSocketId).emit('opponentDisconnected', { message: 'Opponent has disconnected.' });
          }
          delete games[gameId];
          logger.info(`Game ${gameId} ended due to disconnection of User ${userId}.`);

          try {
            await pool.query(
              'UPDATE games SET status = ?, winner_id = ? WHERE id = ?',
              ['completed', opponentId, gameId]
            );
            logger.info(`Game ${gameId} marked as completed. Winner: User ${opponentId}`);
          } catch (error) {
            logger.error(`Error Updating Game Status After Disconnection: ${error}`);
          }
        }
      }
    }
  });
});

// -----------------------------
// Start the Server
// -----------------------------
serverInstance.listen(PORT, () => {
  logger.info(`Server is running (Express + Socket.io) on port ${PORT}`);
});
