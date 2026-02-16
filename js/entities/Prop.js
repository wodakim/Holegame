import Entity from './Entity.js';

export default class Prop extends Entity {
    constructor(x, y, type, value, width, height, color) {
        // radius is used for collision approximation
        const radius = Math.max(width, height) / 2;
        super(x, y, radius, color);

        this.type = 'prop';
        this.propType = type; // 'cone', 'car', 'building'
        this.value = value; // Score value
        this.width = width;
        this.height = height;
        this.scale = 1;
        this.rotation = Math.random() * Math.PI * 2;
    }

    draw(ctx) {
        ctx.save();
        // Apply shake before rotation/scale but after position?
        // Actually, shake is displacement in world space.
        // So: translate(x + shake.x, y + shake.y).
        ctx.translate(this.x + this.shake.x, this.y + this.shake.y);

        ctx.rotate(this.rotation);
        ctx.scale(this.scale, this.scale);

        if (this.propType === 'cone') {
            // Small Orange Circle with inner dot
            ctx.fillStyle = '#ffae00'; // Orange
            ctx.beginPath();
            ctx.arc(0, 0, this.width / 2, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#ffa';
            ctx.beginPath();
            ctx.arc(0, 0, this.width / 4, 0, Math.PI * 2);
            ctx.fill();
        }
        else if (this.propType === 'car') {
            // Rounded Rectangle with gradient
            const w = this.width;
            const h = this.height;

            // Gradient
            const grad = ctx.createLinearGradient(-w/2, -h/2, w/2, h/2);
            grad.addColorStop(0, this.color);
            grad.addColorStop(1, '#000'); // Shadow side

            ctx.fillStyle = grad;

            // Draw rounded rect
            this.roundRect(ctx, -w/2, -h/2, w, h, 5);
            ctx.fill();

            // Windshield (Black rect)
            ctx.fillStyle = '#111';
            this.roundRect(ctx, -w/4, -h/4, w/2, h/2, 2);
            ctx.fill();
        }
        else if (this.propType === 'police') {
             const w = this.width;
             const h = this.height;

             // Base
             ctx.fillStyle = '#1a1a1a';
             this.roundRect(ctx, -w/2, -h/2, w, h, 5);
             ctx.fill();

             // Lights (Flash)
             const blink = Math.floor(Date.now() / 200) % 2 === 0;
             ctx.fillStyle = blink ? '#ff0000' : '#0000ff';
             this.roundRect(ctx, -w/2, -h/2, w, h/3, 2); // Top bar
             ctx.fill();

             ctx.fillStyle = !blink ? '#ff0000' : '#0000ff';
             this.roundRect(ctx, -w/2, h/2 - h/3, w, h/3, 2); // Bottom bar
             ctx.fill();

             ctx.shadowBlur = 20;
             ctx.shadowColor = blink ? '#ff0000' : '#0000ff';
        }
        else if (this.propType === 'building') {
            // Extruded Polygon (2.5D)
            const w = this.width;
            const h = this.height;
            const depth = 20; // Height of building

            // Draw Sides (Darker)
            ctx.fillStyle = '#1a1a1a'; // Dark grey side
            ctx.beginPath();
            ctx.rect(-w/2, -h/2, w, h);
            ctx.fill();

            // Draw Roof (Offset)
            // The "roof" should be offset based on camera perspective?
            // For now, static offset looks okay for simple "top down"
            // Wait, standard top down doesn't show sides unless perspective.
            // Let's just draw a nice neon rect with inner details.

            ctx.strokeStyle = this.color;
            ctx.lineWidth = 2;
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color;

            ctx.strokeRect(-w/2, -h/2, w, h);

            // Inner grid (windows)
            ctx.fillStyle = this.color;
            ctx.globalAlpha = 0.3;
            ctx.fillRect(-w/2 + 5, -h/2 + 5, w - 10, h - 10);
            ctx.globalAlpha = 1.0;

            ctx.shadowBlur = 0;
        }

        ctx.restore();
    }

    roundRect(ctx, x, y, w, h, r) {
        if (w < 2 * r) r = w / 2;
        if (h < 2 * r) r = h / 2;
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
    }
}
