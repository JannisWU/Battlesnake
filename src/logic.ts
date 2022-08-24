import { InfoResponse, GameState, MoveResponse, Game } from "./types"

export function info(): InfoResponse {
    console.log("INFO")
    const response: InfoResponse = {
        apiversion: "1",
        author: "",
        color: "#fff400",
        head: "bendr",
        tail: "skinny"
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
    const boardWidth = gameState.board.width
    const boardHeight = gameState.board.height
    const minWidth = 0
    const minHeight = 0

    if (myHead.x === (boardWidth - 1)){
        possibleMoves.right = false
    }
    if (myHead.y === (boardHeight - 1)){
        possibleMoves.up = false
    }
    if (myHead.x === minWidth){
        possibleMoves.left = false
    }
    if (myHead.y === minHeight){
        possibleMoves.down = false
    }

    

    // TODO: Step 2 - Don't hit yourself.
    // Use information in gameState to prevent your Battlesnake from colliding with itself.
    // const mybody = gameState.you.body
    const mybody = gameState.you.body
    
    if (mybody.some(Coord => Coord.x === (myHead.x + 1) && Coord.y === myHead.y) ){
        possibleMoves.right = false 
    } 
    if (mybody.some(Coord => Coord.x === (myHead.x - 1) && Coord.y === myHead.y)){
        possibleMoves.left = false
    } 
    if (mybody.some(Coord => Coord.x  === myHead.x && Coord.y === (myHead.y - 1))){
        possibleMoves.down = false
    }
    if (mybody.some(Coord => Coord.x === myHead.x && Coord.y === (myHead.y + 1))){
        possibleMoves.up = false
    }

    // TODO: Step 3 - Don't collide with others.
    // Use information in gameState to prevent your Battlesnake from colliding with others.
    const boardSnakes = gameState.board.snakes

    for(var i = 0 ;i < boardSnakes.length; i++) {
        const boardSnake = boardSnakes[i]

    if (boardSnake.body.some(Coord => Coord.x === (myHead.x + 1) && Coord.y === myHead.y ) ){
        possibleMoves.right = false
    } 
    if (boardSnake.body.some(Coord => Coord.x === (myHead.x - 1) && Coord.y === myHead.y)){
        possibleMoves.left = false
    } 
    if (boardSnake.body.some(Coord => Coord.x  === myHead.x && Coord.y === (myHead.y - 1))){
        possibleMoves.down = false
    } 
    if (boardSnake.body.some(Coord => Coord.x === myHead.x && Coord.y === (myHead.y + 1) )){
        possibleMoves.up = false
    }
    }
    

    // TODO: Step 4 - Find food.
    // Use information in gameState to seek out and find food.
    const foods = gameState.board.food

    for(var i = 0; i < foods.length; i++){
        const food = foods[i]
    if (gameState.board.food.length != 0) {
    var isRight: boolean = false
    var isLeft: boolean = false
    var isUp: boolean = false
    var isDown: boolean = false 
    
    if (food.x > myHead.x){
        isRight = true
    } else if (food.x < myHead.x){
        isLeft = true
    } 

    if (food.y > myHead.y){
        isUp = true
    } else if (food.y < myHead.y){
        isDown = true
    }

    if (isRight === true && isUp === true){
        possibleMoves.left = false 
        possibleMoves.down = false
    } else if (isLeft === true && isUp === true){
        possibleMoves.right = false 
        possibleMoves.down = false
    } else if (isRight === true && isDown === true){
        possibleMoves.left = false 
        possibleMoves.up = false
    } else if (isLeft === true && isDown === true){
        possibleMoves.right = false 
        possibleMoves.up = false
    } else if (isRight === true){
        possibleMoves.left = false
        possibleMoves.down = false 
        possibleMoves.up = false
    } else if (isLeft === true){
        possibleMoves.right = false
        possibleMoves.down = false 
        possibleMoves.up = false
    }else if (isUp === true){
        possibleMoves.left = false
        possibleMoves.down = false 
        possibleMoves.right = false
    }else if (isDown === true){
        possibleMoves.left = false
        possibleMoves.right = false 
        possibleMoves.up = false
    }
    
    }
    }
    // Finally, choose a move from the available safe moves.
    // TODO: Step 5 - Select a move to make based on strategy, rather than random.
    const safeMoves = Object.keys(possibleMoves).filter(key => possibleMoves[key])
    const response: MoveResponse = {
        move: safeMoves[Math.floor(Math.random() * safeMoves.length)],
    }

    console.log(`${gameState.game.id} MOVE ${gameState.turn}: ${response.move}`)
    return response
}
