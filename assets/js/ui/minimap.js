export default class Minimap {
    constructor(canvas, app) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.app = app;
        this.width = canvas.width;
        this.height = canvas.height;
    }

    update() {
        const gm = this.app.gameManager;
        if (!gm || !gm.player) return;

        // Clear Canvas
        this.ctx.clearRect(0, 0, this.width, this.height);

        // 1. Setup Circle Mask & Background
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(this.width / 2, this.height / 2, this.width / 2, 0, Math.PI * 2);
        this.ctx.clip();

        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // 2. Determine Scale
        // Fit the whole world? Or just nearby?
        // Let's fit the whole world for "Battle Royale" feel
        const worldSize = gm.worldSize;
        const scale = this.width / worldSize;

        // Center of minimap is center of world (0,0) mapped to (width/2, height/2)
        this.ctx.translate(this.width / 2, this.height / 2);
        this.ctx.scale(scale, scale);

        // 3. Draw Entities
        // Only draw Holes and Powerups (not small props)
        gm.entities.forEach(entity => {
            if (entity.markedForDeletion) return;

            if (entity.type === 'hole') {
                this.ctx.beginPath();
                // Ensure visibility: Minimum radius of 100 world units (scaled down to ~2.5px)
                // If scale is small, make sure dots are visible
                const minRadius = 100;
                const r = Math.max(entity.radius * 2, minRadius);

                this.ctx.arc(entity.x, entity.y, r, 0, Math.PI * 2);

                if (entity === gm.player) {
                    this.ctx.fillStyle = '#00ff00'; // Green Player
                } else if (entity.isPolice) {
                     // Flash
                     this.ctx.fillStyle = (Date.now() % 400 < 200) ? '#ff0000' : '#0000ff';
                } else {
                    this.ctx.fillStyle = '#ff0000'; // Red Enemies
                }
                this.ctx.fill();
            } else if (entity.type === 'powerup') {
                this.ctx.fillStyle = '#ffff00';
                this.ctx.beginPath();
                this.ctx.rect(entity.x - 50, entity.y - 50, 100, 100);
                this.ctx.fill();
            }
        });

        // 4. Draw World Boundary (Optional)
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 20; // Scaled down
        this.ctx.strokeRect(-worldSize/2, -worldSize/2, worldSize, worldSize);

        this.ctx.restore();
    }
}
