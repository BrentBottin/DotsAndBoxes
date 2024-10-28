function ai(gameRepresentation) {
    return playSophisticatedHeuristics(gameRepresentation);
}

// full minimax
function playMinimax(gameRepresentation) {
    const unfilledLines = getAllUnfilledLines(gameRepresentation);

    if (unfilledLines.length < 14) {
        evaluation = minimax(gameRepresentation, 20, true, -Infinity, Infinity, 1);
        console.log("final move: " + evaluation.move)
        return evaluation.move
    }

    let boxScores = calculateBoxScores(gameRepresentation)
    const check2BoxScores = check2Scores(boxScores);
    const box2Lines = getUnfilled2BoxLines(check2BoxScores, gameRepresentation);
    const choosableLines = unfilledLines.filter(line =>
        !box2Lines.some(boxLine =>
            boxLine[0] === line[0] && boxLine[1] === line[1]
        )
    );

    const randomIndex = Math.floor(Math.random() * choosableLines.length);
    return choosableLines[randomIndex];
}

function minimax(gameRepresentation, depth, isMaximizingPlayer, alpha, beta, player) {
    // Terminal condition: max depth or no more moves
    if (depth === 0 || isGameOver(gameRepresentation)) {
        return { evaluation: evaluateGameRepresentation(gameRepresentation, 1) };
    }

    let possibleMoves = getAllUnfilledLines(gameRepresentation); // get possible moves
    let bestMove = null; // Track the best move

    if (isMaximizingPlayer) {
        let maxEval = -Infinity;
        for (let move of possibleMoves) {
            let newGameRepresentation = cloneGameRepresentation(gameRepresentation);

            applyMove(newGameRepresentation, move, player); // Apply the move to the game state

            let eval = minimax(newGameRepresentation, depth - 1, false, alpha, beta, 0);

            if (eval.evaluation > maxEval) {
                maxEval = eval.evaluation;
                bestMove = move; // Track the best move
            }
            alpha = Math.max(alpha, eval.evaluation);
            if (beta <= alpha) {
                break; // Alpha cut-off
            }
        }
        return { move: bestMove, evaluation: maxEval };;
    } else {
        let minEval = Infinity;
        for (let move of possibleMoves) {
            let newGameRepresentation = cloneGameRepresentation(gameRepresentation);
            applyMove(newGameRepresentation, move, player); // Apply move for opponent

            let eval = minimax(newGameRepresentation, depth - 1, true, alpha, beta, 1);

            if (eval.evaluation < minEval) {
                minEval = eval.evaluation;
                bestMove = move; // Track the best move
            }
            beta = Math.min(beta, eval.evaluation);
            if (beta <= alpha) {
                break; // Beta cut-off
            }
        }
        return { move: bestMove, evaluation: minEval };
    }
}

// heuristic minimax
function playSophisticatedHeuristics(gameRepresentation) {
    let boxScores = calculateBoxScores(gameRepresentation)

    const check3BoxIndex = check3Scores(boxScores);
    if (check3BoxIndex != -1) {
        return fillBoxSide(check3BoxIndex, gameRepresentation);
    }

    const check2BoxScores = check2Scores(boxScores);
    const box2Lines = getUnfilled2BoxLines(check2BoxScores, gameRepresentation);
    const unfilledLines = getAllUnfilledLines(gameRepresentation);

    const choosableLines = unfilledLines.filter(line =>
        !box2Lines.some(boxLine =>
            boxLine[0] === line[0] && boxLine[1] === line[1]
        )
    );

    if (choosableLines.length == 0) {
        evaluation = heuristicminimax(gameRepresentation, 20, true, -Infinity, Infinity, 1);
        console.log("final move: " + evaluation.move)
        return evaluation.move;
    }

    const randomIndex = Math.floor(Math.random() * choosableLines.length);
    return choosableLines[randomIndex];
}

function cloneGameRepresentation(gameRepresentation) {
    return {
        horizontals: [...gameRepresentation.horizontals],
        verticals: [...gameRepresentation.verticals],
        boxes: [...gameRepresentation.boxes],
        size: gameRepresentation.size
    };
}

function evaluateGameRepresentation(gameRepresentation, player) {
    const { boxes } = gameRepresentation
    const otherPlayer = player === 0 ? 1 : 0;
    const evaulation = boxes.filter(num => num === player).length - boxes.filter(num => num === otherPlayer).length;
    return evaulation
}

function applyMove(gameRepresentation, move, player) {
    let [currentMoveOrientation, currentMoveLocation] = move;
    if (currentMoveOrientation == "horizontal") {
        gameRepresentation.horizontals[currentMoveLocation] = 1;
    } else {
        gameRepresentation.verticals[currentMoveLocation] = 1;
    }
    checkBoxUpdate(gameRepresentation, player);
}

function checkBoxUpdate(gameRepresentation, currentPlayer) {
    const size = gameRepresentation.size;
    for (let i = 0; i < size - 1; i++) {
        for (let j = 0; j < size - 1; j++) {
            const currentBoxIndex = j * (size - 1) + i;

            // Check if the box is filled
            if (gameRepresentation.boxes[currentBoxIndex] == -1) {
                if (checkBoxFilled(i, j, gameRepresentation)) {
                    gameRepresentation.boxes[currentBoxIndex] = currentPlayer
                }
            }
        }
    }
}

function checkBoxFilled(x, y, gameRepresentation) {
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

function isGameOver(gameRepresentation) {
    if (gameRepresentation.boxes.indexOf(-1) === -1) {
        return true
    }
    return false;
}

function heuristicminimax(gameRepresentation, depth, isMaximizingPlayer, alpha, beta, player) {
    // Terminal condition: max depth or no more moves
    if (depth === 0 || isGameOver(gameRepresentation)) {
        return { evaluation: evaluateGameRepresentation(gameRepresentation, 1) };
    }

    let heuristicGameRepresentation = cloneGameRepresentation(gameRepresentation);
    const boxScores = calculateBoxScores(heuristicGameRepresentation);
    const check3BoxIndex = check3Scores(boxScores);
    if (check3BoxIndex != -1) {
        const move = fillBoxSide(check3BoxIndex, heuristicGameRepresentation);
        applyMove(heuristicGameRepresentation, move, player)
        return heuristicminimax(heuristicGameRepresentation, depth, isMaximizingPlayer, alpha, beta, player);
    }

    let possibleMoves = getAllUnfilledLines(heuristicGameRepresentation); // get possible moves
    let bestMove = null; // Track the best move

    if (isMaximizingPlayer) {
        let maxEval = -Infinity;
        for (let move of possibleMoves) {
            let newGameRepresentation = cloneGameRepresentation(heuristicGameRepresentation);

            applyMove(newGameRepresentation, move, player); // Apply the move to the game state

            let eval = heuristicminimax(newGameRepresentation, depth - 1, false, alpha, beta, 0);

            if (eval.evaluation > maxEval) {
                maxEval = eval.evaluation;
                bestMove = move; // Track the best move
            }
            alpha = Math.max(alpha, eval.evaluation);
            if (beta <= alpha) {
                break; // Alpha cut-off
            }
        }
        return { move: bestMove, evaluation: maxEval };;
    } else {
        let minEval = Infinity;
        for (let move of possibleMoves) {
            let newGameRepresentation = cloneGameRepresentation(heuristicGameRepresentation);
            applyMove(newGameRepresentation, move, player); // Apply move for opponent

            let eval = heuristicminimax(newGameRepresentation, depth - 1, true, alpha, beta, 1);

            if (eval.evaluation < minEval) {
                minEval = eval.evaluation;
                bestMove = move; // Track the best move
            }
            beta = Math.min(beta, eval.evaluation);
            if (beta <= alpha) {
                break; // Beta cut-off
            }
        }
        return { move: bestMove, evaluation: minEval };
    }
}


// simpleHeuristics
function playSimpleHeuristics(gameRepresentation) {
    let boxScores = calculateBoxScores(gameRepresentation)

    const check3BoxIndex = check3Scores(boxScores);
    if (check3BoxIndex != -1) {
        return fillBoxSide(check3BoxIndex, gameRepresentation);
    }

    const check2BoxScores = check2Scores(boxScores);
    const box2Lines = getUnfilled2BoxLines(check2BoxScores, gameRepresentation);
    const unfilledLines = getAllUnfilledLines(gameRepresentation);

    const choosableLines = unfilledLines.filter(line =>
        !box2Lines.some(boxLine =>
            boxLine[0] === line[0] && boxLine[1] === line[1]
        )
    );

    if (choosableLines.length == 0) {
        return playRandom(gameRepresentation);
    }

    const randomIndex = Math.floor(Math.random() * choosableLines.length);
    return choosableLines[randomIndex];
}

function fillBoxSide(boxNumber, gameRepresentation) {
    const { horizontals, verticals, size } = gameRepresentation;

    const x = Math.floor(boxNumber / (size - 1));
    const y = boxNumber % (size - 1);

    const topFilled = horizontals[x + y * (size - 1)]; // top line
    const leftFilled = verticals[x + y * size]; // left line
    const bottomFilled = horizontals[x + (y + 1) * (size - 1)]; // bottom line
    const rightFilled = verticals[(x + 1) + y * size]; // right line

    const lines = [
        { line: topFilled, orientation: 'horizontal', index: x + y * (size - 1) },
        { line: leftFilled, orientation: 'vertical', index: x + y * size },
        { line: bottomFilled, orientation: 'horizontal', index: x + (y + 1) * (size - 1) },
        { line: rightFilled, orientation: 'vertical', index: (x + 1) + y * size }
    ];

    // Filter only the lines that are 0 (unfilled)
    const unfilledLines = lines.filter(lineObj => lineObj.line === 0);
    return [unfilledLines[0].orientation, unfilledLines[0].index];
}

function getUnfilled2BoxLines(box2Scores, gameRepresentation) {
    const { horizontals, verticals, size } = gameRepresentation;

    const unfilledLines = [];

    // Iterate over each box index in box2Scores
    box2Scores.forEach(boxIndex => {
        const x = Math.floor(boxIndex / (size - 1));
        const y = boxIndex % (size - 1);

        // Get the four lines corresponding to this box
        const topFilled = horizontals[x + y * (size - 1)]; // top line
        const leftFilled = verticals[x + y * size]; // left line
        const bottomFilled = horizontals[x + (y + 1) * (size - 1)]; // bottom line
        const rightFilled = verticals[(x + 1) + y * size]; // right line

        // Check for unfilled lines and add to the unfilledLines array
        if (topFilled === 0) unfilledLines.push(['horizontal', x + y * (size - 1)]);
        if (leftFilled === 0) unfilledLines.push(['vertical', x + y * size]);
        if (bottomFilled === 0) unfilledLines.push(['horizontal', x + (y + 1) * (size - 1)]);
        if (rightFilled === 0) unfilledLines.push(['vertical', (x + 1) + y * size]);
    });

    return unfilledLines;
}

function check3Scores(boxScores) {
    return boxScores.indexOf(3);
}

function check2Scores(boxScores) {
    return boxScores
        .map((value, index) => (value === 2 ? index : -1)) // Map values to their index if they are 2, otherwise -1
        .filter(index => index !== -1); // Filter out the -1 values
}

function calculateBoxScores(gameRepresentation) {
    const { size } = gameRepresentation;
    let boxScores = new Array((size - 1) * (size - 1)).fill(0);
    for (let i = 0; i < (size - 1) * (size - 1); i++) {
        boxScores[i] = calculateBoxScore(i, gameRepresentation);
    }
    return boxScores;
}

function calculateBoxScore(boxNumber, gameRepresentation) {
    const { horizontals, verticals, size } = gameRepresentation;

    const x = Math.floor(boxNumber / (size - 1));
    const y = boxNumber % (size - 1);

    const topFilled = horizontals[x + y * (size - 1)]; // top line
    const leftFilled = verticals[x + y * size]; // left line
    const bottomFilled = horizontals[x + (y + 1) * (size - 1)]; // bottom line
    const rightFilled = verticals[(x + 1) + y * size]; // right line

    return topFilled + leftFilled + bottomFilled + rightFilled;
}


// play random
function playRandom(gameRepresentation) {
    const unfilledLines = getAllUnfilledLines(gameRepresentation);
    const randomIndex = Math.floor(Math.random() * unfilledLines.length);
    return unfilledLines[randomIndex];
}


// helper functions




function getAllUnfilledLines(gameRepresentation) {
    const { horizontals, verticals } = gameRepresentation;
    const unfilledLines = [];

    horizontals.forEach((line, index) => {
        if (line === 0) { // Line is unfilled
            unfilledLines.push(['horizontal', index]);
        }
    });

    verticals.forEach((line, index) => {
        if (line === 0) { // Line is unfilled
            unfilledLines.push(['vertical', index]);
        }
    });

    return unfilledLines
}



gameRepresentationTest = {
    horizontals: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    verticals: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    boxes: [-1, -1, -1, -1, -1, -1, -1, -1, -1],
    size: 4
}

heuristicminimax(gameRepresentationTest, 20, true, -Infinity, Infinity, 1);


