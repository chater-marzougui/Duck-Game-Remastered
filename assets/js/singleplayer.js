const singleGameContainer = document.getElementById('single-game-container');

const finalTopScoreElement = document.getElementById('result-top-score');
const bullets = bulletsContainer.querySelectorAll('.bullet');
const reload = document.querySelector('.reload');
const killCountElement = document.getElementById('kill-count');
const finalScoreElement = document.getElementById('final-score');

let bulletsRemaining = bullets.length;
let canShoot = true;
let localKillCount = 0;
const bullet = new Bullet(singleGameContainer);

function detectHit(shotX, shotY) {
    let hits = 0;
    ducks.forEach(duck => {
        const duckRect = duck.element.getBoundingClientRect();
        if (
            shotX >= duckRect.left && shotX <= duckRect.right &&
            shotY >= duckRect.top && shotY <= duckRect.bottom && duck.alive
        ) {
            localKillCount = addKillCount();
            hits++;
            if(localKillCount===1){startGameTimer();}
            if(localKillCount%numberToUpdate ===0 && localKillCount<maxNumberToUpdate){
                createDuck();
            }
            updateKillCount()
            duck.kill();
        }
    });
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

function resetBullets() {
    bulletsRemaining = bullets.length;
    updateBullets();
}

function shoot(x, y) {
    if (canShoot && bulletsRemaining > 0) {
        bullet.show(x, y, true);
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

function endGame() {
    localKillCount = getKillCount();
    gameContainer.style.display = 'none';
    resultContainer.style.display = 'flex';
    removeDucks();
    const endSound = document.getElementById('end-sound');
    endSound.currentTime = 0;
    endSound.play();
    finalScoreElement.textContent = `Your score: ${killCount}`;
    finalTopScoreElement.textContent = `Top score: ${bestScore > killCount ? bestScore : killCount}`;
    socket.emit('tracking_data', false);
}

socket.on('position', (data) => {
    let x = parseInt(data.x * singleGameContainer.clientWidth);
    let y = parseInt(data.y * singleGameContainer.clientHeight);
    if (data.should_shoot && data.player_id === player) {
        shoot(x, y);
    } else if (data.player_id === player){
        bullet.show(x, y);
    } else {
        showDialog(player2Dialog);
        shakeModals();
    }
});

socket.on('intruder', (player) => {
    showIntruder(player);
});

updateDucks();