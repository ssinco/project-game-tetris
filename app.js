/* Selectors ----------------------------------- */
function $(cssSelector){return document.querySelector(cssSelector)}
function $$$(cssSelectorAll){return document.querySelectorAll(cssSelectorAll)}

const gameContainer = $(".gameContainer")

document.onkeydown = function(e){
    console.log(e)
    if (e.key === "ArrowLeft"){
        moveLeft()
    } else if (e.key === "ArrowRight"){
        moveRight()
    } else if (e.key === "ArrowUp")
        drawGrid()
        moveRotate(currentShape)
}

/* Shapes ----------------------------------- */


const grid = [
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
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

let currentShape = shapeT
let rowPos = 0
let colPos = 0
let newGame = true
let canMove = true

/* Functions ----------------------------------- */

gameLoop()

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
    
    for (let row = grid.length-1; row >= 0; row-- ){
        for (let col = 0; col < grid[row].length; col++){
            if (grid[row][col] > 0 && grid[row][col] < 11){
                grid[row+1][col] = grid[row][col]
                grid[row][col] = 0
            }
        }
    }
    rowPos++

    drawGrid()
}
    

function gameLoop(){

        console.log('looprun')
        if (newGame){
            addShape()
            newGame=false
        }
        moveDown()
        drawGrid()
        setTimeout(gameLoop,1000)
    }

function moveRotate(shape){

    drawGrid()
    const tempShape = Array.from({length: shape[0].length}, () => new Array (shape.length).fill(0))
    for (let y = 0; y < shape.length; y++){
        for (let x = 0; x < shape[0].length; x++){
            tempShape[x][y] = shape[y][x]
        }
    }
    tempShape.forEach((item)=>item.reverse()) // this is rotated shape
    currentShape = tempShape
    // find the position of the current shape and replace it
    console.log('rowPos = '+rowPos)
    console.log('colPos = '+colPos)
    for (let y = rowPos; y < tempShape.length+1; y++){
        for (let x = colPos; x < colPos+tempShape[0].length; x++){
            grid[y][x] = tempShape[y - rowPos][x - colPos];
            // x - colPos starts at index -2 which will start at index 0 in the block array
        }
    }
    drawGrid()
    // console.log(currentShape)
    // return shape
}

// function moveRotate(shape){
//     const tempShape = Array.from({length: shape[0].length}, () => new Array (shape.length).fill(0))

//     for (let y = 0; y < shape.length; y++){
//         for (let x = 0; x < shape[0].length; x++){
//             tempShape[x][y] = shape[y][x]
//         }
//     }
//     tempShape.forEach((item)=>item.reverse())

//     shape = tempShape
//     return shape
// }

function addShape(){
    rowPos = 0
    colPos = 3 
    for (let y = rowPos; y < shapeT.length; y++){
        for (let x = colPos; x <colPos+shapeT[0].length; x++){
            grid[y][x] = shapeT[y - rowPos][x - colPos];
            // x - colPos starts at index -2 which will start at index 0 in the block array
        }
    }
}


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
