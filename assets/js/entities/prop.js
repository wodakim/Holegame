import Entity from './entity.js';

export default class Prop extends Entity {
    constructor(x, y, propType, value, width, height, color) {
        // Calculate collision radius
        const radius = Math.max(width, height) / 2;
        super(x, y, radius, color);

        this.type = 'prop';
        this.propType = propType;

        this.value = value;
        this.width = width;
        this.height = height;
        this.scale = 1.0;
        this.rotation = 0;
        this.opacity = 1.0;
        this.falling = false;

        // Size Hierarchy Logic
        if (propType === 'trash' || propType === 'bottle') {
            this.requiredSize = 10;
        } else if (propType === 'cone') {
            this.requiredSize = 25;
        } else if (propType === 'hydrant') {
            this.requiredSize = 35;
        } else if (propType === 'person') {
            this.requiredSize = 40;
        } else if (propType === 'fence') {
            this.requiredSize = 50;
        } else if (propType === 'bike') {
            this.requiredSize = 60;
        } else if (propType === 'car') {
            this.requiredSize = 100;
        } else if (propType === 'bus_stop') {
            this.requiredSize = 150;
        } else if (propType === 'building') {
            this.requiredSize = Math.max(200, radius * 2.5);
        } else {
            this.requiredSize = radius * 1.5;
        }

        // isFloor check
        if (propType === 'road' || propType === 'sidewalk') {
            this.isFloor = true;
            this.requiredSize = 999999;
        }
    }

    update(dt) {
        if (this.falling) {
            this.scale -= dt * 2;
            this.rotation += dt * 5;
            this.opacity -= dt * 2;
            if (this.scale <= 0 || this.opacity <= 0) {
                this.markedForDeletion = true;
            }
        }
    }

    draw(ctx) {
        if (this.markedForDeletion) return;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.scale(this.scale, this.scale);
        ctx.globalAlpha = this.opacity;

        // Visuals
        if (this.propType === 'building' || this.propType === 'car' || this.propType === 'bus_stop') {
            this.draw3DBox(ctx);
        } else if (this.propType === 'cone') {
            this.drawCone(ctx);
        } else if (this.propType === 'person') {
            this.drawPerson(ctx);
        } else if (this.propType === 'trash') {
            this.drawTrash(ctx);
        } else if (this.propType === 'road') {
            // Simple flat rect
            ctx.fillStyle = '#222';
            ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
            // Dashed Line
            ctx.strokeStyle = '#fff';
            ctx.setLineDash([20, 20]);
            ctx.lineWidth = 4;
            ctx.beginPath();
            if (this.width > this.height) { // Horizontal Road
                 ctx.moveTo(-this.width/2, 0); ctx.lineTo(this.width/2, 0);
            } else { // Vertical Road
                 ctx.moveTo(0, -this.height/2); ctx.lineTo(0, this.height/2);
            }
            ctx.stroke();
        } else {
            // Generic Box
            ctx.fillStyle = this.color;
            ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
        }

        ctx.restore();
    }

    draw3DBox(ctx) {
        const d = this.propType === 'building' ? 40 : 10;
        const w = this.width;
        const h = this.height;

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fillRect(-w/2 + 10, -h/2 + 10, w, h);

        // Side (Right)
        ctx.fillStyle = this.adjustColor(this.color, -40);
        ctx.beginPath();
        ctx.moveTo(w/2, -h/2);
        ctx.lineTo(w/2 + d/2, -h/2 - d);
        ctx.lineTo(w/2 + d/2, h/2 - d);
        ctx.lineTo(w/2, h/2);
        ctx.fill();

        // Top (Roof)
        ctx.fillStyle = this.adjustColor(this.color, 40);
        ctx.beginPath();
        ctx.moveTo(-w/2, -h/2);
        ctx.lineTo(w/2, -h/2);
        ctx.lineTo(w/2 + d/2, -h/2 - d);
        ctx.lineTo(-w/2 + d/2, -h/2 - d);
        ctx.fill();

        // Front Face
        ctx.fillStyle = this.color;
        ctx.fillRect(-w/2, -h/2, w, h);

        // Building Windows
        if (this.propType === 'building') {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            for(let i=10; i<w-10; i+=20) {
                for(let j=10; j<h-10; j+=30) {
                    ctx.fillRect(-w/2 + i, -h/2 + j, 10, 20);
                }
            }
        }
    }

    drawCone(ctx) {
        ctx.fillStyle = '#ff6600';
        ctx.beginPath();
        ctx.arc(0, 0, this.width/2, 0, Math.PI*2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, this.width/4, 0, Math.PI*2);
        ctx.fill();
    }

    drawPerson(ctx) {
        ctx.fillStyle = '#ffccaa'; // Skin
        ctx.beginPath();
        ctx.arc(0, 0, this.width/2, 0, Math.PI*2);
        ctx.fill();
        ctx.fillStyle = this.color; // Shirt
        ctx.beginPath();
        ctx.arc(0, 5, this.width/2, 0, Math.PI);
        ctx.fill();
    }

    drawTrash(ctx) {
        ctx.fillStyle = '#555';
        ctx.beginPath();
        ctx.moveTo(-5, -5);
        ctx.lineTo(5, -3);
        ctx.lineTo(3, 5);
        ctx.lineTo(-4, 4);
        ctx.fill();
    }

    adjustColor(color, amount) {
        if (typeof color !== 'string' || color[0] !== '#') return color;

        let usePound = false;
        if (color[0] === "#") {
            color = color.slice(1);
            usePound = true;
        }

        let num = parseInt(color, 16);
        let r = (num >> 16) + amount;
        if (r > 255) r = 255; else if (r < 0) r = 0;

        let b = ((num >> 8) & 0x00FF) + amount;
        if (b > 255) b = 255; else if (b < 0) b = 0;

        let g = (num & 0x0000FF) + amount;
        if (g > 255) g = 255; else if (g < 0) g = 0;

        return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16).padStart(6, '0');
    }
}
