const gameDuration = 5 * 60 * 1000;
let numberToUpdate = 11;
class Duck {
    constructor(id, x, y, direction, container) {
        this.id = ducks.length + 1;
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.alive = true;
        this.speed = Math.random() * 2 + 2;
        this.images = [
            '../assets/images/flyingduck/flyingduck1.png',
            '../assets/images/flyingduck/flyingduck2.png',
            '../assets/images/flyingduck/flyingduck3.png',
            '../assets/images/flyingduck/flyingduck4.png',
            '../assets/images/flyingduck/flyingduck5.png',
            '../assets/images/flyingduck/flyingduck6.png',
            '../assets/images/flyingduck/flyingduck7.png',
            '../assets/images/flyingduck/flyingduck8.png',
            '../assets/images/flyingduck/deadduck.png'
        ];
        this.currentImageIndex = 0;
        this.element = document.createElement('img');
        this.element.src = this.images[this.currentImageIndex];
        this.element.style.position = 'absolute';
        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;
        this.element.style.transition = 'left 0.1s linear, top 0.1s linear';
        if (this.direction === 'right') {
            this.element.style.transform = 'rotateY(180deg)';
        }
        container.appendChild(this.element);
        
        this.animate();
    }
    
    animate() {
        if (this.alive) {
            this.currentImageIndex = (this.currentImageIndex + 1) % 8;
            this.element.src = this.images[this.currentImageIndex];
            setTimeout(() => this.animate(), 100);
        } else {
            this.element.src = this.images[8];
        }
    }
    
    updatePosition() {
        if (this.alive) {
            if (this.direction === 'left') {
                this.x += this.speed;
                if (this.x > window.innerWidth) {
                    this.direction = 'right';
                    this.element.style.transform = 'rotateY(0deg)';
                }
            } else {
                this.x -= this.speed;
                if (this.x < -this.element.width) {
                    this.direction = 'left';
                    this.element.style.transform = 'rotateY(180deg)';
                }
            }
            this.element.style.left = `${this.x}px`;
            this.element.style.top = `${this.y}px`;
        }
    }

    kill() {
        this.alive = false;
        this.element.src = this.images[8];
        this.fall();
    }
    
    fall() {
        const fallInterval = setInterval(() => {
            if (this.y < window.innerHeight) {
                this.y += 5; // Speed of falling
                this.element.style.top = `${this.y}px`;
            } else {
                clearInterval(fallInterval);
                this.element.remove();
                createDuck();
            }
        }, 30); // Adjust the interval time for smooth falling animation
    }
}

class Bullet {
    constructor(container) {
        this.container = container;
        this.element = document.createElement('img');
        this.element.src = '../assets/images/shot1.png';
        this.element.style.position = 'absolute';
        this.element.style.display = 'none';
        this.element.style.width = '50px';
        this.element.style.transition = 'opacity 0.5s ease';
        container.appendChild(this.element);
    }

    show(x, y) {
        this.element.style.left = `${x - 25}px`;
        this.element.style.top = `${y - 25}px`;
        this.element.style.display = 'block';
        this.element.style.opacity = '1';
        
        // Play shot sound
        const shotSound = document.getElementById('shot-sound');
        shotSound.currentTime = 0; // Rewind to start
        shotSound.play();
        
        // Hide after 0.5s
        setTimeout(() => {
            this.element.style.opacity = '0';
            setTimeout(() => {
                this.element.style.display = 'none';
            }, 500); // Wait for transition to finish
        }, 500);
    }
}

const singleGameContainer = document.getElementById('single-game-container');
const bulletsContainer = document.querySelector('.bullets');
const bullets = bulletsContainer.querySelectorAll('.bullet');
const reload = document.querySelector('.reload');
const resultContainer = document.getElementById('result');
const timerElement = document.getElementById('game-timer');
const killCountElement = document.getElementById('kill-count');
const finalScoreElement = document.getElementById('final-score');

let gameTimer;
let timeRemaining = gameDuration;

let bulletsRemaining = bullets.length;
let canShoot = true;
let killCount = 0;
const bullet = new Bullet(singleGameContainer);
// Function to create a new duck
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
    const killImg = document.getElementById(imageId);
    const killSound = document.getElementById(soundId);
    killSound.currentTime = 0;
    killSound.play();
    killImg.style.display = 'flex';
    setTimeout(() => {
        killImg.style.display = 'none';
    }, 1000);
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
/*
function ensureDucks() {
    const additionalDucks = Math.floor(killCount / 5);
    const targetDucks = 7 + additionalDucks;
    while (ducks.length < targetDucks) {
        createDuck();
    }
}*/

// Function to update the timer display
function updateTimerDisplay() {
    const minutes = Math.floor(timeRemaining / 60000);
    const seconds = Math.floor((timeRemaining % 60000) / 1000);
    timerElement.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    console.log(ducks,"  ",ducks.length);
}

// Function to end the game
function endGame() {
    gameContainer.style.display = 'none';
    resultContainer.style.display = 'flex';
    finalScoreElement.textContent = `Your score: ${killCount}`;
}
