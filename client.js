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

const playButtonX = width / 2;
const playButtonY = 220;
const multiplayerButtonX = width / 2;
const multiplayerButtonY = 260;

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

  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "white";
  ctx.font = "40px Arial";
  fillTextCenteredHorizontally(ctx, "Pong", width / 2, 140);
  ctx.font = "30px Arial";

  const playButtonCoords = textCoords(ctx, "Play", playButtonX, playButtonY);
  const multiplayerButtonCoords = textCoords(ctx, "Multiplayer", multiplayerButtonX, multiplayerButtonY);
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
      break;
    }
    if (checkPointInside(
      clickEvent.x,
      clickEvent.y,
      multiplayerButtonCoords.x0,
      multiplayerButtonCoords.y0,
      multiplayerButtonCoords.x1,
      multiplayerButtonCoords.y1
    )) {
      console.log("MULTIPLAYER");
      break;
    }
  }

  drawButton(ctx, "Play", playButtonX, playButtonY);
  drawButton(ctx, "Multiplayer", multiplayerButtonX, multiplayerButtonY);
  
  // fillTextCenteredHorizontally(ctx, "Play", width / 2, 220);
  // fillTextCenteredHorizontally(ctx, "Multiplayer", width / 2, 260);
  clickEvents = [];
//   update(deltaTime)
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

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