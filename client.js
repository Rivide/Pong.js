const socket = io();

let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let width = 600;
let height = 480;

let paddleWidth = 10;
let paddleHeight = 40;
let paddleOffset = 60;

let scoreOffsetX = 80;
let scoreOffsetY = 30;

let keys = {
    w: false,
    s: false,
    ArrowUp: false,
    ArrowDown: false
};

class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.score = 0;
    }
    draw(ctx, width, height) {
        ctx.fillRect(this.x, this.y, width, height);
    }
}
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
}

let side = null;
let playerLeft = new Player(paddleOffset, height / 2 - paddleHeight / 2);
let playerRight = new Player(width - paddleOffset - paddleWidth, height / 2 - paddleHeight / 2);

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

function updatePlayer(clientPlayer, serverPlayer) {
  clientPlayer.x = serverPlayer.x;
  clientPlayer.y = serverPlayer.y;
  clientPlayer.score = serverPlayer.score;
}

function updateBall(clientBall, serverBall) {
  clientBall.x = serverBall.x;
  clientBall.y = serverBall.y;
  clientBall.inPlay = serverBall.inPlay;
}

socket.on("side", sideFromServer => {
  side = sideFromServer;
});

socket.on("state", state => {
  updatePlayer(playerLeft, state.playerLeft);
  updatePlayer(playerRight, state.playerRight);
  updateBall(ball, state.ball);
});

function update(deltaTime) {
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
  playerLeft.draw(ctx, paddleWidth, paddleHeight);
  playerRight.draw(ctx, paddleWidth, paddleHeight);
}

let prevTime = 0;
function loop(timestamp) {
  let deltaTime = timestamp - prevTime;
  // let deltaTime = 1;
  prevTime = timestamp;
  update(deltaTime)
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);