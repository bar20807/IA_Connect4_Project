const io = require('socket.io-client')
const URL = "http://192.168.1.131:4000"
const socket = io(URL)

socket.on('connect', () => {
    console.log("Connected to server")

    socket.emit('signin', {
        user_name: "hvhProplayer",
        tournament_id: 142857,
        user_role: 'player'
    })
})

socket.on('ok_signin', () => {
    console.log("Login")
})

// Función principal para generar el movimiento utilizando el algoritmo de poda alfa-beta
function generateMove(board, playerTurnID) {
  const maxDepth = 6; // Profundidad máxima de búsqueda del algoritmo
  const alpha = -Infinity;
  const beta = Infinity;

  // Duplicar el tablero para no modificar el estado original
  const boardCopy = [...board.map((row) => [...row])];

  // Obtener el índice de la columna con el mejor movimiento
  const columnIndex = minimax(boardCopy, maxDepth, alpha, beta, true, playerTurnID).columnIndex;

  return columnIndex;
}

// Función de evaluación heurística para evaluar el estado del tablero
function evaluateBoard(board, playerTurnID) {
  const opponentID = playerTurnID === 1 ? 2 : 1;
  let score = 0;

  // Calcular puntuación horizontal
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 4; col++) {
      const window = [board[row][col], board[row][col + 1], board[row][col + 2], board[row][col + 3]];
      score += evaluateWindow(window, playerTurnID, opponentID);
    }
  }

  // Calcular puntuación vertical
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 7; col++) {
      const window = [board[row][col], board[row + 1][col], board[row + 2][col], board[row + 3][col]];
      score += evaluateWindow(window, playerTurnID, opponentID);
    }
  }

  // Calcular puntuación en diagonales ascendentes
  for (let row = 3; row < 6; row++) {
    for (let col = 0; col < 4; col++) {
      const window = [board[row][col], board[row - 1][col + 1], board[row - 2][col + 2], board[row - 3][col + 3]];
      score += evaluateWindow(window, playerTurnID, opponentID);
    }
  }

  // Calcular puntuación en diagonales descendentes
  for (let row = 3; row < 6; row++) {
    for (let col = 3; col < 7; col++) {
      const window = [board[row][col], board[row - 1][col - 1], board[row - 2][col - 2], board[row - 3][col - 3]];
      score += evaluateWindow(window, playerTurnID, opponentID);
    }
  }

  return score;
}

// Función de evaluación para una ventana de 4 fichas
function evaluateWindow(window, playerTurnID, opponentID) {
  let score = 0;

  // Puntuación del jugador actual
  if (window.filter((cell) => cell === playerTurnID).length === 4) {
    score += 100;
  } else if (window.filter((cell) => cell === playerTurnID).length === 3 && window.filter((cell) => cell === 0).length === 1) {
    score += 5;
  } else if (window.filter((cell) => cell === playerTurnID).length === 2 && window.filter((cell) => cell === 0).length === 2) {
    score += 2;
  }

  // Puntuación del oponente
  if (window.filter((cell) => cell === opponentID).length === 3 && window.filter((cell) => cell === 0).length === 1) {
    score -= 4;
  }

  return score;
}

// Función para realizar la poda alfa-beta y encontrar el mejor movimiento
function minimax(board, depth, alpha, beta, maximizingPlayer, playerTurnID) {
  const availableMoves = getAvailableMoves(board);
  let bestMove = null;

  if (depth === 0 || availableMoves.length === 0) {
    const score = evaluateBoard(board, playerTurnID);
    return { score };
  }

  if (maximizingPlayer) {
    let maxScore = -Infinity;

    for (let move of availableMoves) {
      const newBoard = makeMove(board, move, playerTurnID);
      const result = minimax(newBoard, depth - 1, alpha, beta, false, playerTurnID);
      const score = result.score;

      if (score > maxScore) {
        maxScore = score;
        bestMove = move;
      }

      alpha = Math.max(alpha, maxScore);

      if (alpha >= beta) {
        break;
      }
    }

    return { score: maxScore, columnIndex: bestMove };
  } else {
    let minScore = Infinity;

    for (let move of availableMoves) {
      const newBoard = makeMove(board, move, playerTurnID === 1 ? 2 : 1);
      const result = minimax(newBoard, depth - 1, alpha, beta, true, playerTurnID);
      const score = result.score;

      if (score < minScore) {
        minScore = score;
        bestMove = move;
      }

      beta = Math.min(beta, minScore);

      if (alpha >= beta) {
        break;
      }
    }

    return { score: minScore, columnIndex: bestMove };
  }
}

// Función para obtener los movimientos disponibles en el tablero
function getAvailableMoves(board) {
  const availableMoves = [];

  for (let col = 0; col < 7; col++) {
    if (board[0][col] === 0) {
      availableMoves.push(col);
    }
  }

  return availableMoves;
}

// Función para realizar un movimiento en el tablero
function makeMove(board, columnIndex, playerTurnID) {
  const newBoard = [...board.map((row) => [...row])];

  for (let row = 5; row >= 0; row--) {
    if (newBoard[row][columnIndex] === 0) {
      newBoard[row][columnIndex] = playerTurnID;
      break;
    }
  }

  return newBoard;
}


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