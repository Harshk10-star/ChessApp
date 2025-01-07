import check from "./Check";
import bishopValid from "./BishopValid";
import rookValid from "./RookValid";

function queenValid(arr,x,y,turn,selectedPiece,kingPos,setKingPos,whiteKing,blackKing,setPieceCheck,updateBlackKingPos,updateWhiteKingPos){
    return bishopValid(arr,x,y,turn,selectedPiece,kingPos,setKingPos,whiteKing,blackKing,setPieceCheck,updateBlackKingPos,updateWhiteKingPos) || rookValid(arr,x,y,turn,selectedPiece,kingPos,setKingPos,whiteKing,blackKing,setPieceCheck,updateBlackKingPos,updateWhiteKingPos);
  }

  export default queenValid;