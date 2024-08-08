const gameContainer = document.getElementById('single-game-container');
gameContainer.style.display = 'none';
const unknownDialog = document.getElementById('unknown-player-dialog');
const intruderDialog = document.getElementById('intruder-dialog');

let player = 'player1';
let clickCount = 1;
let startGameB = false;
let killCount = 0;
const testBullet = new Bullet(testContainer);

showDialog(unknownDialog);
shakeModals(unknownDialog);

function closeModals() {
    hideDialog(player1Dialog);
    hideDialog(player2Dialog);
    hideDialog(unknownDialog);
    hideDialog(intruderDialog);
}


function startGame() {
    if(startGameB){
        closeModals();
        testContainer.style.display = 'none';
        gameContainer.style.display = 'flex';
        resetBullets();
        document.getElementById('result').style.display = 'none';
        const startSound = document.getElementById('start-sound');
        startSound.currentTime = 0;
        startSound.play();
        killCount = 0;
        resetGameTimer();
        initializeDucks();
        displayBestScore();
        socket.emit('tracking_data' , true);
    }
    else{
        shakeModals(player1Dialog);
        shakeModals(player2Dialog);
        shakeModals(unknownDialog);
    }
}

function getKillCount() {
    return killCount;
}

function addKillCount() {
    killCount++;
    return killCount;
}

socket.on('adjustment_shot', (data) => {
    duck.src = duckImages.dead;
    let x = shootCorners[(clickCount -1)%4].x;
    let y = shootCorners[(clickCount -1)%4].y;
    testBullet.show(x, y, true);
    setTimeout(() => {
        const { x, y, rotation } = corners[clickCount>3?3:clickCount];
        duck.style.left = `${x}px`;
        duck.style.top = `${y}px`;
        duck.style.transform = `rotate(${rotation}deg)`;
        if (clickCount === 4) {
            saveCoordinates();
            duck.style.display = 'none';
            startGameB = true;
            closeModals();
            testBullet.element.style.display = 'none';
        } else {
            clickCount++;
        }
        duck.src = duckImages.alive;
    }, 600);
});

socket.on('determinePlayer', (data) => {
    closeModals();
    if (data === 'player1') {
        showDialog(player1Dialog);
        shakeModals(player1Dialog);
        player = 'player1';
    } else {
        showDialog(player2Dialog);
        shakeModals(player2Dialog);
        player = 'player2';
    }
});

socket.on('adjustment_done', (value) => {
    if (value === true) {
        duck.style.display = 'none';
        startGameB = true;
        closeModals();
        testBullet.element.style.display = 'none';
    }
});

socket.emit('adjust-shooting', {type: "SinglePlayer", height: window.innerHeight, width: window.innerWidth});
