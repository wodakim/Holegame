import Entity from './entity.js';

export default class Prop extends Entity {
    // Static configuration for Prop Types (Updated for Geek/Fun DA)
    static TYPES = {
        // Tier 1: Small Trash
        'bottle':   { radius: 6, value: 1, color: '#2ECC71', height: 10 }, // Green Soda
        'cone':     { radius: 8, value: 2, color: '#E67E22', height: 15 }, // Orange Cone
        'rubik':    { radius: 10, value: 5, color: 'multi', height: 12 },   // Cube (replaces mailbox)

        // Tier 2: Street Gear
        'pole':     { radius: 10, value: 10, color: '#95A5A6', height: 60 },
        'fence':    { radius: 12, value: 15, color: '#ECF0F1', height: 20 },
        'trash_bin':{ radius: 16, value: 20, color: '#27AE60', height: 25 },

        // Tier 3: Living / Active
        'human':    { radius: 14, value: 25, color: '#F1C40F', height: 35 },
        'bench':    { radius: 18, value: 30, color: '#D35400', height: 15 }, // Wooden
        'scooter':  { radius: 25, value: 50, color: '#3498DB', height: 20 }, // Electric Scooter (replaces motorcycle)

        // Tier 3.5: Structures
        'kiosk':    { radius: 32, value: 80, color: '#E74C3C', height: 40 }, // Red Phone Booth / Arcade

        // Tier 4: Vehicles
        'car':      { radius: 42, value: 100, color: 'random', height: 25 },
        'van':      { radius: 52, value: 150, color: '#BDC3C7', height: 35 },

        // Tier 5: Large
        'bus':      { radius: 58, value: 200, color: '#F1C40F', height: 50 },
        'truck':    { radius: 68, value: 250, color: '#FFFFFF', height: 60 },

        'shelter':  { radius: 75, value: 400, color: '#34495E', height: 45 },

        // Tier 6: Buildings
        'small_shop': { radius: 110, value: 800, color: '#8E44AD', height: 80 }, // Comic Shop
        'building':   { radius: 190, value: 2500, color: 'random', height: 250 }
    };

    constructor(x, y, type) {
        const config = Prop.TYPES[type] || Prop.TYPES['bottle'];
        super(x, y, config.radius, config.color);

        this.propType = type;
        this.value = config.value;
        this.height = config.height;

        // Solid Collision logic:
        // Only solid if it's a structural object (Building, Shelter, etc)
        // Trash, Humans, and Small Vehicles should be soft (pass through if not eaten)
        this.isSolid = ['building', 'shelter', 'small_shop', 'pole', 'fence', 'kiosk', 'bench', 'mailbox', 'trash_bin'].includes(type);

        // Random Colors for generic types
        if (this.color === 'random') {
            const palette = ['#E74C3C', '#3498DB', '#F1C40F', '#9B59B6', '#1ABC9C'];
            this.color = palette[Math.floor(Math.random() * palette.length)];
        }

        // Dimensions
        this.width = this.radius * 2;
        this.length = this.radius * 2;

        if (['car', 'bus', 'truck', 'van', 'scooter'].includes(type)) {
            this.length = this.radius * 2.2;
            this.width = this.radius * 1.1;
        }

        this.rotation = Math.random() * Math.PI * 2;
        if (['building', 'kiosk', 'small_shop', 'shelter'].includes(type)) {
            this.rotation = 0; // Buildings align to grid
        }

        // Pre-calculate Rubik colors to avoid strobing
        if (this.propType === 'rubik') {
            this.rubikColors = [];
            const palette = ['#E74C3C', '#3498DB', '#F1C40F', '#2ECC71'];
            for(let i=0; i<4; i++) {
                this.rubikColors.push(palette[Math.floor(Math.random() * 4)]);
            }
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + this.shake.x, this.y + this.shake.y);
        ctx.rotate(this.rotation);

        // Shadow (Universal)
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath();
        if (['building', 'small_shop'].includes(this.propType)) {
             ctx.fillRect(-this.width/2 + 10, -this.length/2 + 10, this.width, this.length);
        } else {
             ctx.arc(5, 5, this.radius, 0, Math.PI*2);
             ctx.fill();
        }

        // Draw Logic per Type
        if (this.propType === 'rubik') {
            this.drawCube(ctx, this.radius);
        } else if (this.propType === 'human') {
            this.drawHuman(ctx);
        } else if (['car', 'bus', 'truck', 'van', 'scooter'].includes(this.propType)) {
            this.drawVehicle(ctx);
        } else if (['building', 'small_shop', 'kiosk', 'shelter'].includes(this.propType)) {
            this.drawBuilding(ctx);
        } else {
            // Generic props (Cone, Bottle, Pole)
            this.drawGeneric(ctx);
        }

        ctx.restore();
    }

    drawGeneric(ctx) {
        const r = this.radius;
        // Outline
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#2C3E50';

        if (this.propType === 'cone') {
            ctx.fillStyle = '#E67E22';
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI*2);
            ctx.fill();
            ctx.stroke();

            // Detail
            ctx.fillStyle = '#F39C12'; // Highlight
            ctx.beginPath();
            ctx.arc(0, 0, r/2, 0, Math.PI*2);
            ctx.fill();
        } else {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI*2);
            ctx.fill();
            ctx.stroke();

            // Shine
            ctx.fillStyle = 'rgba(255,255,255,0.4)';
            ctx.beginPath();
            ctx.arc(-r/3, -r/3, r/4, 0, Math.PI*2);
            ctx.fill();
        }
    }

    drawCube(ctx, r) {
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#2C3E50';

        // Draw Base White Cube
        const s = r * 1.5;
        ctx.fillStyle = '#fff';
        ctx.fillRect(-s/2, -s/2, s, s);
        ctx.strokeRect(-s/2, -s/2, s, s);

        // Draw Stored Face Colors
        // Top-Left
        ctx.fillStyle = this.rubikColors[0];
        ctx.fillRect(-s/2 + 2, -s/2 + 2, s/2 - 4, s/2 - 4);
        // Top-Right
        ctx.fillStyle = this.rubikColors[1];
        ctx.fillRect(0 + 2, -s/2 + 2, s/2 - 4, s/2 - 4);
        // Bottom-Left
        ctx.fillStyle = this.rubikColors[2];
        ctx.fillRect(-s/2 + 2, 0 + 2, s/2 - 4, s/2 - 4);
        // Bottom-Right
        ctx.fillStyle = this.rubikColors[3];
        ctx.fillRect(0 + 2, 0 + 2, s/2 - 4, s/2 - 4);
    }

    drawHuman(ctx) {
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#2C3E50';

        // Head
        ctx.fillStyle = '#F1C40F'; // Yellow skin like Lego/Emoji
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI*2);
        ctx.fill();
        ctx.stroke();

        // Glasses/Eyes
        ctx.fillStyle = '#2C3E50';
        ctx.fillRect(-5, -2, 10, 4);
    }

    drawVehicle(ctx) {
        const w = this.length;
        const h = this.width;

        ctx.lineWidth = 3;
        ctx.strokeStyle = '#2C3E50';

        // Body
        ctx.fillStyle = this.color;
        this.roundRect(ctx, -w/2, -h/2, w, h, 8);
        ctx.fill();
        ctx.stroke();

        // Windshield
        ctx.fillStyle = '#A9CCE3'; // Light Blue Glass
        ctx.fillRect(w/4, -h/2 + 4, w/4, h - 8);
        ctx.strokeRect(w/4, -h/2 + 4, w/4, h - 8);

        // Roof highlight
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.fillRect(-w/4, -h/2 + 6, w/2, h - 12);
    }

    drawBuilding(ctx) {
        const w = this.width;
        const h = this.length;
        const isShop = this.propType === 'small_shop';

        ctx.lineWidth = 4;
        ctx.strokeStyle = '#2C3E50';

        // Roof (Top down view)
        ctx.fillStyle = this.color;
        ctx.fillRect(-w/2, -h/2, w, h);
        ctx.strokeRect(-w/2, -h/2, w, h);

        // Inner Roof details (AC units, vents)
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.fillRect(-w/2 + 10, -h/2 + 10, w - 20, h - 20);

        // "3D" Side effect (Fake perspective by drawing a bottom offset rect)
        ctx.fillStyle = '#2C3E50';
        ctx.fillRect(-w/2, h/2, w, 10); // Shadow/Side

        if (isShop) {
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 24px Montserrat';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('SHOP', 0, 0);
        }
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
