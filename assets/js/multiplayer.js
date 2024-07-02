const singleGameContainer = document.getElementById('multi-game-container');
const bulletsContainer = document.querySelector('.bullets');
const player1Bullets = bulletsContainer.querySelectorAll('.bullet1');
const player2Bullets = bulletsContainer.querySelectorAll('.bullet2');
const player1Reload = document.querySelector('.reload-player1');
const player2Reload = document.querySelector('.reload-player2');
const resultContainer = document.getElementById('result');
const timerElement = document.getElementById('game-timer');
const player1killCountElement = document.getElementById('player1-kill-count');
const player2killCountElement = document.getElementById('player2-kill-count');
const finalScoreElement = document.getElementById('final-score');
const clickSpace = document.getElementById('click-space');
const finalTopScoreElement = document.getElementById('result-top-score');

let gameDuration = 2 * 60 * 1000;
let numberToUpdate = 9;
let maxNumberToUpdate = 250;

let gameTimer;
let timeRemaining = gameDuration;
updateTimerDisplay();

let player1BulletsRemaining = player1Bullets.length;
let player1canShoot = true;
let player1killCount = 0;
let player2BulletsRemaining = player2Bullets.length;
let player2canShoot = true;
let player2killCount = 0;

let bestScore = 0;
const bullet1 = new Bullet(singleGameContainer);
const bullet2 = new Bullet(singleGameContainer ,false);



let ducks = [];
function initializeDucks(){
    for (let i = 0; i < 7; i++) {
        createDuck();
    }
}

function createDuck() {
    const x = Math.round(Math.random()) * window.innerWidth;
    const y = Math.random() * singleGameContainer.clientHeight;
    const direction = x === 0 ? 'right' : 'left';
    const duck = new Duck(ducks.length, x, y, direction, singleGameContainer);
    ducks.push(duck);
}

function updateDucks() {
    ducks.forEach(duck => {
        duck.updatePosition();
    });
    requestAnimationFrame(updateDucks);
}

function showKillNotification(imageId, soundId) {
    const shotSound = document.getElementById('shot-sound');
    shotSound.volume = 0.4;
    const killImg = document.getElementById(imageId);
    const killSound = document.getElementById(soundId);
    killSound.currentTime = 0;
    killSound.play();
    killImg.style.display = 'flex';
    setTimeout(() => {
        killImg.style.display = 'none';
    }, 1500);
}

function detectHit(shotX, shotY, player) {
    let hits = 0;
    if (player === "player1") {
        ducks.forEach(duck => {
            const duckRect = duck.element.getBoundingClientRect();
            if (shotX >= duckRect.left && shotX <= duckRect.right &&
                shotY >= duckRect.top && shotY <= duckRect.bottom) {
                player1killCount++;
                hits++;
                if(player1killCount%numberToUpdate ===0 && (player2killCount + player1killCount)<maxNumberToUpdate){
                    createDuck();
                }
                duck.kill();
            }
        });
    }
    if (player === "player1") {
        ducks.forEach(duck => {
            const duckRect = duck.element.getBoundingClientRect();
            if (
                shotX >= duckRect.left && shotX <= duckRect.right &&
                shotY >= duckRect.top && shotY <= duckRect.bottom
            ) {
                player2killCount++;
                hits++;
                if(player2killCount%numberToUpdate ===0 && (player1killCount + player2killCount )<maxNumberToUpdate){
                    createDuck();
                }
                duck.kill();
            }
        });
    }
    updateKillCount();
    switch (hits) {
        case 0:
            break;
        case 1:
            break;
        case 2:
            showKillNotification('double-kil-image', 'double-kil-sound');
            break;
        case 3:
            showKillNotification('triple-kil-image', 'triple-kil-sound');
            break;
        case 4:
            showKillNotification('quad-kil-image', 'quad-kil-sound');
            break;
        default:
            showKillNotification('quintuple-kil-image', 'quintuple-kil-sound');
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

function updateKillCount(thePlayer) {
    if (thePlayer === "player1") {
        player1killCountElement.textContent = player1killCount;
    } else if (thePlayer === "player2") {
        player2killCountElement.textContent = player2killCount;
    }
}

function regenerateBullets1() {
    const shotSound = document.getElementById('reload-sound');
    shotSound.currentTime = 0;
    shotSound.play();
    setTimeout(() => {
        player1BulletsRemaining = player1Bullets.length;
        updateBullets1();
        player1canShoot = true;
        player1Reload.style.visibility = 'hidden';
    }, 2000);
}

function regenerateBullets2() {
    const shotSound = document.getElementById('reload-sound');
    shotSound.currentTime = 0;
    shotSound.play();
    setTimeout(() => {
        player2BulletsRemaining = player2Bullets.length;
        updateBullets2();
        player2canShoot = true;
        player2Reload.style.visibility = 'hidden';
    }, 2000);
}

function updateBullets1() {
    player1Bullets.forEach((bullet, index) => {
        bullet.style.visibility = index < player1BulletsRemaining ? 'visible' : 'hidden';
    });
}

function updateBullets2() {
    player2Bullets.forEach((bullet, index) => {
        bullet.style.visibility = index < player2BulletsRemaining ? 'visible' : 'hidden';
    });
}

function shoot(x, y , player) {
    if (player1canShoot && player1BulletsRemaining > 0 && player == "player1") {
        bullet1.show(x, y);
        detectHit(x, y , "player1");
        player1BulletsRemaining--;
        updateBullets1();
        if (player1BulletsRemaining === 0) {
            player1Reload.style.visibility = 'visible';
            player1canShoot = false;
            regenerateBullets1();
        }
    }
    if (player2canShoot && player2BulletsRemaining > 0 && player == "player2") {
        bullet2.show(x, y);
        detectHit(x, y, "player2");
        player2BulletsRemaining--;
        updateBullets2();
        if (player2BulletsRemaining === 0) {
            player2Reload.style.visibility = 'visible';
            player2canShoot = false;
            regenerateBullets2();
        }
    }
}

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
    }, 500);
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

let player1 = setInterval(() => {
    let player1_x = Math.random() * singleGameContainer.clientWidth;
    let player1_y = Math.random() * singleGameContainer.clientHeight;
    shoot(player1_x, player1_y, "player1")
}, 1100);

let player2 = setInterval(() => {
    let player2_x = Math.random() * singleGameContainer.clientWidth;
    let player2_y = Math.random() * singleGameContainer.clientHeight;
    shoot(player2_x, player2_y, "player2")
}, 1500);

updateDucks();

function deb() {
    testContainer.style.display = 'none';
    gameContainer.style.display = 'flex';
    document.getElementById('result').style.display = 'none';
}