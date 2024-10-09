let currentPlayer = 0; // Player 1 starts as 'blue'
let playerColors = { 0: 'blue', 1: 'red' };
let lightPlayerColors = { 0: 'lightblue', 1: 'pink' }
let playerScores = { 0: 0, 1: 0 };
let gameRepresentation = { horizontals: [], verticals: [], boxes: [], size: 0 };
htlmElementToRepresentationLink = { boxes: [] }

document.addEventListener('DOMContentLoaded', () => {
    const gridSizeSelector = document.getElementById('grid-size');
    const gameBoard = document.getElementById('game-board');

    // Generate the initial grid (default to 7x7)
    generateGridRepresentation(7, gameBoard);

    // Generate the grid when the page loads or when the grid size changes
    gridSizeSelector.addEventListener('change', () => {
        const gridSize = parseInt(gridSizeSelector.value);
        generateGridRepresentation(gridSize, gameBoard);
        initGame()
    });

    initGame()
});

// Initialize game logic
function initGame() {
    // initialize event listeners for turns
    const verticalLines = document.querySelectorAll('.line-vertical');
    verticalLines.forEach(line => {
        line.addEventListener('click', function () {
            // If the line is already colored, ignore further clicks
            if (this.style.backgroundColor) return;

            // Set the line color based on the current player
            this.style.backgroundColor = playerColors[currentPlayer];
            const currentMove = parseInt(this.getAttribute('data-index'), 10);
            gameRepresentation.verticals[currentMove] = 1

            if (!checkCompletedBoxes()) {
                currentPlayer = currentPlayer === 0 ? 1 : 0;
            }

            updateturnDisplay()
        });
    });

    const horizontalLines = document.querySelectorAll('.line-horizontal');
    horizontalLines.forEach(line => {
        line.addEventListener('click', function () {
            // If the line is already colored, ignore further clicks
            if (this.style.backgroundColor) return;

            // Set the line color based on the current player
            this.style.backgroundColor = playerColors[currentPlayer];
            const currentMove = parseInt(this.getAttribute('data-index'), 10);
            gameRepresentation.horizontals[currentMove] = 1

            if (!checkCompletedBoxes()) {
                currentPlayer = currentPlayer === 0 ? 1 : 0;
            }

            updateturnDisplay()
        });
    });
}

function checkCompletedBoxes() {
    let completedBox = false;
    const size = gameRepresentation.size;
    for (let i = 0; i < size - 1; i++) {
        for (let j = 0; j < size - 1; j++) {
            const currentBoxIndex = j * (size - 1) + i;

            // Check if the box is filled
            if (isBoxFilled(i, j)) {
                if (gameRepresentation.boxes[currentBoxIndex] == -1) {
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
    htlmElementToRepresentationLink = { horizontals: [], verticals: [] }
    htlmElementToRepresentationLink = { boxes: new Array((size - 1) * (size - 1)).fill(null) }
    document.getElementById('game').style.width = `${5 * size}%`

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
            }

            // Add vertical lines between dots
            if (j < size - 1) {
                const lineVertical = document.createElement('div');
                lineVertical.classList.add('line-vertical');
                lineVertical.style.left = `${x + 7}px`;
                lineVertical.style.top = `${y + 7}px`;
                gameBoard.appendChild(lineVertical);
                lineVertical.setAttribute('data-index', j * (size) + i);
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


