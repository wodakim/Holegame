export default class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;

        // Configuration
        this.gridSize = 100;
        this.gridColor = '#2a2a2a'; // Dark grey lines
        this.floorColor = '#111'; // Almost black asphalt
    }

    resize(width, height) {
        this.width = width;
        this.height = height;
        this.canvas.width = width;
        this.canvas.height = height;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    render(entities, camera) {
        this.clear();

        this.ctx.save();

        // 1. Apply Camera Transform
        // We want the camera position (world coords) to be at the center of the screen
        this.ctx.translate(this.width / 2, this.height / 2);
        this.ctx.scale(camera.zoom, camera.zoom);
        this.ctx.translate(-camera.x, -camera.y);

        // 2. Draw Floor (The City Grid)
        // We need to draw a large enough area to cover the view
        // Or just draw the visible grid.
        // For simplicity, let's draw a fixed large world or infinite grid.
        // Infinite grid is better.
        this.drawFloor(camera);

        // 3. Draw Holes (Players/Bots) -> The "Void" Effect
        // This erases the floor to reveal the abyss (CSS background)
        this.ctx.globalCompositeOperation = 'destination-out';

        entities.forEach(entity => {
            if (entity.type === 'hole') {
                this.drawHole(entity);
            }
        });

        // 4. Draw Props & Particles (Normal rendering)
        this.ctx.globalCompositeOperation = 'source-over';

        // Draw Shadows/Glows first?

        entities.forEach(entity => {
            if (entity.type === 'floating_text') return; // Draw last
            if (entity.type !== 'hole') { // Props, particles
                entity.draw(this.ctx);
            } else {
                // Draw the rim/glow of the hole on top
                this.drawHoleRim(entity);
            }
        });

        // Draw UI entities (Floating Text) last
        entities.forEach(entity => {
            if (entity.type === 'floating_text') {
                entity.draw(this.ctx);
            }
        });

        this.ctx.restore();
    }

    drawFloor(camera) {
        // Calculate visible bounds
        const viewportWidth = this.width / camera.zoom;
        const viewportHeight = this.height / camera.zoom;
        const startX = camera.x - viewportWidth / 2;
        const startY = camera.y - viewportHeight / 2;
        const endX = startX + viewportWidth;
        const endY = startY + viewportHeight;

        // Snap to grid
        const gridStartX = Math.floor(startX / this.gridSize) * this.gridSize;
        const gridStartY = Math.floor(startY / this.gridSize) * this.gridSize;

        this.ctx.fillStyle = this.floorColor;
        // Optimization: Draw one big rectangle for the floor?
        // Or just let the background be the floor color?
        // If we use destination-out, the canvas must have content to erase.
        // So we MUST fill the canvas with the floor color first.

        // Since we are transformed, we can just draw a huge rect covering the view
        this.ctx.fillRect(startX - 100, startY - 100, viewportWidth + 200, viewportHeight + 200);

        // Draw Grid Lines
        this.ctx.beginPath();
        this.ctx.strokeStyle = this.gridColor;
        this.ctx.lineWidth = 2;

        for (let x = gridStartX; x <= endX; x += this.gridSize) {
            this.ctx.moveTo(x, startY - 100);
            this.ctx.lineTo(x, endY + 100);
        }

        for (let y = gridStartY; y <= endY; y += this.gridSize) {
            this.ctx.moveTo(startX - 100, y);
            this.ctx.lineTo(endX + 100, y);
        }

        this.ctx.stroke();
    }

    drawHole(entity) {
        // The actual "cut"
        this.ctx.beginPath();
        this.ctx.arc(entity.x, entity.y, entity.radius, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawHoleRim(entity) {
        // The neon glow/ring around the hole
        this.ctx.beginPath();
        this.ctx.arc(entity.x, entity.y, entity.radius, 0, Math.PI * 2);
        this.ctx.strokeStyle = entity.color || '#00f3ff'; // Default Cyan
        this.ctx.lineWidth = 5;
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = entity.color || '#00f3ff';
        this.ctx.stroke();

        // Reset shadow
        this.ctx.shadowBlur = 0;

        // Draw Name
        if (entity.name) {
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 16px Montserrat';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(entity.name, entity.x, entity.y - entity.radius - 15);
        }
    }
}
