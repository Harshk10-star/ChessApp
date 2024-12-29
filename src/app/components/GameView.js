import React from 'react';
import {useState,useEffect } from 'react';
import '../App.css';
import Board from './Board';


import { useLocation } from 'react-router-dom';
function GameView(){
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
  const [selected, setSelected] = useState(false);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [turn, setTurn] = useState("white");
  const [kingPos,setKingPos] = useState([7,4]);
  const [whiteKing, setWhiteKing] = useState([7, 4]);
  const [blackKing, setBlackKing] = useState([0, 4]);
  const [checkKing,setCheck]= useState(false);
  const[pieceCheck,setPieceCheck] =useState({});
  const[checkz,setCheckMate] = useState(true);  
  const [point,changePoint] = useState(0);
  const [stack,changeStack] = useState([])
  const location = useLocation();

  const moves = JSON.parse(decodeURIComponent(new URLSearchParams(location.search).get('moves')));

  function backward(){
      if(stack.length == 0) return;
      const temp = stack.pop();
      changeStack(stack);
      if(temp.x >=10){
        let xL = temp.x % 10;
        let yL = temp.y % 10;

        if(temp.piece === "wking"){
          if(yL == 2){
            setPositions( prevPositions => {
              const newPositions = [...prevPositions];
              newPositions[xL][yL] = null;
              newPositions[temp.beforeX][temp.beforeY] = temp.piece;
              newPositions[7][3] = null;
              newPositions[7][0] = "wrook";
              return newPositions;
            });
          }else{
            setPositions( prevPositions => {
              const newPositions = [...prevPositions];
              newPositions[xL][yL] = null;
              newPositions[temp.beforeX][temp.beforeY] = temp.piece;
              newPositions[7][5] = null;
              newPositions[7][7] = "wrook";
              return newPositions;
            });
          }
        }else{
          if(yL == 2){
            setPositions( prevPositions => {
              const newPositions = [...prevPositions];
              newPositions[xL][yL] = null;
              newPositions[temp.beforeX][temp.beforeY] = temp.piece;
              newPositions[0][3] = null;
              newPositions[0][0] = "brook";
              return newPositions;
            });
          }else{
            setPositions( prevPositions => {
              const newPositions = [...prevPositions];
              newPositions[xL][yL] = null;
              newPositions[temp.beforeX][temp.beforeY] = temp.piece;
              newPositions[0][5] = null;
              newPositions[0][7] = "brook";
              return newPositions;
            });
          }
          
        }
      }else{
      setPositions( prevPositions => {
        const newPositions = [...prevPositions];
        newPositions[temp.beforeX][temp.beforeY] = temp.piece;
        newPositions[temp.x][temp.y] = null;
        return newPositions;
      });
    }
      changePoint(point-1);

    }

    function forward(){
        if(point >= moves.length) return;
        stack.push(moves[point]);
        changeStack(stack);
        if(moves[point].x >=10){
          let xL = moves[point].x % 10;
          let yL = moves[point].y % 10;

          if(moves[point].piece === "wking"){
            if(yL == 2){
              setPositions( prevPositions => {
                const newPositions = [...prevPositions];
                newPositions[xL][yL] = moves[point].piece;
                newPositions[moves[point].beforeX][moves[point].beforeY] = null;
                newPositions[7][3] = "wrook";
                newPositions[7][0] = null;
                return newPositions;
              });
            }else{
              setPositions( prevPositions => {
                const newPositions = [...prevPositions];
                newPositions[xL][yL] = moves[point].piece;
                newPositions[moves[point].beforeX][moves[point].beforeY] = null;
                newPositions[7][5] = "wrook";
                newPositions[7][7] = null;
                return newPositions;
              });
            }
          }else{
            if(yL == 2){
              setPositions( prevPositions => {
                const newPositions = [...prevPositions];
                newPositions[xL][yL] = moves[point].piece;
                newPositions[moves[point].beforeX][moves[point].beforeY] = null;
                newPositions[0][3] = "brook";
                newPositions[0][0] = null;
                return newPositions;
              });
            }else{
              setPositions( prevPositions => {
                const newPositions = [...prevPositions];
                newPositions[xL][yL] = moves[point].piece;
                newPositions[moves[point].beforeX][moves[point].beforeY] = null;
                newPositions[0][5] = "brook";
                newPositions[0][7] = null;
                return newPositions;
              });
            }
            
          }
        }else{
          setPositions( prevPositions => {
            const newPositions = [...prevPositions];
            newPositions[moves[point].x][moves[point].y] = moves[point].piece;
            newPositions[moves[point].beforeX][moves[point].beforeY] = null;
            return newPositions;
          });
        }
        

        changePoint(point+1);
    }
    function updatePositions(){

    }


      return (
  
        <div id='app'>
          <Board updatePositions={updatePositions}  blackKing={blackKing} whiteKing={whiteKing} setKingPos={setKingPos}  positions={positions} setPositions={setPositions} selected={selected} setSelected={setSelected} setSelectedPiece={setSelectedPiece} selectedPiece={selectedPiece}/>
          <button id='reset' onClick={forward}>forward</button>
          <button id='save' onClick={backward}>backward</button>
        </div>
      );
}


export default GameView;