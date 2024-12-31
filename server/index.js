const express= require('express');
const ejs= require('ejs');
const cors= require("cors");
const bcrypt = require('bcrypt');
var bodyParser = require('body-parser');
const app= express();

const pool = require('./db.js');

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));

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
const server = http.createServer(app);

const { Server } = require('socket.io');
const io = new Server(server, {
  cors: { origin: '*' }
});


io.on("connection", (socket)=>{

  socket.on('joinRoom', (gameId)=> {
    socket.join(gameId);
  })

})

server.listen(3001, () => {
  console.log('Server is running (Express + Socket.io) on port 3001');
});
