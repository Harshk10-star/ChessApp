// PawnValid.js
import check from "./Check";

/**
 * Validates the pawn's move.
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
 * @returns {Object} - Object containing result and possibly the promoted piece.
 */
function pawnValid(
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
    const direction = turn === "white" ? -1 : 1;
    const startRow = turn === "white" ? 6 : 1;
    const enemyColor = turn === "white" ? "b" : "w";

    // Simple move forward
    if (y === selectedPiece.y && x === selectedPiece.x + direction && arr[x][y] === null) {
        // Check for promotion
        if ((turn === "white" && x === 0) || (turn === "black" && x === 7)) {
            const newPiece = prompt("Choose a piece to promote your pawn to: queen, rook, bishop, or knight.");
            if (["queen", "rook", "bishop", "knight"].includes(newPiece)) {
                return { res: true, piece: turn.charAt(0) + newPiece };
            } else {
                return { res: false, piece: selectedPiece.piece };
            }
        }

        // Temporarily make the move
        const newPositions = JSON.parse(JSON.stringify(arr));
        newPositions[x][y] = newPositions[selectedPiece.x][selectedPiece.y];
        newPositions[selectedPiece.x][selectedPiece.y] = null;
        const isCheck = isKingInCheck(turn, kingPos, newPositions);
        return { res: !isCheck.check, piece: selectedPiece.piece };
    }

    // Double move from starting position
    if (
        y === selectedPiece.y &&
        x === selectedPiece.x + 2 * direction &&
        selectedPiece.x === startRow &&
        arr[selectedPiece.x + direction][y] === null &&
        arr[x][y] === null
    ) {
        // Temporarily make the move
        const newPositions = JSON.parse(JSON.stringify(arr));
        newPositions[x][y] = newPositions[selectedPiece.x][selectedPiece.y];
        newPositions[selectedPiece.x][selectedPiece.y] = null;
        const isCheck = isKingInCheck(turn, kingPos, newPositions);
        return { res: !isCheck.check, piece: selectedPiece.piece };
    }

    // Captures
    if (
        (x === selectedPiece.x + direction && y === selectedPiece.y - 1 && arr[x][y] && arr[x][y].charAt(0) === enemyColor) ||
        (x === selectedPiece.x + direction && y === selectedPiece.y + 1 && arr[x][y] && arr[x][y].charAt(0) === enemyColor)
    ) {
        // Check for promotion
        if ((turn === "white" && x === 0) || (turn === "black" && x === 7)) {
            const newPiece = prompt("Choose a piece to promote your pawn to: queen, rook, bishop, or knight.");
            if (["queen", "rook", "bishop", "knight"].includes(newPiece)) {
                return { res: true, piece: turn.charAt(0) + newPiece };
            } else {
                return { res: false, piece: selectedPiece.piece };
            }
        }

        // Temporarily make the move
        const newPositions = JSON.parse(JSON.stringify(arr));
        newPositions[x][y] = newPositions[selectedPiece.x][selectedPiece.y];
        newPositions[selectedPiece.x][selectedPiece.y] = null;
        const isCheck = isKingInCheck(turn, kingPos, newPositions);
        return { res: !isCheck.check, piece: selectedPiece.piece };
    }

    // En Passant (optional implementation)
    // Add your en passant logic here if needed

    return { res: false, piece: selectedPiece.piece };
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
        () => {}, // No-op setters since we're only checking
        color === "white" ? kingPos : [0, 4],
        color === "black" ? kingPos : [7, 4],
        () => {},
        () => {},
        () => {},
        null
    );

    return checkResult;
}

export default pawnValid;
