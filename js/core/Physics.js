export default class Physics {
    constructor() {
        this.worldBounds = { x: -2000, y: -2000, width: 4000, height: 4000 };
    }

    update(dt, entities, onEat) {
        // 1. Move everything
        entities.forEach(entity => {
            if (entity.velocity) {
                entity.x += entity.velocity.x * dt;
                entity.y += entity.velocity.y * dt;

                // Friction/Damping for sliding objects?
                // For holes, velocity is controlled directly.
                // For props being sucked, they might have velocity.
            }

            // Boundary checks for Holes
            if (entity.type === 'hole') {
                this.clampToWorld(entity);
            }
        });

        // 2. Collision & Suction
        // Separate holes and props
        const holes = entities.filter(e => e.type === 'hole');
        const props = entities.filter(e => e.type === 'prop');

        // Hole vs Prop
        holes.forEach(hole => {
            props.forEach(prop => {
                // If prop is already eaten or shrinking too fast, skip?
                if (prop.markedForDeletion) return;

                // Check basic distance first (Circle-Circle approx)
                const dx = hole.x - prop.x;
                const dy = hole.y - prop.y;
                const distSq = dx*dx + dy*dy;
                const pullRadius = hole.radius + Math.max(prop.width || prop.radius, prop.height || prop.radius); // Rough bounding

                // If within pull range
                if (distSq < pullRadius * pullRadius * 1.5) { // 1.5x buffer
                    // Check if prop is smaller
                    // Calculate prop effective radius
                    const propR = prop.radius || (Math.max(prop.width, prop.height) / 2);

                    if (hole.radius > propR) {
                        // SUCTION LOGIC
                        // 1. Move prop towards hole center
                        const dist = Math.sqrt(distSq);
                        const force = (hole.radius / dist) * 200 * dt; // Stronger as it gets closer
                        const nx = dx / dist;
                        const ny = dy / dist;

                        prop.x += nx * force;
                        prop.y += ny * force;

                        // Apply Shake
                        const shakeStrength = Math.min(10, force * 0.5); // Cap at 10px
                        if (prop.shake) {
                            prop.shake.x = (Math.random() - 0.5) * shakeStrength;
                            prop.shake.y = (Math.random() - 0.5) * shakeStrength;
                        }

                        // 2. Shrink prop
                        prop.scale = (prop.scale || 1) - 2 * dt;
                        if (prop.scale < 0) prop.scale = 0;

                        // 3. EAT LOGIC
                        // If center is close enough
                        if (dist < hole.radius * 0.5) {
                            prop.markedForDeletion = true;
                            hole.grow(prop.value || 1);
                            if (onEat) onEat(hole, prop);
                        }
                    }
                }
            });

            // Hole vs Hole
            holes.forEach(otherHole => {
                if (hole === otherHole) return;

                const dx = hole.x - otherHole.x;
                const dy = hole.y - otherHole.y;
                const dist = Math.sqrt(dx*dx + dy*dy);

                if (dist < hole.radius) {
                    if (hole.radius > otherHole.radius * 1.1) { // 10% bigger to eat
                         otherHole.markedForDeletion = true; // Respawn?
                         hole.grow(otherHole.radius * 0.5); // Grow by half their radius
                         if (onEat) onEat(hole, otherHole);
                    }
                }
            });
        });
    }

    clampToWorld(entity) {
        if (entity.x - entity.radius < this.worldBounds.x) entity.x = this.worldBounds.x + entity.radius;
        if (entity.x + entity.radius > this.worldBounds.x + this.worldBounds.width) entity.x = this.worldBounds.x + this.worldBounds.width - entity.radius;
        if (entity.y - entity.radius < this.worldBounds.y) entity.y = this.worldBounds.y + entity.radius;
        if (entity.y + entity.radius > this.worldBounds.y + this.worldBounds.height) entity.y = this.worldBounds.y + this.worldBounds.height - entity.radius;
    }

    // Helper: Circle-Rect collision
    static checkCircleRect(circle, rect) {
        const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
        const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));
        const dx = circle.x - closestX;
        const dy = circle.y - closestY;
        return (dx * dx + dy * dy) < (circle.radius * circle.radius);
    }
}
