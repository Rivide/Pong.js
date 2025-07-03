let socket = null;

let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let width = 600;
let height = 480;

const roundDelay = 1500;

let paddleWidth = 10;
let paddleHeight = 40;
let paddleOffset = 60;
let paddleSpeed = .25;

const playerLeftX = paddleOffset;
const playerRightX = width - paddleOffset - paddleWidth;

const ballWidth = 10;
const ballHeight = 10;
const ballSpeed = .25;

let scoreOffsetX = 80;
let scoreOffsetY = 30;

const playButtonX = width / 2;
const playButtonY = 220;
const twoPlayerButtonX = width / 2;
const twoPlayerButtonY = 260;
const onlineButtonX = width / 2;
const onlineButtonY = 300;

let keys = {
    w: false,
    s: false,
    ArrowUp: false,
    ArrowDown: false
};

class Player {
  constructor(y) {
      this.y = y;
      this.score = 0;
  }
  update(direction, deltaTime) {
    this.y = Math.max(Math.min(this.y + paddleSpeed * direction *
        deltaTime, height - paddleHeight), 0);
  }
  draw(ctx, x, width, height) {
      ctx.fillRect(x, this.y, width, height);
  }
}

class ClientPlayer {
    constructor(y) {
        this.y = y;
        this.score = 0;
    }
    draw(ctx, x, width, height) {
        ctx.fillRect(x, this.y, width, height);
    }
}
// let ball = {
//     x: 0,
//     y: 0,
//     width: 10,
//     height: 10,
//     inPlay: false,
//     draw: function(ctx) {
//         if (this.inPlay) {
//             ctx.fillRect(this.x, this.y, this.width, this.height);
//         }
//     }
// }

// let side = null;
// let playerLeft = new ClientPlayer(height / 2 - paddleHeight / 2);
// let playerRight = new ClientPlayer(height / 2 - paddleHeight / 2);

document.addEventListener("keydown", function(e) {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = true;
    }
});
document.addEventListener("keyup", function(e) {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = false;
    }
});

let mouseX = -1;
let mouseY = -1;
canvas.addEventListener("mousemove", function(e) {
  mouseX = e.offsetX;
  mouseY = e.offsetY;
});

let clickEvents = [];
canvas.addEventListener("click", function(e) {
  clickEvents.push({
    x: e.offsetX,
    y: e.offsetY
  });
});

function updatePlayer(clientPlayer, serverPlayer) {
  clientPlayer.y = serverPlayer.y;
  clientPlayer.score = serverPlayer.score;
}

function updateBall(clientBall, serverBall) {
  clientBall.x = serverBall.x;
  clientBall.y = serverBall.y;
  clientBall.inPlay = serverBall.inPlay;
}

// class TwoPlayerState {
//   playerLeft;
//   playerRight;
//   ball;
//   timeToRound;

//   constructor() {
//     this.playerLeft = new Player(height / 2 - paddleHeight / 2);
//     this.playerRight = new Player(height / 2 - paddleHeight / 2);
//     // this.ball = 
//   }
// }

// class TwoPlayerBall {

// }

let twoPlayerState = (() => {
  let playerLeft = new Player(height / 2 - paddleHeight / 2);
  let playerRight = new Player(height / 2 - paddleHeight / 2);
  let ball = {
    x: 0,
    y: 0,
    directionX: 0,
    directionY: 0,
    inPlay: false,
    lastHit: "none",
    move: function(deltaTime) {
      // Move according to velocity
      this.x += this.directionX * ballSpeed * deltaTime;
      this.y += this.directionY * ballSpeed * deltaTime;

      // On collision with the top or bottom of the screen,
      // 1. flip directionY
      // 2. move the ball back into the screen
      if (this.y < 0 || this.y + ballHeight > height) {
          this.directionY = -this.directionY;
          if (this.y < 0) {
              this.y = -this.y;
          }
          else {
              // this.y = height + height - this.y - this.height;
              // this.y -= 2 * (this.y + this.height - height);
              this.y = height - (this.y + ballHeight - height) - ballHeight;
          }
      }
      // let ballVelocityX = this.speed * this.directionX;
      // let ballVelocityYRelativeToLeftPaddle = this.speed * this.directionY - paddleSpeed;
      console.log(playerLeft)
      // Paddle collisions
      if (
          this.lastHit != "left" &&
          this.x < playerLeftX + paddleWidth &&
          this.x > playerLeftX &&
          this.y + ballHeight > playerLeft.y &&
          this.y < playerLeft.y + paddleHeight
      ) {
          this.directionX = Math.random() / 2 + .5;
          this.directionY = Math.sign(Math.random() - .5) *
          Math.sqrt(1 - Math.pow(this.directionX, 2));
          this.lastHit = "left";
      }
      if (
          this.lastHit != "right" &&
          this.x + ballWidth > playerRightX && 
          this.x + ballWidth < playerRightX + paddleWidth &&
          this.y + ballHeight > playerRight.y &&
          this.y < playerRight.y + paddleHeight
      ) {
          this.directionX = -(Math.random() / 2 + .5);
          this.directionY = Math.sign(Math.random() - .5) *
          Math.sqrt(1 - Math.pow(this.directionX, 2));
          this.lastHit = "right";
      }
      // if (
      //     this.x < player1.x + paddleWidth &&
      //     this.x > player1.x &&
      //     this.y + this.height > player1.y &&
      //     this.y < player1.y + paddleHeight ||
      //     this.x + this.width > player2.x && 
      //     this.x + this.width < player2.x + paddleWidth &&
      //     this.y + this.height > player2.y &&
      //     this.y < player2.y + paddleHeight) {
      //     this.directionX = -Math.sign(this.directionX) * (Math.random() / 2 + .5);
      //     this.directionY = Math.sign(Math.random() - .5) *
      //     Math.sqrt(1 - Math.pow(this.directionX, 2));
      //     if (this.x < width / 2) {
      //         this.x += 2 * (player1.x + paddleWidth - this.x);
      //     }
      //     else {
      //         this.x -= 2 * (this.x + this.width - player2.x);
      //     }
      // }

    }
  };
  let timeToRound = 0;

  function update(ctx, deltaTime) {
    let playerLeftInputDirection = 0;
    if (keys.w) {
        playerLeftInputDirection -= 1;
    }
    if (keys.s) {
        playerLeftInputDirection += 1;
    }
    let playerRightInputDirection = 0;
    if (keys.ArrowUp) {
        playerRightInputDirection -= 1;
    }
    if (keys.ArrowDown) {
        playerRightInputDirection += 1;
    }
    // playerLeft.direction = playerLeftInputDirection;
    // playerRight.direction = playerRightInputDirection;
    function movePlayer(player, direction) {
      player.y = Math.max(Math.min(player.y + paddleSpeed * direction *
          deltaTime, height - paddleHeight), 0);
    }
    movePlayer(playerLeft, playerLeftInputDirection);
    movePlayer(playerRight, playerRightInputDirection);
    // playerLeft.update(playerLeftInputDirection, deltaTime);
    // playerRight.update(playerRightInputDirection, deltaTime);
    if (!ball.inPlay) {
      timeToRound -= deltaTime;
      if (timeToRound <= 0) {
        ball.x = width / 2 - ballWidth / 2;
        ball.y = Math.random() * (height - ballHeight);
        // let angle = Math.random() * 2 * Math.PI;
        ball.directionX = Math.sign(Math.random() - .5) * (Math.random() / 2 + .5);
        ball.directionY = Math.sign(Math.random() - .5) *
          Math.sqrt(1 - Math.pow(ball.directionX, 2));
        ball.inPlay = true;
        // ball.setInPlay();
      }
    }
    if (ball.inPlay) {
      // Move according to velocity
      ball.x += ball.directionX * ballSpeed * deltaTime;
      ball.y += ball.directionY * ballSpeed * deltaTime;

      // On collision with the top or bottom of the screen,
      // 1. flip directionY
      // 2. move the ball back into the screen
      if (ball.y < 0 || ball.y + ballHeight > height) {
          ball.directionY = -ball.directionY;
          if (ball.y < 0) {
              ball.y = -ball.y;
          }
          else {
              // ball.y = height + height - ball.y - ball.height;
              // ball.y -= 2 * (ball.y + ball.height - height);
              ball.y = height - (ball.y + ballHeight - height) - ballHeight;
          }
      }
      // let ballVelocityX = ball.speed * ball.directionX;
      // let ballVelocityYRelativeToLeftPaddle = ball.speed * ball.directionY - paddleSpeed;
      console.log(playerLeft)
      // Paddle collisions
      if (
          ball.lastHit != "left" &&
          ball.x < playerLeftX + paddleWidth &&
          ball.x > playerLeftX &&
          ball.y + ballHeight > playerLeft.y &&
          ball.y < playerLeft.y + paddleHeight
      ) {
          ball.directionX = Math.random() / 2 + .5;
          ball.directionY = Math.sign(Math.random() - .5) *
          Math.sqrt(1 - Math.pow(ball.directionX, 2));
          ball.lastHit = "left";
      }
      if (
          ball.lastHit != "right" &&
          ball.x + ballWidth > playerRightX && 
          ball.x + ballWidth < playerRightX + paddleWidth &&
          ball.y + ballHeight > playerRight.y &&
          ball.y < playerRight.y + paddleHeight
      ) {
          ball.directionX = -(Math.random() / 2 + .5);
          ball.directionY = Math.sign(Math.random() - .5) *
          Math.sqrt(1 - Math.pow(ball.directionX, 2));
          ball.lastHit = "right";
      }
      if (ball.x < 0 || ball.x + ballWidth > width) {
        if (ball.x < 0) {
          playerRight.score++;
        }
        else {
          playerLeft.score++;
        }
        console.log("Scores: " + playerLeft.score + " - " + playerRight.score);
        ball.inPlay = false;
        ball.lastHit = "none";
        timeToRound = roundDelay;
      }
    }
  
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, width, height);
  
    ctx.fillStyle = "white";
    ctx.font = "64px monospace";
    ctx.textBaseline = "top";
    ctx.textAlign = "right";
    ctx.fillText(playerLeft.score, width / 2 - scoreOffsetX, scoreOffsetY);
    ctx.textAlign = "left";
    ctx.fillText(playerRight.score, width / 2 + scoreOffsetX, scoreOffsetY);
  
    if (ball.inPlay) {
        ctx.fillRect(ball.x, ball.y, ballWidth, ballHeight);
    }
    playerLeft.draw(ctx, paddleOffset, paddleWidth, paddleHeight);
    playerRight.draw(ctx, width - paddleOffset - paddleWidth, paddleWidth, paddleHeight);
  }

  return {
    // playerLeft,
    // playerRight,
    // ball,
    // timeToRound: 0,
    update: update
  };
})();

let onlineState = (() => {
  let playerLeft = new ClientPlayer(height / 2 - paddleHeight / 2);
  let playerRight = new ClientPlayer(height / 2 - paddleHeight / 2);
  let ball = {
    x: 0,
    y: 0,
    width: 10,
    height: 10,
    inPlay: false,
    draw: function(ctx) {
        if (this.inPlay) {
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
  };
  let socket = null;
  let side = null;

  function startOnline() {
    socket = io();
    socket.on("side", sideFromServer => {
      side = sideFromServer;
    });
    
    socket.on("state", state => {
      updatePlayer(playerLeft, state.playerLeft);
      updatePlayer(playerRight, state.playerRight);
      updateBall(ball, state.ball);
    });
  }

  function update(ctx, deltaTime) {
    let inputDirection = 0;
    if (keys.w || keys.ArrowUp) {
        inputDirection -= 1;
    }
    if (keys.s || keys.ArrowDown) {
        inputDirection += 1;
    }
    socket.emit("input direction", inputDirection);
  
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, width, height);
  
    ctx.fillStyle = "white";
    ctx.font = "64px monospace";
    ctx.textBaseline = "top";
    ctx.textAlign = "right";
    ctx.fillText(playerLeft.score, width / 2 - scoreOffsetX, scoreOffsetY);
    ctx.textAlign = "left";
    ctx.fillText(playerRight.score, width / 2 + scoreOffsetX, scoreOffsetY);
  
    ball.draw(ctx);
    playerLeft.draw(ctx, paddleOffset, paddleWidth, paddleHeight);
    playerRight.draw(ctx, width - paddleOffset - paddleWidth, paddleWidth, paddleHeight);
  }

  return {
    playerLeft,
    playerRight,
    ball,
    startOnline: startOnline,
    update: update
  };
})();

// let twoPlayerState = {
//   playerLeft: new Player(height / 2 - paddleHeight / 2),
//   playerRight: new Player(height / 2 - paddleHeight / 2),
//   ball: {
//     x: 0,
//     y: 0,
//     directionX: 0,
//     directionY: 0,
//     inPlay: false,
//     lastHit: "none",
//     draw: function(ctx) {
//       if (this.inPlay) {
//           ctx.fillRect(this.x, this.y, ballWidth, ballHeight);
//       }
//     },
//     setInPlay: function(x, y) {
//       this.x = width / 2 - ballWidth / 2;
//       this.y = Math.random() * (height - ballHeight);
//       let angle = Math.random() * 2 * Math.PI;
//       this.directionX = Math.sign(Math.random() - .5) * (Math.random() / 2 + .5);
//       this.directionY = Math.sign(Math.random() - .5) *
//       Math.sqrt(1 - Math.pow(this.directionX, 2));
//       this.inPlay = true;
//     },
//     setOutOfPlay() {
//       this.inPlay = false;
//       this.lastHit = "none";
//     },
//     move: function(deltaTime) {
//       this.x += this.directionX * ballSpeed * deltaTime;
//       this.y += this.directionY * ballSpeed * deltaTime;

//       if (this.y < 0 || this.y + ballHeight > height) {
//           this.directionY = -this.directionY;
//           if (this.y < 0) {
//               this.y = -this.y;
//           }
//           else {
//               // this.y = height + height - this.y - this.height;
//               // this.y -= 2 * (this.y + this.height - height);
//               this.y = height - (this.y + ballHeight - height) - ballHeight;
//           }
//       }
//       // let ballVelocityX = this.speed * this.directionX;
//       // let ballVelocityYRelativeToLeftPaddle = this.speed * this.directionY - paddleSpeed;
//       if (
//           this.lastHit != "left" &&
//           this.x < playerLeft.x + paddleWidth &&
//           this.x > playerLeft.x &&
//           this.y + ballHeight > playerLeft.y &&
//           this.y < playerLeft.y + paddleHeight
//       ) {
//           this.directionX = Math.random() / 2 + .5;
//           this.directionY = Math.sign(Math.random() - .5) *
//           Math.sqrt(1 - Math.pow(this.directionX, 2));
//           this.lastHit = "left";
//       }
//       if (
//           this.lastHit != "right" &&
//           this.x + ballWidth > playerRight.x && 
//           this.x + ballWidth < playerRight.x + paddleWidth &&
//           this.y + ballHeight > playerRight.y &&
//           this.y < playerRight.y + paddleHeight
//       ) {
//           this.directionX = -(Math.random() / 2 + .5);
//           this.directionY = Math.sign(Math.random() - .5) *
//           Math.sqrt(1 - Math.pow(this.directionX, 2));
//           this.lastHit = "right";
//       }
//       // if (
//       //     this.x < player1.x + paddleWidth &&
//       //     this.x > player1.x &&
//       //     this.y + this.height > player1.y &&
//       //     this.y < player1.y + paddleHeight ||
//       //     this.x + this.width > player2.x && 
//       //     this.x + this.width < player2.x + paddleWidth &&
//       //     this.y + this.height > player2.y &&
//       //     this.y < player2.y + paddleHeight) {
//       //     this.directionX = -Math.sign(this.directionX) * (Math.random() / 2 + .5);
//       //     this.directionY = Math.sign(Math.random() - .5) *
//       //     Math.sqrt(1 - Math.pow(this.directionX, 2));
//       //     if (this.x < width / 2) {
//       //         this.x += 2 * (player1.x + paddleWidth - this.x);
//       //     }
//       //     else {
//       //         this.x -= 2 * (this.x + this.width - player2.x);
//       //     }
//       // }

//     }
//   },
//   timeToRound: 0
// }

// function updateTwoPlayer(state, deltaTime) {
//   let {
//     playerLeft,
//     playerRight,
//     ball,
//     timeToRound
//   } = state;
//   let playerLeftInputDirection = 0;
//   if (keys.w) {
//       playerLeftInputDirection -= 1;
//   }
//   if (keys.s) {
//       playerLeftInputDirection += 1;
//   }
//   let playerRightInputDirection = 0;
//   if (keys.ArrowUp) {
//       playerRightInputDirection -= 1;
//   }
//   if (keys.ArrowDown) {
//       playerRightInputDirection += 1;
//   }
//   // playerLeft.direction = playerLeftInputDirection;
//   // playerRight.direction = playerRightInputDirection;
//   playerLeft.update(playerLeftInputDirection, deltaTime);
//   playerRight.update(playerRightInputDirection, deltaTime);
//   if (!ball.inPlay) {
//     timeToRound -= deltaTime;
//     if (timeToRound <= 0) {
//       ball.setInPlay();
//     }
//   }
//   if (ball.inPlay) {
//     ball.move(deltaTime);
//     if (ball.x < 0 || ball.x + ballWidth > width) {
//       if (ball.x < 0) {
//         playerRight.score++;
//       }
//       else {
//         playerLeft.score++;
//       }
//       console.log("Scores: " + playerLeft.score + " - " + playerRight.score);
//       ball.setOutOfPlay();
//       timeToRound = roundDelay;
//     }
//   }

//   ctx.fillStyle = "black";
//   ctx.fillRect(0, 0, width, height);

//   ctx.fillStyle = "white";
//   ctx.font = "64px monospace";
//   ctx.textBaseline = "top";
//   ctx.textAlign = "right";
//   ctx.fillText(playerLeft.score, width / 2 - scoreOffsetX, scoreOffsetY);
//   ctx.textAlign = "left";
//   ctx.fillText(playerRight.score, width / 2 + scoreOffsetX, scoreOffsetY);

//   ball.draw(ctx);
//   playerLeft.draw(ctx, paddleOffset, paddleWidth, paddleHeight);
//   playerRight.draw(ctx, width - paddleOffset - paddleWidth, paddleWidth, paddleHeight);

//   state.timeToRound = timeToRound;
// }

// function updateOnline(deltaTime) {
//   let inputDirection = 0;
//   if (keys.w || keys.ArrowUp) {
//       inputDirection -= 1;
//   }
//   if (keys.s || keys.ArrowDown) {
//       inputDirection += 1;
//   }
//   socket.emit("input direction", inputDirection);

//   ctx.fillStyle = "black";
//   ctx.fillRect(0, 0, width, height);

//   ctx.fillStyle = "white";
//   ctx.font = "64px monospace";
//   ctx.textBaseline = "top";
//   ctx.textAlign = "right";
//   ctx.fillText(playerLeft.score, width / 2 - scoreOffsetX, scoreOffsetY);
//   ctx.textAlign = "left";
//   ctx.fillText(playerRight.score, width / 2 + scoreOffsetX, scoreOffsetY);

//   ball.draw(ctx);
//   playerLeft.draw(ctx, paddleOffset, paddleWidth, paddleHeight);
//   playerRight.draw(ctx, width - paddleOffset - paddleWidth, paddleWidth, paddleHeight);
// }

let screen = "menu";
let state = {
  screen: "menu",
  state: null
};

let prevTime = 0;
function loop(timestamp) {
  let deltaTime = timestamp - prevTime;
  // let deltaTime = 1;
  prevTime = timestamp;

  // fillTextCenteredHorizontally(ctx, "2 Player", width / 2, 220);
  // fillTextCenteredHorizontally(ctx, "Online", width / 2, 260);
  switch (screen) {
    case "menu": {
      menu();
      break;
    }
    case "two player": {
      twoPlayerState.update(ctx, deltaTime);
      // updateTwoPlayer(twoPlayerState, deltaTime);
      break;
    }
    case "online": {
      onlineState.update(ctx, deltaTime);
      // updateOnline(deltaTime);
      break;
    }
  }
  clickEvents = [];

//   update(deltaTime)
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

function startTwoPlayer() {
  screen = "two player";
}

function startOnline() {
  screen = "online";
  onlineState.startOnline();
  // socket = io();
  // socket.on("side", sideFromServer => {
  //   side = sideFromServer;
  // });
  
  // socket.on("state", state => {
  //   updatePlayer(playerLeft, state.playerLeft);
  //   updatePlayer(playerRight, state.playerRight);
  //   updateBall(ball, state.ball);
  // });
}

function menu() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "white";
  ctx.font = "40px Arial";
  fillTextCenteredHorizontally(ctx, "Pong", width / 2, 140);
  ctx.font = "30px Arial";

  const playButtonCoords = textCoords(ctx, "Play", playButtonX, playButtonY);
  const twoPlayerButtonCoords = textCoords(ctx, "2 Player", twoPlayerButtonX, twoPlayerButtonY);
  const onlineButtonCoords = textCoords(ctx, "Online", onlineButtonX, onlineButtonY);
  for (const clickEvent of clickEvents) {
    if (checkPointInside(
      clickEvent.x,
      clickEvent.y,
      playButtonCoords.x0,
      playButtonCoords.y0,
      playButtonCoords.x1,
      playButtonCoords.y1
    )) {
      console.log("PLAY");
      return;
    }
    if (checkPointInside(
      clickEvent.x,
      clickEvent.y,
      twoPlayerButtonCoords.x0,
      twoPlayerButtonCoords.y0,
      twoPlayerButtonCoords.x1,
      twoPlayerButtonCoords.y1
    )) {
      console.log("TWO PLAYER");
      startTwoPlayer();
      return;
    }
    if (checkPointInside(
      clickEvent.x,
      clickEvent.y,
      onlineButtonCoords.x0,
      onlineButtonCoords.y0,
      onlineButtonCoords.x1,
      onlineButtonCoords.y1
    )) {
      console.log("ONLINE");
      startOnline();
      return;
    }
  }

  drawButton(ctx, "Play", playButtonX, playButtonY);
  drawButton(ctx, "2 Player", twoPlayerButtonX, twoPlayerButtonY);
  drawButton(ctx, "Online", onlineButtonX, onlineButtonY);
}

function fillTextCenteredHorizontally(ctx, text, x, y) {
    const width = ctx.measureText(text).width;
    ctx.fillText(text, x - width / 2, y);
}

function textCoords(ctx, text, x, y) {
  const metrics = ctx.measureText(text);
  return {
    x0: x - metrics.width / 2,
    x1: x + metrics.width / 2,
    y0: y - metrics.actualBoundingBoxAscent,
    y1: y + metrics.actualBoundingBoxDescent
  };
}

function checkPointInside(x, y, x0, y0, x1, y1) {
  return x > x0 && x < x1 && y > y0 && y < y1;
}

function drawButton(ctx, text, x, y) {
  const metrics = ctx.measureText(text);
  const width = metrics.width;
  // const height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
  const x0 = x - width / 2;
  const x1 = x + width / 2;
  const y0 = y - metrics.actualBoundingBoxAscent;
  const y1 = y + metrics.actualBoundingBoxDescent;

  if (
    mouseX > x0 && mouseX < x1 &&
    mouseY > y0 && mouseY < y1
  ) {
    ctx.fillStyle = "lightgray";
  } else {
    ctx.fillStyle = "white";
  }
  ctx.fillText(text, x - width / 2, y);
  // ctx.strokeStyle = "red";
  // ctx.beginPath();
  // ctx.moveTo(x0, y1);
  // ctx.lineTo(x1, y1);
  // ctx.stroke();
}
