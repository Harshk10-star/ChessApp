// Helper function to check knight attacks
function isKnightAttack(kingPos, knightPos, positions, enemyColor) {
    const [kingX, kingY] = kingPos;
    const [knightX, knightY] = knightPos;

    // Check if knightPos is within bounds
    if (
        knightX < 0 || knightX >= 8 ||
        knightY < 0 || knightY >= 8
    ) return false;

    const piece = positions[knightX][knightY];
    if (!piece) return false;

    if (
        piece.charAt(0) === enemyColor &&
        piece.substring(1) === "knight"
    ) {
        const dx = Math.abs(knightX - kingX);
        const dy = Math.abs(knightY - kingY);
        return (dx === 2 && dy === 1) || (dx === 1 && dy === 2);
    }

    return false;
}

function check(
    color,
    kingPos,
    positions,
    setPieceCheck
) {
    let check = false;
    let pieceChecking = null;
    let enemyColor = color === "white" ? "b" : "w";

    console.log("KING POSTION IS", kingPos)

    // Directions for sliding pieces
    const directions = [
        { dx: 0, dy: -1, pieces: ["rook", "queen"] }, // Left
        { dx: 0, dy: 1, pieces: ["rook", "queen"] },  // Right
        { dx: -1, dy: 0, pieces: ["rook", "queen"] }, // Up
        { dx: 1, dy: 0, pieces: ["rook", "queen"] },  // Down
        { dx: -1, dy: -1, pieces: ["bishop", "queen"] }, // Up-Left
        { dx: -1, dy: 1, pieces: ["bishop", "queen"] },  // Up-Right
        { dx: 1, dy: -1, pieces: ["bishop", "queen"] },  // Down-Left
        { dx: 1, dy: 1, pieces: ["bishop", "queen"] },   // Down-Right
    ];

    // Check for sliding piece attacks
    for (let direction of directions) {
        let a = kingPos[0] + direction.dx;
        let b = kingPos[1] + direction.dy;

        while (a >= 0 && a < 8 && b >= 0 && b < 8) {
            const piece = positions[a][b];
            if (!piece) {
                a += direction.dx;
                b += direction.dy;
                continue;
            }

            if (piece.charAt(0) === enemyColor) {
                const pieceType = piece.substring(1);
                if (direction.pieces.includes(pieceType)) {
                    check = true;
                    pieceChecking = { x: a, y: b };
                    setPieceCheck(pieceChecking);
                    console.log("FAILING WHILE LOOP ", pieceChecking)
                    return { check, pieceChecking };
                }
                break; // Blocked by other enemy piece
            } else {
                break; // Blocked by own piece
            }
        }
    }

    // Pawn attack checks
    const [x, y] = kingPos;
    const pawnDirection = enemyColor === "w" ? -1 : 1; // Assuming white pawns move up

    const pawnAttacks = [
        { x: x + pawnDirection, y: y - 1 },
        { x: x + pawnDirection, y: y + 1 },
    ];

    for (let pos of pawnAttacks) {
        const { x: px, y: py } = pos;
        if (
            px >= 0 && px < 8 &&
            py >= 0 && py < 8
        ) {
            const piece = positions[px][py];
            if (piece && piece.charAt(0) === enemyColor && piece.substring(1) === "pawn") {
                check = true;
                pieceChecking = { x: px, y: py };
                setPieceCheck(pieceChecking);
                console.log("IN HERE PAWN")
                return { check, pieceChecking };
            }
        }
    }

    // Knight (Horse) attack checks
    const knightMoves = [
        { dx: -2, dy: 1 },
        { dx: -1, dy: 2 },
        { dx: -2, dy: -1 },
        { dx: -1, dy: -2 },
        { dx: 2, dy: -1 },
        { dx: 1, dy: -2 },
        { dx: 2, dy: 1 },
        { dx: 1, dy: 2 },
    ];

    for (let move of knightMoves) {
        const knightX = kingPos[0] + move.dx;
        const knightY = kingPos[1] + move.dy;

        if (
            knightX >= 0 && knightX < 8 &&
            knightY >= 0 && knightY < 8
        ) {
            const piece = positions[knightX][knightY];
            if (
                piece &&
                piece.charAt(0) === enemyColor &&
                piece.substring(1) === "knight"
            ) {
                check = true;
                pieceChecking = { x: knightX, y: knightY };
                setPieceCheck(pieceChecking);
                console.log("HORSE WHILE")
                return { check, pieceChecking };
            }
        }
    }

    // If no checks are detected
    return { check: false, pieceChecking: null };
}

export default check;
