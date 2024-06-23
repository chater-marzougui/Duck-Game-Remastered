const gameDuration = 2.5 * 60 * 1000;
let numberToUpdate = 9;

const singleGameContainer = document.getElementById('single-game-container');
const bulletsContainer = document.querySelector('.bullets');
const bullets = bulletsContainer.querySelectorAll('.bullet');
const reload = document.querySelector('.reload');
const resultContainer = document.getElementById('result');
const timerElement = document.getElementById('game-timer');
const killCountElement = document.getElementById('kill-count');
const finalScoreElement = document.getElementById('final-score');
const finalTopScoreElement = document.getElementById('result-top-score');

let gameTimer;
let timeRemaining = gameDuration;

let bulletsRemaining = bullets.length;
let canShoot = true;
let killCount = 0;
let bestScore = 0;
const bullet = new Bullet(singleGameContainer);
function createDuck() {
    const x = Math.round(Math.random()) * window.innerWidth;
    const y = Math.random() * singleGameContainer.clientHeight;
    const direction = x === 0 ? 'right' : 'left';
    const duck = new Duck(ducks.length, x, y, direction, singleGameContainer);
    ducks.push(duck);
}

// Initialize ducks array and create initial ducks
let ducks = [];
for (let i = 0; i < 7; i++) {
    createDuck();
}

// Function to update positions of ducks
function updateDucks() {
    ducks.forEach(duck => {
        duck.updatePosition();
    });
    requestAnimationFrame(updateDucks);
}
updateDucks();

function showKillNotification(imageId, soundId) {
    const shotSound = document.getElementById('shot-sound');
    shotSound.pause();
    shotSound.currentTime = 0;
    const killImg = document.getElementById(imageId);
    const killSound = document.getElementById(soundId);
    killSound.currentTime = 0;
    killSound.play();
    killImg.style.display = 'flex';
    setTimeout(() => {
        killImg.style.display = 'none';
    }, 1500);
}

// Function to detect hits
function detectHit(shotX, shotY) {
    let hits = 0;
    ducks.forEach(duck => {
        const duckRect = duck.element.getBoundingClientRect();
        if (
            shotX >= duckRect.left && shotX <= duckRect.right &&
            shotY >= duckRect.top && shotY <= duckRect.bottom
        ) {
            killCount++;
            hits++;
            if(killCount===1){startGameTimer();}
            if(killCount%numberToUpdate ===0){
                createDuck();
            }
            updateKillCount()
            duck.kill();
        }
    });
    switch (hits) {
        case 2:
            showKillNotification('double-kil-image', 'double-kil-sound');
            break;
        case 3:
            showKillNotification('triple-kil-image', 'triple-kil-sound');
            break;
        case 4:
            showKillNotification('quad-kil-image', 'quad-kil-sound');
            break;
        case 5:
            showKillNotification('quintuple-kil-image', 'quintuple-kil-sound');
            break;
        case 6:
            showKillNotification('quintuple-kil-image', 'quintuple-kil-sound');
            break;
        case 7:
            showKillNotification('quintuple-kil-image', 'quintuple-kil-sound');
            break;
        default:
            break;
    }
}
function regenerate(){
    ducks.forEach(duck => {
        duck.element.remove();
    });
    ducks = [];
    for (let i = 0; i < 7; i++) {
        createDuck();
    }
}
function updateKillCount() {
    killCountElement.textContent = killCount;
}
function regenerateBullets() {
    const shotSound = document.getElementById('reload-sound');
    shotSound.currentTime = 0;
    shotSound.play();
    setTimeout(() => {
        bulletsRemaining = bullets.length;
        updateBullets();
        canShoot = true;
        reload.style.visibility = 'hidden';
    }, 2000);
}
function updateBullets() {
    bullets.forEach((bullet, index) => {
        bullet.style.visibility = index < bulletsRemaining ? 'visible' : 'hidden';
    });
}

function shoot(x, y) {
    if (canShoot && bulletsRemaining > 0) {
        bullet.show(x, y);
        detectHit(x, y);
        bulletsRemaining--;
        updateBullets();
        if (bulletsRemaining === 0) {
            reload.style.visibility = 'visible';
            canShoot = false;
            regenerateBullets();
        }
    }
}
singleGameContainer.addEventListener('click', (event) => {
    event.stopPropagation();
    shoot(event.clientX, event.clientY);
});

function startGameTimer() {
    const endTime = Date.now() + gameDuration;
    gameTimer = setInterval(() => {
        const now = Date.now();
        timeRemaining = endTime - now;
        if (timeRemaining <= 0) {
            clearInterval(gameTimer);
            endGame();
        } else {
            updateTimerDisplay();
        }
    }, 800);
}
function updateTimerDisplay() {
    const minutes = Math.floor(timeRemaining / 60000);
    const seconds = Math.floor((timeRemaining % 60000) / 1000);
    timerElement.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
function endGame() {
    gameContainer.style.display = 'none';
    resultContainer.style.display = 'flex';
    const endSound = document.getElementById('end-sound');
    endSound.currentTime = 0;
    endSound.play();
    finalScoreElement.textContent = `Your score: ${killCount}`;
    finalTopScoreElement.textContent = `Top score: ${bestScore > killCount ? bestScore : killCount}`;
}

function sendToLeaderBoard() {
    const SB = document.getElementById("IEEE-SB").value;
    const userName = document.getElementById("name").value;
    const theMessage = document.getElementById("message").value;
    const theScore = killCount;

    fetch('http://localhost:5000/submit-score', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ SB, userName, theMessage, theScore }),
    })
    .then(response => response.text())
    .then(data => {
        console.log(data);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function displayBestScore() {
    fetch('http://localhost:5000/leaderboard')
        .then(response => response.json())
        .then(data => {
            bestScore = data.bestScore;
            document.getElementById('top-score').textContent = `Best score : ${bestScore}`
        })
        .catch(error => console.error('Error:', error));
}
