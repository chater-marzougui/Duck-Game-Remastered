const gameContainer = document.getElementById('multi-game-container');
gameContainer.style.display = 'none';

showDialog(player1Dialog);
shakeModals(player1Dialog);

const testBullet = new Bullet(testContainer);
const testBullet2 = new Bullet(testContainer, false);

let player1killCount = 0;
let player2killCount = 0;
let clickCount = 1;
let startGameB = false;

function startGame() {
    if(startGameB){
        testContainer.style.display = 'none';
        gameContainer.style.display = 'flex';
        resetBullets()
        document.getElementById('result').style.display = 'none';
        const startSound = document.getElementById('start-sound');
        startSound.currentTime = 0;
        startSound.play();
        player1killCount = 0;
        player2killCount = 0;
        updateKillCount();
        initializeDucks();
        startGameTimer();
        socket.emit('tracking_data', true)
    }
    else{
        shakeModals();
    }
}

function turnToModal2() {
    hideDialog(player1Dialog);
    showDialog(player2Dialog);
    shakeModals(player2Dialog);
}

function closeModals(){
    hideDialog(player1Dialog);
    hideDialog(player2Dialog);
}

function addKillCount(player) {
    if (player === "player1") {
        player1killCount++;
    } else {
        player2killCount++;
    }
    updateKillCount();
}

function getKillCount(player) {
    return player === "player1" ? player1killCount : player2killCount;
}

function getTotalKillCount() {
    return player1killCount + player2killCount;
}

socket.on('adjustment_shot', (data) => {
    duck.src = duckImages.dead;
    let x = shootCorners[(clickCount -1)%4].x;
    let y = shootCorners[(clickCount -1)%4].y;
    clickCount <= 4 ? testBullet.show(x , y , true) : testBullet2.show(x , y , true);
    if (clickCount === 4) {
        turnToModal2();
    }
    setTimeout(() => {
        const { x, y, rotation } = corners[clickCount%4];
        duck.style.left = `${x}px`;
        duck.style.top = `${y}px`;
        duck.style.transform = `rotate(${rotation}deg)`;
        if (clickCount === 8) {
            saveCoordinates();
            duck.style.display = 'none';
            startGameB = true;
            closeModals();
            testBullet.element.style.display = 'none';
            testBullet2.element.style.display = 'none';
        } else {
            clickCount++;
        }
        duck.src = duckImages.alive;
    }, 600);
});

socket.on('adjustment_done', (value) => {
    if (value === true) {
        duck.style.display = 'none';
        startGameB = true;
        closeModals();
        testBullet.element.style.display = 'none';
    }
});

socket.emit('adjust-shooting', {type: "MultiPlayer", height: window.innerHeight, width: window.innerWidth});
