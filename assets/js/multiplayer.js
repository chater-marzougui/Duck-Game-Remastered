const duck = document.getElementById('test-duck');
const gameContainer = document.getElementById('multi-game-container');
gameContainer.style.display = 'none';
const testContainer = document.getElementById('single-container');


const duckImages = {
    alive: 'assets/images/alive-duck.png',
    dead: 'assets/images/dead-duck.png'
};

function changeTime() {
    const newTime = document.getElementById('newTime').value;

    let minutes = Math.floor(newTime);
    let seconds = Math.floor((newTime - minutes) * 60);
    let minutesDisplay = String(minutes).padStart(2, '0');
    let secondsDisplay = String(seconds).padStart(2, '0');
    document.getElementById('game-timer').textContent = `${minutesDisplay}:${secondsDisplay}`;

    document.getElementById('timeForm').style.display = 'none';
    gameDuration = newTime * 60 * 1000;
    startGame();

    return false;
}

document.getElementById('adjustTimeBtn').addEventListener('click', function() {
    document.getElementById('timeForm').style.display = 'block';
    document.getElementById('StartGame-Button').style.display = 'none';
});

const testBullet = new Bullet(testContainer);
duck.addEventListener('click', (event) => {
    duck.src = duckImages.dead;
    testBullet.show(event.clientX, event.clientX);
    setTimeout(() => {
        if (clickCount < 5) {
            const { x, y, rotation } = corners[clickCount>3?3:clickCount];
            duck.style.left = `${x}px`;
            duck.style.top = `${y}px`;
            duck.style.transform = `rotate(${rotation}deg)`;
            clickCoordinates.push({ x: event.clientX, y: event.clientY });
    
            if (clickCount === 4) {
                saveCoordinates();
                duck.style.display = 'none';
                startGameB = true;
            } else {
                clickCount++;
            }
        }
        duck.src = duckImages.alive;
    }, 600);
});

let clickCount = 1;
const clickCoordinates = [];
let startGameB = false;

const corners = [
    { x: -40, y: -40, rotation: 135 },
    { x: window.innerWidth + 40 - duck.width, y: -40, rotation: -135 },
    { x: window.innerWidth + 40 - duck.width, y: window.innerHeight + 40 - duck.height, rotation: -45 },
    { x: - 40, y: window.innerHeight + 40 - duck.height, rotation: 45 }
];

function saveCoordinates() {
    fetch('http://localhost:5000/save_coordinates', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ coordinates: clickCoordinates })
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

function startGame() {
    if(startGameB){
    testContainer.style.display = 'none';
    gameContainer.style.display = 'flex';
    document.getElementById('result').style.display = 'none';
    const startSound = document.getElementById('start-sound');
    startSound.currentTime = 0;
    startSound.play();
    regenerate();
    displayBestScore()
    }
    else{
        alert('Please shoot the duck to adjust positioning');
    }
}
