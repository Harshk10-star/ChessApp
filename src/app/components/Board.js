import React, { useState } from "react";
import Tile from "./Tile";
import "./board.css"

function Board({positions,setPositions,updatePositions,selected,setSelected,selectedPiece,setSelectedPiece}) {

   

  return (
    <div id="board">
      {positions.map((row, i) =>
        row.map((piece, j) => (
          <Tile
            key={`${i}-${j}`}
            piece={piece}
            x={i}
            y={j}
            updatePositions={updatePositions}
            setPositions={setPositions} 
            selected={selected} 
            setSelected={setSelected} 
            setSelectedPiece={setSelectedPiece} 
            selectedPiece={selectedPiece}
  
          />
        ))
      )}
    </div>
  );
}

export default Board;
