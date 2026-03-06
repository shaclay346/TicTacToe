type Player = 'X' | 'O';
type GameResult = Player | 'tie';

const scores: Record<GameResult, number> = {
    // human is X
    X: -1,
    // AI is O so they should have the highest score
    O: 1,
    tie: 0
};

let isAITurn = false;
const winnerText = document.getElementById('message') as HTMLElement;

// helper function to determine if three squares all hold the same value
function allEqual(spot1: HTMLElement, spot2: HTMLElement, spot3: HTMLElement): boolean {
    return spot1.innerText === spot2.innerText &&
        spot2.innerText === spot3.innerText &&
        spot1.innerText !== '';
}

// returns true if there are any open spots remaining
function openSpots(board: HTMLElement[][]): boolean {
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (board[i][j].innerText === '') {
                return true;
            }
        }
    }
    return false;
}

// returns true if the board is empty, else returns false
function isBoardEmpty(board: HTMLElement[][]): boolean {
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (board[i][j].innerText !== '') {
                return false;
            }
        }
    }
    return true;
}

function getBoard(): HTMLElement[][] {
    const squares = document.querySelectorAll<HTMLElement>('.square');
    return [
        [squares[0], squares[1], squares[2]],
        [squares[3], squares[4], squares[5]],
        [squares[6], squares[7], squares[8]]
    ];
}

// determines and plays the best possible move for the AI
function bestMove(board: HTMLElement[][]): void {
    let highScore = -Infinity;
    let move: { i: number; j: number } | undefined;

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            // if the spot is empty
            if (board[i][j].innerText === '') {
                // play for the AI at every spot
                board[i][j].innerText = 'O';

                // if the AI can win just make the winning play and don't even bother calling minimax.
                // without this the AI would make unnecessary moves (it would still win the game with those moves) but would
                // make a move that results in more future wins, rather than just winning faster.
                if (checkWinner() === 'O') {
                    board[i][j].innerHTML = '<p>O</p>';
                    displayWinner('O');
                    return;
                }

                // call minimax to find the best possible move
                const score = minimax(board, false);
                isAITurn = false;

                board[i][j].innerHTML = '';
                // if the score returned is higher than highScore, update it.
                // whichever score is highest is the best possible move that results in
                // the most wins for the AI
                if (score > highScore) {
                    highScore = score;
                    move = { i, j };
                }
            }
        }
    }

    const winner = checkWinner();
    if (winner === null) {
        if (move !== undefined) {
            board[move.i][move.j].innerHTML = '<p>O</p>';
            // if the previous move was the winning play check winner again
            const newWinner = checkWinner();
            if (newWinner !== null) {
                displayWinner(newWinner);
            }
        }
    } else {
        displayWinner(winner);
    }
}

// to save on runtime, I hard coded the first move of the AI.
// it is still playing the most efficient move, just not doing any
// calculation since the first move was taking upwards of 5 seconds to play.
function determineAIFirstMove(board: HTMLElement[][]): void {
    if (board[0][0].innerHTML !== '' || board[0][2].innerHTML !== '' ||
        board[2][0].innerHTML !== '' || board[2][2].innerHTML !== '') {
        board[1][1].innerHTML = '<p>O</p>';
    } else if (board[1][2].innerHTML !== '') {
        board[0][2].innerHTML = '<p>O</p>';
    } else if (board[2][1].innerHTML !== '') {
        board[0][1].innerHTML = '<p>O</p>';
    } else {
        board[0][0].innerHTML = '<p>O</p>';
    }
}

// minimax fills out the full board for all potential AI moves
// and returns the score if the AI wins that game
function minimax(board: HTMLElement[][], isAiTurn: boolean): number {
    const result = checkWinner();

    // if there was a winner or a tie
    if (result !== null) {
        return scores[result];
    }

    if (isAiTurn) {
        let highScore = -Infinity;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (board[i][j].innerText === '') {
                    board[i][j].innerText = 'O';
                    const score = minimax(board, false);
                    board[i][j].innerText = '';
                    if (score > highScore) {
                        highScore = score;
                    }
                }
            }
        }
        return highScore;
    } else {
        let highScore = Infinity;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (board[i][j].innerText === '') {
                    board[i][j].innerText = 'X';
                    const score = minimax(board, true);
                    board[i][j].innerText = '';
                    if (score < highScore) {
                        highScore = score;
                    }
                }
            }
        }
        return highScore;
    }
}

function displayWinner(winner: GameResult): void {
    if (winner === 'tie') {
        winnerText.innerText = "Tie!";
    } else {
        winnerText.innerText = `${winner} Wins!`;
    }
}

// after a player makes their turn, use this to determine if someone won the game
function checkWinner(): GameResult | null {
    const squares = document.querySelectorAll<HTMLElement>('.square');
    const board: HTMLElement[][] = [
        [squares[0], squares[1], squares[2]],
        [squares[3], squares[4], squares[5]],
        [squares[6], squares[7], squares[8]]
    ];

    // check all horizontal spots
    for (let i = 0; i < 3; i++) {
        if (allEqual(board[i][0], board[i][1], board[i][2])) {
            return board[i][0].innerText as Player;
        }
    }

    // check vertical spots
    for (let i = 0; i < 3; i++) {
        if (allEqual(board[0][i], board[1][i], board[2][i])) {
            return board[0][i].innerText as Player;
        }
    }

    // check diagonal spots
    if (allEqual(board[0][0], board[1][1], board[2][2])) {
        return board[1][1].innerText as Player;
    }
    if (allEqual(board[0][2], board[1][1], board[2][0])) {
        return board[1][1].innerText as Player;
    }

    // if there is no winner and the board is full, it's a tie
    if (!openSpots(board)) {
        return 'tie';
    }

    return null;
}

// wipes the board and starts a new game with the user going first
function newGame(): void {
    const squares = document.querySelectorAll('.square');
    squares.forEach(item => {
        item.innerHTML = '';
    });
    winnerText.innerText = '';
    isAITurn = false;
}

const aiButton = document.getElementById('AI') as HTMLElement;
aiButton.addEventListener('click', () => {
    newGame();
    determineAIFirstMove(getBoard());
});

const container = document.getElementById('container') as HTMLElement;
container.addEventListener('click', function (e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (target.className === 'square') {
        isAITurn = true;

        const winner = checkWinner();
        if (winner) {
            displayWinner(winner);
        } else {
            if (isBoardEmpty(getBoard())) {
                target.innerHTML = '<p>X</p>';
                determineAIFirstMove(getBoard());
            } else {
                target.innerHTML = '<p>X</p>';
                bestMove(getBoard());
            }
        }
    }
});

const newButton = document.getElementById('reset') as HTMLElement;
newButton.addEventListener('click', function () {
    newGame();
});
