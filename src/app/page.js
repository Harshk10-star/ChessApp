"use client";
import React from 'react';
import Link from 'next/link'; // 2) Import from next/link
import {useState,useEffect } from 'react';
import axios from 'axios';
import './App.css';
import Board from './components/Board';
import check from './components/Check';
import pawnValid from './components/PawnValid';
import rookValid from './components/RookValid';
import knightValid from './components/KnightValid';
import kingValid from './components/KingValid';
import bishopValid from './components/BishopValid';
import queenValid from './components/QueenValid';
import PromotionPawn from './components/PromotionPawn';
import checkMate from './components/CheckMate';
import fetchGames from './components/fetchGames';

// tile sets piece to null before usEffect Is DONE
// pieceCheck is updated to0 late it needs to happen before checkmate is called
function Main() {
  const [promotion, setPromotion] = useState(true);
  


  const [moves,setMoveArr] = useState([]);
  const [selected, setSelected] = useState(false);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [turn, setTurn] = useState("white");
  const [kingPos,setKingPos] = useState([7,4]);
  const [whiteKing, setWhiteKing] = useState([7, 4]);
  const [blackKing, setBlackKing] = useState([0, 4]);
  const [checkKing,setCheck]= useState(false);
  const[pieceCheck,setPieceCheck] =useState({});
  const[isCheckMate,setCheckMate] = useState(true);
  const[moveWhiteKing,setWhiteMove] = useState(false);
  const[moveBlackKing,setBlackMove] = useState(false);
  const[whiteCastle,setWhiteCastle] = useState(false);
  const [blackCastle,setBlackCastle] = useState(false);

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
  if(!moveBlackKing) setBlackMove(true);
  setBlackKing([x, y]);
};
const updateWhiteKingPos = (x, y) => {
  console.log("updateWHite");
  if(!moveWhiteKing) setWhiteKing(true);
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
    console.log(isCheckMate);
    if(isCheckMate == false){
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
    console.log(p);
    if(p == "queen" && queenValid(positions,x,y,turn,selectedPiece,kingPos,setKingPos,whiteKing,blackKing,setPieceCheck,updateBlackKingPos,updateWhiteKingPos)){
      setting(piece,x,y,null);
    }else if(p === "rook"&& rookValid(positions,x,y,turn,selectedPiece,kingPos,setKingPos,whiteKing,blackKing,setPieceCheck,updateBlackKingPos,updateWhiteKingPos)){
      setting(piece,x,y,null);
    }else if(p === "bishop"&& bishopValid(positions,x,y,turn,selectedPiece,kingPos,setKingPos,whiteKing,blackKing,setPieceCheck,updateBlackKingPos,updateWhiteKingPos)){
      setting(piece,x,y,null);
    }else if(p === "knight"&& knightValid(positions,x,y,turn,selectedPiece,kingPos,setKingPos,whiteKing,blackKing,setPieceCheck,updateBlackKingPos,updateWhiteKingPos)){
      console.log("IN KING SETMOVES");
      setting(piece,x,y,null);
    }else if(p==="king"){
      
      if(piece === "wking" && selectedPiece.x == 7 && selectedPiece.y == 4 && x == 7 && y == 6 && positions[7][6] == null && positions[7][7] === "wrook"){
        updateWhiteKingPos(x,y);
        setting(piece,x,y,"right");
        return;
      }else if(piece === "wking" && selectedPiece.x == 7 && selectedPiece.y == 4 && x == 7 && y == 2 && positions[7][2] == null && positions[7][0] === "wrook"){
        console.log("in caslte white left");
        updateWhiteKingPos(x,y);
        setting(piece,x,y,"left");
        return;
      }

      if(piece === "bking" && selectedPiece.x == 0 && selectedPiece.y == 4 && x == 0 && y == 6 && positions[0][6] == null && positions[0][7] === "brook"){
        updateBlackKingPos(x,y);
        setting(piece,x,y,"right");
        return;
      }else if(piece === "bking" && selectedPiece.x == 0 && selectedPiece.y == 4 && x == 0 && y == 2 && positions[0][2] == null && positions[0][0] === "brook"){
        updateBlackKingPos(x,y);
        setting(piece,x,y,"left");
        return;
      }
      
      const valPromise = kingValid(positions, x, y, turn, selectedPiece, kingPos, setKingPos, whiteKing, blackKing, setPieceCheck, updateBlackKingPos, updateWhiteKingPos, false, setWhiteCastle, setBlackCastle);
      console.log(valPromise);
      valPromise.then(val => {
          if(val == true){
            console.log("here");
            setting(piece,x,y,"dw");
          }
      });
      
    }else{
      if(p === "pawn"){
        let ans =  "pawn"&& pawnValid(positions,x,y,turn,selectedPiece,kingPos,setKingPos,whiteKing,blackKing,setPieceCheck,updateBlackKingPos,updateWhiteKingPos);
        if(ans.res == true){
          setting(ans.piece,x,y,null);
        }
      }
    }

  }
  async function setting(piece,x,y,checkC){

    if(piece === "wking" && (checkC === "left" || checkC === "right")){
      if(checkC === "right"){
        setPositions( prevPositions => {
          const newPositions = [...prevPositions];
          newPositions[x][y] = piece;
          newPositions[selectedPiece.x][selectedPiece.y] = null;
          newPositions[7][5] = "wrook";
          newPositions[7][7] = null;
          return newPositions;
        });
      }else if(checkC === "left"){
        setPositions( prevPositions => {
          const newPositions = [...prevPositions];
          newPositions[x][y] = piece;
          newPositions[selectedPiece.x][selectedPiece.y] = null;
          newPositions[7][3] = "wrook";
          newPositions[7][0] = null;
          return newPositions;
        });
        
      }

    
    }else if(piece === "bking" && (checkC === "left" || checkC === "right")){
      
      if(checkC === "right"){
        setPositions( prevPositions => {
          const newPositions = [...prevPositions];
          newPositions[x][y] = piece;
          newPositions[selectedPiece.x][selectedPiece.y] = null;
          newPositions[0][5] = "brook";
          newPositions[0][7] = null;
          return newPositions;
        });
      }else if(checkC === "left"){
        setPositions( prevPositions => {
          const newPositions = [...prevPositions];
          newPositions[x][y] = piece;
          newPositions[selectedPiece.x][selectedPiece.y] = null;
          newPositions[0][3] = "brook";
          newPositions[0][0] = null;
          return newPositions;
        });
      }


    }else{
      setPositions( prevPositions => {
        const newPositions = [...prevPositions];
        newPositions[x][y] = piece;
        newPositions[selectedPiece.x][selectedPiece.y] = null;
        return newPositions;
      });
    }
      if(piece === "bking" && (checkC === "left" || checkC === "right")){
        if (checkC === "left"){
          moves.push({beforeX:selectedPiece.x,beforeY:selectedPiece.y,piece:piece,x:10,y:12})

        }else{
          moves.push({beforeX:selectedPiece.x,beforeY:selectedPiece.y,piece:piece,x:10,y:16})
        }
      }else if(piece === "wking" && (checkC === "left" || checkC === "right")){
        if (checkC === "left"){
          moves.push({beforeX:selectedPiece.x,beforeY:selectedPiece.y,piece:piece,x:17,y:12})

        }else{
          moves.push({beforeX:selectedPiece.x,beforeY:selectedPiece.y,piece:piece,x:17,y:16})
        }
      }else{
        moves.push({beforeX:selectedPiece.x,beforeY:selectedPiece.y,piece:piece,x:x,y:y})

      } 
      setMoveArr(moves);  
    
   
    setTurn(("white" === turn) ? "black" : "white");
    }
    /*
     <PromotionPawn onPieceSelected={(piece) => {
        setSelectedPiece({ ...selectedPiece, piece });
          setPromotion(false);
        }} />
    
    
    <div className='prom'>
    {promotion && (
             <PromotionPawn onPieceSelected={(piece) => {
              setSelectedPiece({ ...selectedPiece, piece });
                setPromotion(false);
              }} />
      )}
    </div>
        */
  
  return (
    <>
    <div id='app'>
 

 <Board blackKing={blackKing} whiteKing={whiteKing} setKingPos={setKingPos} updatePositions={updatePositions} positions={positions} setPositions={setPositions} selected={selected} setSelected={setSelected} setSelectedPiece={setSelectedPiece} selectedPiece={selectedPiece}/>
 <button id='reset' onClick={reset}>Reset</button>
 <button id='save' onClick={saveBoard}>Save</button>
 <Link href="http://localhost:3001/games">
          Get Games
        </Link>
</div>
    
    </>
  );
  
}

export default Main;
