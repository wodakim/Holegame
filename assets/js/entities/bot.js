import Hole from './hole.js';

export default class Bot extends Hole {
    constructor(x, y, radius, color, name) {
        super(x, y, radius, color, name);
        this.state = 'wander'; // wander, chase, flee
        this.target = null;
        this.lastStateChange = 0;
        this.wanderAngle = Math.random() * Math.PI * 2;
    }

    update(dt, entities) {
        super.update(dt);

        // AI Logic
        // 1. Scan environment
        let closestThreat = null;
        let closestFood = null;
        let minThreatDist = Infinity;
        let minFoodDist = Infinity;

        entities.forEach(entity => {
            if (entity === this) return;
            if (entity.markedForDeletion) return;

            const dx = entity.x - this.x;
            const dy = entity.y - this.y;
            const dist = Math.sqrt(dx*dx + dy*dy);

            if (entity.type === 'hole') {
                if (entity.radius > this.radius * 1.1) {
                    if (dist < minThreatDist) {
                        minThreatDist = dist;
                        closestThreat = entity;
                    }
                } else if (entity.radius < this.radius * 0.9) {
                    if (dist < minFoodDist) {
                        minFoodDist = dist;
                        closestFood = entity;
                    }
                }
            } else if (entity.type === 'prop') {
                // Props are food too
                if (dist < minFoodDist && dist < 300) { // Only care about close props
                    minFoodDist = dist;
                    closestFood = entity;
                }
            }
        });

        // 2. Decide State
        if (closestThreat && minThreatDist < 400) {
            this.state = 'flee';
            this.target = closestThreat;
        } else if (closestFood && minFoodDist < 300) {
            this.state = 'chase';
            this.target = closestFood;
        } else {
            this.state = 'wander';
            this.target = null;
        }

        // 3. Execute State
        if (this.state === 'flee') {
            const dx = this.x - this.target.x; // Move away
            const dy = this.y - this.target.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            this.velocity.x = (dx / dist) * this.speed;
            this.velocity.y = (dy / dist) * this.speed;
        } else if (this.state === 'chase') {
            const dx = this.target.x - this.x; // Move towards
            const dy = this.target.y - this.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            this.velocity.x = (dx / dist) * this.speed;
            this.velocity.y = (dy / dist) * this.speed;
        } else {
            // Wander: Change direction occasionally
            this.lastStateChange += dt;
            if (this.lastStateChange > 2) { // Change every 2s
                this.wanderAngle += (Math.random() - 0.5) * 2;
                this.lastStateChange = 0;
            }

            this.velocity.x = Math.cos(this.wanderAngle) * this.speed * 0.5; // Slower wander
            this.velocity.y = Math.sin(this.wanderAngle) * this.speed * 0.5;

            // Avoid boundaries by turning back?
            // Physics.clampToWorld handles hard stop, but bot should turn away smoothly?
            // Simple bounce logic:
            if (this.x < -1800 || this.x > 1800 || this.y < -1800 || this.y > 1800) {
                this.wanderAngle += Math.PI; // Turn around
            }
        }
    }
}
