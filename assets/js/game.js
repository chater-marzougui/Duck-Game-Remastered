const duck = document.getElementById('test-duck');
const testContainer = document.getElementById('single-container');
const player1Dialog = document.getElementById('player1-dialog');
const player2Dialog = document.getElementById('player2-dialog');
const clickSpace = document.getElementById('click-space');
const resultContainer = document.getElementById('result');
const timerElement = document.getElementById('game-timer');
const bulletsContainer = document.querySelector('.bullets');

let gameDuration = 2 * 60 * 1000;
const numberToUpdate = 9;
const maxNumberToUpdate = 200;
const duckImages = {
    alive: 'assets/images/alive-duck.png',
    dead: 'assets/images/dead-duck.png'
};
const shootCorners = [
    {x: 0, y: 0},
    {x: window.innerWidth, y: 0},
    {x: window.innerWidth, y: window.innerHeight},
    {x: 0, y: window.innerHeight}
];
const corners = [
    { x: -40, y: -40, rotation: 135 },
    { x: window.innerWidth + 40 - duck.width, y: -40, rotation: -135 },
    { x: window.innerWidth + 40 - duck.width, y: window.innerHeight + 40 - duck.height, rotation: -45 },
    { x: -40, y: window.innerHeight + 40 - duck.height, rotation: 45 }
];

let gameTimer;
let timeRemaining = gameDuration;
let bestScore = 0;
let ducks = [];

const socket = io('http://localhost:5000');
socket.on('connect', () => {
    console.log('Connected to WebSocket server');
});
socket.on('disconnect', () => {
    console.log('Disconnected from WebSocket server');
});
socket.emit('tracking_data', true);
socket.on('shakeModals', (data) => {
    if (data === 'player1') {
        shakeModals(player2Dialog);
    } else {
        shakeModals(player1Dialog);
    }
});

document.getElementById('adjustTimeBtn').addEventListener('click', function() {
    document.getElementById('timeForm').style.display = 'block';
    document.getElementById('StartGame-Button').style.display = 'none';
});

function saveCoordinates() {
    fetch('http://localhost:5000/save_coordinates', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ game: "start" })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            console.log('Coordinates saved successfully');
        } else {
            console.error('Error saving coordinates:', data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function showDialog(dialog) {
    dialog.style.display = 'block';
}

function hideDialog(dialog) {
    dialog.style.display = 'none';
}

function shakeModals(dialog) {
    dialog.style.animation = 'shake 0.5s linear infinite';
    setTimeout(() => {
        dialog.style.animation = 'none';
    }, 700);
}

function changeTime() {
    const newTime = document.getElementById('newTime').value;
    let minutes = Math.floor(newTime);
    let seconds = Math.floor((newTime - minutes) * 60);
    let minutesDisplay = String(minutes).padStart(2, '0');
    let secondsDisplay = String(seconds).padStart(2, '0');
    timerElement.textContent = `${minutesDisplay}:${secondsDisplay}`;
    document.getElementById('timeForm').style.display = 'none';
    gameDuration = newTime * 60 * 1000;
    startGame();
    return false;
}

function initializeDucks() {
    for (let i = 0; i < 7; i++) {
        createDuck();
    }
}

function createDuck() {
    const x = Math.round(Math.random()) * window.innerWidth;
    const yCalc = Math.random() * singleGameContainer.clientHeight - 140;
    const y = yCalc > 0 ? yCalc : yCalc + 140;
    const direction = Math.round(Math.random()) === 0 ? 'left' : 'right';
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

function regenerate() {
    ducks.forEach(duck => {
        duck.element.remove();
    });
    ducks = [];
    for (let i = 0; i < 7; i++) {
        createDuck();
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

function removeDucks() {
    ducks.forEach(duck => {
        duck.element.remove();
    });
    ducks = [];
}

function resetGameTimer() {
    timeRemaining = gameDuration;
    updateTimerDisplay();
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
            document.getElementById('top-score').textContent = `Best score: ${bestScore}`;
        })
        .catch(error => console.error('Error:', error));
}

function showIntruder(player) {
    const intruderText = document.getElementById('intruder-text');
    intruderText.textContent = `${player} get out!`;
    if (player === "player1") {
        intruderDialog.classList.remove("redD");
        intruderDialog.classList.add("blueD");
    } else if (player === "player2") {
        intruderDialog.classList.remove("blueD");
        intruderDialog.classList.add("redD");
    }
    showDialog(intruderDialog);
    shakeModals(intruderDialog);
    setTimeout(() => {
        hideDialog(intruderDialog);
    }, 1000);
}

updateTimerDisplay();
