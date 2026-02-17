import Entity from './entity.js';

export default class PowerUp extends Entity {
    constructor(x, y, type) {
        super(x, y, 20, '#fff'); // Fixed size
        this.type = 'powerup';
        this.powerType = type; // 'magnet', 'speed', 'shield'
        this.life = 10; // Disappear after 10s if not picked up

        // Colors
        if (type === 'magnet') this.color = '#ff00ff';
        if (type === 'speed') this.color = '#00ffff';
        if (type === 'shield') this.color = '#ffff00';
    }

    update(dt) {
        this.life -= dt;
        if (this.life <= 0) this.markedForDeletion = true;

        // Float animation
        this.scale = 1 + Math.sin(Date.now() / 200) * 0.2;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(this.scale, this.scale);

        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#000';
        ctx.font = 'bold 20px Montserrat';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        let label = '?';
        if (this.powerType === 'magnet') label = 'M';
        if (this.powerType === 'speed') label = 'S';
        if (this.powerType === 'shield') label = '🛡️';

        ctx.fillText(label, 0, 0);

        ctx.restore();
    }
}
