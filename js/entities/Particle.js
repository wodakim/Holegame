import Entity from './Entity.js';

export default class Particle extends Entity {
    constructor(x, y, color) {
        super(x, y, 2 + Math.random() * 3, color);
        this.type = 'particle';
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 100 + 50;
        this.velocity = {
            x: Math.cos(angle) * speed,
            y: Math.sin(angle) * speed
        };
        this.life = 0.5; // Shorter life for snappier feel
        this.decay = 2.0 + Math.random(); // Decay rate
        this.originalRadius = this.radius;
    }

    update(dt) {
        this.life -= dt;
        if (this.life <= 0) {
            this.markedForDeletion = true;
        }

        // Move (Add friction?)
        this.x += this.velocity.x * dt;
        this.y += this.velocity.y * dt;

        // Shrink faster at end
        this.radius = this.originalRadius * (this.life / 0.5);
    }

    draw(ctx) {
        ctx.globalAlpha = this.life;
        super.draw(ctx);
        ctx.globalAlpha = 1.0;
    }
}
