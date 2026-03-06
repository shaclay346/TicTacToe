import { useState } from 'react';

type CellValue = 'X' | 'O' | '';
type Player = 'X' | 'O';
type GameResult = Player | 'tie';
type Board = CellValue[][];

const scores: Record<GameResult, number> = {
    X: -1,
    O: 1,
    tie: 0,
};

function createEmptyBoard(): Board {
    return [
        ['', '', ''],
        ['', '', ''],
        ['', '', ''],
    ];
}

function allEqual(a: CellValue, b: CellValue, c: CellValue): boolean {
    return a !== '' && a === b && b === c;
}

function openSpots(board: Board): boolean {
    return board.some(row => row.some(cell => cell === ''));
}

function isBoardEmpty(board: Board): boolean {
    return board.every(row => row.every(cell => cell === ''));
}

function checkWinner(board: Board): GameResult | null {
    // check rows
    for (let i = 0; i < 3; i++) {
        if (allEqual(board[i][0], board[i][1], board[i][2])) return board[i][0] as Player;
    }
    // check columns
    for (let j = 0; j < 3; j++) {
        if (allEqual(board[0][j], board[1][j], board[2][j])) return board[0][j] as Player;
    }
    // check diagonals
    if (allEqual(board[0][0], board[1][1], board[2][2])) return board[1][1] as Player;
    if (allEqual(board[0][2], board[1][1], board[2][0])) return board[1][1] as Player;

    if (!openSpots(board)) return 'tie';
    return null;
}

// minimax explores all future game states and returns the best score for the current player.
// board is mutated in place but each cell is always reset after recursion.
function minimax(board: Board, isAiTurn: boolean): number {
    const result = checkWinner(board);
    if (result !== null) return scores[result];

    if (isAiTurn) {
        let highScore = -Infinity;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (board[i][j] === '') {
                    board[i][j] = 'O';
                    const score = minimax(board, false);
                    board[i][j] = '';
                    if (score > highScore) highScore = score;
                }
            }
        }
        return highScore;
    } else {
        let highScore = Infinity;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (board[i][j] === '') {
                    board[i][j] = 'X';
                    const score = minimax(board, true);
                    board[i][j] = '';
                    if (score < highScore) highScore = score;
                }
            }
        }
        return highScore;
    }
}

// returns a new board with the AI's best move applied
function bestMove(board: Board): Board {
    const workingBoard = board.map(row => [...row]) as Board;
    let highScore = -Infinity;
    let move: { i: number; j: number } | undefined;

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (workingBoard[i][j] === '') {
                workingBoard[i][j] = 'O';
                // if this is an immediate winning move, play it now
                if (checkWinner(workingBoard) === 'O') return workingBoard;
                const score = minimax(workingBoard, false);
                workingBoard[i][j] = '';
                if (score > highScore) {
                    highScore = score;
                    move = { i, j };
                }
            }
        }
    }

    if (move !== undefined) {
        workingBoard[move.i][move.j] = 'O';
    }
    return workingBoard;
}

// hard-coded optimal AI first move to avoid the ~5 second minimax calculation on an empty board
function aiFirstMove(board: Board): Board {
    const newBoard = board.map(row => [...row]) as Board;
    if (newBoard[0][0] !== '' || newBoard[0][2] !== '' || newBoard[2][0] !== '' || newBoard[2][2] !== '') {
        newBoard[1][1] = 'O';
    } else if (newBoard[1][2] !== '') {
        newBoard[0][2] = 'O';
    } else if (newBoard[2][1] !== '') {
        newBoard[0][1] = 'O';
    } else {
        newBoard[0][0] = 'O';
    }
    return newBoard;
}

export default function App() {
    const [board, setBoard] = useState<Board>(createEmptyBoard());
    const [gameResult, setGameResult] = useState<GameResult | null>(null);

    function handleSquareClick(i: number, j: number) {
        if (gameResult !== null || board[i][j] !== '') return;

        // place human's move
        const boardAfterHuman = board.map(row => [...row]) as Board;
        boardAfterHuman[i][j] = 'X';

        const resultAfterHuman = checkWinner(boardAfterHuman);
        if (resultAfterHuman !== null) {
            setBoard(boardAfterHuman);
            setGameResult(resultAfterHuman);
            return;
        }

        // AI responds — use the hard-coded first move if this was the human's first turn
        const boardAfterAI = isBoardEmpty(board)
            ? aiFirstMove(boardAfterHuman)
            : bestMove(boardAfterHuman);

        const resultAfterAI = checkWinner(boardAfterAI);
        setBoard(boardAfterAI);
        if (resultAfterAI !== null) {
            setGameResult(resultAfterAI);
        }
    }

    function handleNewGame() {
        setBoard(createEmptyBoard());
        setGameResult(null);
    }

    function handleAIFirst() {
        setBoard(aiFirstMove(createEmptyBoard()));
        setGameResult(null);
    }

    return (
        <div>
            <div className="header">
                <h1 id="colorDisplay">
                    <span>Tic Tac Toe</span>
                </h1>
            </div>

            <section id="stripe">
                <button className="selected" id="reset" onClick={handleNewGame}>New Game</button>
                <button className="selected" id="AI" onClick={handleAIFirst}>AI first</button>
            </section>

            <div>
                <p className="displayText" id="message">
                    {gameResult === 'tie' ? 'Tie!' : gameResult ? `${gameResult} Wins!` : ''}
                </p>
            </div>

            <div id="container">
                {board.map((row, i) =>
                    row.map((cell, j) => (
                        <div
                            key={`${i}-${j}`}
                            className="square"
                            onClick={() => handleSquareClick(i, j)}
                        >
                            {cell && <p>{cell}</p>}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
