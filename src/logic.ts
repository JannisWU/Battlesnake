import { addSyntheticLeadingComment } from "typescript"
import { InfoResponse, GameState, MoveResponse, Game, Coord } from "./types"

export function info(): InfoResponse {
    console.log("INFO")
    const response: InfoResponse = {
        apiversion: "1",
        author: "",
        color: "#d37b00",
        head: "sand-worm",
        tail: "comet"
    }
    return response
}

export function start(gameState: GameState): void {
    console.log(`${gameState.game.id} START`)
}

export function end(gameState: GameState): void {
    console.log(`${gameState.game.id} END\n`)
}

export function move(gameState: GameState): MoveResponse {
    let possibleMoves: { [key: string]: boolean } = {
        up: true,
        down: true,
        left: true,
        right: true
    }

    // Step 0: Don't let your Battlesnake move back on it's own neck
    const myHead = gameState.you.head
    const myNeck = gameState.you.body[1]
    const boardWidth = gameState.board.width
    const boardHeight = gameState.board.height
    const minWidth = 0
    const minHeight = 0


    if (myNeck.x < myHead.x) {
        possibleMoves.left = false
    } 
    if (myNeck.x > myHead.x) {
        possibleMoves.right = false
    }
    if (myNeck.y < myHead.y) {
        possibleMoves.down = false
    }
    if (myNeck.y > myHead.y) {
        possibleMoves.up = false
    } 

    // TODO: Step 1 - Don't hit walls.
    // Use information in gameState to prevent your Battlesnake from moving beyond the boundaries of the board.
    // const boardWidth = gameState.board.width
    // const boardHeight = gameState.board.height
    possibleMoves = avoidWalls(myHead, boardWidth, possibleMoves, boardHeight, minWidth, minHeight)

    // TODO: Step 2 - Don't hit yourself.
    // Use information in gameState to prevent your Battlesnake from colliding with itself.
    // const mybody = gameState.you.body
    possibleMoves = avoidMe(gameState, myHead, possibleMoves)

    // TODO: Step 3 - Don't collide with others.
    // Use information in gameState to prevent your Battlesnake from colliding with others.
    possibleMoves = avoidOtherSnakes(gameState, myHead, possibleMoves)
    
    // Avoiding Hazards
    possibleMoves = avoidHazards(gameState, myHead, possibleMoves)
    

    // TODO: Step 4 - Find food.
    // Use information in gameState to seek out and find food.
    const foods = gameState.board.food
    const hunger = gameState.you.health
    
    let chasetail: boolean = false
    let hungermode: boolean = false
        if (hunger < 5) {
            hungermode = true
        }
    
    possibleMoves = findFood(gameState, hungermode, foods, myHead, possibleMoves)

    
    // implementing a smarter Movement
    if (hunger > 5){
        chasetail = true
        const mybody = gameState.you.body
        possibleMoves = avoidWalls(myHead, boardWidth, possibleMoves, boardHeight, minWidth, minHeight)

        if(chasetail = true) {
            if ((mybody.some(Coord => Coord.x === (myHead.x - 1) && Coord.y === myHead.y)) && (mybody.some(Coord => Coord.x  === myHead.x && Coord.y === (myHead.y - 1)))){
                possibleMoves = avoidMe(gameState, myHead, possibleMoves)
            }  else if (mybody.some(Coord => Coord.x === (myHead.x - 1) && Coord.y === myHead.y)){
                possibleMoves.right = false 
                possibleMoves.left = false
                possibleMoves.up = false 
            } 

            if ((mybody.some(Coord => Coord.x === (myHead.x + 1) && Coord.y === myHead.y)) && (mybody.some(Coord => Coord.x  === myHead.x && Coord.y === (myHead.y - 1)))){
                possibleMoves = avoidMe(gameState, myHead, possibleMoves)
            } else if (mybody.some(Coord => Coord.x  === myHead.x && Coord.y === (myHead.y - 1))){
                possibleMoves.up = false 
                possibleMoves.down = false
                possibleMoves.left = false 
            } 

            if ((mybody.some(Coord => Coord.x === (myHead.x - 1) && Coord.y === myHead.y)) && (mybody.some(Coord => Coord.x === myHead.x && Coord.y === (myHead.y + 1)))){
                possibleMoves = avoidMe(gameState, myHead, possibleMoves) 
            } else if (mybody.some(Coord => Coord.x === myHead.x && Coord.y === (myHead.y + 1))){
                possibleMoves.up = false 
                possibleMoves.down = false
                possibleMoves.right = false 
            } 

            if ((mybody.some(Coord => Coord.x === (myHead.x + 1) && Coord.y === myHead.y)) &&  (mybody.some(Coord => Coord.x === myHead.x && Coord.y === (myHead.y + 1)))){
                possibleMoves = avoidMe(gameState, myHead, possibleMoves) 
            } else if (mybody.some(Coord => Coord.x === (myHead.x + 1) && Coord.y === myHead.y)){
                possibleMoves.left = false 
                possibleMoves.right = false
                possibleMoves.down = false
            }
            
            
        }
        
        
    }
    

    


    //angular tour of heroes 

    // Finally, choose a move from the available safe moves.
    // TODO: Step 5 - Select a move to make based on strategy, rather than random.
    const safeMoves = Object.keys(possibleMoves).filter(key => possibleMoves[key])
    const response: MoveResponse = {
        move: safeMoves[Math.floor(Math.random() * safeMoves.length)],
    }

    console.log(`${gameState.game.id} MOVE ${gameState.turn}: ${response.move}`)
    return response
 
    
}

function findFood(gameState: GameState, hungermode: boolean, foods: Coord[], myHead: Coord, possibleMoves: { [key: string]: boolean }): { [key: string]: boolean } {
    if (gameState.board.food.length != 0 && hungermode === true) {
        let isRight: boolean = false
        let isLeft: boolean = false
        let isUp: boolean = false
        let isDown: boolean = false



        if (foods[0].x > myHead.x) {
            isRight = true
        } else if (foods[0].x < myHead.x) {
            isLeft = true
        }

        if (foods[0].y > myHead.y) {
            isUp = true
        } else if (foods[0].y < myHead.y) {
            isDown = true
        }

        if (isRight === true && isUp === true) {
            possibleMoves.left = false
            possibleMoves.down = false
        } else if (isLeft === true && isUp === true) {
            possibleMoves.right = false
            possibleMoves.down = false
        } else if (isRight === true && isDown === true) {
            possibleMoves.left = false
            possibleMoves.up = false
        } else if (isLeft === true && isDown === true) {
            possibleMoves.right = false
            possibleMoves.up = false
        } else if (isRight === true) {
            possibleMoves.left = false
            possibleMoves.down = false
            possibleMoves.up = false
        } else if (isLeft === true) {
            possibleMoves.right = false
            possibleMoves.down = false
            possibleMoves.up = false
        } else if (isUp === true) {
            possibleMoves.left = false
            possibleMoves.down = false
            possibleMoves.right = false
        } else if (isDown === true) {
            possibleMoves.left = false
            possibleMoves.right = false
            possibleMoves.up = false
        }
    }
    return possibleMoves;
}

function movealongWalls(myHead: Coord, boardWidth: number, boardHeight: number, possibleMoves: { [key: string]: boolean }, minWidth: number, minHeight: number):{ [key: string]: boolean } {
    if (myHead.x === (boardWidth - 1) && myHead.y === (boardHeight - 1)) {
        possibleMoves.down = false
        possibleMoves.up = false
        possibleMoves.right = false
    } else if (myHead.x === (boardWidth - 1)) {
        possibleMoves.down = false
        possibleMoves.left = false
        possibleMoves.right = false
    } else if (myHead.x === (minWidth) && myHead.y === (boardHeight - 1)) {
        possibleMoves.right = false
        possibleMoves.up = false
        possibleMoves.left = false
    } else if (myHead.y === (boardHeight - 1)) {
        possibleMoves.right = false
        possibleMoves.up = false
        possibleMoves.down = false
    } else if (myHead.x === (minWidth) && myHead.y === minHeight) {
        possibleMoves.up = false
        possibleMoves.down = false
        possibleMoves.left = false
    } else if (myHead.x === (minWidth)) {
        possibleMoves.up = false
        possibleMoves.right = false
        possibleMoves.left = false
    } else if (myHead.x === (boardWidth - 1) && myHead.y === minHeight) {
        possibleMoves.left = false
        possibleMoves.right = false
        possibleMoves.down = false
    } else if (myHead.y === (minHeight)) {
        possibleMoves.left = false
        possibleMoves.up = false
        possibleMoves.down = false
    }
    return possibleMoves;
}

function avoidWalls(myHead: Coord, boardWidth: number, possibleMoves: { [key: string]: boolean }, boardHeight: number, minWidth: number, minHeight: number): { [key: string]: boolean } {
    if (myHead.x === (boardWidth - 1)) {
        possibleMoves.right = false
    }
    if (myHead.y === (boardHeight - 1)) {
        possibleMoves.up = false
    }
    if (myHead.x === minWidth) {
        possibleMoves.left = false
    }
    if (myHead.y === minHeight) {
        possibleMoves.down = false
    }
    if (myHead.y === 0 && myHead.x === 0) {
        possibleMoves.down = false
        possibleMoves.left = false
    }
    if (myHead.y === (boardHeight - 1) && myHead.x === 0) {
        possibleMoves.left = false
        possibleMoves.up = false
    }
    if (myHead.y === (boardHeight - 1) && myHead.x === (boardWidth - 1)) {
        possibleMoves.right = false
        possibleMoves.up = false
    }
    if (myHead.y === 0 && myHead.x === (boardWidth - 1)) {
        possibleMoves.down = false
        possibleMoves.right = false
    }
    return possibleMoves;
}

function avoidHazards(gameState: GameState, myHead: Coord, possibleMoves: { [key: string]: boolean }) {
    const boardHazard = gameState.board.hazards

    if (boardHazard.some(Coord => Coord.x === (myHead.x + 1) && Coord.y === myHead.y)) {
        possibleMoves.right = false
    }
    if (boardHazard.some(Coord => Coord.x === (myHead.x - 1) && Coord.y === myHead.y)) {
        possibleMoves.left = false
    }
    if (boardHazard.some(Coord => Coord.x === myHead.x && Coord.y === (myHead.y - 1))) {
        possibleMoves.down = false
    }
    if (boardHazard.some(Coord => Coord.x === myHead.x && Coord.y === (myHead.y + 1))) {
        possibleMoves.up = false
    }
    return possibleMoves;
}

function avoidMe(gameState: GameState, myHead: Coord, possibleMoves: { [key: string]: boolean }):{ [key: string]: boolean } {
    const mybody = gameState.you.body

    if (mybody.some(Coord => Coord.x === (myHead.x + 1) && Coord.y === myHead.y)) {
        possibleMoves.right = false
    }
    if (mybody.some(Coord => Coord.x === (myHead.x - 1) && Coord.y === myHead.y)) {
        possibleMoves.left = false
    }
    if (mybody.some(Coord => Coord.x === myHead.x && Coord.y === (myHead.y - 1))) {
        possibleMoves.down = false
    }
    if (mybody.some(Coord => Coord.x === myHead.x && Coord.y === (myHead.y + 1))) {
        possibleMoves.up = false
    }
    return possibleMoves;
}

function avoidOtherSnakes(gameState: GameState, myHead: Coord, possibleMoves: { [key: string]: boolean }):{ [key: string]: boolean } {
    const boardSnakes = gameState.board.snakes

    for (var i = 0; i < boardSnakes.length; i++) {
        const boardSnake = boardSnakes[i]

    if (boardSnake.body.some(Coord => Coord.x === (myHead.x + 1) && Coord.y === myHead.y)) {
        possibleMoves.right = false
    }
    if (boardSnake.body.some(Coord => Coord.x === (myHead.x - 1) && Coord.y === myHead.y)) {
        possibleMoves.left = false
    }
    if (boardSnake.body.some(Coord => Coord.x === myHead.x && Coord.y === (myHead.y - 1))) {
        possibleMoves.down = false
    }
    if (boardSnake.body.some(Coord => Coord.x === myHead.x && Coord.y === (myHead.y + 1))) {
        possibleMoves.up = false
    }
    }
    return possibleMoves;
}

