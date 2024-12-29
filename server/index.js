const express= require('express')
const mongoose= require('mongoose')
const ejs= require('ejs');
const cors=require("cors");
var bodyParser = require('body-parser')
const app= express()
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(express.static('public'));
mongoose.set('strictQuery', true);
mongoose.connect('mongodb://127.0.0.1:27017/Chess');
app.use(cors());
app.use(express.json());

app.use(bodyParser.urlencoded({extended: true}));

const chessPieceSchema = new mongoose.Schema({
    movesP : [
      {
        beforeX: Number,
        beforeY: Number,
        piece: String,
        x: Number,
        y: Number
      }
    ]  
  });
const ChessPiece = mongoose.model('chessGame', chessPieceSchema);
app.post('/', (req,res)=>{
    const move = new ChessPiece({movesP:req.body.moves});
    console.log(req.body.moves);
    move.save();

})

app.get('/games',(req,res)=>{
  ChessPiece.find({},(err,games)=>{
    console.log(games);
    if(err){
      console.error(err);
      res.status(500).send('Error retrieving games');
    }else{
      res.render('games',{games:games});
    }
  })
})












app.listen(3001,() =>{
    console.log("Server is running!");
})