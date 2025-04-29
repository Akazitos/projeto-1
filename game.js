const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const gameOverElement = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');
const startScreenElement = document.getElementById('startScreen');

// Imagem de fundo
const backgroundImage = new Image();
backgroundImage.src = 'https://s.zst.com.br/cms-assets/2021/06/minecraft-classic-capa.jpg';

// Imagem do pássaro
const birdImage = new Image();
birdImage.src = 'https://github.com/Akazitos/projeto-1/blob/main/imagens/image-removebg-preview.png?raw=true';

// Imagem do cano
const pipeTexture = new Image();
pipeTexture.src = 'https://i.pinimg.com/736x/41/ec/51/41ec519450f2d6eab830e86b97cd7d69.jpg';

let bird = {
    x: 100,
    y: canvas.height / 2,
    velocity: 0,
    gravity: 0.5,
    lift: -7,
    width: 40,
    height: 40
};

let pipes = [];
let score = 0;
let gameState = 'start';
const pipeWidth = 50;
const pipeGap = 150;
const pipeSpeed = 2;
const pipeFrequency = 90;
let frameCount = 0;

function drawBird() {
    ctx.drawImage(
        birdImage,
        bird.x - bird.width / 2,
        bird.y - bird.height / 2,
        bird.width,
        bird.height
    );
}

function drawPipes() {
    pipes.forEach(pipe => {
        ctx.drawImage(pipeTexture, pipe.x, 0, pipeWidth, pipe.top);
        ctx.drawImage(
            pipeTexture,
            pipe.x,
            pipe.top + pipeGap,
            pipeWidth,
            canvas.height - pipe.top - pipeGap
        );
    });
}

function updateBird() {
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    if (bird.y + bird.height / 2 > canvas.height || bird.y - bird.height / 2 < 0) {
        gameState = 'over';
    }
}

function updatePipes() {
    if (frameCount % pipeFrequency === 0) {
        let topHeight = Math.random() * (canvas.height - pipeGap - 100) + 50;
        pipes.push({ x: canvas.width, top: topHeight, scored: false });
    }

    pipes.forEach(pipe => {
        pipe.x -= pipeSpeed;
        if (pipe.x + pipeWidth < 0) {
            pipes.shift();
        }
        if (!pipe.scored && pipe.x + pipeWidth < bird.x) {
            score++;
            pipe.scored = true;
            scoreElement.textContent = `Score: ${score}`;
        }
    });
}

function checkCollision() {
    const hitboxPadding = 8;

    const birdLeft = bird.x - bird.width / 2 + hitboxPadding;
    const birdRight = bird.x + bird.width / 2 - hitboxPadding;
    const birdTop = bird.y - bird.height / 2 + hitboxPadding;
    const birdBottom = bird.y + bird.height / 2 - hitboxPadding;

    pipes.forEach(pipe => {
        const pipeLeft = pipe.x;
        const pipeRight = pipe.x + pipeWidth;
        const pipeTopBottom = pipe.top + pipeGap;

        const collidedTop = birdRight > pipeLeft && birdLeft < pipeRight && birdTop < pipe.top;
        const collidedBottom = birdRight > pipeLeft && birdLeft < pipeRight && birdBottom > pipeTopBottom;

        if (collidedTop || collidedBottom) {
            gameState = 'over';
        }
    });
}

function gameLoop() {
    if (gameState === 'playing') {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Desenhar o fundo ajustado à área jogável
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

        drawBird();
        drawPipes();
        updateBird();
        updatePipes();
        checkCollision();
        frameCount++;
    } else if (gameState === 'over') {
        gameOverElement.style.display = 'block';
        finalScoreElement.textContent = score;
    }
    requestAnimationFrame(gameLoop);
}

function startGame() {
    gameState = 'playing';
    startScreenElement.style.display = 'none';
    canvas.style.display = 'block';
    scoreElement.style.display = 'block';
    scoreElement.textContent = `Score: ${score}`;
    gameLoop();
}

function restartGame() {
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    pipes = [];
    score = 0;
    frameCount = 0;
    gameState = 'playing';
    scoreElement.textContent = `Score: ${score}`;
    gameOverElement.style.display = 'none';
}

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && gameState === 'playing') {
        bird.velocity = bird.lift;
    }
});
