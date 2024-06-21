const duck = document.getElementById('test-duck');
const gameContainer = document.getElementById('single-game-container');
gameContainer.style.display = 'none';
const testContainer = document.getElementById('single-container');


const duckImages = {
    alive: '../assets/images/alive-duck.png',
    dead: '../assets/images/dead-duck.png'
};

let clickCount = 1;
const clickCoordinates = [];

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
                testContainer.style.display = 'none';
                duck.style.display = 'none';
                gameContainer.style.display = 'flex';
            } else {
                clickCount++;
            }
        }
        duck.src = duckImages.alive;
    }, 600);
});

function saveCoordinates() {
    console.log(clickCoordinates)
    /*
    const file = new Blob([JSON.stringify(clickCoordinates)], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(file);
    a.download = 'test.txt';
    a.click();
    */
}
