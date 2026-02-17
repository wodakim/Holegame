import Entity from './entity.js';

export default class Hole extends Entity {
    constructor(x, y, radius, color, name) {
        super(x, y, radius, color, name);
        this.type = 'hole';
        this.name = name;
        this.speed = 150; // Base speed (reduced from 200)
        this.score = 0;
        this.shape = 'circle'; // circle, square, star, gear
        this.trail = [];
        this.trailTimer = 0;

        // Upgrade Stats
        this.growthMultiplier = 1.0;
        this.suctionRange = 1.0;
        this.satellites = 0; // Number of small orbiting holes

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

        // Speed Logic
        // Base speed decreases slightly with size, but active speed boost overrides.
        let baseSpeed = this.speed; // From upgrades
        // Slow down as we get huge (logarithmic penalty)
        const sizePenalty = Math.max(0, (this.radius - 25) * 0.2);
        const currentSpeed = this.activePowerUps['speed'] ? (baseSpeed + 200) : Math.max(50, baseSpeed - sizePenalty);

        // Apply to entity logic (GameManager handles input -> velocity)
        // But here we just expose 'speed' property for input handler.
        this.currentSpeed = currentSpeed; // Use this in Player/Bot update

        // Trail logic
        this.trailTimer += dt;
        if (this.trailTimer > 0.05) {
            this.trail.push({ x: this.x, y: this.y, r: this.radius, a: 0.5 });
            this.trailTimer = 0;
        }
        if (this.trail.length > 20) this.trail.shift();
        this.trail.forEach(t => t.a -= dt * 0.5);
        this.trail = this.trail.filter(t => t.a > 0);
    }

    grow(amount) {
        // Apply Growth Multiplier (Upgrade)
        const effectiveAmount = amount * this.growthMultiplier;

        this.score += effectiveAmount;

        // Logarithmic Growth Formula
        // Initial Radius: 25 (Area ~1963)
        // We want growth to be slow.
        // New Area = Old Area + (Amount * Constant)
        // Constant was 100. Let's make it 10 for very slow growth.
        // It should take many small items to grow visibly.

        const currentArea = Math.PI * this.radius * this.radius;
        const addedArea = effectiveAmount * 12; // Further reduced for scalable challenge
        const newArea = currentArea + addedArea;

        this.radius = Math.sqrt(newArea / Math.PI);

        // Cap max size
        if (this.radius > 600) this.radius = 600;
    }

    shrink(amount) {
        this.score = Math.max(0, this.score - amount * 5);
        const currentArea = Math.PI * this.radius * this.radius;
        const removeArea = amount * 15;
        const newArea = Math.max(Math.PI * 25 * 25, currentArea - removeArea); // Min radius 25
        this.radius = Math.sqrt(newArea / Math.PI);
    }

    addUpgrade(type) {
        console.log(`Applying upgrade: ${type} to ${this.name}`);
        switch(type) {
            case 'speed':
                this.speed += 20; // Permanent +20 speed
                break;
            case 'size':
                // Immediate +5% radius
                this.radius *= 1.05;
                break;
            case 'satellite':
                this.satellites++;
                break;
            case 'suction':
                this.suctionRange += 0.2; // +20% range
                break;
            case 'digest':
                this.growthMultiplier += 0.2; // +20% growth per item
                break;
            case 'cooldown': // Replaced with "Dash" or just "Growth" if no dash
                // Let's make this "Agility" -> Turn speed? Or Score Multiplier?
                // Let's go with Score Multiplier for now, or just more Speed.
                this.speed += 10;
                break;
        }
    }
}
