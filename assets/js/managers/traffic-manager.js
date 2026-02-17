import Prop from '../entities/prop.js';

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
                this.spawnVehicle();
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

    spawnVehicle() {
        const isHorizontal = Math.random() > 0.5;
        // Align to grid (multiple of 200)
        // Range -1000 to 1000 (if world is 2000, now 4000)
        const lines = Math.floor(this.worldSize / this.roadSpacing);
        const lineIndex = Math.floor(Math.random() * lines) - Math.floor(lines/2);
        const lanePos = lineIndex * this.roadSpacing;

        const direction = Math.random() > 0.5 ? 1 : -1;

        // Determine Type
        const rand = Math.random();
        let type = 'car';
        let width = 20;
        let height = 30; // Length
        let speed = 150 + Math.random() * 100;
        let color = Math.random() > 0.5 ? '#ff0055' : '#0055ff';

        if (rand < 0.2) { // 20% Truck
            type = 'truck';
            width = 25;
            height = 60;
            speed = 100 + Math.random() * 50;
            color = '#ffffff'; // White trucks
        } else if (rand < 0.4) { // 20% Bus
            type = 'bus';
            width = 25;
            height = 50;
            speed = 120 + Math.random() * 60;
            color = '#ffae00'; // School bus yellow
        } else {
            // Cars can be varied colors
            const carColors = ['#ff0055', '#0055ff', '#00ffaa', '#aa00ff'];
            color = carColors[Math.floor(Math.random() * carColors.length)];
        }

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

        const vehicle = new Prop(x, y, type, 5, width, height, color);
        vehicle.velocity = { x: vx, y: vy };
        vehicle.rotation = rotation;
        vehicle.isTraffic = true;

        this.cars.push(vehicle);
        this.gameManager.entities.push(vehicle);
    }
}
