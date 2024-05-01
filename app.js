/* Selectors ----------------------------------- */
function $(cssSelector){return document.querySelector(cssSelector)}
function $$$(cssSelectorAll){return document.querySelectorAll(cssSelectorAll)}

const gameContainer = $(".gameContainer")
const startButton = $("#startGame")
const stopButton = $("#stopGame")

startButton.addEventListener('click', () => {startGame()})
stopButton.addEventListener('click', () => {stopGame()})

document.onkeydown = function(e){
    if (gameLive){
        if (e.key === "ArrowLeft"){
            moveLeft()
        } else if (e.key === "ArrowRight"){
            moveRight()
        } else if (e.key === "ArrowUp")
            // drawGrid()
            moveRotate(currentShape)
    }
}

/* Listeners----------------------------------- */



/* Shapes ----------------------------------- */


const grid = [
    // [0,0,0,0,0,0,0,0,0,0], // 0 -- hidden  
    [0,0,0,0,0,0,0,0,0,0], // 0 
    [0,0,0,0,0,0,0,0,0,0], // 1
    [0,0,0,0,0,0,0,0,0,0], // 2
    [0,0,0,0,0,0,0,0,0,0], // 3
    [0,0,0,0,0,0,0,0,0,0], // 4
    [0,0,0,0,0,0,0,0,0,0], // 5
    [0,0,0,0,0,0,0,0,0,0], // 6
    [0,0,0,0,0,0,0,0,0,0], // 7
    [0,0,0,0,0,0,0,0,0,0], // 8
    [0,0,0,0,0,0,0,0,0,0], // 9
]

const shapeI = [
    [0,0,0,0],
    [0,0,0,0],
    [1,1,1,1],
    [0,0,0,0]
]

const shapeT = [
    [0,1,0],
    [1,1,1],
    [0,0,0]
]

const shapeS = [
    [0,1,1],
    [1,1,0],
    [0,0,0]
]

const shapeZ = [
    [1,1,0],
    [0,1,1],
    [0,0,0]
]


let currentShape = shapeT
let rowPos = 0
let colPos = 0
let newGame = true
let canMove = true
let gameTimer
let gameLive
let newShapeStatus = true



/* Functions ----------------------------------- */

// gameLoop()

function drawGrid (){
    gameContainer.innerHTML=''
    grid.forEach((row)=>{
        row.forEach((col)=>{
            if (col === 0) {gameContainer.innerHTML += '<div class = "tile"></div>'} 
            else {gameContainer.innerHTML += '<div class = "tetromino"></div>'}
        })
    })
}

function moveDown (){
    // check for collisions
    // if collisions found, and pieces can't move, then freeze all tiles on grid

    // if pieces can move, then move pieces down
    canMove = true
    checkCollision()
    if (canMove){
        for (let row = grid.length-1; row >= 0; row-- ){
            for (let col = 0; col < grid[row].length; col++){
                if (grid[row][col] > 0 && grid[row][col] < 11){
                    grid[row+1][col] = grid[row][col]
                    grid[row][col] = 0
                }
                // console.log(col)
            }
        }
        rowPos++
    }
}
    
function gameLoop(){
        // console.log('looprun')
        // console.log(currentShape)
        if (newShapeStatus = false) {addShape()}
        drawGrid()
        moveDown()
        gameTimer = setTimeout(gameLoop,250)
    }

function moveLeft(){
    canMove=true
    // checkCollision()

    // check if user is against the left side
    for (let row = grid.length-1; row >= 0; row--){
        for (let col = 0; col < grid[row].length; col++){
            if (grid[row][col] > 0 && grid[row][col] < 11){
                if (col===0){
                    canMove = false
                }
            }
        }
    }

    if (canMove){
        for (let row = grid.length-1; row >= 0; row-- ){
            for (let col = 0; col < grid[row].length; col++){
                if (grid[row][col] > 0 && grid[row][col] < 11){
                    grid[row][col-1] = grid[row][col]
                    grid[row][col] = 0
                }
            }
        }
        colPos--
    }
}

function moveRight (){
    canMove=true
    // checkCollision()
    // check if user is against the left side
    for (let row = grid.length-1; row >= 0; row--){
        for (let col = 0; col < grid[row].length; col++){
            if (grid[row][col] > 0 && grid[row][col] < 11){
                if (col===9){
                    canMove = false
                }
            }
        }
    }

    if (canMove){
        for (let row = grid.length-1; row >= 0; row-- ){
            for (let col = grid[row].length-1; col >=0; col--){
                if (grid[row][col] > 0 && grid[row][col] < 11){
                    grid[row][col+1] = grid[row][col]
                    grid[row][col] = 0
                }
            }
        }
        colPos++
    }
}

function moveRotate(shape){
    canMove=true
    checkCollision()
    if (canMove){
        const tempShape = Array.from({length: shape[0].length}, () => new Array (shape.length).fill(0))
        currentShape = tempShape
        for (let y = 0; y < shape.length; y++){
            for (let x = 0; x < shape[0].length; x++){
                tempShape[x][y] = shape[y][x]
            }
        }
        tempShape.forEach((item)=>item.reverse()) // this is rotated shape

        // find the position of the current shape and replace it
        for (let y = rowPos; y < rowPos+tempShape.length; y++){
            for (let x = colPos; x < colPos+tempShape[0].length; x++){
                grid[y][x] = tempShape[y - rowPos][x - colPos];
                // x - colPos starts at index -2 which will start at index 0 in the block array
            }
        }
    }
    drawGrid()
}

function checkCollision (){
    // check for tiles in last row
    // check for tiles blocked by frozen tiles
    for (let row = grid.length-1; row >= 0; row-- ){
        for (let col = 0; col < grid[row].length; col++){
            if (grid[row][col] > 0 && grid[row][col] < 11){ // if a number is found
                if (row === grid.length-1 || grid[row+1][col] === 11) {
                    console.log('collisions found')
                    freeze()
                }
            }
        }
    }
}

function addShape(){
    rowPos = 0
    colPos = 3 
    addShapeStatus = true
    // select a new shape from 7 options. Rotate them accordingly

    // Current shape becomes this shape

    let shapeNum = Math.floor((Math.random()*7)+1)

    if (shapeNum === 1){currentShape = shapeT}
    else if (shapeNum === 2){currentShape = shapeS}
    else if (shapeNum === 3){currentShape = shapeI}
    else if (shapeNum === 4){currentShape = shapeZ}


    // check if there's space to add a piece
    for (let y = rowPos; y < currentShape.length-1; y++){
        for (let x = colPos; x <colPos+currentShape[0].length; x++){
            if (grid[y][x] > 0){
                stopGame()
                }
        }
    }
    // if there's space, then add a piece

    for (let y = rowPos; y < currentShape.length-1; y++){
        for (let x = colPos; x <colPos+currentShape[0].length; x++){
            grid[y][x] = currentShape[y - rowPos][x - colPos]
            console.log('shape added')
            // x - colPos starts at index -2 which will start at index 0 in the block array
        }
    }

    drawGrid()
}

function stopGame() {
    console.log('gamestopped')
    gameLive = false
    clearTimeout(gameTimer)
}

function startGame() {
    gameLive = true
    addShape()
    gameLoop()
}

function freeze(){
    grid.forEach((row,rowInd)=>{
        row.forEach((col,colInd)=>{
            if (grid[rowInd][colInd] > 0 && grid[rowInd][colInd] < 11) {
            grid[rowInd][colInd] = 11
            }
        })
    })
    addShapeStatus = false
}

// function checkLose()


// }


/* Notes ---- 

// create a gameloop
    // recreate grid based off array
    // move tiles down
    // check for FULL lines

// create the array map
// create an html container / grid based off the map
    // color the tiles
    // select the game container in the HTML

// Movement
    // move tiles down
    // move tiles left (user input)
    // move tiles right (user input)
    // move tiles right (user input) 
    
// randomize shapes that come out
 
    
    
    */



