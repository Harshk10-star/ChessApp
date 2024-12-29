import { useState,useEffect } from 'react';
import axios from 'axios';
import '../App.css'
import Board from './components/Board';
import check from './components/Check';
import pawnValid from './components/PawnValid';
import rookValid from './components/RookValid';
import knightValid from './components/KnightValid';
import kingValid from './components/KingValid';
import bishopValid from './components/BishopValid';
import queenValid from './components/QueenValid';
import checkMate from './components/CheckMate';

// tile sets piece to null before usEffect Is DONE
// pieceCheck is updated to0 late it needs to happen before checkmate is called
function App() {

  const [moves,setMoveArr] = useState([]);
  const [selected, setSelected] = useState(false);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [turn, setTurn] = useState("white");
  const [kingPos,setKingPos] = useState([7,4]);
  const [whiteKing, setWhiteKing] = useState([7, 4]);
  const [blackKing, setBlackKing] = useState([0, 4]);
  const [checkKing,setCheck]= useState(false);
  const[pieceCheck,setPieceCheck] =useState({});
  const[checkz,setCheckMate] = useState(true);

  async function saveBoard() {
    const url = 'http://localhost:3001/';
    
    try {
      const response = await axios.post(url, { moves }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
    
      console.log(response);
    } catch (error) {
      console.error(error);
    }
  }
  
  
const updateBlackKingPos = (x, y) => {
  console.log("udtateBVlack");
  setBlackKing([x, y]);
};
const updateWhiteKingPos = (x, y) => {
  console.log("updateWHite");
  setWhiteKing([x, y]);
};
  
  const [positions, setPositions] = useState([
    ["brook", "bknight", "bbishop", "bqueen", "bking", "bbishop", "bknight", "brook"],
    ["bpawn", "bpawn", "bpawn", "bpawn", "bpawn", "bpawn", "bpawn", "bpawn"],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    ["wpawn", "wpawn", "wpawn", "wpawn", "wpawn", "wpawn", "wpawn", "wpawn"],
    ["wrook", "wknight", "wbishop", "wqueen", "wking", "wbishop", "wknight", "wrook"]
  ]);
  //checkmate not working good job
  function reset(){
    setPositions([
      ["brook", "bknight", "bbishop", "bqueen", "bking", "bbishop", "bknight", "brook"],
      ["bpawn", "bpawn", "bpawn", "bpawn", "bpawn", "bpawn", "bpawn", "bpawn"],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      ["wpawn", "wpawn", "wpawn", "wpawn", "wpawn", "wpawn", "wpawn", "wpawn"],
      ["wrook", "wknight", "wbishop", "wqueen", "wking", "wbishop", "wknight", "wrook"]
    ]);
    setSelected(false);
    setSelectedPiece(null);
    setTurn("white");
    setKingPos([7,4]);
    setWhiteKing([7, 4]);
    setBlackKing([0, 4]);
    setCheck(false);
    setPieceCheck({});
    setCheckMate(true);
    setMoveArr([]);
  }


  useEffect(() => {
    console.log(pieceCheck);
    const checks=  check(turn, kingPos, positions, setKingPos,whiteKing,blackKing,setPieceCheck,updateBlackKingPos,updateWhiteKingPos,selectedPiece,false);
  
    setCheck(checks.check);
    setCheckMate(checks.checkMate);
    console.log(checks.checkMate);
 
  }, [turn]);
/*
  useEffect(() => {
    console.log(checkKing);
    if (checkKing) {
      const isCheckmate = checkMate(turn, kingPos, pieceCheck, positions, setKingPos, setPieceCheck, updateBlackKingPos, updateWhiteKingPos, selectedPiece, whiteKing, blackKing);
      setCheckMate(isCheckmate);
      console.log(isCheckmate);
      setSelectedPiece(null);
    }

  }, [checkKing]);
  */
  function  updatePositions(piece,x,y){
 
    if(checkz=== false){
      console.log("over checkmate! lmao");
      return;
    }
    const t = piece.substring(0,1);
    if(turn == "white" && t=== "b"){
      return false;
    }else if( turn ==="black" && t==="w"){
      return false;
    }
   
    const p= selectedPiece.piece.substring(1,selectedPiece.piece.length);

    setMoves(p,x,y,piece);

  }
  function setMoves(p,x,y,piece){

    if(p == "queen" && queenValid(positions,x,y,turn,selectedPiece,kingPos,setKingPos,whiteKing,blackKing,setPieceCheck,updateBlackKingPos,updateWhiteKingPos)){
      setting(piece,x,y);
    }else if(p === "rook"&& rookValid(positions,x,y,turn,selectedPiece,kingPos,setKingPos,whiteKing,blackKing,setPieceCheck,updateBlackKingPos,updateWhiteKingPos)){
      setting(piece,x,y);
    }else if(p === "bishop"&& bishopValid(positions,x,y,turn,selectedPiece,kingPos,setKingPos,whiteKing,blackKing,setPieceCheck,updateBlackKingPos,updateWhiteKingPos)){
      setting(piece,x,y);
    }else if(p === "knight"&& knightValid(positions,x,y,turn,selectedPiece,kingPos,setKingPos,whiteKing,blackKing,setPieceCheck,updateBlackKingPos,updateWhiteKingPos)){
      console.log("IN KING SETMOVES");
      setting(piece,x,y);
    }else if(p === "pawn"&& pawnValid(positions,x,y,turn,selectedPiece,kingPos,setKingPos,whiteKing,blackKing,setPieceCheck,updateBlackKingPos,updateWhiteKingPos)){
      setting(piece,x,y);
    }else if(p==="king" && kingValid(positions,x,y,turn,selectedPiece,kingPos,setKingPos,whiteKing,blackKing,setPieceCheck,updateBlackKingPos,updateWhiteKingPos,false)){
      console.log("IN KING SETMOVES");
      setting(piece,x,y);
    }

  }
  async function setting(piece,x,y){
 
     setPositions( prevPositions => {
      const newPositions = [...prevPositions];
      newPositions[x][y] = piece;
      newPositions[selectedPiece.x][selectedPiece.y] = null;
      return newPositions;
    });
    moves.push({piece:piece,x:x,y:y})
    setMoveArr(moves);    
    setTurn(("white" === turn) ? "black" : "white");

  }
  return (
    <div>
    <div id='app'>
      <Board blackKing={blackKing} whiteKing={whiteKing} setKingPos={setKingPos} updatePositions={updatePositions} positions={positions} setPositions={setPositions} selected={selected} setSelected={setSelected} setSelectedPiece={setSelectedPiece} selectedPiece={selectedPiece}/>
      <button id='reset' onClick={reset}>Reset</button>
      <button id='save' onClick={saveBoard}>Save</button>
    </div>
    
    </div>
     
  );
  
}

export default App;
