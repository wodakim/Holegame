import Entity from './entity.js';

export default class Prop extends Entity {
    constructor(x, y, type, value, width, height, color) {
        // radius is used for collision approximation
        const radius = Math.max(width, height) / 2;
        super(x, y, radius, color);

        this.type = 'prop';
        this.propType = type; // 'cone', 'car', 'building', 'truck', 'bus'
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
        else if (['car', 'police', 'truck', 'bus'].includes(this.propType)) {
            // Common Vehicle Drawing
            const w = Math.max(this.width, this.height); // Length
            const h = Math.min(this.width, this.height); // Width
            const isPolice = this.propType === 'police';
            const isTruck = this.propType === 'truck';
            const isBus = this.propType === 'bus';

            // Headlights
            ctx.fillStyle = 'rgba(255, 255, 0, 0.15)';
            ctx.beginPath();
            const beamLength = 100;
            const beamSpread = h * 1.5;
            ctx.moveTo(w/2, -h/3);
            ctx.lineTo(w/2 + beamLength, -beamSpread);
            ctx.arc(w/2, 0, beamLength, -Math.PI/6, Math.PI/6);
            ctx.lineTo(w/2, h/3);
            ctx.fill();

            // Taillights
            ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
            ctx.beginPath();
            ctx.arc(-w/2, 0, 20, 0, Math.PI * 2);
            ctx.fill();

            // Body Color
            ctx.fillStyle = this.color;
            if (isPolice) ctx.fillStyle = '#111';

            // Chassis
            const cornerRadius = (isTruck || isBus) ? 2 : 8;
            this.roundRect(ctx, -w/2, -h/2, w, h, cornerRadius);
            ctx.fill();

            // Details
            ctx.fillStyle = '#222';
            if (isTruck) {
                // Cab
                this.roundRect(ctx, w/4, -h/2 + 2, w/4 - 2, h - 4, 2);
                ctx.fill();
                // Trailer line
                ctx.fillStyle = '#111';
                ctx.fillRect(w/4 - 2, -h/2, 2, h);
            } else if (isBus) {
                // Long windows
                ctx.fillStyle = '#444';
                this.roundRect(ctx, -w/2 + 5, -h/2 + 5, w - 10, h - 10, 2);
                ctx.fill();
            } else {
                // Car/Police Roof
                this.roundRect(ctx, -w/4, -h/2 + 5, w/2, h - 10, 4);
                ctx.fill();
            }

            if (isPolice) {
                const blink = Math.floor(Date.now() / 150) % 2 === 0;
                ctx.shadowBlur = 20;
                ctx.fillStyle = blink ? '#ff0000' : '#0000ff';
                ctx.shadowColor = ctx.fillStyle;
                ctx.fillRect(-5, -h/4, 10, h/2);
                ctx.shadowBlur = 0;
            }
        }
        else if (this.propType === 'building') {
            // "True" Isometric/2.5D Effect
            // Roof is at (0,0) - centered
            // Base is shifted by (depthX, depthY)
            const w = this.width;
            const h = this.height;
            const depth = 40;
            const shiftX = 20; // Shift right
            const shiftY = 30; // Shift down

            // Calculate corners of Roof
            const tl = {x: -w/2, y: -h/2}; // Top-Left
            const tr = {x: w/2, y: -h/2};  // Top-Right
            const bl = {x: -w/2, y: h/2};  // Bottom-Left
            const br = {x: w/2, y: h/2};   // Bottom-Right

            // Calculate corners of Base (Shifted)
            const b_br = {x: br.x + shiftX, y: br.y + shiftY};
            const b_tr = {x: tr.x + shiftX, y: tr.y + shiftY};
            const b_bl = {x: bl.x + shiftX, y: bl.y + shiftY};

            // 1. Draw Shadows (Base footprint)
            ctx.fillStyle = 'rgba(0,0,0,0.4)';
            ctx.beginPath();
            ctx.moveTo(tl.x + shiftX, tl.y + shiftY);
            ctx.lineTo(tr.x + shiftX, tr.y + shiftY);
            ctx.lineTo(br.x + shiftX, br.y + shiftY);
            ctx.lineTo(bl.x + shiftX, bl.y + shiftY);
            ctx.closePath();
            ctx.fill();

            // 2. Draw South Face (Front)
            // Connect bl -> br -> b_br -> b_bl
            ctx.fillStyle = '#0a0a0a'; // Darkest
            ctx.beginPath();
            ctx.moveTo(bl.x, bl.y);
            ctx.lineTo(br.x, br.y);
            ctx.lineTo(b_br.x, b_br.y);
            ctx.lineTo(b_bl.x, b_bl.y);
            ctx.closePath();
            ctx.fill();

            // South Face Details (Windows)
            ctx.fillStyle = this.color;
            ctx.globalAlpha = 0.3;
            for(let i=0; i<3; i++) {
                // Interpolate
                const startX = bl.x + (br.x - bl.x) * (0.2 + i*0.25);
                const startY = bl.y + (br.y - bl.y) * (0.2 + i*0.25);
                ctx.fillRect(startX, startY, 4, shiftY * 0.8);
            }
            ctx.globalAlpha = 1.0;


            // 3. Draw East Face (Side)
            // Connect tr -> br -> b_br -> b_tr
            ctx.fillStyle = '#1a1a1a'; // Slightly lighter
            ctx.beginPath();
            ctx.moveTo(tr.x, tr.y);
            ctx.lineTo(br.x, br.y);
            ctx.lineTo(b_br.x, b_br.y);
            ctx.lineTo(b_tr.x, b_tr.y);
            ctx.closePath();
            ctx.fill();

             // East Face Details
            ctx.fillStyle = this.color;
            ctx.globalAlpha = 0.2;
            for(let i=0; i<3; i++) {
                 const startY = tr.y + (br.y - tr.y) * (0.2 + i*0.25);
                 ctx.fillRect(tr.x, startY + 5, shiftX * 0.8, 2);
            }
            ctx.globalAlpha = 1.0;


            // 4. Draw Roof (Top)
            // Drawn at normal position (x,y)
            ctx.fillStyle = '#111';
            ctx.fillRect(-w/2, -h/2, w, h);

            // Neon Edge
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 3;
            ctx.shadowBlur = 15;
            ctx.shadowColor = this.color;
            ctx.strokeRect(-w/2, -h/2, w, h);

            // Roof Grid
            ctx.fillStyle = this.color;
            ctx.globalAlpha = 0.4;
            ctx.fillRect(-w/2 + 5, -h/2 + 5, w - 10, h - 10);
            ctx.globalAlpha = 1.0;
            ctx.shadowBlur = 0;

            // Reset Shadow
            ctx.shadowColor = 'transparent';
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
