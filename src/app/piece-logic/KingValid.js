// KnightValid.js
import check from "./Check";

/**
 * Validates the knight's move.
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
function kingValid(
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
    // Validate move boundaries
    if (x < 0 || x > 7 || y < 0 || y > 7) {
        return false;
    }

    const xDiff = Math.abs(selectedPiece.x - x);
    const yDiff = Math.abs(selectedPiece.y - y);
    console.log(xDiff, yDiff);
    if (!((xDiff === 1 || yDiff === 1))) {
        console.log("if number 3")
        return false;
    }

    // Validate if moving to a square occupied by own piece
    if (arr[x][y] && arr[selectedPiece.x][selectedPiece.y].charAt(0) === arr[x][y].charAt(0)) {
        console.log("if number 2")
        return false;
    }

    // Temporarily make the move
    const newPositions = JSON.parse(JSON.stringify(arr));
    newPositions[x][y] = newPositions[selectedPiece.x][selectedPiece.y];
    newPositions[selectedPiece.x][selectedPiece.y] = null;
    console.log(newPositions)
    const newKingPos = [x,y]
    // Check if the king is in check after the move
    const isCheck = isKingInCheck(turn, newKingPos, newPositions);
    return !isCheck;
}

/**
 * Checks if the king is in check after a hypothetical move.
 *
 * @param {string} color - The current player's color.
 * @param {Array} kingPos - The king's position.
 * @param {Array} newPositions - The board positions after the move.
 * @returns {boolean} - True if the king is in check, else false.
 */
function isKingInCheck(color, kingPos, newPositions) {
    const check = require("./Check").default;

    const checkResult = check(
        color,
        kingPos,
        newPositions,
        () => {} // No-op setters since we're only checking
    );

    return checkResult.check;
}

export default kingValid;
