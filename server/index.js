// app.js
const express= require('express');
const ejs= require('ejs');
const cors= require("cors");
const bcrypt = require('bcrypt');
const saltRounds = 10;
var bodyParser = require('body-parser');
const app= express();

// 1) Import the pool
const pool = require('./db.js');

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/games', async (req, res) => {
  try {
    // Example: Query games
    const [games] = await pool.query('SELECT * FROM games');
    res.json(games);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

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
    
    // 1) Validate input (basic example)
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    // 2) Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3) Insert into the users table
    const sql = 'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)';
    const [result] = await pool.query(sql, [username, email, hashedPassword]);

    // result.insertId is the auto-increment ID of the newly inserted user
    res.status(201).json({ 
      success: true,
      userId: result.insertId,
      message: 'User created successfully' 
    });
  } catch (error) {
    console.error('Error inserting user:', error);
    res.status(500).json({ error: 'Database error' });
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

    // Insert a row in the games table
    const sql = `
      INSERT INTO games (white_player_id, black_player_id, winner_id)
      VALUES (?, ?, ?)
    `;
    const [result] = await pool.query(sql, [white_player_id, black_player_id, winner_id]);

    // Return the new game's ID
    res.status(201).json({
      success: true,
      gameId: result.insertId,
      message: 'New game created successfully.'
    });
  } catch (error) {
    console.error('Error creating new game:', error);
    res.status(500).json({ error: 'Database error' });
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

        // Basic validation (optional, or expand as needed)
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

      res.status(201).json({
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
    res.status(500).json({ error: 'Database error' });
  }
});

app.listen(3001, () => {
  console.log("Server is running on port 3001!");
});