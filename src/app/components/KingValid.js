import check from "./Check";
async function kingValid(arr,x,y,turn,selectedPiece,kingPos,setKingPos,whiteKing,blackKing,setPieceCheck,updateBlackKingPos,updateWhiteKingPos,checkM,setWhiteCastle,setBlackCastle){
  console.log("lol");
  console.log(selectedPiece,x,y);
  if(checkM===false && selectedPiece && arr[selectedPiece.x][selectedPiece.y] === null) return false; 
  if( checkM===false && selectedPiece && arr[x][y]!=null && arr[selectedPiece.x][selectedPiece.y].charAt(0) === arr[x][y].charAt(0)) return false;
  if(checkM==true && arr[x][y]!=null && arr[kingPos[0]][kingPos[1]].charAt(0) === arr[x][y].charAt(0)) return false;
    let diffX;
    let diffY;
    if(checkM == true){
      diffX=Math.abs(kingPos[0] - x);
      diffY= Math.abs(kingPos[1] - y);

    }else{
      diffX= Math.abs(selectedPiece.x - x);
      diffY= Math.abs(selectedPiece.y - y);
    }
    
    const newPositions = JSON.parse(JSON.stringify(arr));
    console.log(kingPos);
    // Temporarily make the move
    let isCheck;
    if(checkM== true){
      newPositions[x][y] = newPositions[kingPos[0]][kingPos[1]];
      newPositions[kingPos[0]][kingPos[1]] = null;
  
    }else{
      newPositions[x][y] = newPositions[selectedPiece.x][selectedPiece.y];
      newPositions[selectedPiece.x][selectedPiece.y] = null;
  
    }
    isCheck= (turn ==="white")? check(turn, kingPos, newPositions, setKingPos, [x,y], blackKing,setPieceCheck,updateBlackKingPos,updateWhiteKingPos,selectedPiece,true): check(turn, kingPos, newPositions, setKingPos, whiteKing, [x,y],setPieceCheck,updateBlackKingPos,updateWhiteKingPos,selectedPiece,true);
    console.log(isCheck,diffX,diffY);
    if(diffX == 1 || diffY == 1){
      if(checkM === false){
        if(selectedPiece.piece === "wking"){
          console.log("update? 1");
          updateWhiteKingPos(x,y);
        }else{
          console.log("update? 2");
          updateBlackKingPos(x,y);
        }
    }
      
      return true && !isCheck.check;
    }
    return false;
  }

  export default kingValid;