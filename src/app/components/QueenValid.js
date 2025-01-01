// QueenValid.js
import bishopValid from "./BishopValid";
import rookValid from "./RookValid";

/**
 * Validates the queen's move by checking both bishop and rook moves.
 *
 * @param {Array} arr - The current board positions.
 * @param {number} x - The target x-coordinate.
 * @param {number} y - The target y-coordinate.
 * @param {string} turn - Current player's turn ("white" or "black").
 * @param {Object} selectedPiece - The piece being moved.
 * @param {Array} kingPos - The current king's position.
 * @param {Function} setKingPos - Setter for king's position.
 * @param {Array} whiteKing - White king's position.
 * @param {Array} blackKing - Black king's position.
 * @param {Function} setPieceCheck - Setter for piece checking the king.
 * @param {Function} updateBlackKingPos - Function to update black king's position.
 * @param {Function} updateWhiteKingPos - Function to update white king's position.
 * @returns {boolean} - True if the move is valid, else false.
 */
function queenValid(
    arr,
    x,
    y,
    turn,
    selectedPiece,
    kingPos,
    setKingPos,
    whiteKing,
    blackKing,
    setPieceCheck,
    updateBlackKingPos,
    updateWhiteKingPos
) {
    return (
        bishopValid(arr, x, y, turn, selectedPiece, kingPos, setKingPos, whiteKing, blackKing, setPieceCheck, updateBlackKingPos, updateWhiteKingPos) ||
        rookValid(arr, x, y, turn, selectedPiece, kingPos, setKingPos, whiteKing, blackKing, setPieceCheck, updateBlackKingPos, updateWhiteKingPos)
    );
}

export default queenValid;
