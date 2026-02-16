import Entity from './Entity.js';

export default class Hole extends Entity {
    constructor(x, y, radius, color, name) {
        super(x, y, radius, color);
        this.type = 'hole';
        this.name = name;
        this.speed = 200; // Base speed
        this.score = 0;
        this.growthRate = 0.5; // How much radius increases per point
        this.shape = 'circle'; // circle, square, star, gear
        this.trail = [];
        this.trailTimer = 0;

        // Power-ups
        this.activePowerUps = {}; // { type: durationLeft }
    }

    applyPowerUp(type) {
        this.activePowerUps[type] = 5.0; // 5 seconds
    }

    update(dt) {
        super.update(dt);

        // Update Powerups
        Object.keys(this.activePowerUps).forEach(type => {
            this.activePowerUps[type] -= dt;
            if (this.activePowerUps[type] <= 0) delete this.activePowerUps[type];
        });

        // Speed Boost Logic
        const currentSpeed = this.activePowerUps['speed'] ? 400 :
                            Math.max(50, 200 - (this.radius - 30) * 0.5);
        this.speed = currentSpeed;

        // Trail logic
        this.trailTimer += dt;
        if (this.trailTimer > 0.05) { // Add point every 0.05s
            this.trail.push({ x: this.x, y: this.y, r: this.radius, a: 0.5 });
            this.trailTimer = 0;
        }

        // Remove old trail
        if (this.trail.length > 20) {
            this.trail.shift();
        }

        // Decay trail
        this.trail.forEach(t => t.a -= dt * 0.5);
        this.trail = this.trail.filter(t => t.a > 0);
    }

    grow(amount) {
        this.score += amount;
        // Simple growth formula: radius += amount * rate / (radius * 0.1)
        // Or just radius += amount * constant.
        // Usually growth slows down as you get bigger.
        // Area = pi * r^2. Mass ~ Area.
        // Mass += amount. NewArea = OldArea + amount.
        // r = sqrt(NewArea / pi).

        const currentArea = Math.PI * this.radius * this.radius;
        const addedArea = amount * 100; // Doubled growth rate for faster pacing
        const newArea = currentArea + addedArea;
        this.radius = Math.sqrt(newArea / Math.PI);

        // Cap max size?
        if (this.radius > 500) this.radius = 500;

        // Recalculate speed (bigger = slower)
        this.speed = Math.max(50, 200 - (this.radius - 30) * 0.5);
    }

    shrink(amount) {
        this.score = Math.max(0, this.score - amount * 5); // 5x penalty for score
        const currentArea = Math.PI * this.radius * this.radius;
        const removeArea = amount * 100;
        const newArea = Math.max(Math.PI * 40 * 40, currentArea - removeArea); // Don't go below 40
        this.radius = Math.sqrt(newArea / Math.PI);
        this.speed = Math.max(50, 200 - (this.radius - 30) * 0.5);
    }

    update(dt) {
        // Movement logic will be handled by subclasses (Player input vs Bot AI)
        super.update(dt);
    }
}
