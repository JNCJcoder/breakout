/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = 480;
canvas.height = 620;

const colorList = [
    "#FF0000",
    "#00FF00",
    "#FFFF00",
    "#009000",
    "#0032FF",
    "#FF00FF",
    "#FFAA32",
    "#AE99E9",
];

class Ball
{
    static initialX = canvas.width / 2;
    static initialY = canvas.height - 30;
    static initialDX = 3;
    static initialDY = 3;

    static radius = 10;

    constructor()
    {
        this.x  = Ball.initialX;
        this.y  = Ball.initialY;
        this.dx = Ball.initialDX;
        this.dy = Ball.initialDY;
    }

    reset()
    {
        this.x  = Ball.initialX;
        this.y  = Ball.initialY;
        this.dx = Ball.initialDX;
        this.dy = Ball.initialDY;
    }

    update(paddle)
    {
        this.x += this.dx;
        this.y += this.dy;

        if (this.x >= canvas.width - Ball.radius || this.x <= Ball.radius)
        {
            this.dx = -this.dx;
        }

        if(this.y < Ball.radius)
        {
            this.dy = -this.dy;
        }
        else if(this.x < paddle.x + Paddle.width &&
            this.x + Ball.radius > paddle.x &&
            this.y < paddle.y + Paddle.height &&
            this.y + Ball.radius> paddle.y)
        {
            if(Paddle.commands['ArrowLeft'] && this.dx > 0)
            {
                this.dx = -Math.abs(this.dx);
            }
            else if(Paddle.commands['ArrowRight'] && this.dx < 0)
            {
                this.dx = Math.abs(this.dx);
            }
            this.dy = -Math.abs(this.dy);
        }
        else if(this.y > canvas.height)
        {
            return false;
        }

        return true;
    }

    draw()
    {
        ctx.beginPath();
        ctx.arc(this.x, this.y, Ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = "#222222";
        ctx.fill();
        ctx.closePath();

        ctx.beginPath();
        ctx.arc(this.x, this.y, Ball.radius - 1, 0, Math.PI * 2);
        ctx.fillStyle = "#FF0000";
        ctx.fill();
        ctx.closePath();
    }
}

class Brick
{
    static width        = 75;
    static height       = 20;
    static padding      = 2;
    static offsetTop    = 30;
    static offsetLeft   = 10;
    static rows         = 10;
    static columns      = 6;

    static pointValue = 10;
    static maxPointPerLevel = (Brick.columns * Brick.rows) * Brick.pointValue;

    static list = []

    constructor(x, y, color)
    {
        this.x = x;
        this.y = y;
        this.color = color;
        this.alive = true;
    }

    static initList()
    {
        const brickSizeX = Brick.width + Brick.padding;
        const brickSizeY = Brick.height + Brick.padding;

        for (let x = 0; x < Brick.columns; x++)
        {
            for (let y = 0; y < Brick.rows; y++)
            {
                const xPos = (x * brickSizeX) + Brick.offsetLeft;
                const yPos = (y * brickSizeY) + Brick.offsetTop;
                const randomValue = Math.floor(Math.random() * colorList.length);
                const color = colorList[randomValue];

                Brick.list.push(new Brick(xPos, yPos, color));
            }
        }
    }

    static drawList()
    {
        Brick.list.forEach(brick => brick.draw());
    }

    static updateList(ball)
    {
        Brick.list.forEach(brick => brick.update(ball));
    }

    static resetList()
    {
        Brick.list.forEach(brick => {
            const randomValue = Math.floor(Math.random() * colorList.length);
            const color = colorList[randomValue];

            brick.alive = true;
            brick.color = color;
        });
    }

    update(ball)
    {
        if(!this.alive) return;

        const dx = ball.x - Math.max(this.x, Math.min(ball.x, this.x + Brick.width));
        const dy = ball.y - Math.max(this.y, Math.min(ball.y, this.y + Brick.height));

        if ((dx * dx + dy * dy) <= (Ball.radius * Ball.radius))
        {
            this.alive = false;
            Game.score += Brick.pointValue;

            if (Math.abs(dx) > Math.abs(dy))
            {
                ball.dx = -ball.dx;
            } 
            else
            {
                ball.dy = -ball.dy;
            }
        }
    }

    draw()
    {
        if(!this.alive) return;

        ctx.fillStyle = "#000000";
        ctx.fillRect(this.x, this.y, Brick.width, Brick.height);

        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, Brick.width - 2, Brick.height - 2);
    }
}

class Paddle
{
    static width    = 80;
    static height   = 10;
    static speed    = 5;
    static initialX = (canvas.width - Paddle.width) / 2; 
    static initialY = (canvas.height - Paddle.height) - 10;

    static commands = { 'ArrowLeft': false, 'ArrowRight': false };

    constructor()
    {
        this.x = Paddle.initialX;
        this.y = Paddle.initialY;

        document.addEventListener("keydown", Paddle.keyDownHandler, false);
        document.addEventListener("keyup", Paddle.keyUpHandler, false);

        document.addEventListener('touchstart', Paddle.touchStartHandler, false);
        document.addEventListener('touchmove', Paddle.touchStartHandler, false);
        document.addEventListener('touchend', Paddle.touchEndHandler, false);
    }

    static keyDownHandler(event)
    {
        Paddle.commands[event.code] = true;
    }

    static keyUpHandler(event)
    {
        Paddle.commands[event.code] = false;
    }

    static touchStartHandler(event)
    {
        event.preventDefault();

        const touchX = event.touches[0].clientX;

        if(touchX > (canvas.width / 2))
        {
            Paddle.commands['ArrowRight'] = true;
            Paddle.commands['ArrowLeft'] = false;
        }
        else if(touchX < (canvas.width / 2))
        {
            Paddle.commands['ArrowLeft'] = true;
            Paddle.commands['ArrowRight'] = false;
        }
    }

    static touchEndHandler(event)
    {
        event.preventDefault();

        Paddle.commands['ArrowLeft'] = false;
        Paddle.commands['ArrowRight'] = false;
    }

    reset()
    {
        this.x = Paddle.initialX;
        this.y = Paddle.initialY;
    }

    update()
    {
        
        if(Paddle.commands['ArrowLeft'] && this.x > 0)
        {
            this.x -= Paddle.speed;
        }
        else if(Paddle.commands['ArrowRight'] && this.x < canvas.width - Paddle.width)
        {
            this.x += Paddle.speed;
        }
    }

    draw()
    {
        ctx.fillStyle = "#000000";
        ctx.fillRect(this.x, this.y, Paddle.width, Paddle.height);

        const tenPercentWidth = Math.floor(Paddle.width / 10);

        ctx.fillStyle = "#808080";
        ctx.fillRect(this.x + 1, this.y, Paddle.width - 2, Paddle.height - 1);
        
        ctx.fillStyle = "#FF0000";
        ctx.fillRect(this.x + 1, this.y, tenPercentWidth, Paddle.height - 1);

        ctx.fillStyle = "#FF0000";
        ctx.fillRect(
            (this.x + Paddle.width) - tenPercentWidth - 1,
            this.y,
            tenPercentWidth,
            Paddle.height - 1
        );
    }
}

class Game
{
    static lives = 3;
    static score = 0;
    static level = 1;

    constructor()
    {
        this.paddle = new Paddle();
        this.ball   = new Ball();

        Brick.initList();
        requestAnimationFrame(() => this.loop());
    }

    reset()
    {
        Game.lives = 3;
        Game.score = 0;
        Game.level = 1;

        Brick.resetList();
        this.paddle.reset();
        this.ball.reset();
    }

    update()
    {
        this.paddle.update();
        const result = this.ball.update(this.paddle);

        if(!result)
        {
            if(Game.lives == 0)
            {
                this.reset();
                return;
            }

            Game.lives--;
            this.paddle.reset();
            this.ball.reset();
        }

        Brick.updateList(this.ball);

        const levelPassed = (Brick.list.find(brick => brick.alive == true) || []).length == 0;

        if(levelPassed)
        {
            Game.level++;
            this.ball.reset();
            this.paddle.reset();
            Brick.resetList();
        }
    }

    draw()
    {
        ctx.fillStyle = "#afafaf";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.font = "16px Arial";
        ctx.fillStyle = "#0000FF";
        ctx.fillText(`Level: ${Game.level}`, 10, 20);
        ctx.fillText(`Score: ${Game.score}`, (canvas.width / 2) - 35, 20);
        ctx.fillText(`Lives: ${Game.lives}`, canvas.width - 65, 20);

        this.paddle.draw();
        this.ball.draw();

        Brick.drawList();
    }

    loop()
    {
        this.update();
        this.draw();

        requestAnimationFrame(() => this.loop());
    }
}

const game = new Game();