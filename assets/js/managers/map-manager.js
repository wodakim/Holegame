import Prop from '../entities/prop.js';

export default class MapManager {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.chunkSize = 600; // 500 block + 100 road (shared)
        this.activeChunks = new Map(); // key "x,y" -> [entities]

        // Initial spawn
        this.update(0, 0);
    }

    update(playerX, playerY) {
        const cx = Math.floor(playerX / this.chunkSize);
        const cy = Math.floor(playerY / this.chunkSize);

        // Keep 2x2 radius chunks active (5x5 grid)
        const range = 2;
        const visibleKeys = new Set();

        for (let x = cx - range; x <= cx + range; x++) {
            for (let y = cy - range; y <= cy + range; y++) {
                const key = `${x},${y}`;
                visibleKeys.add(key);

                if (!this.activeChunks.has(key)) {
                    this.generateChunk(x, y);
                }
            }
        }

        // Cleanup old chunks
        for (const [key, entities] of this.activeChunks) {
            if (!visibleKeys.has(key)) {
                this.despawnChunk(key);
            }
        }
    }

    generateChunk(cx, cy) {
        const entities = [];
        const baseX = cx * this.chunkSize;
        const baseY = cy * this.chunkSize;
        const centerX = baseX + this.chunkSize / 2;
        const centerY = baseY + this.chunkSize / 2;

        // 1. Determine Block Type
        const typeRoll = Math.random();

        if (typeRoll < 0.6) {
            // City Block: Buildings
            if (Math.random() < 0.5) {
                // 1 Big Building
                const b = new Prop(centerX, centerY, 'building');
                b.width = 300;
                b.length = 300;
                b.radius = 160; // Needs to be big enough to block
                entities.push(b);
            } else {
                // 4 Small Buildings
                const offset = 90;
                [[-1,-1], [1,-1], [-1,1], [1,1]].forEach(([dx, dy]) => {
                    const b = new Prop(centerX + dx*offset, centerY + dy*offset, 'building');
                    b.width = 130;
                    b.length = 130;
                    b.radius = 70;
                    entities.push(b);
                });
            }
        } else if (typeRoll < 0.8) {
            // Plaza / Park
            const fountain = new Prop(centerX, centerY, 'pole');
            fountain.scale = 2; // Fountain
            entities.push(fountain);

            // Benches in circle
            for(let i=0; i<8; i++) {
                const angle = i * Math.PI/4;
                const dist = 120;
                entities.push(new Prop(centerX + Math.cos(angle)*dist, centerY + Math.sin(angle)*dist, 'bench'));
            }
            // Some humans walking
            for(let i=0; i<5; i++) {
                entities.push(new Prop(centerX + (Math.random()-0.5)*200, centerY + (Math.random()-0.5)*200, 'human'));
            }
        } else {
            // Parking Lot or Construction
            for(let i=0; i<8; i++) {
                 // Random parked cars
                 entities.push(new Prop(centerX + (Math.random()-0.5)*300, centerY + (Math.random()-0.5)*300, 'car'));
            }
            entities.push(new Prop(centerX - 150, centerY - 150, 'cone'));
            entities.push(new Prop(centerX + 150, centerY + 150, 'cone'));
        }

        // 2. Sidewalk Props (Perimeter)
        // Road is at edges (0 and 600 relative to chunk).
        // Sidewalk is 60px in.
        const min = 60;
        const max = this.chunkSize - 60;

        // Spawn items along the sidewalk paths
        const step = 80;
        for (let x = min; x <= max; x += step) {
             this.trySpawnSidewalkItem(baseX + x, baseY + min, entities);
             this.trySpawnSidewalkItem(baseX + x, baseY + max, entities);
        }
        for (let y = min; y <= max; y += step) {
             this.trySpawnSidewalkItem(baseX + min, baseY + y, entities);
             this.trySpawnSidewalkItem(baseX + max, baseY + y, entities);
        }

        // 3. Register
        this.activeChunks.set(`${cx},${cy}`, entities);
        this.gameManager.entities.push(...entities);
    }

    trySpawnSidewalkItem(x, y, list) {
        if (Math.random() > 0.4) return; // 60% empty space

        const roll = Math.random();
        // Vary items
        if (roll < 0.3) list.push(new Prop(x, y, 'human'));
        else if (roll < 0.5) list.push(new Prop(x, y, 'bottle'));
        else if (roll < 0.65) list.push(new Prop(x, y, 'pole'));
        else if (roll < 0.75) list.push(new Prop(x, y, 'bench'));
        else if (roll < 0.8) list.push(new Prop(x, y, 'shelter')); // Rare bus stop
        else list.push(new Prop(x, y, 'cone'));
    }

    despawnChunk(key) {
        const entities = this.activeChunks.get(key);
        if (entities) {
            entities.forEach(e => e.markedForDeletion = true);
            this.activeChunks.delete(key);
        }
    }

    // Helper to get random road position for TrafficManager
    getRandomRoadPosition(playerX, playerY, range=2000) {
        // Return a coordinate that aligns with road grid (multiples of 600)
        // Near player
        const cx = Math.floor(playerX / this.chunkSize);
        const cy = Math.floor(playerY / this.chunkSize);

        // Pick a road line (vertical or horizontal)
        const isVert = Math.random() > 0.5;
        if (isVert) {
            // x = multiple of 600
            // Pick x within range
            const offsetIdx = Math.floor((Math.random() - 0.5) * 4); // -2 to 2
            const x = (cx + offsetIdx) * this.chunkSize;
            const y = playerY + (Math.random() - 0.5) * range;
            return { x, y, isVert: true };
        } else {
            const offsetIdx = Math.floor((Math.random() - 0.5) * 4);
            const y = (cy + offsetIdx) * this.chunkSize;
            const x = playerX + (Math.random() - 0.5) * range;
            return { x, y, isVert: false };
        }
    }
}
