let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let width = 600;
let height = 480;

let roundDelay = 1500;
let timeToRound = 0;

let paddleWidth = 10;
let paddleHeight = 40;
let paddleOffset = 60;
let paddleSpeed = .25;

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
        this.direction = 0;
        this.score = 0;
    }
    update(deltaTime) {
        this.y = Math.max(Math.min(this.y + paddleSpeed * this.direction *
            deltaTime, height - paddleHeight), 0);
    }
    draw(ctx, width, height) {
        ctx.fillRect(this.x, this.y, width, height);
    }
}
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
        let angle = Math.random() * 2 * Math.PI;
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
            this.x < player1.x + paddleWidth &&
            this.x > player1.x &&
            this.y + this.height > player1.y &&
            this.y < player1.y + paddleHeight
        ) {
            this.directionX = Math.random() / 2 + .5;
            this.directionY = Math.sign(Math.random() - .5) *
            Math.sqrt(1 - Math.pow(this.directionX, 2));
            this.lastHit = "left";
        }
        if (
            this.lastHit != "right" &&
            this.x + this.width > player2.x && 
            this.x + this.width < player2.x + paddleWidth &&
            this.y + this.height > player2.y &&
            this.y < player2.y + paddleHeight
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

    },
    draw: function(ctx) {
        if (this.inPlay) {
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
}

let player1 = new Player(paddleOffset, height / 2 - paddleHeight / 2);
let player2 = new Player(width - paddleOffset - paddleWidth, height / 2 - paddleHeight / 2);

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
function update(deltaTime) {
    let player1Direction = 0;
    if (keys.w) {
        player1Direction -= 1;
    }
    if (keys.s) {
        player1Direction += 1;
    }
    let player2Direction = 0;
    if (keys.ArrowUp) {
        player2Direction -= 1;
    }
    if (keys.ArrowDown) {
        player2Direction += 1;
    }
    player1.direction = player1Direction;
    player2.direction = player2Direction;
    player1.update(deltaTime);
    player2.update(deltaTime);
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
                player2.score++;
            }
            else {
                player1.score++;
            }
            console.log("Scores: " + player1.score + " - " + player2.score);
            ball.setOutOfPlay();
            timeToRound = roundDelay;
        }
    }

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "white";
    ctx.font = "64px monospace";
    ctx.textBaseline = "top";
    ctx.textAlign = "right";
    ctx.fillText(player1.score, width / 2 - scoreOffsetX, scoreOffsetY);
    ctx.textAlign = "left";
    ctx.fillText(player2.score, width / 2 + scoreOffsetX, scoreOffsetY);

    ball.draw(ctx);
    
    player1.draw(ctx, paddleWidth, paddleHeight);
    player2.draw(ctx, paddleWidth, paddleHeight);
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

const socket = io();