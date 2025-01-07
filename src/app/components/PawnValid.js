import check from "./Check";
function pawnValid(arr,x,y,turn,selectedPiece,kingPos,setKingPos,whiteKing,blackKing,setPieceCheck,updateBlackKingPos,updateWhiteKingPos){
  const newPositions = JSON.parse(JSON.stringify(arr));

  // Temporarily make the move
  newPositions[x][y] = newPositions[selectedPiece.x][selectedPiece.y];
  newPositions[selectedPiece.x][selectedPiece.y] = null;
  const isCheck=check(turn,kingPos,newPositions,setKingPos,whiteKing,blackKing,setPieceCheck,updateBlackKingPos,updateWhiteKingPos,selectedPiece,true);
  
  
  if(selectedPiece.piece.charAt(0) === 'w'){
    if(selectedPiece.x == 0){
      const newPiece = prompt("Choose a new piece to promote your pawn to: queen, rook, bishop, or knight.");
      return {res: true && !isCheck.check,piece:"wprompt"}
    }
    // Temporarily make the move
  
    if(arr[x][y]!= null && arr[x][y].charAt(0) == 'w') return false;
    if(selectedPiece.x === 6){
      if((x === 4 || x === 5) && selectedPiece.y === y){
        if(arr[x][y] === null){
          return {res: true && !isCheck.check,piece:selectedPiece.piece}
        }
      }
    }else{
      if(x === selectedPiece.x - 1 && selectedPiece.y === y){
        if(arr[x][y] === null){
          return {res: true && !isCheck.check,piece:selectedPiece.piece};
        }
      }
    }
    if(arr[x][y] !== null && selectedPiece.x == x+1 && (selectedPiece.y-1 === y || selectedPiece.y+1 === y)){
      return {res: true && !isCheck.check,piece:selectedPiece.piece};
    }
  }else{
    if(arr[x][y]!= null && arr[x][y].charAt(0) == 'b') return false;
    if(selectedPiece.x === 1){
      if((x === 2 || x === 3) && selectedPiece.y == y){
        if(arr[x][y] === null){
          return {res: true && !isCheck.check,piece:selectedPiece.piece};
        }
      }
    }else{
      if(x === selectedPiece.x + 1 && selectedPiece.y == y){
        if(arr[x][y] === null){
          return {res: true && !isCheck.check,piece:selectedPiece.piece};
        }
      }
    }
    if(arr[x][y] != null && selectedPiece.x == x-1 && (selectedPiece.y-1 == y || selectedPiece.y+1 == y)){
      return {res: true && !isCheck.check,piece:selectedPiece.piece};
    }
  }
  return {res: false && !isCheck.check,piece:selectedPiece.piece};
}

export default pawnValid;