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
        const powerups = entities.filter(e => e.type === 'powerup');

        // Hole vs PowerUp
        holes.forEach(hole => {
             powerups.forEach(pu => {
                 if (pu.markedForDeletion) return;
                 const dx = hole.x - pu.x;
                 const dy = hole.y - pu.y;
                 const dist = Math.sqrt(dx*dx + dy*dy);
                 if (dist < hole.radius + pu.radius) {
                     pu.markedForDeletion = true;
                     hole.applyPowerUp(pu.powerType);
                     if (onEat) onEat(hole, pu); // Sound/Feedback
                 }
             });
        });

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
                const magnetMultiplier = hole.activePowerUps && hole.activePowerUps['magnet'] ? 3.0 : 1.5;
                if (distSq < pullRadius * pullRadius * magnetMultiplier) {
                    // Check if prop is smaller
                    // Calculate prop effective radius
                    const propR = prop.radius || (Math.max(prop.width, prop.height) / 2);

                    if (hole.radius > propR) {
                        // SUCTION LOGIC
                        // 1. Move prop towards hole center
                        const dist = Math.sqrt(distSq);
                        const force = (hole.radius / dist) * 400 * dt; // Doubled suction force for snappiness
                        const nx = dx / dist;
                        const ny = dy / dist;

                        // Override traffic velocity if caught
                        if (prop.isTraffic) {
                            prop.velocity.x = 0;
                            prop.velocity.y = 0;
                            prop.isTraffic = false; // Stop driving
                        }

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

                            if (prop.propType === 'police') {
                                hole.shrink(20); // Penalty
                            } else {
                                hole.grow(prop.value || 1);
                            }

                            if (onEat) onEat(hole, prop);
                        }
                    }
                }
            });

            // Hole vs Hole
            holes.forEach(otherHole => {
                if (hole === otherHole) return;
                if (hole.markedForDeletion || otherHole.markedForDeletion) return;

                // Shield check
                if (otherHole.activePowerUps && otherHole.activePowerUps['shield']) return;

                const dx = hole.x - otherHole.x;
                const dy = hole.y - otherHole.y;
                const dist = Math.sqrt(dx*dx + dy*dy);

                // Eat Range: Distance < Radius
                // Requirement: Must be bigger to eat
                if (dist < hole.radius) {
                    if (hole.radius > otherHole.radius * 1.05) { // 5% bigger buffer
                         otherHole.markedForDeletion = true;
                         // Reward: 1/3 of victim's points
                         const reward = Math.floor(otherHole.score / 3);
                         hole.grow(reward > 0 ? reward : 10); // Minimum 10 points
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
