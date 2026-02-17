export default class Renderer {
    constructor(canvas, assetManager) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.assetManager = assetManager;
        this.width = canvas.width;
        this.height = canvas.height;

        // Configuration
        this.gridSize = 100;
        this.roadWidth = 60; // Road width
        this.sidewalkColor = '#3a3a3a'; // Dark Grey for blocks
        this.roadColor = '#222'; // Darker for roads
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

        // 2. Draw Roads (Grid Lines)
        this.ctx.lineWidth = this.roadWidth;
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

        // 3. Draw Road Markings (Dashed White Lines)
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.setLineDash([10, 10]);
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
            const offsetX = -camera.x * 0.1;
            const offsetY = -camera.y * 0.1;
            bg.style.backgroundPosition = `${offsetX}px ${offsetY}px`;
        }
    }

    drawHole(entity) {
        this.ctx.beginPath();
        // Use default shape drawing for the "cut", as textures don't work with destination-out easily
        // unless we draw the mask. But circle/square is fine for the hole itself.
        this.drawShape(entity.x, entity.y, entity.radius, entity.shape);
        this.ctx.fill();
    }

    drawHoleRim(entity) {
        // If we have a skin asset, try to use it?
        // But skins are usually just the rim.
        // Let's stick to the procedural neon rim for now as it looks cool and "Void"-like
        // OR if we have a skin asset, draw it on top.

        const skinKey = entity.skinId || 'skin-default'; // Assuming entity has skinId
        const skinImg = this.assetManager ? this.assetManager.getImage(skinKey) : null;

        if (skinImg) {
            this.ctx.save();
            this.ctx.translate(entity.x, entity.y);
            this.ctx.rotate(Date.now() * 0.002); // Spin
            const size = entity.radius * 2.5; // Slightly larger than hole
            this.ctx.drawImage(skinImg, -size/2, -size/2, size, size);
            this.ctx.restore();

            // Name
            this.drawName(entity);
            return;
        }

        // Fallback to Procedural Rim
        const depthGrad = this.ctx.createRadialGradient(entity.x, entity.y, entity.radius * 0.7, entity.x, entity.y, entity.radius);
        depthGrad.addColorStop(0, 'rgba(0,0,0,0)');
        depthGrad.addColorStop(1, 'rgba(0,0,0,0.8)');
        this.ctx.fillStyle = depthGrad;
        this.ctx.beginPath();
        this.ctx.arc(entity.x, entity.y, entity.radius, 0, Math.PI * 2);
        this.ctx.fill();

        // Rings
        const time = Date.now() * 0.001;
        this.ctx.save();
        this.ctx.translate(entity.x, entity.y);
        this.ctx.rotate(time);
        this.ctx.beginPath();
        this.drawShape(0, 0, entity.radius, entity.shape, 0, 0);
        this.ctx.strokeStyle = entity.color || '#00f3ff';
        this.ctx.lineWidth = 5;
        this.ctx.stroke();
        this.ctx.restore();

        this.drawName(entity);
    }

    drawName(entity) {
        if (entity.name) {
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 16px Montserrat';
            this.ctx.textAlign = 'center';
            this.ctx.shadowBlur = 4;
            this.ctx.shadowColor = '#000';
            this.ctx.fillText(entity.name, entity.x, entity.y - entity.radius - 20);
            this.ctx.shadowBlur = 0;
        }
    }

    drawEntitySprite(entity) {
        // Determine Asset Key
        let key = null;
        if (entity.type === 'prop') {
            const pType = entity.propType;
            if (pType === 'hydrant') key = 'prop-hydrant';
            else if (pType === 'cone') key = 'prop-cone';
            else if (pType === 'mailbox') key = 'prop-mailbox';
            else if (pType === 'trash_bin') key = 'prop-trash';
            else if (pType === 'kiosk' || pType === 'small_shop') key = 'prop-vending'; // Mapping
            else if (pType === 'car') key = 'prop-car';
            else if (pType === 'van' || pType === 'bus' || pType === 'truck') key = 'prop-van'; // Shared for now
            else if (pType === 'tree') key = 'prop-tree';
            else if (pType === 'building') key = 'prop-building';
            // Fallback for others (pole, fence, etc) will use procedural or default
        }

        const img = this.assetManager ? this.assetManager.getImage(key) : null;

        if (img) {
            // Draw Sprite
            this.ctx.save();

            // Shake effect
            const shakeX = entity.shake ? entity.shake.x : 0;
            const shakeY = entity.shake ? entity.shake.y : 0;

            this.ctx.translate(entity.x + shakeX, entity.y + shakeY);

            // Rotation
            if (entity.rotation) this.ctx.rotate(entity.rotation);
            else if (entity.propType === 'car' || entity.propType === 'van') {
                // If vehicles don't have rotation property set, maybe align?
                // Usually Prop.js sets rotation.
            }

            // Scale
            const scale = entity.scale || 1;
            this.ctx.scale(scale, scale);

            // Draw Image
            // Calculate dimensions based on entity size or image aspect ratio
            // Prop.js sets width/length.
            let w = entity.width || entity.radius * 2;
            let h = entity.length || entity.height || entity.radius * 2;

            // Adjust for specific sprites that might be taller (buildings)
            if (key === 'prop-building') {
                // Building sprite is isometric, we draw it anchored at the bottom-center (roughly)
                // Sprite viewbox is 100x100.
                h = w * 1.5; // Make it tall
                this.ctx.drawImage(img, -w/2, -h + w/4, w, h); // Offset y to anchor at bottom
            } else {
                this.ctx.drawImage(img, -w/2, -h/2, w, h);
            }

            this.ctx.restore();

        } else {
            // Fallback to original procedural drawing
            if (entity.draw) entity.draw(this.ctx);
        }
    }

    drawShape(x, y, r, type, cx = x, cy = y) {
        if (type === 'square') {
            const side = r * Math.sqrt(2);
            this.ctx.rect(cx - side/2, cy - side/2, side, side);
        } else {
            this.ctx.arc(cx, cy, r, 0, Math.PI * 2);
        }
    }
}
