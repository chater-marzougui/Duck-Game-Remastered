const duck = document.getElementById('test-duck');
const gameContainer = document.getElementById('single-game-container');
gameContainer.style.display = 'none';
const testContainer = document.getElementById('single-container');


const duckImages = {
    alive: 'assets/images/alive-duck.png',
    dead: 'assets/images/dead-duck.png'
};

let clickCount = 1;
const clickCoordinates = [];
let startGameB = false;

const corners = [
    { x: -40, y: -40, rotation: 135 },
    { x: window.innerWidth + 40 - duck.width, y: -40, rotation: -135 },
    { x: window.innerWidth + 40 - duck.width, y: window.innerHeight + 40 - duck.height, rotation: -45 },
    { x: - 40, y: window.innerHeight + 40 - duck.height, rotation: 45 }
];

duck.addEventListener('click', (event) => {
    event.stopPropagation();
    duck.src = duckImages.dead;
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

function startGame() {
    if(startGameB){
    testContainer.style.display = 'none';
    gameContainer.style.display = 'flex';
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
