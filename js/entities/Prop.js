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
            // Isometric Cone (Triangle + Ellipse base)
            ctx.fillStyle = '#ffae00';
            ctx.beginPath();
            ctx.moveTo(0, -this.height/2);
            ctx.lineTo(this.width/2, this.height/2);
            ctx.lineTo(-this.width/2, this.height/2);
            ctx.closePath();
            ctx.fill();

            // Base shadow
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.beginPath();
            ctx.ellipse(0, this.height/2, this.width/2, this.width/4, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        else if (this.propType === 'car' || this.propType === 'police') {
            // Ensure Length is along X (w)
            const w = Math.max(this.width, this.height);
            const h = Math.min(this.width, this.height);
            const isPolice = this.propType === 'police';

            // Headlights (Yellow Cones) - Facing Right (0 deg)
            // Assuming car length is along X axis? No, width/height passed usually w < h for vertical car?
            // Let's assume car is drawn facing UP (-Y) or RIGHT (+X).
            // Usually car sprites face UP. But rotation aligns them.
            // Let's draw car facing RIGHT (+X).

            // Headlights (Refined)
            ctx.fillStyle = 'rgba(255, 255, 0, 0.15)'; // Slightly more transparent
            ctx.beginPath();
            // Narrower and shorter beam
            const beamLength = 100;
            const beamSpread = h * 1.5;

            ctx.moveTo(w/2, -h/3);
            ctx.lineTo(w/2 + beamLength, -beamSpread);
            ctx.arc(w/2, 0, beamLength, -Math.PI/6, Math.PI/6); // Narrower Cone (30 deg)
            ctx.lineTo(w/2, h/3);
            ctx.fill();

            // Taillights (Red Glow)
            ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
            ctx.beginPath();
            ctx.arc(-w/2, 0, 20, 0, Math.PI * 2);
            ctx.fill();

            // Car Body
            ctx.fillStyle = this.color;
            if (isPolice) ctx.fillStyle = '#111'; // Black/White for police

            // Chassis
            this.roundRect(ctx, -w/2, -h/2, w, h, 8);
            ctx.fill();

            // Roof / Windshield (Darker)
            ctx.fillStyle = '#222';
            this.roundRect(ctx, -w/4, -h/2 + 5, w/2, h - 10, 4);
            ctx.fill();

            if (isPolice) {
                // Siren Lights
                const blink = Math.floor(Date.now() / 150) % 2 === 0;
                ctx.shadowBlur = 20;

                ctx.fillStyle = blink ? '#ff0000' : '#0000ff';
                ctx.shadowColor = ctx.fillStyle;
                ctx.fillRect(-5, -h/4, 10, h/2);

                ctx.shadowBlur = 0;
            }
        }
        else if (this.propType === 'building') {
            // Isometric 3D Effect
            const w = this.width;
            const h = this.height;
            const depth = 40; // Simulated height

            // 1. Draw Side (The "Wall" going down)
            // Shifted down by depth
            ctx.fillStyle = '#0a0a0a'; // Very dark wall
            ctx.beginPath();
            ctx.moveTo(-w/2, -h/2);
            ctx.lineTo(w/2, -h/2);
            ctx.lineTo(w/2, h/2 + depth); // Bottom Right projected
            ctx.lineTo(-w/2, h/2 + depth); // Bottom Left projected
            ctx.closePath();
            ctx.fill();

            // 2. Draw Roof (The Neon Top)
            // Drawn at normal position (x,y)
            ctx.fillStyle = '#111';
            ctx.fillRect(-w/2, -h/2, w, h);

            // Neon Edge
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 3;
            ctx.shadowBlur = 15;
            ctx.shadowColor = this.color;
            ctx.strokeRect(-w/2, -h/2, w, h);

            // Windows / Grid on Roof
            ctx.fillStyle = this.color;
            ctx.globalAlpha = 0.5;
            // Simple grid pattern
            for(let i=1; i<4; i++) {
                ctx.fillRect(-w/2 + (w/4)*i, -h/2, 2, h);
                ctx.fillRect(-w/2, -h/2 + (h/4)*i, w, 2);
            }
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
