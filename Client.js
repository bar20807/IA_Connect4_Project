const io = require('socket.io-client')
const URL = "http://192.168.1.134:4000"
const socket = io(URL)

socket.on('connect', () => {
    console.log("Connected to server")

    socket.emit('signin', {
        user_name: "hvhProplayer",
        tournament_id: 142857,
        user_role: 'player'
    })
})

function alphabeta(board, depth, player, maximizingPlayer) {
  if (depth === 0 || isGameOver(board, player)) {
    return evaluateBoard(board, player);
  }

  const moves = getPossibleMoves(board, player);
  let bestMove = -infinity;
  let bestScore = -infinity;

  moves.forEach((move) => {
    const newBoard = makeMove(board, move, player);
    const moveScore = alphabeta(newBoard, depth - 1, player, !maximizingPlayer);

    if (moveScore > bestScore) {
      bestScore = moveScore;
      bestMove = move;
    }

    if (maximizingPlayer) {
      const alphabetaScore = alphabeta(newBoard, depth - 1, player, true);
      const betaScore = alphabetaScore + (bestScore - alphabetaScore) / 2;

      if (betaScore > bestScore) {
        bestScore = betaScore;
        bestMove = move;
      }
    }
  });

  return bestScore;
}


function generateMove(board, player) {
  let bestMove = -1;
  let bestScore = -infinity;

  // Implementa la lógica de búsqueda utilizando la función alphabeta
  const score = alphabeta(board, 3, player, true);

  if (score !== -infinity) {
    bestMove = score;
    bestScore = score;
  }

  return bestMove;
}



socket.on('ok_signin', () => {
    console.log("Login")
})

socket.on('ready', function(data){
    var gameID = data.game_id;
    var playerTurnID = data.player_turn_id;
    var board = data.board;
  });

  socket.on('finish', function(data){
    var gameID = data.game_id;
    var playerTurnID = data.player_turn_id;
    var winnerTurnID = data.winner_turn_id;
    var board = data.board;
  });

  socket.on('ready', function(data){
    var gameID = data.game_id;
    var playerTurnID = data.player_turn_id;
    var board = data.board;

    console.log("Soy el jugador: ", playerTurnID)
    console.log("Soy el board: ", board)
    
    // TODO: Your logic / user input here
    const move = generateMove(board, playerTurnID);
    socket.emit('play', {
      tournament_id: 142857,
      player_turn_id: playerTurnID,
      game_id: gameID,
      movement: move
    });
  });

  socket.on('finish', function(data){
    var gameID = data.game_id;
    var playerTurnID = data.player_turn_id;
    var winnerTurnID = data.winner_turn_id;
    var board = data.board;
    
    console.log(board)
    console.log("El jugador ganador es: ",winnerTurnID)

    // Utiliza la función generateMove para obtener el mejor movimiento para el jugador actual
    const move = generateMove(board, playerTurnID);
    

    // TODO: Your cleaning board logic here
    console.log(winnerTurnID)
    console.log(board)
    socket.emit('player_ready', {
      tournament_id: 142857,
      player_turn_id: playerTurnID,
      game_id: gameID,
      movement: move
    });
  });