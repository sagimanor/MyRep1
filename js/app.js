'use strict'

const WALL = 'WALL'
const FLOOR = 'FLOOR'
const BALL = 'BALL'
const GAMER = 'GAMER'
const GLUE = 'GLUE'

const GAMER_IMG = '<img src="img/gamer.png">'
const BALL_IMG = '<img src="img/ball.png">'
const GLUE_IMG = '<img src="img/gamer-purple.png">'

// Model:
var gBoard
var gGamerPos
var gScore = 0
var gBallInterval
var gBallsAround = 0
var gIsGlue = true
var gGlueInterval
var gNeighborsCount

function onInitGame() {
    gGamerPos = { i: 2, j: 9 }
    gBoard = buildBoard()
    renderBoard(gBoard)
    var pos = findEmptyPosRandom(gBoard)
    // console.log('pos', pos)
    gBallInterval = setInterval(() => addRandBall(gBoard), 3000)
    console.log('newBallPos', pos)
    gGlueInterval = setInterval(() => addGlue(gBoard), 5000)
    
}

function buildBoard() {
    const board = []
    // DONE: Create the Matrix 10 * 12 
    // DONE: Put FLOOR everywhere and WALL at edges
    for (var i = 0; i < 10; i++) {
        board[i] = []
        for (var j = 0; j < 12; j++) {
            board[i][j] = { type: FLOOR, gameElement: null }
            if (i === 0 || i === 9 || j === 0 || j === 11) board[i][j].type = WALL
        }
    }
    // DONE: Place the gamer and two balls
    board[gGamerPos.i][gGamerPos.j].gameElement = GAMER
    board[5][5].gameElement = BALL
    board[7][2].gameElement = BALL
    gBallsAround = 2
    board[0][5].type = board[9][5].type = board[5][0].type = board[5][11].type = FLOOR
    return board
}

// Render the board to an HTML table
function renderBoard(board) {

    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n'
        for (var j = 0; j < board[0].length; j++) {
            const currCell = board[i][j]

            var cellClass = getClassName({ i, j }) // 'cell-1-4'

            if (currCell.type === FLOOR) cellClass += ' floor'
            else if (currCell.type === WALL) cellClass += ' wall'

            strHTML += `<td class="cell ${cellClass}"  onclick="onMoveTo(${i},${j})" >`

            if (currCell.gameElement === GAMER) {
                strHTML += GAMER_IMG
            } else if (currCell.gameElement === BALL) {
                strHTML += BALL_IMG
            }

            strHTML += '</td>'
        }
        strHTML += '</tr>'
    }
    const elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML
}

// Move the player to a specific location
function onMoveTo(i, j) {

    if (i === -1) i = gBoard.length - 1
    else if (j === -1) j = gBoard[0].length - 1
    else if (j === gBoard[0].length) j = 0
    else if (i === gBoard.length) i = 0

    const targetCell = gBoard[i][j]
    if (targetCell.type === WALL) return
    // if(targetCell.gameElement === GLUE) 
    // Calculate distance to make sure we are moving to a neighbor cell
    const iAbsDiff = Math.abs(i - gGamerPos.i)
    const jAbsDiff = Math.abs(j - gGamerPos.j)
    // If the clicked Cell is one of the four allowed
    // if ((iAbsDiff === 1 && jAbsDiff === 0) || (jAbsDiff === 1 && iAbsDiff === 0)) {
    if ((iAbsDiff === 1 && jAbsDiff === 0) || (jAbsDiff === 1 && iAbsDiff === 0) || (iAbsDiff === gBoard.length - 1) || (jAbsDiff === gBoard[0].length - 1)) {
        if (targetCell.gameElement === GLUE) {
            onGlue()
        }
        if (targetCell.gameElement === BALL) {
            console.log('Collecting!')
            playSound()
            //update MODEL
            gScore++
            gBallsAround--
            //update DOM
            countScore(gScore)
            if (gBallsAround === 0) {
                return gameOver()
            }
        }

        // REMOVE FROM
        // update MODEL
        gBoard[gGamerPos.i][gGamerPos.j].gameElement = null
        // update DOM
        renderCell(gGamerPos, '')

        // ADD TO
        // update MODEL
        targetCell.gameElement = GAMER
        gGamerPos = { i, j }
        // update DOM
        renderCell(gGamerPos, GAMER_IMG)
        countNeighbors()
    } else {
        console.log('TOO FAR', iAbsDiff, jAbsDiff)
    }

}

// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {
    const cellSelector = '.' + getClassName(location)
    const elCell = document.querySelector(cellSelector)
    elCell.innerHTML = value
}

// Move the player by keyboard arrows
function onHandleKey(event) {
    const i = gGamerPos.i
    const j = gGamerPos.j

    switch (event.key) {
        case 'ArrowLeft':
            onMoveTo(i, j - 1)
            break
        case 'ArrowRight':
            onMoveTo(i, j + 1)
            break
        case 'ArrowUp':
            onMoveTo(i - 1, j)
            break
        case 'ArrowDown':
            onMoveTo(i + 1, j)
            break
    }
}

// Returns the class name for a specific cell
function getClassName(location) {
    const cellClass = 'cell-' + location.i + '-' + location.j
    return cellClass
}

function findEmptyPosRandom() {
    const emptyLocations = []
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            const cell = gBoard[i][j]
            // console.log('cell', cell)
            if (!cell.gameElement && cell.type !== WALL) {
                const pos = { i, j }
                emptyLocations.push(pos)
                // console.log('emptyLocations', emptyLocations)
            }
        }
    }

    const randIdx = getRandomInt(0, emptyLocations.length)
    return emptyLocations[randIdx]

}
// var newBallPos = addRandBall()
// console.log('newBallPos', newBallPos)
function addRandBall() {
    const newBallPos = findEmptyPosRandom()
    console.log('newballpo', newBallPos)
    gBoard[newBallPos.i][newBallPos.j].gameElement = 'BALL'
    gBallsAround++
    countNeighbors()
    //DOM
    renderCell(newBallPos, BALL_IMG)

}

function countScore(score) {
    const elScore = document.querySelector('.score')
    elScore.innerText = score
}

function gameOver() {
    clearInterval(gBallInterval)
    showElement('.victory-container')
}

function onRestartGame() {
    hideElement('.victory-container')
    onInIt()
}

function showElement(selector) {
    const el = document.querySelector(selector)
    el.classList.remove('hide')
}

function hideElement(selector) {
    const el = document.querySelector(selector)
    el.classList.add('hide')
}

function countNeighbors() {
    gNeighborsCount = 0
    for (var i = gGamerPos.i - 1; i <= gGamerPos.i + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = gGamerPos.j - 1; j <= gGamerPos.j + 1; j++) {
            if (i === gGamerPos.i && j === gGamerPos.j) continue
            if (j < 0 || j >= gBoard[i].length) continue
            if (gBoard[i][j].gameElement === BALL) gNeighborsCount++
        }
    }
    const elCountNeighbors = document.querySelector('.neighbour span')
    elCountNeighbors.innerText = gNeighborsCount;
    return gNeighborsCount
}

function addGlue() {
    const newGluePos = findEmptyPosRandom()
    console.log('newGluepos', newGluePos)
    gBoard[newGluePos.i][newGluePos.j].gameElement = 'GLUE'
    countNeighbors()
    gGlueInterval = clearInterval(() => addGlue(gBoard), 3000)

    //DOM
    renderCell(newGluePos, GLUE_IMG)
}

function onGlue() {
    if (gIsGlue) gGamerPos = gGamerPos
    setTimeout(() => onGlue(gBoard), 3000)
}

function playSound() {
    var sound = new Audio('sound/pop.mp3')
    sound.play()
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}