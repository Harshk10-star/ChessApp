import React, {useState} from "react";
import "./tile.css";
import Image from 'next/image';
function Tile({ piece, x, y, updatePositions,selected,setSelected,selectedPiece,setSelectedPiece}) {

 

  async function  handleClick() {
    console.log(selectedPiece);
    if (selectedPiece) {
      await updatePositions(selectedPiece.piece, x, y);
      setSelectedPiece(null);
        setSelected(false);
    } else if (piece) {
      setSelectedPiece({ piece, x, y });
      setSelected(true);
    }
  }
  let tile;
  if((x+y+2) % 2 === 0){
    tile="white-tile";
  }else{
    tile="black-tile";
  }
  
  return (
    <div id={tile} key={`${x}-${y}`}onClick={handleClick}>
      
    {piece ? <Image src={require(`../images/${piece}.png`)} alt="bqueen" width={50} height={50} />: null}
  </div>
  );
}

export default Tile;
