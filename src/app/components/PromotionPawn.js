import React from 'react';
import "../components/promotion.css";


function PromotionPawn({ onPieceSelected }) {
    return (
      <div className="row">
        <img src={require(`../images/wqueen.png`)} onClick={() => onPieceSelected('queen')}/>
        <img  src={require(`../images/wrook.png`)} onClick={() => onPieceSelected('rook')}/>
      </div>
    
    );
  }
  
  export default PromotionPawn;