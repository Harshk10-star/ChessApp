import check from "./Check";
function knightValid(arr,x,y,turn,selectedPiece,kingPos,setKingPos,whiteKing,blackKing,setPieceCheck,updateBlackKingPos,updateWhiteKingPos){
    if (x < 0 || y > 7 || x < 0 || y > 7) {
      return false;
    }
  
    const xDiff = Math.abs(selectedPiece.x - x);
    const yDiff = Math.abs(selectedPiece.y - y);
    if(!((xDiff === 2 && yDiff === 1) || (xDiff === 1 && yDiff === 2))) {
      console.log("if 1")
      return false;
    }
    if (arr[x][y] && arr[selectedPiece.x][selectedPiece.y].charAt(0) === arr[x][y].charAt(0)) {
      console.log("if 2")
      return false
    }
    
    const newPositions = JSON.parse(JSON.stringify(arr));
  
    // Temporarily make the move
    newPositions[x][y] = newPositions[selectedPiece.x][selectedPiece.y];
    newPositions[selectedPiece.x][selectedPiece.y] = null;
    const isCheck=check(turn,kingPos,newPositions,() => {});
    return !isCheck.check;    
  }

  export default knightValid;