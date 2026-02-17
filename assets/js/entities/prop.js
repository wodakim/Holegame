import Entity from './entity.js';

export default class Prop extends Entity {
    // Static configuration for Prop Types
    static TYPES = {
        // Tier 1: Trash / Small Objects
        'bottle': { radius: 5, value: 1, color: '#33ff33', isSolid: false, height: 10 },
        'cone':   { radius: 8, value: 2, color: '#ffae00', isSolid: false, height: 15 },

        // Tier 2: Street Furniture
        'pole':   { radius: 10, value: 5, color: '#888888', isSolid: true, height: 60 },
        'fence':  { radius: 12, value: 5, color: '#aaaaaa', isSolid: true, height: 20 },

        // Tier 3: Living Beings (Simple shapes)
        'human':  { radius: 15, value: 10, color: '#ffccaa', isSolid: false, height: 35 }, // Passable
        'bench':  { radius: 18, value: 15, color: '#8B4513', isSolid: true, height: 15 },

        // Tier 4: Vehicles (Small)
        'car':    { radius: 30, value: 25, color: 'random', isSolid: false, height: 25 }, // Passable (under)

        // Tier 5: Large Vehicles / Structures
        'bus':    { radius: 50, value: 50, color: '#ffae00', isSolid: false, height: 50 }, // Passable (under)
        'truck':  { radius: 55, value: 60, color: '#ffffff', isSolid: false, height: 60 }, // Passable (under)
        'shelter':{ radius: 60, value: 70, color: '#444444', isSolid: true, height: 50 }, // Bus Stop - Solid

        // Tier 6: Buildings
        'building': { radius: 150, value: 200, color: 'random', isSolid: true, height: 200 }
    };

    constructor(x, y, type) {
        const config = Prop.TYPES[type] || Prop.TYPES['bottle'];
        const radius = config.radius;
        let color = config.color;

        if (color === 'random') {
            if (type === 'car') {
                const colors = ['#ff0055', '#0055ff', '#00ffaa', '#aa00ff', '#ffffff'];
                color = colors[Math.floor(Math.random() * colors.length)];
            } else if (type === 'building') {
                const bColors = ['#00ffff', '#ff00ff', '#39ff14', '#ffffff'];
                color = bColors[Math.floor(Math.random() * bColors.length)];
            }
        }

        super(x, y, radius, color);

        this.type = 'prop';
        this.propType = type;
        this.value = config.value;
        this.height = config.height;
        this.isSolid = config.isSolid; // Blocks movement if hole is small

        // Derived dimensions for drawing
        this.width = radius * 2;
        if (type === 'car' || type === 'bus' || type === 'truck') {
            this.length = radius * 2.5; // Longer
            this.width = radius * 1.2;
        } else if (type === 'building') {
            this.width = radius * 2;
            this.length = radius * 2;
        }

        this.scale = 1;
        this.rotation = (type === 'building' || type === 'shelter') ? 0 : Math.random() * Math.PI * 2;

        // Shake effect for suction
        this.shake = { x: 0, y: 0 };
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + this.shake.x, this.y + this.shake.y);
        ctx.rotate(this.rotation);
        ctx.scale(this.scale, this.scale);

        if (this.propType === 'bottle') {
            // Simple Cylinder
            ctx.fillStyle = 'rgba(0,0,0,0.2)';
            ctx.beginPath();
            ctx.ellipse(0, 0, 3, 3, 0, 0, Math.PI*2);
            ctx.fill();

            ctx.fillStyle = this.color;
            ctx.fillRect(-2, -8, 4, 8);
            ctx.fillStyle = '#fff';
            ctx.globalAlpha = 0.5;
            ctx.fillRect(-1, -6, 1, 4);
            ctx.globalAlpha = 1;
        }
        else if (this.propType === 'cone') {
            // Cone Logic
             ctx.fillStyle = '#ffae00';
             ctx.beginPath();
             ctx.moveTo(0, -10); // Top (shifted for iso?)
             // Simple circle for top-down for now, or approximate
             // Let's stick to the previous drawing logic roughly
             ctx.beginPath();
             ctx.arc(0, 0, 6, 0, Math.PI*2);
             ctx.fill();
             ctx.fillStyle = '#ffcc00';
             ctx.beginPath();
             ctx.arc(0, 0, 3, 0, Math.PI*2);
             ctx.fill();
        }
        else if (this.propType === 'pole') {
            // Tall thin cylinder (Circle with shadow)
            ctx.fillStyle = '#555';
            ctx.beginPath();
            ctx.arc(0, 0, 4, 0, Math.PI*2);
            ctx.fill();
            // Lamp glow?
            ctx.fillStyle = 'rgba(255, 255, 200, 0.5)';
            ctx.beginPath();
            ctx.arc(0, 0, 8, 0, Math.PI*2);
            ctx.fill();
        }
        else if (this.propType === 'human') {
            // Head and Shoulders
            ctx.fillStyle = this.color; // Skin/Shirt
            ctx.beginPath();
            ctx.arc(0, 0, 6, 0, Math.PI*2); // Head
            ctx.fill();

            ctx.fillStyle = '#333'; // Shoulders/Body
            ctx.beginPath();
            ctx.ellipse(0, 6, 8, 4, 0, 0, Math.PI*2);
            ctx.fill();
        }
        else if (['car', 'bus', 'truck', 'police'].includes(this.propType)) {
             this.drawVehicle(ctx);
        }
        else if (this.propType === 'building') {
             this.drawBuilding(ctx);
        }
        else if (this.propType === 'shelter') {
             // Bus Stop
             ctx.fillStyle = 'rgba(0,0,0,0.3)';
             ctx.fillRect(-20, -10, 40, 20); // Shadow

             ctx.fillStyle = '#888';
             ctx.fillRect(-20, -10, 5, 20); // Left Wall
             ctx.fillRect(15, -10, 5, 20); // Right Post
             ctx.fillRect(-20, -10, 40, 2); // Back Wall

             ctx.fillStyle = '#444'; // Roof
             ctx.fillRect(-22, -12, 44, 24);
        }
        else {
             // Fallback
             ctx.fillStyle = this.color;
             ctx.beginPath();
             ctx.arc(0, 0, this.radius, 0, Math.PI*2);
             ctx.fill();
        }

        ctx.restore();
    }

    drawVehicle(ctx) {
        const w = this.length || 40;
        const h = this.width || 20;
        const isTruck = this.propType === 'truck';
        const isBus = this.propType === 'bus';

        // Headlights
        ctx.fillStyle = 'rgba(255, 255, 0, 0.2)';
        ctx.beginPath();
        ctx.moveTo(w/2, -h/3);
        ctx.lineTo(w/2 + 60, -h); // Beam
        ctx.lineTo(w/2 + 60, h);
        ctx.lineTo(w/2, h/3);
        ctx.fill();

        // Body
        ctx.fillStyle = this.color;
        this.roundRect(ctx, -w/2, -h/2, w, h, isBus ? 2 : 5);
        ctx.fill();

        // Roof/Windshield
        ctx.fillStyle = '#222';
        if (isTruck) {
             ctx.fillRect(w/4, -h/2 + 2, w/4 - 2, h - 4); // Cab
        } else {
             this.roundRect(ctx, -w/4, -h/2 + 4, w/2, h - 8, 3);
             ctx.fill();
        }
    }

    drawBuilding(ctx) {
        const w = this.width;
        const h = this.length; // Square base usually
        const height3D = this.height; // Visual height

        // 2.5D Projection
        // We are drawing top-down. To simulate height, we draw the roof offset from the base.
        // BUT, if we want to slide against the base, the "Hitbox" (x,y) should be the Base.
        // So we draw the base at 0,0. And the roof offset.
        // Direction of offset depends on camera? Simplified: fixed offset or based on position.
        // Fixed offset (Isometric-ish) looks okay.

        const shiftX = 0; // Centered
        const shiftY = -height3D / 2; // Upwards visually

        // Roof
        ctx.fillStyle = '#111';
        ctx.fillRect(-w/2 + shiftX, -h/2 + shiftY, w, h);

        // Neon Edge
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 4;
        ctx.strokeRect(-w/2 + shiftX, -h/2 + shiftY, w, h);

        // Sides (Fake 3D)
        // Connect corners
        ctx.fillStyle = this.color;
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.moveTo(-w/2, -h/2); // Base TL
        ctx.lineTo(-w/2 + shiftX, -h/2 + shiftY); // Roof TL
        ctx.lineTo(w/2 + shiftX, -h/2 + shiftY); // Roof TR
        ctx.lineTo(w/2, -h/2); // Base TR
        ctx.fill();
        ctx.globalAlpha = 1.0;

        // Grid on Roof
        ctx.fillStyle = this.color;
        ctx.globalAlpha = 0.2;
        ctx.fillRect(-w/2 + shiftX + 10, -h/2 + shiftY + 10, w - 20, h - 20);
        ctx.globalAlpha = 1.0;
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
