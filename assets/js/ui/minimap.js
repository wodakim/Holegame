export default class Minimap {
    constructor(canvas, app) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.app = app;
        this.size = 150; // Canvas visual size
        this.range = 3000; // World units range radius
    }

    update() {
        const player = this.app.gameManager.player;
        if (!player) return;

        // Clear
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw Background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.beginPath();
        this.ctx.arc(this.canvas.width/2, this.canvas.height/2, this.canvas.width/2, 0, Math.PI * 2);
        this.ctx.fill();

        // Draw Entities
        this.ctx.save();
        this.ctx.translate(this.canvas.width/2, this.canvas.height/2);

        // Scale: map radius / world range
        const scale = (this.canvas.width/2) / this.range;

        this.app.gameManager.entities.forEach(entity => {
            if (entity.type === 'hole') {
                const dx = entity.x - player.x;
                const dy = entity.y - player.y;

                // Distance Check (Radar style)
                if (dx*dx + dy*dy < this.range * this.range) {
                    const mx = dx * scale;
                    const my = dy * scale;

                    this.ctx.beginPath();
                    this.ctx.arc(mx, my, 4, 0, Math.PI * 2);

                    if (entity === player) {
                        this.ctx.fillStyle = '#ffae00';
                        // Draw arrow for player direction?
                        this.ctx.fill();
                    } else {
                        this.ctx.fillStyle = entity.color || '#ff0000';
                        this.ctx.fill();
                    }
                }
            }
        });

        this.ctx.restore();

        // Border
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(this.canvas.width/2, this.canvas.height/2, this.canvas.width/2 - 1, 0, Math.PI * 2);
        this.ctx.stroke();
    }
}
