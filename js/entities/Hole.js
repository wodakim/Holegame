import Entity from './Entity.js';

export default class Hole extends Entity {
    constructor(x, y, radius, color, name) {
        super(x, y, radius, color);
        this.type = 'hole';
        this.name = name;
        this.speed = 200; // Base speed
        this.score = 0;
        this.growthRate = 0.5; // How much radius increases per point
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
        const addedArea = amount * 50; // Scale factor for visual growth
        const newArea = currentArea + addedArea;
        this.radius = Math.sqrt(newArea / Math.PI);

        // Cap max size?
        if (this.radius > 500) this.radius = 500;

        // Recalculate speed (bigger = slower)
        this.speed = Math.max(50, 200 - (this.radius - 30) * 0.5);
    }

    update(dt) {
        // Movement logic will be handled by subclasses (Player input vs Bot AI)
        super.update(dt);
    }
}
