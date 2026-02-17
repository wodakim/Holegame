import Hole from './hole.js';

export default class Bot extends Hole {
    constructor(x, y, radius, color, name) {
        super(x, y, radius, color, name);
        this.type = 'hole'; // Ensure type is set
        this.name = name;
        this.state = 'wander'; // wander, chase, flee
        this.target = null;
        this.lastStateChange = 0;
        this.wanderAngle = Math.random() * Math.PI * 2;
        this.speed = 200; // Base speed
    }

    update(dt, entities) {
        super.update(dt);

        // AI Logic
        let closestThreat = null;
        let closestFood = null;
        let minThreatDist = Infinity;
        let minFoodDist = Infinity;

        // Scan radius
        const scanRadius = 600;

        entities.forEach(entity => {
            if (entity === this) return;
            if (entity.markedForDeletion) return;

            const dx = entity.x - this.x;
            const dy = entity.y - this.y;
            const distSq = dx*dx + dy*dy;

            // Optimization: skip far entities
            if (distSq > scanRadius * scanRadius) return;

            const dist = Math.sqrt(distSq);

            if (entity.type === 'hole') {
                if (entity.radius > this.radius * 1.1) {
                    if (dist < minThreatDist) {
                        minThreatDist = dist;
                        closestThreat = entity;
                    }
                } else if (entity.radius < this.radius * 0.9) { // Can eat
                    if (dist < minFoodDist) {
                        minFoodDist = dist;
                        closestFood = entity;
                    }
                }
            } else if (entity.type === 'prop') {
                // Check if eatable
                if (this.radius > entity.radius * 1.1) {
                     if (dist < minFoodDist) {
                        minFoodDist = dist;
                        closestFood = entity;
                     }
                }
            }
        });

        // Decision
        if (closestThreat && minThreatDist < 400) {
            this.state = 'flee';
            this.target = closestThreat;
        } else if (closestFood && minFoodDist < 500) {
            this.state = 'chase';
            this.target = closestFood;
        } else {
            this.state = 'wander';
            this.target = null;
        }

        // Action
        let vx = 0, vy = 0;

        if (this.state === 'flee') {
            const dx = this.x - this.target.x;
            const dy = this.y - this.target.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist > 0) {
                vx = (dx / dist) * this.speed;
                vy = (dy / dist) * this.speed;
            }
        } else if (this.state === 'chase') {
            const dx = this.target.x - this.x;
            const dy = this.target.y - this.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist > 0) {
                vx = (dx / dist) * this.speed;
                vy = (dy / dist) * this.speed;
            }
        } else {
            // Wander
            this.lastStateChange += dt;
            if (this.lastStateChange > 1.5 + Math.random()) {
                this.wanderAngle += (Math.random() - 0.5) * 2; // Turn slightly
                this.lastStateChange = 0;
            }
            vx = Math.cos(this.wanderAngle) * this.speed * 0.6;
            vy = Math.sin(this.wanderAngle) * this.speed * 0.6;
        }

        this.velocity = { x: vx, y: vy };

        // Boundaries handled by Physics? No, infinite map.
        // Despawning handled by GameManager if too far.
    }
}
