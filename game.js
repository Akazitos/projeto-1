const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const gameOverElement = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');
const startScreenElement = document.getElementById('startScreen');

// Imagem de fundo
const backgroundImage = new Image();
backgroundImage.src = 'https://minecraft.wiki/images/thumb/Default_Superflat_world.png/640px-Default_Superflat_world.png?41d26';

// Imagem do pássaro
const birdImage = new Image();
birdImage.src = 'https://github.com/Akazitos/projeto-1/blob/main/imagens/image-removebg-preview.png?raw=true';

// Imagem do cano
const pipeTexture = new Image();
pipeTexture.src = 'https://img.freepik.com/vetores-premium/fundo-de-pixel-o-conceito-de-fundo-de-jogos-ilustracao-vetorial_652575-1362.jpg?semt=ais_hybrid&w=740';

// Handle image loading
let imagesLoaded = 0;
const totalImages = 3;

function imageLoaded() {
    imagesLoaded++;
    if (imagesLoaded === totalImages) {
        console.log('All images loaded');
    }
}

backgroundImage.onload = imageLoaded;
birdImage.onload = imageLoaded;
pipeTexture.onload = imageLoaded;

backgroundImage.onerror = () => console.error('Failed to load background image');
birdImage.onerror = () => console.error('Failed to load bird image');
pipeTexture.onerror = () => console.error('Failed to load pipe texture');

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
let highScore = localStorage.getItem('highScore') || 0;
let gameState = 'start';
const pipeWidth = 50;
const pipeGap = 150;
const pipeSpeed = 2;
const pipeFrequency = 80;
let frameCount = 0;
let backgroundX = 0; // Nova variável para rastrear a posição do fundo
const backgroundSpeed = 0.5; // Velocidade do fundo (mais lenta que os canos)

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
    let currentPipeFrequency = pipeFrequency;
    let currentPipeSpeed = pipeSpeed;

    if (frameCount % currentPipeFrequency === 0) {
        let topHeight = Math.random() * (canvas.height - pipeGap - 100) + 50;
        pipes.push({ x: canvas.width, top: topHeight, scored: false });
    }

    pipes.forEach(pipe => {
        pipe.x -= currentPipeSpeed;
        if (!pipe.scored && pipe.x + pipeWidth < bird.x && gameState === 'playing') {
            score++;
            pipe.scored = true;
            scoreElement.textContent = `Score: ${score}`;
        }
    });

    pipes = pipes.filter(pipe => pipe.x + pipeWidth >= 0);
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

function updateHighScore() {
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
    }
    finalScoreElement.textContent = `${score} | High Score: ${highScore}`; // Removido espaço extra
}

function startCountdown(callback) {
    let countdown = 3;
    gameState = 'countdown';
    canvas.style.display = 'block';
    startScreenElement.style.display = 'none';
    scoreElement.style.display = 'block';
    scoreElement.textContent = `Score: ${score}`;

    function drawCountdown() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Desenhar fundo estático durante a contagem
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
        ctx.font = 'bold 72px Arial';
        ctx.fillStyle = '#3010E0';
        ctx.textAlign = 'center';
        ctx.fillText(countdown, canvas.width / 2, canvas.height / 2);
    }

    drawCountdown();

    const countdownInterval = setInterval(() => {
        countdown--;
        if (countdown > 0) {
            drawCountdown();
        } else {
            clearInterval(countdownInterval);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            backgroundX = 0; // Resetar posição do fundo ao iniciar o jogo
            callback();
        }
    }, 1000);
}

function gameLoop() {
    if (gameState === 'over') {
        gameOverElement.style.display = 'block';
        updateHighScore();
        return;
    }
    if (gameState === 'playing') {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Atualizar e desenhar o fundo com movimento
        backgroundX -= backgroundSpeed; // Mover fundo para a esquerda
        if (backgroundX <= -canvas.width) {
            backgroundX += canvas.width; // Resetar quando a imagem sai da tela
        }
        // Desenhar duas instâncias da imagem para repetição contínua
        ctx.drawImage(backgroundImage, backgroundX, 0, canvas.width, canvas.height);
        ctx.drawImage(backgroundImage, backgroundX + canvas.width, 0, canvas.width, canvas.height);

        drawBird();
        drawPipes();
        updateBird();
        updatePipes();
        checkCollision();
        frameCount++;
    }
    requestAnimationFrame(gameLoop);
}

function startGame() {
    if (imagesLoaded < totalImages) {
        console.log('Waiting for images to load...');
        return;
    }
    startCountdown(() => {
        gameState = 'playing';
        gameLoop();
    });
}

function restartGame() {
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    pipes = [];
    score = 0;
    frameCount = 0;
    backgroundX = 0; // Resetar posição do fundo ao reiniciar
    gameState = 'playing';
    scoreElement.textContent = 'Score: 0';
    gameOverElement.style.display = 'none';
    gameLoop();
}

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && gameState === 'playing') {
        bird.velocity = bird.lift;
    }
});

canvas.addEventListener('touchstart', (e) => {
    if (gameState === 'playing') {
        bird.velocity = bird.lift;
        e.preventDefault();
    }
});

canvas.addEventListener('click', () => {
    if (gameState === 'playing') {
        bird.velocity = lift;
    }
});