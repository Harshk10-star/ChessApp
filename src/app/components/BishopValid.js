import check from "./Check";
function bishopValid(arr,x,y,turn,selectedPiece,kingPos,setKingPos,whiteKing,blackKing,setPieceCheck,updateBlackKingPos,updateWhiteKingPos){
    if(arr[x][y]!=null && arr[selectedPiece.x][selectedPiece.y].charAt(0) === arr[x][y].charAt(0)) return false; 
    const xDiff = Math.abs(x - selectedPiece.x);
    const yDiff = Math.abs(y - selectedPiece.y);

    if (xDiff !== yDiff) {
      return false;
    }

    const xDirection = x > selectedPiece.x ? 1 : -1;
    const yDirection = y > selectedPiece.y ? 1 : -1;

    for (let i = 1; i < xDiff; i++) {
      const nextX = selectedPiece.x + i * xDirection;
      const nextY = selectedPiece.y + i * yDirection;

      if (arr[nextX][nextY] !== null) {
        return false;
      }
    }
    const newPositions = JSON.parse(JSON.stringify(arr));
  
    // Temporarily make the move
    newPositions[x][y] = newPositions[selectedPiece.x][selectedPiece.y];
    newPositions[selectedPiece.x][selectedPiece.y] = null;
    const isCheck=check(turn,kingPos,newPositions,setKingPos,whiteKing,blackKing,setPieceCheck,updateBlackKingPos,updateWhiteKingPos,selectedPiece,true);
    return true && !isCheck.check;
  }

  export default bishopValid;