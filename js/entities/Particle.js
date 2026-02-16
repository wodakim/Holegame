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
        this.life = 1.0; // Seconds
        this.decay = 1.0 + Math.random(); // Decay rate
    }

    update(dt) {
        this.life -= this.decay * dt;
        if (this.life <= 0) {
            this.markedForDeletion = true;
        }

        // Move
        this.x += this.velocity.x * dt;
        this.y += this.velocity.y * dt;

        // Shrink
        this.scale = this.life;
    }

    draw(ctx) {
        ctx.globalAlpha = this.life;
        super.draw(ctx);
        ctx.globalAlpha = 1.0;
    }
}
