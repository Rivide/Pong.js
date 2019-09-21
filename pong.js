let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let width = 600;
let height = 480;

let paddleWidth = 10;
let paddleHeight = 40;
let paddleOffset = 60;
let paddleSpeed = .2;

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
    incrementScore() {
        this.score++;
    }
    move(direction, deltaTime) {
        this.y += paddleSpeed * direction * deltaTime;
    }
    draw(ctx, width, height) {
        ctx.fillStyle = "white";
        ctx.fillRect(this.x, this.y, width, height);
    }
}
let ball = {
    x: 0,
    y: 0,
    speed: .2,
    directionX: 0,
    directionY: 0,
    inPlay: false,
    width: 10,
    height: 10,
    setInPlay: function(x, y) {
        this.x = x;
        this.y = y;
        let angle = Math.random() * 2 * Math.PI
        this.directionX = Math.cos(angle);
        this.directionY = Math.sin(angle);
        this.inPlay = true;
    },
    move: function(deltaTime) {
        this.x += this.directionX * this.speed * deltaTime;
        this.y += this.directionY * this.speed * deltaTime;
        if (this.x < 0 || this.x + this.width > width || this.x < player1.x + player1.width &&
            this.y + this.height > player1.y &&
            this.y < player1.y + paddleHeight) {
            this.directionX = -this.directionX;
            if (this.x < 0) {
                this.x = -this.x;
            }
            else {
                this.x = width + width - this.x - this.width;
            }
        }
        if (this.y < 0 || this.y + this.height > height) {
            this.directionY = -this.directionY;
            if (this.y < 0) {
                this.y = -this.y;
            }
            else {
                this.y = height + height - this.y - this.height;
            }
        }
    },
    draw: function(ctx) {
        console.log(this.x + " " + this.y + " " + this.width + " " + this.height);
        ctx.fillStyle = "white";
        ctx.fillRect(this.x, this.y, this.width, this.height);
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
let prevTime = 0;
function update(timestamp) {
    let deltaTime = timestamp - prevTime;
    prevTime = timestamp;

    if (!ball.inPlay) {
        ball.setInPlay(width / 2, Math.random() * height);
        console.log("inPlay");
    }
    if (keys.w) {
        player1.move(-1, deltaTime);
    }
    if (keys.s) {
        player1.move(1, deltaTime);
    }
    if (keys.ArrowUp) {
        player2.move(-1, deltaTime);
    }
    if (keys.ArrowDown) {
        player2.move(1, deltaTime);
    }

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, width, height);

    if (ball.inPlay) {
        console.log("in Play for real");
        ball.move(deltaTime);
        ball.draw(ctx);
    }

    ctx.fillStyle = "white";
    player1.draw(ctx, paddleWidth, paddleHeight);
    player2.draw(ctx, paddleWidth, paddleHeight);

    requestAnimationFrame(update);
}
requestAnimationFrame(update);