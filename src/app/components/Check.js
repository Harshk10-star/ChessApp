
import checkMate from "./CheckMate";
function check(color, kingPos, positions, setKingPos,whiteKing,blackKing,setPieceCheck,updateBlackKingPos,updateWhiteKingPos,selectedPiece,fromMain) {
    let checkMates;
    let enemyColor;
    if (color === "white") {
      setKingPos([...whiteKing]);
      kingPos=whiteKing;
      enemyColor = "b";
    } else {
      setKingPos([...blackKing]);
      kingPos=blackKing;
      enemyColor = "w";
    }
    // Check horizontally left
   // console.log(whiteKing);
   // console.log(blackKing);
   
    for(let i=kingPos[1]-1;i>=0;i--){
        if(positions[kingPos[0]][i] === null){
            continue;
        }
      if(positions[kingPos[0]][i].charAt(0) === enemyColor){
        let piece = positions[kingPos[0]][i].substring(1,positions[kingPos[0]][i].length);
    
  
        if( piece === "rook" || piece === "queen"){
            //setPieceCheck({x:kingPos[0], y:i});
            if(fromMain === false){
              checkMates=checkMate(color,kingPos,{x:kingPos[0], y:i},positions,setKingPos,setPieceCheck,updateBlackKingPos,updateWhiteKingPos,selectedPiece,whiteKing,blackKing);
              return {check:true,checkMate:checkMates};
            }else{
              return {check:true,checkMate:true};
            }
    
        }
        break;
      }else{
        break;
      }
    }
    // Check horizontally right

    for(let i=kingPos[1]+1; i<8;i++){
        if(positions[kingPos[0]][i] === null){
            continue;
        }
        if(positions[kingPos[0]][i].charAt(0) === enemyColor){
            let piece = positions[kingPos[0]][i].substring(1,positions[kingPos[0]][i].length);
            if(piece === "rook" || piece === "queen"){
             // setPieceCheck({x:kingPos[0], y:i});  
              if(fromMain === false){
                checkMates=checkMate(color,kingPos,{x:kingPos[0], y:i},positions,setKingPos,setPieceCheck,updateBlackKingPos,updateWhiteKingPos,selectedPiece,whiteKing,blackKing);
                return {check:true,checkMate:checkMates};

              }else{
                return {check:true,checkMate:true};

              }
             
    
            }
            break;
        }else{
            break;
        }
    }

    //vertically top

    for(let i=kingPos[0]-1;i>=0;i--){
      if(positions[i][kingPos[1]] === null){
        continue;
      }
      if(positions[i][kingPos[1]].charAt(0) === enemyColor){
        let piece = positions[i][kingPos[1]].substring(1,positions[i][kingPos[1]].length);
        if(piece === "rook" || piece ==="queen"){
          console.log("vetaclly  top");
          //setPieceCheck({x:i,y:kingPos[1]});
          if(fromMain === false){
            checkMates=checkMate(color,kingPos,{x:i,y:kingPos[1]},positions,setKingPos,setPieceCheck,updateBlackKingPos,updateWhiteKingPos,selectedPiece,whiteKing,blackKing);
            return {check:true,checkMate:checkMates};
          }else{
            return {check:true,checkMate:true};
          }
        
        }
        break;
      }else{
        break;
      }
    }
    //vertically bottom

    for(let i=kingPos[0]+1; i <8 ;i++){
      if(positions[i][kingPos[1]] == null){
        continue;
      }
      if(positions[i][kingPos[1]].charAt(0) === enemyColor){
     
        let piece = positions[i][kingPos[1]].substring(1,positions[i][kingPos[1]].length);
        if(piece === "rook" || piece ==="queen"){
          //setPieceCheck({x:i,y:kingPos[1]});
          if(fromMain === false){
            checkMates=checkMate(color,kingPos,{x:i,y:kingPos[1]},positions,setKingPos,setPieceCheck,updateBlackKingPos,updateWhiteKingPos,selectedPiece,whiteKing,blackKing);
            return {check:true,checkMate:checkMates};
          }else{
            return {check:true,checkMate:true};
          }
         
        }
        break;
      }else{
        break;
      }
    }
  
    //pawn checks realtive to king
    
    let [x1, y1] = kingPos;
    let checkDirection = (enemyColor === 'w') ? 1 : -1;
  
    if (positions[x1 + checkDirection] && (positions[x1 + checkDirection][y1 - 1] === enemyColor + 'pawn' || positions[x1 + checkDirection][y1 - 1] === enemyColor + 'queen' || positions[x1 + checkDirection][y1 - 1] === enemyColor + 'bishop')){
      
      //setPieceCheck({x:x1+checkDirection, y:y1-1});
      if(fromMain === false){
        checkMates=checkMate(color,kingPos,{x:x1+checkDirection, y:y1-1},positions,setKingPos,setPieceCheck,updateBlackKingPos,updateWhiteKingPos,selectedPiece,whiteKing,blackKing);
        return {check:true,checkMate:checkMates};
      }else{
        return {check:true,checkMate:true};
      }
   
    } 
    if (positions[x1 + checkDirection] && (positions[x1 + checkDirection][y1 + 1] === enemyColor + 'pawn' || positions[x1 + checkDirection][y1 + 1] === enemyColor + 'queen' || positions[x1 + checkDirection][y1 + 1] === enemyColor + 'bishop')){
      //setPieceCheck({x:x1+checkDirection,y:y1+1});
      if(fromMain === false){
        checkMates=checkMate(color,kingPos,{x:x1+checkDirection,y:y1+1},positions,setKingPos,setPieceCheck,updateBlackKingPos,updateWhiteKingPos,selectedPiece,whiteKing,blackKing);
        return {check:true,checkMate:checkMates};
      }else{
        return {check:true,checkMate:true};
      }
     
    } 

   //horse checks- 8 postions to check

   const first=[kingPos[0]-2,kingPos[1]+1];
   const second=[kingPos[0]-1,kingPos[1]+2];

   const third=[kingPos[0]-2,kingPos[1]-1];
   const fourth=[kingPos[0]-1,kingPos[1]-2];

   const fith=[kingPos[0]+2,kingPos[1]-1];
   const sixth=[kingPos[0]+1,kingPos[1]-2];

   const seventh=[kingPos[0]+2,kingPos[1]+1];
   const last=[kingPos[0]+1,kingPos[1]+2];
  if(isHorseCheck(kingPos,first,positions,enemyColor,setPieceCheck) === true) {
    if(fromMain===false){
      checkMates=checkMate(color,kingPos,{x:first[0],y:first[1]},positions,setKingPos,setPieceCheck,updateBlackKingPos,updateWhiteKingPos,selectedPiece,whiteKing,blackKing);
      return {check:true,checkMate:checkMates};
    }else{
      return {check:true,checkMate:true};
    }
    
  }else if( isHorseCheck(kingPos,second,positions,enemyColor,setPieceCheck)===true){
    if(fromMain===false){
      checkMates=checkMate(color,kingPos,{x:second[0],y:second[1]},positions,setKingPos,setPieceCheck,updateBlackKingPos,updateWhiteKingPos,selectedPiece,whiteKing,blackKing);
      return {check:true,checkMate:checkMates};
    }else{
      return {check:true,checkMate:true};
    }

  }else if(isHorseCheck(kingPos,third,positions,enemyColor,setPieceCheck)=== true){
    if(fromMain===false){
      checkMates=checkMate(color,kingPos,{x:third[0],y:third[1]},positions,setKingPos,setPieceCheck,updateBlackKingPos,updateWhiteKingPos,selectedPiece,whiteKing,blackKing);
      return {check:true,checkMate:checkMates};
    }else{
      return {check:true,checkMate:true};
    }

    
  }else if(isHorseCheck(kingPos,fourth,positions,enemyColor,setPieceCheck)=== true){
    
    if(fromMain===false){
      checkMates=checkMate(color,kingPos,{x:fourth[0],y:fourth[1]},positions,setKingPos,setPieceCheck,updateBlackKingPos,updateWhiteKingPos,selectedPiece,whiteKing,blackKing);
      return {check:true,checkMate:checkMates};
    }else{
      return {check:true,checkMate:true};
    }
  }else if(isHorseCheck(kingPos,fith,positions,enemyColor,setPieceCheck)=== true){
    
    if(fromMain===false){
      checkMates=checkMate(color,kingPos,{x:fith[0],y:fith[1]},positions,setKingPos,setPieceCheck,updateBlackKingPos,updateWhiteKingPos,selectedPiece,whiteKing,blackKing);
      return {check:true,checkMate:checkMates};
    }else{
      return {check:true,checkMate:true};
    }

  }else if(isHorseCheck(kingPos,sixth,positions,enemyColor,setPieceCheck)=== true){
    if(fromMain===false){
      checkMates=checkMate(color,kingPos,{x:sixth[0],y:sixth[1]},positions,setKingPos,setPieceCheck,updateBlackKingPos,updateWhiteKingPos,selectedPiece,whiteKing,blackKing);
      return {check:true,checkMate:checkMates};
    }else{
      return {check:true,checkMate:true};
    }
    

  }else if(isHorseCheck(kingPos,seventh,positions,enemyColor,setPieceCheck)=== true){
    if(fromMain===false){
      checkMates=checkMate(color,kingPos,{x:seventh[0],y:seventh[1]},positions,setKingPos,setPieceCheck,updateBlackKingPos,updateWhiteKingPos,selectedPiece,whiteKing,blackKing);
      return {check:true,checkMate:checkMates};
    }else{
      return {check:true,checkMate:true};
    }
    
  
  }else if(isHorseCheck(kingPos,last,positions,enemyColor,setPieceCheck)=== true){
    
    if(fromMain===false){
      checkMates=checkMate(color,kingPos,{x:last[0],y:last[1]},positions,setKingPos,setPieceCheck,updateBlackKingPos,updateWhiteKingPos,selectedPiece,whiteKing,blackKing);
      return {check:true,checkMate:checkMates};
    }else{
      return {check:true,checkMate:true};
    }

  }



  let [x, y] = kingPos;
  const dx = [1, 1, -1, -1];
  const dy = [1, -1, 1, -1];

  for (let i = 0; i < 4; i++) {
    let a = x + dx[i];
    let b = y + dy[i];
    while (a >= 0 && a < 8 && b >= 0 && b < 8) {
      const piece = positions[a][b];
      if (piece === null) {
        a += dx[i];
        b += dy[i];
        continue;
      } else if (piece.substring(0, 1) === enemyColor) {
        // Check if enemy piece can attack the king diagonally
        if (piece.substring(1) === "bishop" || piece.substring(1) === "queen") {
          //setPieceCheck({x:a,y:b});
          if(fromMain===false){
            checkMates=checkMate(color,kingPos,{x:a,y:b},positions,setKingPos,setPieceCheck,updateBlackKingPos,updateWhiteKingPos,selectedPiece,whiteKing,blackKing);
            return {check:true,checkMate:checkMates};
          }else{
            return {check:true,checkMate:true};
          }

        } else {
          break;
        }
      } else {
        break;
      }
    }
  }
    
    
    
    
    return {check:false,checkMate:true};
    
  }

  function isHorseCheck(kingPos, horsePos,positions,enemyColor,setPieceCheck) {
    if(!(horsePos[0] < 8 && horsePos[0] >=0 && horsePos[1] < 8 && horsePos[1] >=0)) return false;
    if(positions[horsePos[0]][[horsePos[1]]] === null) return false
    if(positions[horsePos[0]][[horsePos[1]]].charAt(0) === enemyColor && positions[horsePos[0]][[horsePos[1]]].substring(1,positions[horsePos[0]][[horsePos[1]]].length) === "knight"){
    
    const kingX = kingPos[0];
    const kingY = kingPos[1];
    const horseX = horsePos[0];
    const horseY = horsePos[1];
    
    // Check the L-shaped moves of a horse
    if((horseX + 2 === kingX && horseY + 1 === kingY) ||
       (horseX + 2 === kingX && horseY - 1 === kingY) ||
       (horseX - 2 === kingX && horseY + 1 === kingY) ||
       (horseX - 2 === kingX && horseY - 1 === kingY) ||
       (horseX + 1 === kingX && horseY + 2 === kingY) ||
       (horseX + 1 === kingX && horseY - 2 === kingY) ||
       (horseX - 1 === kingX && horseY + 2 === kingY) ||
       (horseX - 1 === kingX && horseY - 2 === kingY) === true) {
     // setPieceCheck({x:horsePos[0],y:horsePos[1]});
      return true;
    }
  }
    return false;
  }

  

  export default check;