export default class Renderer {
    constructor(canvas, assetManager) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d', { alpha: false }); // Optimize
        this.assetManager = assetManager;
        this.width = canvas.width;
        this.height = canvas.height;

        // Configuration
        this.gridSize = 100;
        this.roadWidth = 60; // Road width
        this.sidewalkColor = '#2C3E50'; // Darker Blue-Grey (Triple A)
        this.roadColor = '#1a1a1a'; // Almost Black
        this.grassColor = '#27ae60'; // Vibrant Green details
    }

    resize(width, height) {
        this.width = width;
        this.height = height;
        this.canvas.width = width;
        this.canvas.height = height;
    }

    clear() {
        // Use fillRect instead of clearRect for potentially better performance on some mobile GPUs
        // if we are redrawing everything anyway. But clearRect is standard.
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    render(entities, camera) {
        this.clear();

        this.ctx.save();

        // 0. Update Parallax Background (CSS)
        this.updateParallax(camera);

        // 1. Apply Camera Transform
        this.ctx.translate(this.width / 2, this.height / 2);
        this.ctx.scale(camera.zoom, camera.zoom);
        this.ctx.translate(-camera.x, -camera.y);

        // Calculate Viewport Bounds for Culling
        const vpW = this.width / camera.zoom;
        const vpH = this.height / camera.zoom;
        const viewLeft = camera.x - vpW / 2 - 200;
        const viewRight = camera.x + vpW / 2 + 200;
        const viewTop = camera.y - vpH / 2 - 200;
        const viewBottom = camera.y + vpH / 2 + 200;

        // Helper to check visibility
        const isVisible = (e) => {
            const r = e.radius || Math.max(e.width || 0, e.height || 0) || 50;
            return (e.x + r > viewLeft && e.x - r < viewRight &&
                    e.y + r > viewTop && e.y - r < viewBottom);
        };

        // 2. Draw Hybrid Floor (City Grid)
        this.drawFloor(camera);

        // 3. Draw Holes (Players/Bots) -> The "Void" Effect
        this.ctx.globalCompositeOperation = 'destination-out';
        entities.forEach(entity => {
            if (entity.type === 'hole') {
                if (isVisible(entity)) this.drawHole(entity);
            }
        });

        // 4. Draw Props & Particles (Sorted by Y for Depth)
        this.ctx.globalCompositeOperation = 'source-over';

        const visibleEntities = entities.filter(e => {
            if (e.type === 'floating_text') return false;
            return isVisible(e);
        });

        visibleEntities.sort((a, b) => a.y - b.y);

        visibleEntities.forEach(entity => {
            if (entity.type !== 'hole') {
                this.drawEntitySprite(entity);
            } else {
                this.drawHoleRim(entity);
            }
        });

        // Draw UI entities (Floating Text) last
        entities.forEach(entity => {
            if (entity.type === 'floating_text') {
                if (isVisible(entity)) entity.draw(this.ctx);
            }
        });

        this.ctx.restore();
    }

    drawFloor(camera) {
        const viewportWidth = this.width / camera.zoom;
        const viewportHeight = this.height / camera.zoom;
        const startX = camera.x - viewportWidth / 2;
        const startY = camera.y - viewportHeight / 2;
        const endX = startX + viewportWidth;
        const endY = startY + viewportHeight;

        const gridStartX = Math.floor(startX / this.gridSize) * this.gridSize;
        const gridStartY = Math.floor(startY / this.gridSize) * this.gridSize;

        // 1. Fill Background (Sidewalk Color)
        this.ctx.fillStyle = this.sidewalkColor;
        this.ctx.fillRect(startX - 100, startY - 100, viewportWidth + 200, viewportHeight + 200);

        // 1.5 Draw Decorative Elements (Grass Corners / Drains)
        this.ctx.fillStyle = '#34495e'; // Slightly lighter pavement
        for (let x = gridStartX; x <= endX; x += this.gridSize) {
            for (let y = gridStartY; y <= endY; y += this.gridSize) {
                // Determine block center
                // Draw pavement tiles
                this.ctx.fillRect(x + 5, y + 5, this.gridSize - 10, this.gridSize - 10);
            }
        }

        // 2. Draw Roads (Grid Lines)
        this.ctx.lineWidth = this.roadWidth;
        this.ctx.lineCap = 'butt';
        this.ctx.strokeStyle = this.roadColor;
        this.ctx.beginPath();

        for (let x = gridStartX; x <= endX; x += this.gridSize) {
            this.ctx.moveTo(x, startY - 100);
            this.ctx.lineTo(x, endY + 100);
        }
        for (let y = gridStartY; y <= endY; y += this.gridSize) {
            this.ctx.moveTo(startX - 100, y);
            this.ctx.lineTo(endX + 100, y);
        }
        this.ctx.stroke();

        // 3. Draw Road Markings (Dashed White Lines) - Reduced opacity
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.setLineDash([15, 15]);
        this.ctx.beginPath();

        for (let x = gridStartX; x <= endX; x += this.gridSize) {
            this.ctx.moveTo(x, startY - 100);
            this.ctx.lineTo(x, endY + 100);
        }
        for (let y = gridStartY; y <= endY; y += this.gridSize) {
            this.ctx.moveTo(startX - 100, y);
            this.ctx.lineTo(endX + 100, y);
        }
        this.ctx.stroke();
        this.ctx.setLineDash([]); // Reset
    }

    updateParallax(camera) {
        const bg = document.getElementById('abyss-background');
        if (bg) {
            const offsetX = -camera.x * 0.05;
            const offsetY = -camera.y * 0.05;
            bg.style.backgroundPosition = `${offsetX}px ${offsetY}px`;
        }
    }

    drawHole(entity) {
        this.ctx.beginPath();
        this.drawShape(entity.x, entity.y, entity.radius, entity.shape);
        this.ctx.fill();
    }

    drawHoleRim(entity) {
        // Fallback to Procedural Rim
        const depthGrad = this.ctx.createRadialGradient(entity.x, entity.y, entity.radius * 0.8, entity.x, entity.y, entity.radius);
        depthGrad.addColorStop(0, 'rgba(0,0,0,0)');
        depthGrad.addColorStop(1, 'rgba(0,0,0,0.8)');
        this.ctx.fillStyle = depthGrad;
        this.ctx.beginPath();
        this.drawShape(entity.x, entity.y, entity.radius, entity.shape);
        this.ctx.fill();

        // Neon Glow Rim
        this.ctx.save();
        this.ctx.translate(entity.x, entity.y);
        this.ctx.rotate(Date.now() * 0.001); // Subtle spin

        this.ctx.beginPath();
        this.drawShape(0, 0, entity.radius, entity.shape, 0, 0);
        this.ctx.strokeStyle = entity.color || '#00f3ff';
        this.ctx.lineWidth = 5;
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = entity.color || '#00f3ff';
        this.ctx.stroke();
        this.ctx.restore();

        // Arrow Pointer to Player (if offscreen? No, this is HUD stuff)
        // Just Name
        this.drawName(entity);
    }

    drawName(entity) {
        if (entity.name) {
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 16px Montserrat, sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.shadowBlur = 4;
            this.ctx.shadowColor = '#000';
            this.ctx.lineWidth = 3;
            this.ctx.strokeText(entity.name, entity.x, entity.y - entity.radius - 20);
            this.ctx.fillText(entity.name, entity.x, entity.y - entity.radius - 20);
            this.ctx.shadowBlur = 0;
        }
    }

    drawEntitySprite(entity) {
        // Determine Asset Key
        let key = null;
        if (entity.type === 'prop') {
            const pType = entity.propType;
            // Mapping from Prop types to AssetManager keys
            if (pType === 'hydrant') key = 'hydrant';
            else if (pType === 'cone') key = 'cone';
            else if (pType === 'mailbox') key = 'mailbox';
            else if (pType === 'trash_bin' || pType === 'bin') key = 'trash';
            else if (pType === 'kiosk' || pType === 'vending') key = 'vending';
            else if (pType === 'car' || pType === 'motorcycle') key = 'car';
            else if (pType === 'van' || pType === 'bus' || pType === 'truck') key = 'van';
            else if (pType === 'tree') key = 'tree';
            else if (pType === 'building' || pType === 'small_shop' || pType === 'shelter') key = 'building';
            else if (pType === 'police') key = 'police';
            else if (pType === 'human') key = 'human';
        } else if (entity.type === 'powerup') {
            // No asset for powerup yet, use procedural or maybe a generic icon
            // key = 'coin'; // placeholder
        }

        const img = this.assetManager ? this.assetManager.get(key) : null;

        if (img) {
            // Draw Sprite
            this.ctx.save();

            // Shake effect
            const shakeX = entity.shake ? entity.shake.x : 0;
            const shakeY = entity.shake ? entity.shake.y : 0;

            this.ctx.translate(entity.x + shakeX, entity.y + shakeY);

            // Rotation
            if (entity.rotation) this.ctx.rotate(entity.rotation);

            // Scale
            const scale = entity.scale || 1;
            this.ctx.scale(scale, scale);

            // Draw Image
            // Calculate dimensions based on entity size
            // Prop.js sets width/length.
            let w = entity.width || entity.radius * 2;
            let h = entity.length || entity.height || entity.radius * 2;

            // Special handling for Buildings (Isometric height)
            if (key === 'building') {
                h = w * 1.5;
                this.ctx.drawImage(img, -w/2, -h + w/3, w, h); // Anchor bottom
            } else if (key === 'tree') {
                h = w * 1.5;
                this.ctx.drawImage(img, -w/2, -h + w/4, w, h);
            } else {
                this.ctx.drawImage(img, -w/2, -h/2, w, h);
            }

            this.ctx.restore();

        } else {
            // Fallback to original procedural drawing if no asset
            if (entity.draw) entity.draw(this.ctx);
        }
    }

    drawShape(x, y, r, type, cx = x, cy = y) {
        if (type === 'square') {
            const side = r * Math.sqrt(2);
            this.ctx.rect(cx - side/2, cy - side/2, side, side);
        } else if (type === 'star') {
            // Simple Star
            const spikes = 5;
            const outerRadius = r;
            const innerRadius = r / 2;
            let rot = Math.PI / 2 * 3;
            let cx2 = cx;
            let cy2 = cy;
            let step = Math.PI / spikes;

            this.ctx.moveTo(cx2, cy2 - outerRadius);
            for (let i = 0; i < spikes; i++) {
                cx2 = cx + Math.cos(rot) * outerRadius;
                cy2 = cy + Math.sin(rot) * outerRadius;
                this.ctx.lineTo(cx2, cy2);
                rot += step;

                cx2 = cx + Math.cos(rot) * innerRadius;
                cy2 = cy + Math.sin(rot) * innerRadius;
                this.ctx.lineTo(cx2, cy2);
                rot += step;
            }
            this.ctx.lineTo(cx, cy - outerRadius);
            this.ctx.closePath();
        } else {
            this.ctx.arc(cx, cy, r, 0, Math.PI * 2);
        }
    }
}
