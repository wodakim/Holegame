import Prop from '../entities/prop.js';

export default class ChunkManager {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.chunkSize = 1000; // 1km^2
        this.loadedChunks = new Set();
        this.lastChunkX = null;
        this.lastChunkY = null;
        this.seedBase = Math.random() * 10000;
        this.floorCanvas = null;
        this.floorCtx = null;
    }

    // AAA Aesthetic: Draw Roads on Floor Canvas?
    // The renderer clears the floor every frame to show the abyss.
    // To make roads visible, we need to draw them on the canvas or create "Road Entities" that get eaten?
    // If roads get eaten, they must be entities.
    // If they are just texture, they stay until the hole moves over them.
    // The current engine uses `globalCompositeOperation = 'destination-out'` to cut holes.
    // So the floor is actually drawn first (or is the background), then we cut holes.
    // Wait, `index.html` says: Layer 1 Abyss, Layer 2 Canvas.
    // Renderer.js likely fills canvas with "Floor Color" then cuts holes.
    // If we want roads, we must draw them on the floor layer in Renderer.

    // ChunkManager should provide "Floor Decoration" data to Renderer?
    // Or just spawn "Road" entities that are huge flat props?
    // Road entities are best if we want them to be "eaten" eventually (super late game).
    // For now, let's keep roads as visual floor decoration.

    update(playerX, playerY) {
        const cx = Math.floor(playerX / this.chunkSize);
        const cy = Math.floor(playerY / this.chunkSize);

        if (cx !== this.lastChunkX || cy !== this.lastChunkY) {
            this.lastChunkX = cx;
            this.lastChunkY = cy;
            this.updateChunks(cx, cy);
        }
    }

    updateChunks(px, py) {
        const radius = 2;
        const newVisible = new Set();

        for (let y = py - radius; y <= py + radius; y++) {
            for (let x = px - radius; x <= px + radius; x++) {
                const key = `${x},${y}`;
                newVisible.add(key);
                if (!this.loadedChunks.has(key)) {
                    this.generateChunk(x, y);
                    this.loadedChunks.add(key);
                }
            }
        }

        // Unload
        for (const key of this.loadedChunks) {
            if (!newVisible.has(key)) {
                this.unloadChunk(key);
                this.loadedChunks.delete(key);
            }
        }
    }

    unloadChunk(key) {
        const [cx, cy] = key.split(',').map(Number);
        const minX = cx * this.chunkSize;
        const maxX = (cx + 1) * this.chunkSize;
        const minY = cy * this.chunkSize;
        const maxY = (cy + 1) * this.chunkSize;

        for (let i = this.gameManager.entities.length - 1; i >= 0; i--) {
            const e = this.gameManager.entities[i];
            if (e.type === 'prop' && e.x >= minX && e.x < maxX && e.y >= minY && e.y < maxY) {
                e.markedForDeletion = true;
            }
        }
    }

    generateChunk(cx, cy) {
        const chunkSeed = Math.sin(cx * 12.9898 + cy * 78.233 + this.seedBase) * 43758.5453;
        let rng = chunkSeed - Math.floor(chunkSeed);
        const random = () => {
            rng = Math.sin(rng * 12.9898 + 78.233) * 43758.5453;
            rng = rng - Math.floor(rng);
            return rng;
        };

        const baseX = cx * this.chunkSize;
        const baseY = cy * this.chunkSize;

        // Structured Layout
        const roadWidth = 120; // Wide roads

        // 1. Spawn "Road" tiles?
        // Let's spawn "Road Strip" props that are flat and dark grey.
        // They will be Tier 10 (Uneatable until end) or just visual?
        // If we make them props, they sort with buildings.
        // Let's make them visually distinct props: type='road'

        // Top Road
        this.spawnRoad(baseX + this.chunkSize/2, baseY + roadWidth/2, this.chunkSize, roadWidth);
        // Left Road
        this.spawnRoad(baseX + roadWidth/2, baseY + this.chunkSize/2, roadWidth, this.chunkSize);

        const innerX = baseX + roadWidth;
        const innerY = baseY + roadWidth;
        const innerSize = this.chunkSize - roadWidth;

        // 2. Buildings (The Meat)
        const numBuildings = 4 + Math.floor(random() * 6);
        for(let i=0; i<numBuildings; i++) {
            const w = 120 + random() * 180;
            const h = 120 + random() * 180;
            const x = innerX + random() * (innerSize - w);
            const y = innerY + random() * (innerSize - h);

            const area = w*h;
            const value = Math.floor(area / 100);

            // Dark Neon Palette
            const colors = ['#1a1a2e', '#16213e', '#0f3460', '#533483'];
            const color = colors[Math.floor(random() * colors.length)];

            this.gameManager.spawnProp(x + w/2, y + h/2, 'building', value, w, h, color);
        }

        // 3. Street Details (Lamps, Hydrants)
        const perimeterProps = 25;
        for(let i=0; i<perimeterProps; i++) {
            const side = Math.floor(random() * 4);
            let px, py;
            // Spawning on the SIDEWALK (edge of road)
            const offset = roadWidth + 20;

            if (side === 0) { // Top Strip
                 px = baseX + random()*this.chunkSize;
                 py = baseY + offset;
            } else if (side === 1) { // Right Strip
                 px = baseX + this.chunkSize - offset;
                 py = baseY + random()*this.chunkSize;
            } else if (side === 2) { // Bottom Strip
                 px = baseX + random()*this.chunkSize;
                 py = baseY + this.chunkSize - offset;
            } else { // Left Strip
                 px = baseX + offset;
                 py = baseY + random()*this.chunkSize;
            }

            const r = random();
            let type, w, h, val, col;
            if (r < 0.3) { type='cone'; w=15; h=15; val=2; col='#ffaa00'; }
            else if (r < 0.6) { type='hydrant'; w=20; h=25; val=5; col='#ff4444'; }
            else if (r < 0.8) { type='fence'; w=40; h=10; val=8; col='#cccccc'; }
            else { type='bus_stop'; w=60; h=30; val=15; col='#33ccff'; }

            this.gameManager.spawnProp(px, py, type, val, w, h, col);
        }

        // 4. Park / Plaza in Center?
        if (random() < 0.3) {
             const cx = innerX + innerSize/2;
             const cy = innerY + innerSize/2;
             // Spawn trees?
             for(let k=0; k<5; k++) {
                 this.gameManager.spawnProp(cx + (random()-0.5)*100, cy + (random()-0.5)*100, 'tree', 10, 30, 30, '#00ff00');
             }
             // Benches
             this.gameManager.spawnProp(cx, cy+40, 'bench', 8, 40, 15, '#aa6633');
        }

        // 5. Scattering Small Objects
        const filler = 20;
        for(let i=0; i<filler; i++) {
            const x = innerX + random() * innerSize;
            const y = innerY + random() * innerSize;
            const r = random();
            let type, w, h, val, col;

            if (r < 0.5) { type='trash'; w=10; h=10; val=1; col='#555'; }
            else if (r < 0.8) { type='bottle'; w=8; h=12; val=1; col='#0f0'; }
            else { type='person'; w=15; h=15; val=5; col='#fff'; }

            this.gameManager.spawnProp(x, y, type, val, w, h, col);
        }
    }

    spawnRoad(x, y, w, h) {
        // Road is a flat prop, extremely hard to eat
        // type='road'
        // requiredSize = 999999
        // visual only
        // Actually, let's NOT make them props because they will collide with player.
        // We want player to walk ON them.
        // So roads must be purely visual in the Renderer or a separate entity layer that doesn't collide.
        // Or simple hack: Prop with isFloor = true.

        const road = new Prop(x, y, 'road', 0, w, h, '#222');
        road.isFloor = true; // Flag for physics to ignore
        road.z = -1; // Draw below everything
        this.gameManager.entities.push(road);
    }
}
