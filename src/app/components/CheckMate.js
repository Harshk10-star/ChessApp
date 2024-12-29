import kingValid from "./KingValid";
import knightValid from "./KnightValid";
import pawnValid from "./PawnValid";
import queenValid from "./QueenValid";
import rookValid from "./RookValid";
import bishopValid from "./BishopValid";
function checkMate(color,kingPos,pieceCheck,positions,setKingPos,setPieceCheck,updateBlackKingPos,updateWhiteKingPos,selectedPiece,whiteKing,blackKing,setWhiteCastle,setBlackCastle){
    //gather all pieces of your color
    //have to someone how get pieceCheck
    console.log(pieceCheck);
    let enemyColor;
    let meColor;
    if (color === "white") {
      setKingPos([...whiteKing]);
      kingPos=whiteKing;
      enemyColor = "b";
      meColor='w';
    } else {
      setKingPos([...blackKing]);
      kingPos=blackKing;
      enemyColor = "w";
      meColor='b';
    }
  const pieceMoves = [];
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      if (positions[i][j] && positions[i][j].charAt(0) === meColor) { //should w or b not white or black
        pieceMoves.push({ x: i, y: j, piece: positions[i][j] });
      }
    }
  }
    
  //king moves 8 of them

console.log(pieceMoves);
  
  let dx = [-1, -1, -1, 0, 0, 1, 1, 1];//king steps x
  let dy = [-1, 0, 1, -1, 1, -1, 0, 1]; //king steps y
  for(let i=0;i<dx.length;i++){
    console.log(kingPos);
    let newX = kingPos[0] + dx[i];
    let newY = kingPos[1] + dy[i];
    if(newX >= 0 && newX < 8 && newY >= 0 && newY < 8){
        const v=kingValid(positions,newX,newY,color,selectedPiece,kingPos,setKingPos,whiteKing,blackKing,setPieceCheck,updateBlackKingPos,updateWhiteKingPos,true,setWhiteCastle,setBlackCastle);
        const r = v.then((value)=>{
          console.log("gayda")
          if(value == true) {
            return true;
          } else {
            return false;
          }
        })
        console.log(r);
        console.log("this is r")
    }
  }
    //captures
  
    for(let i=0;i<pieceMoves.length;i++){
    let p = pieceMoves[i].piece.substring(1,pieceMoves[i].piece.length);
    let isValid=false;
  
  
    
     if(p == "queen" && captureWithQueen(pieceCheck,pieceMoves[i],positions) === true){
        isValid=true;
      }else if(p === "rook"&& captureWithRook(pieceCheck,pieceMoves[i],positions) === true){
        isValid=true;
      }else if(p === "bishop"&& captureWithBishop(pieceCheck,pieceMoves[i],positions) === true){
        isValid=true;
      }else if(p === "knight"&& captureWithKight(pieceCheck,pieceMoves[i],positions) === true){
        isValid=true;
      }else if(p === "pawn"&& captureWithPawn(pieceCheck,pieceMoves[i],positions) === true){
        isValid=true;
      }
      
      if(isValid === true){
        console.log("can hosie");
        return true;
      }
    
    }
    
    //blocks
    
    for(let i=0;i<pieceMoves.length;i++){
        if (inBetween(pieceCheck,kingPos,pieceMoves[i],positions,color,whiteKing,blackKing,setPieceCheck,updateBlackKingPos,updateWhiteKingPos)) {
          // Return true if the friendly piece can block the attack
          console.log(pieceMoves[i]);
          return true;
        }
    }
        


    console.log("checkmate");

    return false;
 }

function captureWithRook(pieceCheck,rook,positions){
    //check if rook is in line of sight of checking piece
    if(pieceCheck.x !== rook.x && rook.y !== pieceCheck.y) return false;




    if(pieceCheck.x === rook.x){
        const minY=Math.min(pieceCheck.y,rook.y);
        const maxY=Math.max(pieceCheck.y,rook.y);
        for(let i=minY+1; i<maxY+1 ;i++){
            if(positions[rook.x][i] === null){
                continue;
            }
            if(positions[rook.x][i] === positions[pieceCheck.x][pieceCheck.y]){
                return true;
            }else{
                return false;
            }
        }
    }else{
        const minX=Math.min(pieceCheck.x,rook.x);
        const maxX=Math.max(pieceCheck.x,rook.x);
        for(let i=minX+1; i<maxX+1 ;i++){
            if(positions[i][rook.y] === null){
                continue;
            }
            if(positions[i][rook.y] === positions[pieceCheck.x][pieceCheck.y]){ 
                return true;
            }else{
                return false;
            }
        }
    }
  
    return false;
    
  }


function captureWithBishop(pieceCheck, bishop, positions) {
    // Check if bishop is on diagonal with checking piece
    if (Math.abs(bishop.x - pieceCheck.x) !== Math.abs(bishop.y - pieceCheck.y)) {
        return false;
    }

    let x = bishop.x;
    let y = bishop.y;
    let xIncrement = (pieceCheck.x - bishop.x) / Math.abs(pieceCheck.x - bishop.x);
    let yIncrement = (pieceCheck.y - bishop.y) / Math.abs(pieceCheck.y - bishop.y);

    while (x !== pieceCheck.x && y !== pieceCheck.y) {
        x += xIncrement;
        y += yIncrement;

        if (positions[x][y] === null) {
            continue;
        }
        if (positions[x][y] === positions[pieceCheck.x][pieceCheck.y]) {
            return true;
        } else {
            return false;
        }
    }

    return false;
}

function captureWithPawn(pieceCheck,pawn,turn){
    let direction=1;
    if(turn==='black'){
        direction=-1;
    }
    const xDiff = pieceCheck.x - pawn.x;
    const yDiff = pieceCheck.y - pawn.y;
    if(xDiff === direction && Math.abs(yDiff) === 1){
        return true;
    }
    return false;
}

function captureWithQueen(pieceCheck, queen, positions){
    return captureWithBishop(pieceCheck, queen, positions) || captureWithRook(pieceCheck,queen,positions);
}

function captureWithKight(pieceCheck, horse, positions) {
    const horseMoves = [    [2, 1],
      [2, -1],
      [-2, 1],
      [-2, -1],
      [1, 2],
      [1, -2],
      [-1, 2],
      [-1, -2],
    ];
  
    for (const move of horseMoves) {
      const newX = horse.x + move[0];
      const newY = horse.y + move[1];
      if (newX === pieceCheck.x && newY === pieceCheck.y) {
        console.log(move);
        return true;
      }
    }
  
    return false;
  }
  
  function inBetween(checker,kingPos,piece,positions,color,whiteKing,blackKing,setPieceCheck,updateBlackKingPos,updateWhiteKingPos){
    //vertical check horizontal block
   const diffX= Math.abs(checker.x - kingPos[0]);
    const diffY= Math.abs(checker.y - kingPos[1]);
    if(piece.piece.substring(1,piece.piece.length) === "knight"){
      const horseMoves = [    [2, 1],
    [2, -1],
    [-2, 1],
    [-2, -1],
    [1, 2],
    [1, -2],
    [-1, 2],
    [-1, -2],
    ];
     for(const move in horseMoves){
      const x = piece.x + move[0];
      const y = piece.y + move[1];

      if(knightValid(positions,x,y,color,{x:piece.x,y:piece.y},kingPos,null,whiteKing,blackKing,setPieceCheck,updateBlackKingPos,updateWhiteKingPos)){
        return true;
      } 
    }
    }
    if(diffX === 1 || diffY === 1) return false;
    if(checker.y === kingPos[1]){
      if(piece.piece === "rook" || piece.piece ==="queen"){
        const minX= Math.min(kingPos[0],checker.x);
        const maxX=Math.max(kingPos[0],checker.x);
        if(piece.x > minX && piece.x < maxX){
          if(piece.y < checker.y){
            for(let i=piece.y +1 ; i<checker.y+1;i++){
              let p= positions[piece.x][i];
              if(i === checker.y) return true;
              if(p===null){
                continue;
              }else{
                break;
              }

            }
          }
        }else{
          for(let i=piece.y -1 ; i>=checker.y;i--){
            let p= positions[piece.x][i];
            if(i === checker.y) return true;
              if(p===null){
                continue;
              }else{
                break;
              }
          }
        }
      }
    }
    //horizontal check vertical block
    if(checker.x == kingPos[0]){
      if(piece.piece=== "rook" || piece.piece ==="queen"){
        const minY= Math.min(kingPos[1],checker.y);
        const maxY=Math.max(kingPos[1],checker.y);

       if(piece.y > minY && piece.y < maxY){
          if(piece.x > checker.x){
            for(let i=piece.x-1;i>=checker.x;i--){
            let p= positions[i][piece.y];
            if(i === checker.x) return true;
            if(p===null){
              continue;
            }else{
              break;
            }
            }
          }else{
            for(let i=piece.x+1;i<=checker.x;i++){
            let p= positions[i][piece.y];
            if(i === checker.x) return true;
            if(p===null){
              continue;
            }else{
              break;
            }
            }
          }
       }
      }
    }
    //diagonal block

    //check if queen or biship

  if((piece.piece.substring(1,piece.piece.length) === "queen" || piece.piece.substring(1,piece.piece.length) === "bishop")){
    
    const x=piece.x;
    const y=piece.y;
    const [kx, ky] = kingPos;
    const dx = (x < kx) ? 1 : -1;
    const dy = (y < ky) ? 1 : -1;
    let i = x + dx;
    let j = y + dy;
  
    while (i !== kx && j !== ky) {

      console.log(i,j);
      if(i>=0 && i<8 && j>=0 && j<8){
        if (positions[i][j] !== null) {
          return false; // there is a piece blocking the diagonal
        }
      }else{
        return false;
      }
      
     // if(j == ky) break;
      
      i += dx;
      j += dy;
    
      
    }
    
    return true;
  }
  return false;
}
    
  


export default checkMate;














