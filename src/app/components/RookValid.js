import check from "./Check";

function rookValid(arr,x,y,turn,selectedPiece,kingPos,setKingPos,whiteKing,blackKing,setPieceCheck,updateBlackKingPos,updateWhiteKingPos){
  
    if(arr[x][y]!=null && arr[selectedPiece.x][selectedPiece.y].charAt(0) === arr[x][y].charAt(0)) return false; 
    if(selectedPiece.x === x || selectedPiece.y ===y){

          if(selectedPiece.x === x){

            const distanceMaxY = Math.max(selectedPiece.y,y);
            const distanceMinY= Math.min(selectedPiece.y,y);
            for(let i=distanceMinY +1 ; i<distanceMaxY;i++){
              if(arr[selectedPiece.x][i]!=null){
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
          
          if(selectedPiece.y === y){

            const distanceMaxX= Math.max(selectedPiece.x,x);
            const distanceMinX = Math.min(selectedPiece.x,x);

            for(let i = distanceMinX+1;i<distanceMaxX;i++){
              if(arr[i][selectedPiece.y]!=null){
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
      }
      return false;
  }
export default rookValid;