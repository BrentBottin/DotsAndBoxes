let currentPlayer = 0; // Player 1 starts as 'blue'
let playerColors = { 0: 'blue', 1: 'red' };
let lightPlayerColors = { 0: 'lightblue', 1: 'pink' }
let playerScores = { 0: 0, 1: 0 };
let gameRepresentation = { horizontals: [], verticals: [], boxes: [], size: 0 };
let gameMode = "PvP"
let htlmElementToRepresentationLink = { horizontals: [], verticals: [], boxes: [] };

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('start-game-btn').addEventListener('click', function () {
        document.getElementById('game').style.display = 'block'; // Show the game
        this.style.display = 'none'; // Hide the start button after the game starts
        document.getElementById('grid-size').style.display = 'none';
        document.getElementById('game-mode').style.display = 'none';
        document.querySelector('label[for="grid-size"]').style.display = 'none';
        document.querySelector('label[for="game-mode"]').style.display = 'none';
        document.getElementById('restart-game-btn').style.display = 'inline-block';
        document.getElementById('main-menu-btn').style.display = 'inline-block';
        initGame()
    });

    document.getElementById('restart-game-btn').addEventListener('click', function () {
        initGame();
        playerScores = { 0: 0, 1: 0 };
        currentPlayer = 0; // Player 1 starts as 'blue'
        updateScoreDisplay()
        updateturnDisplay()
    })

    document.getElementById('main-menu-btn').addEventListener('click', function () {
        location.reload();
    })
});

function initGame() {
    const gridSizeSelector = document.getElementById('grid-size');
    const gameModeSelector = document.getElementById('game-mode');
    const gameBoard = document.getElementById('game-board');
    const gridSize = parseInt(gridSizeSelector.value);
    generateGridRepresentation(gridSize, gameBoard);
    const gameMode = gameModeSelector.value;
    if (gameMode === "PvP") {
        gamePvP()
    } else {
        gamePvE()
    }
}

function gamePvE() {
    // initialize event listeners for turns
    const verticalLines = document.querySelectorAll('.line-vertical');
    verticalLines.forEach(line => {
        line.addEventListener('click', function () {
            logicPvE(line, "vertical")
        });
    });

    const horizontalLines = document.querySelectorAll('.line-horizontal');
    horizontalLines.forEach(line => {
        line.addEventListener('click', function () {
            logicPvE(line, "horizontal")
        });
    });
}

function logicPvE(line, orientation) {
    // If the line is already colored, ignore further clicks
    if (line.style.backgroundColor) return;

    // Set the line color based on the current player
    line.style.backgroundColor = playerColors[currentPlayer];
    const currentMove = parseInt(line.getAttribute('data-index'), 10);
    if (orientation === "vertical") {
        gameRepresentation.verticals[currentMove] = 1
    } else {
        gameRepresentation.horizontals[currentMove] = 1
    }

    if (!checkCompletedBoxes()) {
        currentPlayer = currentPlayer === 0 ? 1 : 0;
    }

    if (isGameFinished()) {
        showWinnerPopup(checkWinner())
    }

    updateturnDisplay()

    while (currentPlayer == 1) {
        makeAIMove();
        if (isGameFinished()) {
            showWinnerPopup(checkWinner())
        }
    }

    updateturnDisplay()
}

function makeAIMove() {
    let [currentMoveOrientation, currentMoveLocation] = ai(gameRepresentation);
    if (currentMoveOrientation == "horizontal") {
        gameRepresentation.horizontals[currentMoveLocation] = 1;
        htlmElementToRepresentationLink.horizontals[currentMoveLocation].style.backgroundColor = playerColors[currentPlayer];
    } else {
        gameRepresentation.verticals[currentMoveLocation] = 1;
        htlmElementToRepresentationLink.verticals[currentMoveLocation].style.backgroundColor = playerColors[currentPlayer];
    }

    if (!checkCompletedBoxes()) {
        currentPlayer = currentPlayer === 0 ? 1 : 0;
    }

    updateturnDisplay()
}

// Initialize game logic
function gamePvP() {
    // initialize event listeners for turns
    const verticalLines = document.querySelectorAll('.line-vertical');
    verticalLines.forEach(line => {
        line.addEventListener('click', function () {
            logicPvP(line, "vertical")
        });
    });

    const horizontalLines = document.querySelectorAll('.line-horizontal');
    horizontalLines.forEach(line => {
        line.addEventListener('click', function () {
            logicPvP(line, "horizontal")
        });
    });
}

function logicPvP(line, orientation) {
    // If the line is already colored, ignore further clicks
    if (line.style.backgroundColor) return;

    // Set the line color based on the current player
    line.style.backgroundColor = playerColors[currentPlayer];
    const currentMove = parseInt(line.getAttribute('data-index'), 10);
    if (orientation === "vertical") {
        gameRepresentation.verticals[currentMove] = 1
    } else {
        gameRepresentation.horizontals[currentMove] = 1
    }

    if (!checkCompletedBoxes()) {
        currentPlayer = currentPlayer === 0 ? 1 : 0;
    }

    updateturnDisplay()
}

function isGameFinished() {
    if (gameRepresentation.boxes.indexOf(-1) === -1) {
        return true;
    }
    return false;
}

function checkWinner() {
    const evaulation = gameRepresentation.boxes.filter(num => num === 0).length - gameRepresentation.boxes.filter(num => num === 1).length;
    if (evaulation > 0) {
        return 0
    }
    return 1
}

function showWinnerPopup(winner) {
    const popup = document.getElementById('winnerPopup');
    const winnerMessage = document.getElementById('winnerMessage');

    // Set the winner message
    if (winner === 0) {
        winnerMessage.textContent = "Player 1 Wins!";
        popup.style.color = playerColors[winner]
    } else if (winner === 1) {
        winnerMessage.textContent = "Player 2 Wins!";
        popup.style.color = playerColors[winner]
    } else {
        winnerMessage.textContent = "It's a Draw!";
    }

    // Display the popup
    popup.style.display = 'block';
}

// Close the popup when the close button is clicked
document.getElementById('closePopup').onclick = function () {
    document.getElementById('winnerPopup').style.display = 'none';
};

// Close the popup when clicking outside the popup content
window.onclick = function (event) {
    const popup = document.getElementById('winnerPopup');
    if (event.target === popup) {
        popup.style.display = 'none';
    }
};


function checkCompletedBoxes() {
    let completedBox = false;
    const size = gameRepresentation.size;
    for (let i = 0; i < size - 1; i++) {
        for (let j = 0; j < size - 1; j++) {
            const currentBoxIndex = j * (size - 1) + i;

            // Check if the box is filled
            if (gameRepresentation.boxes[currentBoxIndex] == -1) {
                if (isBoxFilled(i, j)) {
                    gameRepresentation.boxes[currentBoxIndex] = currentPlayer
                    htlmElementToRepresentationLink.boxes[currentBoxIndex].style.backgroundColor = lightPlayerColors[currentPlayer]
                    playerScores[currentPlayer] += 1
                    updateScoreDisplay()
                    completedBox = true;
                }
            }
        }
    }
    return completedBox
}

function isBoxFilled(x, y) {
    const size = gameRepresentation.size;
    // Check if all four sides of the box are filled
    const horizontalLines = gameRepresentation.horizontals;
    const verticalLines = gameRepresentation.verticals;

    const topFilled = horizontalLines[x + y * (size - 1)]; // top line
    const leftFilled = verticalLines[x + y * size]; // left line
    const bottomFilled = horizontalLines[x + (y + 1) * (size - 1)]; // bottom line
    const rightFilled = verticalLines[(x + 1) + y * size]; // right line

    const total = topFilled + leftFilled + bottomFilled + rightFilled

    if (total == 4) {
        return true
    } else {
        return false
    }
}

function updateScoreDisplay() {
    // Update the score display
    document.getElementById('player1-score').innerText = `Player 1 Score: ${playerScores[0]}`;
    document.getElementById('player2-score').innerText = `Player 2 Score: ${playerScores[1]}`;
}

function updateturnDisplay() {
    // Update the current turn display
    document.getElementById('current-turn').innerText = `Current Turn: Player ${currentPlayer + 1} `;
    document.getElementById('current-turn').style.backgroundColor = playerColors[currentPlayer];
    document.getElementById('current-turn').style.border = `1px solid ${playerColors[currentPlayer]}`;
}

function generateGridRepresentation(size, gameBoard) {
    // Clear the previous grid
    gameBoard.innerHTML = '';
    gameRepresentation = { horizontals: new Array(size * (size - 1)).fill(0), verticals: new Array(size * (size - 1)).fill(0), boxes: new Array((size - 1) * (size - 1)).fill(-1), size: size };
    htlmElementToRepresentationLink = { horizontals: new Array(size * (size - 1)).fill(null), verticals: new Array(size * (size - 1)).fill(null), boxes: new Array((size - 1) * (size - 1)).fill(null) };
    document.getElementById('game').style.width = `${75 * size}px`
    document.getElementById('game').style.minWidth = `${75 * size}px`

    const cellSize = 70; // Each box/line/dot will occupy 50x50px space
    const gridSizePx = (size - 1) * cellSize; // Total grid size

    // Set the width and height of the game board
    gameBoard.style.width = `${gridSizePx}px`;
    gameBoard.style.height = `${gridSizePx}px`;

    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            const x = i * cellSize;
            const y = j * cellSize;

            // Add a dot at every grid intersection
            const dot = document.createElement('div');
            dot.classList.add('dot');
            dot.style.left = `${x}px`;
            dot.style.top = `${y}px`;
            gameBoard.appendChild(dot);

            // Add horizontal lines between dots
            if (i < size - 1) {
                const lineHorizontal = document.createElement('div');
                lineHorizontal.classList.add('line-horizontal');
                lineHorizontal.style.left = `${x + 7}px`;
                lineHorizontal.style.top = `${y + 7}px`;
                gameBoard.appendChild(lineHorizontal);
                lineHorizontal.setAttribute('data-index', j * (size - 1) + i);
                htlmElementToRepresentationLink.horizontals[j * (size - 1) + i] = lineHorizontal;
            }

            // Add vertical lines between dots
            if (j < size - 1) {
                const lineVertical = document.createElement('div');
                lineVertical.classList.add('line-vertical');
                lineVertical.style.left = `${x + 7}px`;
                lineVertical.style.top = `${y + 7}px`;
                gameBoard.appendChild(lineVertical);
                lineVertical.setAttribute('data-index', j * (size) + i);
                htlmElementToRepresentationLink.verticals[j * (size) + i] = lineVertical;
            }

            // Add boxes between the lines
            if (i < size - 1 && j < size - 1) {
                const box = document.createElement('div');
                box.classList.add('box');
                box.style.left = `${x + 10}px`;
                box.style.top = `${y + 10}px`;
                gameBoard.appendChild(box);
                htlmElementToRepresentationLink.boxes[j * (size - 1) + i] = box
            }
        }
    }
}




