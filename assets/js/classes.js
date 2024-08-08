class Duck {
    constructor(id, x, y, direction, container) {
        this.id = ducks.length + 1;
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.alive = true;
        this.speed = Math.random() * 2 + 2;
        this.images = [
            'assets/images/flyingduck/flyingduck1.png',
            'assets/images/flyingduck/flyingduck2.png',
            'assets/images/flyingduck/flyingduck3.png',
            'assets/images/flyingduck/flyingduck4.png',
            'assets/images/flyingduck/flyingduck5.png',
            'assets/images/flyingduck/flyingduck6.png',
            'assets/images/flyingduck/flyingduck7.png',
            'assets/images/flyingduck/flyingduck8.png',
            'assets/images/flyingduck/deadduck.png'
        ];
        this.currentImageIndex = 0;
        this.element = document.createElement('img');
        this.element.src = this.images[this.currentImageIndex];
        this.element.style.position = 'absolute';
        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;
        this.element.style.transition = 'left 0.02s linear, top 0.02s linear';
        if (this.direction === 'left') {
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
        createDuck();
        const fallInterval = setInterval(() => {
            if (this.y < window.innerHeight) {
                this.y += 6;
                this.element.style.top = `${this.y}px`;
            } else {
                clearInterval(fallInterval);
                this.element.remove();
            }
        }, 30); // Adjust the interval time for smooth falling animation
    }
}

class Bullet {
    constructor(container, useShot1 = true) {
        this.container = container;
        this.useShot1 = useShot1;
        this.element = document.createElement('img');
        this.isShot = false;
        this.element.src = useShot1 ? 'assets/images/shot1.png' : 'assets/images/shot2.png';
        this.element.style.position = 'absolute';
        this.element.style.display = 'none';
        this.element.style.width = '50px';
        this.element.style.transition = 'left 0.2s ease, top 0.2s ease';
        container.appendChild(this.element);
        this.resetTimeout = null;
    }

    show(x, y, shoot = false) {
        clearTimeout(this.resetTimeout);
        if(!this.isShot){
            this.element.src = this.useShot1 ? 'assets/images/shot1.png' : 'assets/images/shot2.png';
            this.element.style.left = `${x - 25}px`;
            this.element.style.top = `${y - 25}px`;
            this.element.style.display = 'block';
            this.element.style.opacity = '1';
            this.resetTimeout = setTimeout(() => {
                this.element.style.opacity = '0';
            }, 2500);
        } else {
            this.element.src = this.useShot1 ? 'assets/images/shot1Hole.png' : 'assets/images/shot2Hole.png';
        }
        if (shoot) {
            this.isShot = true;
            const shotSound = document.getElementById('shot-sound');
            shotSound.currentTime = 0;
            shotSound.play();
            setTimeout(() => {
                this.isShot = false;
            }, 600);
        }
    }
}
