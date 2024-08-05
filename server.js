import express from "express";
import { createServer } from "node:http";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Server } from "socket.io";

const app = express()
const server = createServer(app)

const port = 3000;

app.use(express.static("."));
// app.use(express.static("."));

const io = new Server(server);

// io.on("connection", socket => {
//   socket.emit("hello", "world");

//   socket.on("howdy", arg => {
//     console.log(arg);
//   });
// });

let width = 600;
let height = 480;

let roundDelay = 1500;
let timeToRound = 0;

let paddleWidth = 10;
let paddleHeight = 40;
let paddleOffset = 60;
let paddleSpeed = .25;
const leftPaddleX = paddleOffset;
const rightPaddleX = width - paddleOffset - paddleWidth;

// const ballWidth = 10;
// const ballHeight = 10;

class Player {
  constructor(x, y) {
      this.x = x;
      this.y = y;
      this.direction = 0;
      this.score = 0;
  }
  update(deltaTime) {
      this.y = Math.max(Math.min(this.y + paddleSpeed * this.direction *
          deltaTime, height - paddleHeight), 0);
  }
}

let gamesWaitingForOpponent = [];
let gamesInProgress = [];

let ball = {
  x: 0,
  y: 0,
  speed: .25,
  directionX: 0,
  directionY: 0,
  inPlay: false,
  width: 10,
  height: 10,
  lastHit: "none",
  setInPlay: function(x, y) {
      this.x = width / 2 - this.width / 2;
      this.y = Math.random() * (height - this.height);
      // let angle = Math.random() * 2 * Math.PI;
      this.directionX = Math.sign(Math.random() - .5) * (Math.random() / 2 + .5);
      this.directionY = Math.sign(Math.random() - .5) *
      Math.sqrt(1 - Math.pow(this.directionX, 2));
      this.inPlay = true;
  },
  setOutOfPlay() {
      this.inPlay = false;
      this.lastHit = "none";
  },
  move: function(deltaTime) {
      this.x += this.directionX * this.speed * deltaTime;
      this.y += this.directionY * this.speed * deltaTime;

      if (this.y < 0 || this.y + this.height > height) {
          this.directionY = -this.directionY;
          if (this.y < 0) {
              this.y = -this.y;
          }
          else {
              // this.y = height + height - this.y - this.height;
              // this.y -= 2 * (this.y + this.height - height);
              this.y = height - (this.y + this.height - height) - this.height;
          }
      }
      // let ballVelocityX = this.speed * this.directionX;
      // let ballVelocityYRelativeToLeftPaddle = this.speed * this.directionY - paddleSpeed;
      if (
          this.lastHit != "left" &&
          this.x < playerLeft.x + paddleWidth &&
          this.x > playerLeft.x &&
          this.y + this.height > playerLeft.y &&
          this.y < playerLeft.y + paddleHeight
      ) {
          this.directionX = Math.random() / 2 + .5;
          this.directionY = Math.sign(Math.random() - .5) *
          Math.sqrt(1 - Math.pow(this.directionX, 2));
          this.lastHit = "left";
      }
      if (
          this.lastHit != "right" &&
          this.x + this.width > playerRight.x && 
          this.x + this.width < playerRight.x + paddleWidth &&
          this.y + this.height > playerRight.y &&
          this.y < playerRight.y + paddleHeight
      ) {
          this.directionX = -(Math.random() / 2 + .5);
          this.directionY = Math.sign(Math.random() - .5) *
          Math.sqrt(1 - Math.pow(this.directionX, 2));
          this.lastHit = "right";
      }
  }
}

let playerLeft = new Player(paddleOffset, height / 2 - paddleHeight / 2);
let playerRight = new Player(width - paddleOffset - paddleWidth, height / 2 - paddleHeight / 2);

let player1Side = null;

// let player1Id = null;
// let player2Id = null;

let playerLeftSocket = null;
let playerRightSocket = null;

const __dirname = dirname(fileURLToPath(import.meta.url));

app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "index.html"));
});

// This line allows `<script src="/socket.io/socket.io.js"></script>` in html
// file. Otherwise you get a mime type error.
// https://stackoverflow.com/questions/8689877/cant-find-socket-io-js
io.on('connection', socket => {
  if (gamesWaitingForOpponent.length > 0) {
    let gameWaitingForOpponent = gamesWaitingForOpponent[0];
    let playerLeftSocket;
    let playerRightSocket;
    switch (gameWaitingForOpponent.playerSide) {
      case "left": {
        playerLeftSocket = gameWaitingForOpponent.playerSocket;
        playerRightSocket = socket;
        socket.emit("side", "right");
        break;
      }
      case "right": {
        playerLeftSocket = socket;
        playerRightSocket = gameWaitingForOpponent.playerSocket;
        socket.emit("side", "left");
        break;
      }
    }
    let playerLeft = new Player(paddleOffset, height / 2 - paddleHeight / 2);
    let playerRight = new Player(width - paddleOffset - paddleWidth, height / 2 - paddleHeight / 2);
    let gameState = {
      playerLeft: playerLeft,
      playerRight: playerRight,
      ball: {
        x: 0,
        y: 0,
        speed: .25,
        directionX: 0,
        directionY: 0,
        inPlay: false,
        width: 10,
        height: 10,
        lastHit: "none",
        setInPlay: function(x, y) {
            this.x = width / 2 - this.width / 2;
            this.y = Math.random() * (height - this.height);
            // let angle = Math.random() * 2 * Math.PI;
            this.directionX = Math.sign(Math.random() - .5) * (Math.random() / 2 + .5);
            this.directionY = Math.sign(Math.random() - .5) *
            Math.sqrt(1 - Math.pow(this.directionX, 2));
            this.inPlay = true;
        },
        setOutOfPlay() {
            this.inPlay = false;
            this.lastHit = "none";
        },
        move: function(deltaTime) {
            this.x += this.directionX * this.speed * deltaTime;
            this.y += this.directionY * this.speed * deltaTime;
      
            if (this.y < 0 || this.y + this.height > height) {
                this.directionY = -this.directionY;
                if (this.y < 0) {
                    this.y = -this.y;
                }
                else {
                    // this.y = height + height - this.y - this.height;
                    // this.y -= 2 * (this.y + this.height - height);
                    this.y = height - (this.y + this.height - height) - this.height;
                }
            }
            // let ballVelocityX = this.speed * this.directionX;
            // let ballVelocityYRelativeToLeftPaddle = this.speed * this.directionY - paddleSpeed;
            if (
                this.lastHit != "left" &&
                this.x < playerLeft.x + paddleWidth &&
                this.x > playerLeft.x &&
                this.y + this.height > playerLeft.y &&
                this.y < playerLeft.y + paddleHeight
            ) {
                this.directionX = Math.random() / 2 + .5;
                this.directionY = Math.sign(Math.random() - .5) *
                Math.sqrt(1 - Math.pow(this.directionX, 2));
                this.lastHit = "left";
            }
            if (
                this.lastHit != "right" &&
                this.x + this.width > playerRight.x && 
                this.x + this.width < playerRight.x + paddleWidth &&
                this.y + this.height > playerRight.y &&
                this.y < playerRight.y + paddleHeight
            ) {
                this.directionX = -(Math.random() / 2 + .5);
                this.directionY = Math.sign(Math.random() - .5) *
                Math.sqrt(1 - Math.pow(this.directionX, 2));
                this.lastHit = "right";
            }
        }
      },
      timeToRound: 0
    };
    gamesInProgress.push({
      playerLeftSocket: playerLeftSocket,
      playerRightSocket: playerRightSocket,
      gameState: gameState
    });
    gamesWaitingForOpponent.shift();

    playerLeftSocket.on("input direction", inputDirection => {
      playerLeft.direction = inputDirection;
    });
    playerRightSocket.on("input direction", inputDirection => {
      playerRight.direction = inputDirection;
    });

    startThisGame(gameState, playerLeftSocket, playerRightSocket);
  } else {
    let side = Math.random() < 0.5 ? "left" : "right";
    socket.emit("side", side);
    gamesWaitingForOpponent.push({
      playerSide: side,
      playerSocket: socket
    });
  }
  // if (player1Side == null) {
  //   playerLeftSocket = socket;
  //   player1Side = "left";
  //   socket.emit("side", player1Side);
  // } else {
  //   playerRightSocket = socket;
  //   socket.emit("side", "right");
  //   startGame();
  // }
  // socket.on("input direction", inputDirection => {
  //   switch (socket.id) {
  //     case playerLeftSocket.id: {
  //       playerLeft.direction = inputDirection;
  //       break;
  //     }
  //     case playerRightSocket.id: {
  //       playerRight.direction = inputDirection;
  //       break;
  //     }
  //     default: {
  //       console.log("Received 'input direction' from unknown player.");
  //     }
  //   }
  // });
  
  // console.log('a user connected');
});

server.listen(port, () => {
  console.log(`server running at http://localhost:${port}`);
});

function startThisGame(
  gameState,
  playerLeftSocket,
  playerRightSocket
) {
  let prevTime = Date.now(); 
  setInterval(() => {
    let timestamp = Date.now();
    let deltaTime = timestamp - prevTime;
    prevTime = timestamp;
    updateGame(
      gameState,
      playerLeftSocket,
      playerRightSocket,
      deltaTime
    );
  }, 1000 / 60);
}

function startGame() {
  let prevTime = Date.now(); 
  setInterval(() => {
    let timestamp = Date.now();
    let deltaTime = timestamp - prevTime;
    prevTime = timestamp;
    update(deltaTime);
  }, 1000 / 60);
}

function updateGame(
  gameState,
  playerLeftSocket,
  playerRightSocket,
  deltaTime
) {
  let {
    playerLeft,
    playerRight,
    ball,
    timeToRound
  } = gameState;
  playerLeft.update(deltaTime);
  playerRight.update(deltaTime);

  if (!ball.inPlay) {
    timeToRound -= deltaTime;
    if (timeToRound <= 0) {
        ball.setInPlay();
    }
  }
  if (ball.inPlay) {
    ball.move(deltaTime);
    if (ball.x < 0 || ball.x + ball.width > width) {
        if (ball.x < 0) {
            playerRight.score++;
        }
        else {
            playerLeft.score++;
        }
        ball.setOutOfPlay();
        timeToRound = roundDelay;
    }
  }
  let stateForClient = {
    playerLeft: {
      y: playerLeft.y,
      score: playerLeft.score
    },
    playerRight: {
      y: playerRight.y,
      score: playerRight.score
    },
    ball: {
      x: ball.x,
      y: ball.y,
      inPlay: ball.inPlay
    }
  };
  playerLeftSocket.emit("state", stateForClient);
  playerRightSocket.emit("state", stateForClient);
  gameState.timeToRound = timeToRound;
}

function update(deltaTime) {
  playerLeft.update(deltaTime);
  playerRight.update(deltaTime);

  if (!ball.inPlay) {
    timeToRound -= deltaTime;
    if (timeToRound <= 0) {
        ball.setInPlay();
    }
  }
  if (ball.inPlay) {
    ball.move(deltaTime);
    if (ball.x < 0 || ball.x + ball.width > width) {
        if (ball.x < 0) {
            playerRight.score++;
        }
        else {
            playerLeft.score++;
        }
        ball.setOutOfPlay();
        timeToRound = roundDelay;
    }
  }
  io.emit("state", {
    playerLeft: {
      y: playerLeft.y,
      score: playerLeft.score
    },
    playerRight: {
      y: playerRight.y,
      score: playerRight.score
    },
    ball: {
      x: ball.x,
      y: ball.y,
      inPlay: ball.inPlay
    }
  });
}

// function sideById(socketId) {
  
// }

// function playerById(socketId) {
//   switch (socketId) {
//     case player1Id: {
//       return playerLeft;
//     }
//     case player2Id: {
//       return playerRight;
//     }
//     default: {
//       console.log("Received 'input direction' from unknown player.");
//       return null;
//     }
//   }
// }

