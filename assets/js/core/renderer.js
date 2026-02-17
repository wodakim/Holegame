export default class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;

        // Frustum Culling Margin
        this.margin = 300;
    }

    resize(width, height) {
        this.width = width;
        this.height = height;
        this.canvas.width = width;
        this.canvas.height = height;
    }

    render(entities, camera) {
        // 1. Clear Screen (Reveals CSS Background)
        this.ctx.clearRect(0, 0, this.width, this.height);

        this.ctx.save();

        // 2. Camera Transform
        // Center camera on screen
        this.ctx.translate(this.width / 2, this.height / 2);
        this.ctx.scale(camera.zoom, camera.zoom);
        this.ctx.translate(-camera.x, -camera.y);

        // Screen Shake
        if (camera.shake > 0) {
            const dx = (Math.random() - 0.5) * camera.shake;
            const dy = (Math.random() - 0.5) * camera.shake;
            this.ctx.translate(dx, dy);
        }

        // 3. Draw Floor (The World)
        // We draw the "Paper City" grid here
        this.drawFloor(camera);

        // 4. Draw "Void" (Holes)
        // The Holes erase the floor to reveal the Abyss (CSS Background)
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'destination-out';

        entities.forEach(e => {
            if (e.type === 'hole') {
                this.drawHoleMask(e);
            }
        });

        this.ctx.restore();

        // 5. Draw Hole Decorations (The Rim/Vortex) over the erased part
        entities.forEach(e => {
            if (e.type === 'hole') {
                this.drawHoleRim(e);
            }
        });

        // 6. Sort Entities by Y for Depth
        const visibleEntities = entities.filter(e =>
            e.type !== 'hole' && // Holes already drawn
            !e.markedForDeletion &&
            this.isVisible(e, camera)
        );

        // Sort: "Higher Y" means "Closer to camera" -> Draw last
        visibleEntities.sort((a, b) => a.y - b.y);

        // 7. Draw Entities
        visibleEntities.forEach(e => e.draw(this.ctx));

        // 8. Draw Debug (Optional)
        // this.drawDebug(visibleEntities);

        this.ctx.restore();
    }

    drawFloor(camera) {
        // Draw a seamless grid pattern
        const size = 100; // Grid cell size

        // Bounds logic adapted from old renderer
        const viewW = this.width / camera.zoom;
        const viewH = this.height / camera.zoom;
        const startX = Math.floor((camera.x - viewW/2) / size) * size;
        const startY = Math.floor((camera.y - viewH/2) / size) * size;
        const cols = Math.ceil(viewW / size) + 2;
        const rows = Math.ceil(viewH / size) + 2;

        this.ctx.fillStyle = '#ECF0F1'; // Paper White/Grey
        // Draw a massive rectangle covering the view first
        this.ctx.fillRect(
            camera.x - viewW/2 - size,
            camera.y - viewH/2 - size,
            viewW + size*2,
            viewH + size*2
        );

        this.ctx.beginPath();
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = '#BDC3C7'; // Light Grey lines

        for (let i = 0; i < cols; i++) {
            const x = startX + i * size;
            this.ctx.moveTo(x, startY - size);
            this.ctx.lineTo(x, startY + rows * size);
        }

        for (let i = 0; i < rows; i++) {
            const y = startY + i * size;
            this.ctx.moveTo(startX - size, y);
            this.ctx.lineTo(startX + cols * size, y);
        }

        this.ctx.stroke();
    }

    drawHoleMask(hole) {
        this.ctx.beginPath();
        this.ctx.arc(hole.x, hole.y, hole.radius, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawHoleRim(hole) {
        // Draw the decorative rim *inside* the hole edge
        this.ctx.save();
        this.ctx.translate(hole.x, hole.y);

        // Inner Shadow (Simulating depth)
        this.ctx.beginPath();
        this.ctx.arc(0, 0, hole.radius, 0, Math.PI * 2);
        this.ctx.strokeStyle = '#2C3E50'; // Dark Outline
        this.ctx.lineWidth = 4;
        this.ctx.stroke();

        // Spinning Vortex Effect
        this.ctx.rotate(Date.now() / 200); // Spin

        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 2;
        for(let i=0; i<3; i++) {
            this.ctx.beginPath();
            this.ctx.arc(0, 0, hole.radius * (0.8 - i*0.2), 0, Math.PI * 1.5);
            this.ctx.stroke();
            this.ctx.rotate(Math.PI/1.5);
        }

        this.ctx.restore();

        // Name Tag
        if (hole.name) {
            this.ctx.font = 'bold 16px Montserrat';
            this.ctx.fillStyle = '#2C3E50';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(hole.name, hole.x, hole.y - hole.radius - 15);
        }
    }

    isVisible(entity, camera) {
        const padding = entity.radius || 100;
        const viewW = this.width / camera.zoom;
        const viewH = this.height / camera.zoom;
        const left = camera.x - viewW / 2 - padding;
        const right = camera.x + viewW / 2 + padding;
        const top = camera.y - viewH / 2 - padding;
        const bottom = camera.y + viewH / 2 + padding;

        return (entity.x > left && entity.x < right && entity.y > top && entity.y < bottom);
    }
}
