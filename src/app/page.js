// Main.js
"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import './App.css';
import Board from './components/Board';
import check from './components/Check';
import pawnValid from './components/PawnValid';
import rookValid from './components/RookValid';
import knightValid from './components/KnightValid';
import kingValid from './components/KingValid';
import bishopValid from './components/BishopValid';
import queenValid from './components/QueenValid';
import PromotionPawn from './components/PromotionPawn';
import checkMate from './components/CheckMate';
import fetchGames from './components/fetchGames';

function Main() {
    const [promotion, setPromotion] = useState(false); // Initially no promotion
    const [moves, setMoveArr] = useState([]);
    const [selected, setSelected] = useState(false);
    const [selectedPiece, setSelectedPiece] = useState(null);
    const [turn, setTurn] = useState("white");
    const [whiteKing, setWhiteKing] = useState([7, 4]);
    const [blackKing, setBlackKing] = useState([0, 4]);
    const [checkKing, setCheck] = useState(false);
    const [pieceCheck, setPieceCheck] = useState(null);
    const [isCheckMate, setCheckMate] = useState(false);
    const [moveWhiteKing, setWhiteMove] = useState(false);
    const [moveBlackKing, setBlackMove] = useState(false);
    const [whiteCastle, setWhiteCastle] = useState(false);
    const [blackCastle, setBlackCastle] = useState(false);

    async function saveBoard() {
        const url = 'http://localhost:3001/';
        try {
            const response = await axios.post(url, { moves }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log(response);
        } catch (error) {
            console.error(error);
        }
    }

    const updateBlackKingPos = (x, y) => {
        console.log("Updating Black King Position");
        setBlackKing([x, y]);
    };

    const updateWhiteKingPos = (x, y) => {
        console.log("Updating White King Position");
        setWhiteKing([x, y]);
    };

    const [positions, setPositions] = useState([
        ["brook", "bknight", "bbishop", "bqueen", "bking", "bbishop", "bknight", "brook"],
        ["bpawn", "bpawn", "bpawn", "bpawn", "bpawn", "bpawn", "bpawn", "bpawn"],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        ["wpawn", "wpawn", "wpawn", "wpawn", "wpawn", "wpawn", "wpawn", "wpawn"],
        ["wrook", "wknight", "wbishop", "wqueen", "wking", "wbishop", "wknight", "wrook"]
    ]);

    // Reset the game to initial state
    function reset() {
        setPositions([
            ["brook", "bknight", "bbishop", "bqueen", "bking", "bbishop", "bknight", "brook"],
            ["bpawn", "bpawn", "bpawn", "bpawn", "bpawn", "bpawn", "bpawn", "bpawn"],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            ["wpawn", "wpawn", "wpawn", "wpawn", "wpawn", "wpawn", "wpawn", "wpawn"],
            ["wrook", "wknight", "wbishop", "wqueen", "wking", "wbishop", "wknight", "wrook"]
        ]);
        setSelected(false);
        setSelectedPiece(null);
        setTurn("white");
        setWhiteKing([7, 4]);
        setBlackKing([0, 4]);
        setCheck(false);
        setPieceCheck(null);
        setCheckMate(false);
        setMoveArr([]);
        setWhiteMove(false);
        setBlackMove(false);
        setWhiteCastle(false);
        setBlackCastle(false);
    }

    useEffect(() => {
      
            console.log("Evaluating check and checkmate...");
            
            // Determine the opponent's color and king position
            const opponentColor = turn === "white" ? "black" : "white";
            const opponentKingPos = opponentColor === "white" ? whiteKing : blackKing;
            const meKindPos = turn === "white" ? whiteKing: blackKing;
            const meColor = turn;
            console.log(meKindPos, "meKingPos");
            // Check if the opponent's king is in check
            const { check: isInCheck, pieceChecking } = check(
                meColor,
                opponentKingPos,
                positions,
                setPieceCheck,
                setCheck
            );

            setCheck(isInCheck);
            setPieceCheck(isInCheck ? pieceChecking : null);

            if (isInCheck) {
                const mate = checkMate(opponentColor, meKindPos, pieceChecking, positions);
                setCheckMate(mate);
            } else {
                setCheckMate(false);
            }
 

    }, [turn]);

    /**
     * Updates the board positions based on the move.
     *
     * @param {string} piece - The piece being moved.
     * @param {number} x - The target x-coordinate.
     * @param {number} y - The target y-coordinate.
     */
    function updatePositions(piece, x, y) {
        if (isCheckMate) {
            console.log("Game Over: Checkmate!");
            return;
        }

        const pieceColor = piece.charAt(0);
        const currentPlayerColor = turn === "white" ? "w" : "b";

        // Prevent moving opponent's pieces
        if (pieceColor !== currentPlayerColor) {
            return;
        }

        const pieceType = piece.substring(1);
        setMoves(pieceType, x, y, piece);
    }

    /**
     * Determines and sets the move based on the piece type.
     *
     * @param {string} p - The type of the piece.
     * @param {number} x - The target x-coordinate.
     * @param {number} y - The target y-coordinate.
     * @param {string|null} piece - Additional information (e.g., castling direction).
     */
    function setMoves(p, x, y, piece) {
        switch (p) {
            case "queen":
                if (queenValid(positions, x, y, turn, selectedPiece, turn === "white" ? whiteKing : blackKing, null, null, null, null, null, null)) {
                    performMove(piece, x, y, null);
                }
                break;
            case "rook":
                if (rookValid(positions, x, y, turn, selectedPiece, turn === "white" ? whiteKing : blackKing, null, null, null, null, null, null)) {
                    performMove(piece, x, y, null);
                }
                break;
            case "bishop":
                if (bishopValid(positions, x, y, turn, selectedPiece, turn === "white" ? whiteKing : blackKing, null, null, null, null, null, null)) {
                    performMove(piece, x, y, null);
                }
                break;
            case "knight":
                if (knightValid(positions, x, y, turn, selectedPiece, turn === "white" ? whiteKing : blackKing, null, null, null, null, null, null)) {
                    performMove(piece, x, y, null);
                }
                break;
            case "king":
                handleKingMove(piece, x, y);
                break;
            case "pawn":
                const pawnMove = pawnValid(positions, x, y, turn, selectedPiece, turn === "white" ? whiteKing : blackKing, null, null, null, null, null, null);
                if (pawnMove.res) {
                    performMove(pawnMove.piece, x, y, null);
                    if (pawnMove.piece.includes("prompt")) {
                        setPromotion(true); // Trigger promotion UI
                    }
                }
                break;
            default:
                break;
        }
    }

    /**
     * Handles the king's move, including castling.
     *
     * @param {string} piece - The king piece being moved.
     * @param {number} x - The target x-coordinate.
     * @param {number} y - The target y-coordinate.
     */
    function handleKingMove(piece, x, y) {
        // Castling conditions
        if (piece === "wking" && selectedPiece.x === 7 && selectedPiece.y === 4) {
            if (y === 6 && positions[7][6] === null && positions[7][7] === "wrook") {
                updateWhiteKingPos(x, y);
                performMove(piece, x, y, "right");
                return;
            } else if (y === 2 && positions[7][2] === null && positions[7][0] === "wrook") {
                updateWhiteKingPos(x, y);
                performMove(piece, x, y, "left");
                return;
            }
        }

        if (piece === "bking" && selectedPiece.x === 0 && selectedPiece.y === 4) {
            if (y === 6 && positions[0][6] === null && positions[0][7] === "brook") {
                updateBlackKingPos(x, y);
                performMove(piece, x, y, "right");
                return;
            } else if (y === 2 && positions[0][2] === null && positions[0][0] === "brook") {
                updateBlackKingPos(x, y);
                performMove(piece, x, y, "left");
                return;
            }
        }

        // Regular king move validation
        if (kingValid(positions, x, y, turn, selectedPiece, turn === "white" ? whiteKing : blackKing, null, null, null, null, null, null)) {
            performMove(piece, x, y, "regular");
        }
    }

    /**
     * Performs the move by updating the board positions and game state.
     *
     * @param {string} piece - The piece being moved.
     * @param {number} x - The target x-coordinate.
     * @param {number} y - The target y-coordinate.
     * @param {string|null} moveType - Type of move (e.g., "left", "right", "regular").
     */
    function performMove(piece, x, y, moveType) {
        setPositions(prevPositions => {
            const newPositions = prevPositions.map(row => [...row]);
            newPositions[x][y] = piece;
            newPositions[selectedPiece.x][selectedPiece.y] = null;

            if (moveType === "left") {
                // Move rook during castling
                if (piece === "wking") {
                    newPositions[7][3] = "wrook";
                    newPositions[7][0] = null;
                } else if (piece === "bking") {
                    newPositions[0][3] = "brook";
                    newPositions[0][0] = null;
                }
            } else if (moveType === "right") {
                // Move rook during castling
                if (piece === "wking") {
                    newPositions[7][5] = "wrook";
                    newPositions[7][7] = null;
                } else if (piece === "bking") {
                    newPositions[0][5] = "brook";
                    newPositions[0][7] = null;
                }
            }

            return newPositions;
        });

        // Record the move immutably
        setMoveArr(prevMoves => [
            ...prevMoves,
            createMoveRecord(piece, x, y, moveType)
        ]);

        // Switch turn
        setTurn(prevTurn => (prevTurn === "white" ? "black" : "white"));
    }

    /**
     * Creates a move record for logging purposes.
     *
     * @param {string} piece - The piece being moved.
     * @param {number} x - The target x-coordinate.
     * @param {number} y - The target y-coordinate.
     * @param {string|null} moveType - Type of move.
     * @returns {Object} - The move record.
     */
    function createMoveRecord(piece, x, y, moveType) {
        if (moveType === "left" || moveType === "right") {
            return {
                beforeX: selectedPiece.x,
                beforeY: selectedPiece.y,
                piece: piece,
                moveType: moveType,
                x: x,
                y: y
            };
        } else {
            return {
                beforeX: selectedPiece.x,
                beforeY: selectedPiece.y,
                piece: piece,
                x: x,
                y: y
            };
        }
    }

    return (
        <>
            <div id='app'>
                <Board
                    blackKing={blackKing}
                    whiteKing={whiteKing}
                    setKingPos={null} // Removed as kingPos is no longer used
                    updatePositions={updatePositions}
                    positions={positions}
                    setPositions={setPositions}
                    selected={selected}
                    setSelected={setSelected}
                    setSelectedPiece={setSelectedPiece}
                    selectedPiece={selectedPiece}
                />
                <button id='reset' onClick={reset}>Reset</button>
                <button id='save' onClick={saveBoard}>Save</button>
                <Link href="http://localhost:3001/games">
                    Get Games
                </Link>
                {/* Promotion Modal */}
                {promotion && (
                    <div className='prom'>
                        <PromotionPawn onPieceSelected={(piece) => {
                            setSelectedPiece({ ...selectedPiece, piece });
                            setPromotion(false);
                        }} />
                    </div>
                )}
                {/* Display Check and Checkmate Status */}
                {checkKing && (
                    <div className='status'>
                        {isCheckMate ? "Checkmate!" : "Check!"}
                    </div>
                )}
            </div>
        </>
    );
}

export default Main;
