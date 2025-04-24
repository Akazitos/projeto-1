const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const gameOverElement = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');
const startScreenElement = document.getElementById('startScreen');

// Carregar a imagem do pássaro e do cano
const birdImage = new Image();
birdImage.src = 'file:///C:/Users/Aluno/Desktop/dadada/imagens%20para%20o%20projeto%201/image-removebg-preview.png'; // Caminho da imagem do pássaro

const pipeTexture = new Image();
pipeTexture.src = 'https://i.pinimg.com/736x/41/ec/51/41ec519450f2d6eab830e86b97cd7d69.jpg'; // Caminho da textura do cano

let bird = {
    x: 100,
    y: canvas.height / 2,
    radius: 20,        // Ainda usado para colisão
    velocity: 0,
    gravity: 0.5,
    lift: -7,
    width: 40,         // Largura da imagem do pássaro
    height: 40         // Altura da imagem do pássaro
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
        // Desenha o cano superior
        ctx.drawImage(
            pipeTexture,
            pipe.x,             // Posição X do cano
            0,                  // Posição Y do cano (superior, por isso 0)
            pipeWidth,          // Largura do cano
            pipe.top            // Altura do cano superior
        );

        // Desenha o cano inferior
        ctx.drawImage(
            pipeTexture,
            pipe.x,                         // Posição X do cano
            pipe.top + pipeGap,             // Posição Y do cano inferior
            pipeWidth,                      // Largura do cano
            canvas.height - pipe.top - pipeGap // Altura do cano inferior
        );
    });
}

function updateBird() {
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    if (bird.y + bird.radius > canvas.height || bird.y - bird.radius < 0) {
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
    pipes.forEach(pipe => {
        if (bird.x + bird.radius > pipe.x && bird.x - bird.radius < pipe.x + pipeWidth) {
            if (bird.y - bird.radius < pipe.top || bird.y + bird.radius > pipe.top + pipeGap) {
                gameState = 'over';
            }
        }
    });
}

function gameLoop() {
    if (gameState === 'playing') {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
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
