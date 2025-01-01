// checkMate.js
import kingValid from "./KingValid";
import knightValid from "./KnightValid";
import pawnValid from "./PawnValid";
import queenValid from "./QueenValid";
import rookValid from "./RookValid";
import bishopValid from "./BishopValid";

/**
 * Determines if the opponent is in checkmate.
 *
 * @param {string} color - The opponent's color ("white" or "black").
 * @param {Array} kingPos - The opponent king's position [x, y].
 * @param {Object} pieceCheck - The position of the piece putting the king in check {x, y}.
 * @param {Array} positions - The current board positions.
 * @returns {boolean} - Returns true if it's checkmate, else false.
 */
function checkMate(color, kingPos, pieceCheck, positions) {
    const opponentColorCode = color === "white" ? "w" : "b"; // 'w' for white, 'b' for black
    const enemyColorCode = color === "white" ? "b" : "w"; // Opponent's opponent color

    console.log(`Evaluating checkmate for ${color} with king at (${kingPos[0]}, ${kingPos[1]})`);

    // 1. Check if the king has any legal moves to escape
    if (canKingEscape(color, kingPos, positions)) {
        console.log("King can escape. Not checkmate.");
        return false; // Not checkmate
    }

    // 2. Gather all pieces of the opponent's color
    const opponentPieces = gatherOwnPieces(opponentColorCode, positions);

    // 3. Check if any opponent's piece can capture the checking piece
    if (canCaptureCheckingPiece(pieceCheck, opponentPieces, positions, color)) {
        console.log("A piece can capture the checking piece. Not checkmate.");
        return false; // Not checkmate
    }

    // 4. Check if any opponent's piece can block the check
    if (canBlockCheck(pieceCheck, kingPos, opponentPieces, positions, color)) {
        console.log("A piece can block the check. Not checkmate.");
        return false; // Not checkmate
    }

    // If none of the above, it's checkmate
    console.log("No escape, capture, or block available. It's checkmate.");
    return true;
}

/**
 * Gathers all pieces of the specified color.
 *
 * @param {string} pieceColorCode - The color identifier ('w' or 'b').
 * @param {Array} positions - The current board positions.
 * @returns {Array} - Array of pieces with their positions.
 */
function gatherOwnPieces(pieceColorCode, positions) {
    const pieces = [];
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const piece = positions[i][j];
            if (piece && piece.charAt(0).toLowerCase() === pieceColorCode) {
                pieces.push({ x: i, y: j, piece });
            }
        }
    }
    return pieces;
}

/**
 * Checks if the opponent's king can escape by moving to any adjacent square.
 *
 * @param {string} color - The opponent's color ("white" or "black").
 * @param {Array} kingPos - The opponent king's position [x, y].
 * @param {Array} positions - The board positions.
 * @returns {boolean} - True if the king can escape, else false.
 */
function canKingEscape(color, kingPos, positions) {
    const opponentColorCode = color === "white" ? "w" : "b";
    const enemyColorCode = color === "white" ? "b" : "w";
    const dx = [-1, -1, -1, 0, 0, 1, 1, 1];
    const dy = [-1, 0, 1, -1, 1, -1, 0, 1];

    for (let i = 0; i < dx.length; i++) {
        const newX = kingPos[0] + dx[i];
        const newY = kingPos[1] + dy[i];
        if (newX >= 0 && newX < 8 && newY >= 0 && newY < 8) {
            const targetPiece = positions[newX][newY];
            // Check if the square is empty or occupied by an enemy piece
            if (!targetPiece || targetPiece.charAt(0).toLowerCase() === enemyColorCode) {
                // Temporarily move the king to the new position and check if it's still in check
                console.log(`Trying to move king to (${newX}, ${newY}) to escape.`);
                const newPositions = JSON.parse(JSON.stringify(positions));
                newPositions[newX][newY] = newPositions[kingPos[0]][kingPos[1]];
                newPositions[kingPos[0]][kingPos[1]] = null;

                // Check if the king is still in check after the move
                const isStillInCheck = isKingInCheck(color, [newX, newY], newPositions);
                if (!isStillInCheck) {
                    console.log(`King can move to (${newX}, ${newY}) to escape.`);
                    return true; // King can escape
                }
            }
        }
    }
    return false; // King cannot escape
}

/**
 * Determines if any opponent's piece can capture the checking piece.
 *
 * @param {Object} pieceCheck - The position of the checking piece {x, y}.
 * @param {Array} opponentPieces - All opponent's pieces.
 * @param {Array} positions - The board positions.
 * @param {string} color - The opponent's color ("white" or "black").
 * @returns {boolean} - True if any piece can capture the checking piece, else false.
 */
function canCaptureCheckingPiece(pieceCheck, opponentPieces, positions, color) {
    for (let i = 0; i < opponentPieces.length; i++) {
        const { x, y, piece } = opponentPieces[i];
        const pieceType = piece.substring(1).toLowerCase();

        // Skip if the piece is the king
        if (pieceType === "king") continue;

        let canCapture = false;
        const selectedPiece = { x, y, piece };

        switch (pieceType) {
            case "queen":
                canCapture = queenValid(
                    positions,
                    pieceCheck.x,
                    pieceCheck.y,
                    color,
                    selectedPiece,
                    null, // kingPos not needed here
                    null,
                    null,
                    null,
                    null,
                    null,
                    null
                );
                break;
            case "rook":
                canCapture = rookValid(
                    positions,
                    pieceCheck.x,
                    pieceCheck.y,
                    color,
                    selectedPiece,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null
                );
                break;
            case "bishop":
                canCapture = bishopValid(
                    positions,
                    pieceCheck.x,
                    pieceCheck.y,
                    color,
                    selectedPiece,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null
                );
                break;
            case "knight":
                canCapture = knightValid(
                    positions,
                    pieceCheck.x,
                    pieceCheck.y,
                    color,
                    selectedPiece,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null
                );
                break;
            case "pawn":
                const pawnResult = pawnValid(
                    positions,
                    pieceCheck.x,
                    pieceCheck.y,
                    color,
                    selectedPiece,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null
                );
                canCapture = pawnResult.res;
                break;
            default:
                break;
        }

        if (canCapture) {
            console.log(`Piece ${piece} at (${x}, ${y}) can capture the checking piece.`);
            return true; // Found a piece that can capture the checking piece
        }
    }

    return false; // No piece can capture the checking piece
}

/**
 * Determines if any opponent's piece can block the check by moving between the king and the checking piece.
 *
 * @param {Object} pieceCheck - The position of the checking piece {x, y}.
 * @param {Array} kingPos - The opponent king's position [x, y].
 * @param {Array} opponentPieces - All opponent's pieces.
 * @param {Array} positions - The board positions.
 * @param {string} color - The opponent's color ("white" or "black").
 * @returns {boolean} - True if blocking the check is possible, else false.
 */
function canBlockCheck(pieceCheck, kingPos, opponentPieces, positions, color) {
    const pieceType = positions[pieceCheck.x][pieceCheck.y].substring(1).toLowerCase();
    // If the checking piece is a knight, blocking is not possible
    if (pieceType === "knight") return false;

    // Determine the direction from the checking piece to the king
    const directionX = kingPos[0] - pieceCheck.x;
    const directionY = kingPos[1] - pieceCheck.y;
    const steps = Math.max(Math.abs(directionX), Math.abs(directionY));

    const stepX = directionX === 0 ? 0 : directionX / Math.abs(directionX);
    const stepY = directionY === 0 ? 0 : directionY / Math.abs(directionY);

    // Collect all squares between the checking piece and the king
    const blockingSquares = [];
    for (let i = 1; i < steps; i++) {
        blockingSquares.push({
            x: pieceCheck.x + stepX * i,
            y: pieceCheck.y + stepY * i,
        });
    }

    // For each blocking square, check if any opponent's piece can move there
    for (let square of blockingSquares) {
        for (let i = 0; i < opponentPieces.length; i++) {
            const { x, y, piece } = opponentPieces[i];
            const currentPieceType = piece.substring(1).toLowerCase();
            const selectedPiece = { x, y, piece };

            // Skip the king
            if (currentPieceType === "king") continue;

            let canMove = false;
            switch (currentPieceType) {
                case "queen":
                    canMove = queenValid(
                        positions,
                        square.x,
                        square.y,
                        color,
                        selectedPiece,
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        null
                    );
                    break;
                case "rook":
                    canMove = rookValid(
                        positions,
                        square.x,
                        square.y,
                        color,
                        selectedPiece,
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        null
                    );
                    break;
                case "bishop":
                    canMove = bishopValid(
                        positions,
                        square.x,
                        square.y,
                        color,
                        selectedPiece,
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        null
                    );
                    break;
                case "knight":
                    canMove = knightValid(
                        positions,
                        square.x,
                        square.y,
                        color,
                        selectedPiece,
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        null
                    );
                    break;
                case "pawn":
                    const pawnResult = pawnValid(
                        positions,
                        square.x,
                        square.y,
                        color,
                        selectedPiece,
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        null
                    );
                    canMove = pawnResult.res;
                    break;
                default:
                    break;
            }

            if (canMove) {
                console.log(`Piece ${piece} at (${x}, ${y}) can block the check by moving to (${square.x}, ${square.y}).`);
                return true; // Found a piece that can block the check
            }
        }
    }

    return false; // No piece can block the check
}

/**
 * Checks if the opponent's king is in check after a hypothetical move.
 *
 * @param {string} color - The opponent's color ("white" or "black").
 * @param {Array} kingPos - The opponent king's position [x, y].
 * @param {Array} newPositions - The board positions after the move.
 * @returns {boolean} - True if the king is in check, else false.
 */
function isKingInCheck(color, kingPos, newPositions) {
    // Import the updated check function
    const check = require("./Check").default;

    const checkResult = check(
        color,
        kingPos,
        newPositions,
        () => {}, // No-op setters since we're only checking
        () => {}, // setCheck is handled outside
        () => {}, // updateBlackKingPos not needed here
        () => {}, // updateWhiteKingPos not needed here
        null // selectedPiece not needed here
    );

    return checkResult.check;
}

export default checkMate;
