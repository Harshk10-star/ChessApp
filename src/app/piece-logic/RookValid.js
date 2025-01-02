// RookValid.js
import check from "./Check";

/**
 * Validates the rook's move.
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
function rookValid(
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
    // Validate if moving along the same row or column
    if (selectedPiece.x !== x && selectedPiece.y !== y) {
        return false;
    }

    // Check path is clear
    if (selectedPiece.x === x) {
        const minY = Math.min(selectedPiece.y, y);
        const maxY = Math.max(selectedPiece.y, y);
        for (let i = minY + 1; i < maxY; i++) {
            if (arr[x][i] !== null) {
                return false; // Path is blocked
            }
        }
    } else {
        const minX = Math.min(selectedPiece.x, x);
        const maxX = Math.max(selectedPiece.x, x);
        for (let i = minX + 1; i < maxX; i++) {
            if (arr[i][y] !== null) {
                return false; // Path is blocked
            }
        }
    }

    // Temporarily make the move
    const newPositions = JSON.parse(JSON.stringify(arr));
    newPositions[x][y] = newPositions[selectedPiece.x][selectedPiece.y];
    newPositions[selectedPiece.x][selectedPiece.y] = null;

    // Check if the king is in check after the move
    const isCheck = isKingInCheck(turn, kingPos, newPositions);
    return !isCheck.check;
}

/**
 * Checks if the king is in check after a hypothetical move.
 *
 * @param {string} color - The current player's color.
 * @param {Array} kingPos - The king's position.
 * @param {Array} newPositions - The board positions after the move.
 * @returns {Object} - Object containing check status.
 */
function isKingInCheck(color, kingPos, newPositions) {
    const check = require("./Check").default;

    const checkResult = check(
        color,
        kingPos,
        newPositions,
        () => {}// No-op setters since we're only checkin
    );

    return checkResult;
}

export default rookValid;
