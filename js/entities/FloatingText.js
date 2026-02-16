import Entity from './Entity.js';

export default class FloatingText extends Entity {
    constructor(x, y, text, color, fontSize = 20) {
        super(x, y, 0, color); // Radius 0 as it's not physical
        this.type = 'floating_text';
        this.text = text;
        this.fontSize = fontSize;
        this.life = 1.0; // Seconds
        this.velocity = { x: 0, y: -50 }; // Float up
        this.opacity = 1.0;

        // Pop animation
        this.scale = 0;
        this.targetScale = 1;
    }

    update(dt) {
        // Pop in
        if (this.scale < this.targetScale) {
            this.scale += dt * 5;
            if (this.scale > this.targetScale) this.scale = this.targetScale;
        }

        this.life -= dt;
        if (this.life <= 0) {
            this.markedForDeletion = true;
        }

        this.x += this.velocity.x * dt;
        this.y += this.velocity.y * dt;

        // Fade out
        this.opacity = Math.max(0, this.life);
        this.velocity.y -= 10 * dt; // Slow down slightly? Or accelerate up?
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.translate(this.x, this.y);
        ctx.scale(this.scale, this.scale);

        ctx.fillStyle = this.color;
        ctx.font = `bold ${this.fontSize}px Montserrat`;
        ctx.textAlign = 'center';
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        ctx.fillText(this.text, 0, 0);
        ctx.restore();
    }
}
