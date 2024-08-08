const singleGameContainer = document.getElementById('multi-game-container');

const player1Bullets = bulletsContainer.querySelectorAll('.bullet1');
const player2Bullets = bulletsContainer.querySelectorAll('.bullet2');
const player1Reload = document.querySelector('.reload-player1');
const player2Reload = document.querySelector('.reload-player2');
const player1killCountElement = document.getElementById('player1-kill-count');
const player2killCountElement = document.getElementById('player2-kill-count');
const finalScorePlayer1 = document.getElementById('player1-score');
const finalScorePlayer2 = document.getElementById('player2-score');


let player1BulletsRemaining = player1Bullets.length;
let player1canShoot = true;
let player2BulletsRemaining = player2Bullets.length;
let player2canShoot = true;

const bullet1 = new Bullet(singleGameContainer);
const bullet2 = new Bullet(singleGameContainer ,false);

function detectHit(shotX, shotY, player) {
    let hits = 0;
    ducks.forEach(duck => {
        const duckRect = duck.element.getBoundingClientRect();
        if (
            shotX >= duckRect.left && shotX <= duckRect.right &&
            shotY >= duckRect.top && shotY <= duckRect.bottom && duck.alive
        ) {
            addKillCount(player);
            hits++;
            duck.kill();
            if(getTotalKillCount()%numberToUpdate ===0 && getTotalKillCount()<maxNumberToUpdate){
                createDuck();
            }
        }
    });
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

function updateKillCount() {
    player1killCountElement.textContent = player1killCount;
    player2killCountElement.textContent = player2killCount;
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

function resetBullets() {
    player1BulletsRemaining = player1Bullets.length;
    player2BulletsRemaining = player2Bullets.length;
    updateBullets1();
    updateBullets2();
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
        bullet1.show(x, y, true);
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
        bullet2.show(x, y, true);
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

function endGame() {
    gameContainer.style.display = 'none';
    removeDucks();
    resultContainer.style.display = 'flex';
    const endSound = document.getElementById('end-sound');
    endSound.currentTime = 0;
    endSound.play();
    finalScorePlayer1.textContent = `Your score: ${player1killCount}`;
    finalScorePlayer2.textContent = `Your score: ${player2killCount}`;
    socket.emit('tracking_data', false)
}

socket.on('position', (data) => {
    let x = parseInt(data.x * singleGameContainer.clientWidth);
    let y = parseInt(data.y * singleGameContainer.clientHeight);
    if (data.should_shoot) {
        shoot(x, y, data.player_id);
    }
    else if (data.player_id === "player1") {
        bullet1.show(x, y);
    }
    else if (data.player_id === "player2") {
        bullet2.show(x, y);
    }
});

updateDucks();