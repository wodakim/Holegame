import Prop from '../entities/Prop.js';

export default class TrafficManager {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.worldSize = gameManager.worldSize;
        this.cars = [];
        this.spawnTimer = 0;
        this.roadSpacing = 200;
        this.maxCars = 50;
    }

    update(dt) {
        this.spawnTimer += dt;

        // Spawn Traffic
        if (this.spawnTimer > 1.0) { // Every 1s check
            if (this.cars.length < this.maxCars) {
                this.spawnCar();
            }
            this.spawnTimer = 0;
        }

        // Clean up out of bounds
        this.cars = this.cars.filter(c => !c.markedForDeletion);
        // Also check if they drove off world
        this.cars.forEach(car => {
            if (Math.abs(car.x) > this.worldSize/2 + 200 || Math.abs(car.y) > this.worldSize/2 + 200) {
                car.markedForDeletion = true;
            }
        });
    }

    spawnCar() {
        const isHorizontal = Math.random() > 0.5;
        // Align to grid (multiple of 200)
        // Range -1000 to 1000 (if world is 2000)
        const lines = Math.floor(this.worldSize / this.roadSpacing);
        const lineIndex = Math.floor(Math.random() * lines) - Math.floor(lines/2);
        const lanePos = lineIndex * this.roadSpacing;

        const direction = Math.random() > 0.5 ? 1 : -1;
        const speed = 150 + Math.random() * 100;

        let x, y, vx, vy, rotation;

        if (isHorizontal) {
            x = -direction * (this.worldSize/2 + 100);
            y = lanePos;
            vx = direction * speed;
            vy = 0;
            rotation = direction > 0 ? 0 : Math.PI;
        } else {
            x = lanePos;
            y = -direction * (this.worldSize/2 + 100);
            vx = 0;
            vy = direction * speed;
            rotation = direction > 0 ? Math.PI/2 : -Math.PI/2;
        }
        // Chance for Police Car (10%)
        const isPolice = Math.random() < 0.1;
        const type = isPolice ? 'police' : 'car';
        const color = isPolice ? '#000000' : (Math.random() > 0.5 ? '#ff0055' : '#0055ff');

        const car = new Prop(x, y, type, isPolice ? 0 : 5, 20, 30, color);
        car.velocity = { x: isPolice ? vx * 1.5 : vx, y: isPolice ? vy * 1.5 : vy }; // Police faster
        car.rotation = rotation;
        car.isTraffic = true;

        this.cars.push(car);
        this.gameManager.entities.push(car);
    }
}
