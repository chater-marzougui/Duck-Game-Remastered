class Duck {
    constructor(id, x, y, direction, container) {
        this.id = id;
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

// Ensure the container element is available
const singleGameContainer = document.getElementById('single-game-container');

// Function to create a new duck
function createDuck() {
    const x = Math.round(Math.random()) * window.innerWidth;
    const y = Math.random() * singleGameContainer.clientHeight;
    const direction = x === 0 ? 'right' : 'left';
    const duck = new Duck(ducks.length, x, y, direction, singleGameContainer);
    ducks.push(duck);
}

// Initialize ducks array and create initial ducks
const ducks = [];
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

// Function to detect hits
function detectHit(shotX, shotY) {
    ducks.forEach(duck => {
        const duckRect = duck.element.getBoundingClientRect();
        
        if (
            shotX >= duckRect.left && shotX <= duckRect.right &&
            shotY >= duckRect.top && shotY <= duckRect.bottom
        ) {
            duck.kill();
            console.log(`Duck ${duck.id} killed`);
        }
    });
}

// Example function to simulate a shot
function simulateShot() {
    const shotX = Math.random() * window.innerWidth;
    const shotY = Math.random() * window.innerHeight;
    console.log(`Shot at: (${shotX}, ${shotY})`);
    detectHit(shotX, shotY);
}

// Simulate a shot every 2 seconds
setInterval(simulateShot, 2000);
