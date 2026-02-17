import Prop from '../entities/prop.js';

export default class Physics {
    constructor() {
    }

    update(dt, entities, onInteraction) {
        // Find eaters and targets
        // Eaters: Holes (Player, Bots)
        // Targets: Everything else + Smaller Holes

        for (let i = 0; i < entities.length; i++) {
            const eater = entities[i];
            if (eater.type !== 'hole') continue;
            if (eater.markedForDeletion) continue;

            for (let j = 0; j < entities.length; j++) {
                if (i === j) continue;
                const target = entities[j];

                if (target.markedForDeletion || target.falling) continue;

                // Simple Circle-Circle Collision
                const dx = target.x - eater.x;
                const dy = target.y - eater.y;
                const distSq = dx*dx + dy*dy;
                const dist = Math.sqrt(distSq);

                // --- LOGIC: EATING vs BLOCKING ---
                let canEat = false;
                let isSolid = false;

                if (target.type === 'prop') {
                    // Check size requirement: Player Radius vs Prop Required Radius
                    if (eater.radius >= target.requiredSize) {
                        canEat = true;
                    } else {
                        isSolid = true;
                    }
                } else if (target.type === 'hole') {
                    // Eat smaller players (10% bigger required)
                    if (eater.radius > target.radius * 1.1) {
                        canEat = true;
                    } else if (target.radius > eater.radius * 1.1) {
                        // Avoid overlap with bigger holes (soft push)
                        if (dist < eater.radius + target.radius) {
                             const overlap = (eater.radius + target.radius) - dist;
                             const angle = Math.atan2(dy, dx);
                             eater.x -= Math.cos(angle) * overlap * 0.1;
                             eater.y -= Math.sin(angle) * overlap * 0.1;
                        }
                        continue;
                    }
                } else if (target.type === 'powerup') {
                    canEat = true;
                } else if (target.isPolice) {
                    // Police logic: Touches Hole -> Bad
                    if (dist < eater.radius + target.radius) {
                        onInteraction(eater, target); // Trigger Shrink
                    }
                    continue;
                }

                // 2. Resolve Interaction
                if (canEat) {
                    // Eat Trigger Zone (Center inside hole)
                    // Margin: 50% of target radius
                    const eatThreshold = eater.radius - (target.radius * 0.5);

                    if (dist < eatThreshold) {
                        // EAT!
                        if (target.type === 'prop') {
                            if (!target.falling) {
                                target.falling = true;
                                onInteraction(eater, target);
                            }
                        } else {
                            // Instant kill (Bots, Powerups)
                            target.markedForDeletion = true;
                            onInteraction(eater, target);
                        }
                    } else if (dist < eater.radius * 1.5 + target.radius) {
                        // Suction Range (Gravity)
                        // Pull dynamic objects towards center
                        if (!target.isStatic && target.type !== 'hole') {
                            const force = 300 * dt * (1 - dist / (eater.radius * 3));
                            const angle = Math.atan2(dy, dx);
                            target.x -= Math.cos(angle) * force;
                            target.y -= Math.sin(angle) * force;
                        }
                    }

                } else if (isSolid) {
                    // Collision (Blocking)
                    // Treat target as solid circle
                    const touchDist = eater.radius + target.radius * 0.9;

                    if (dist < touchDist) {
                        // Push eater OUT
                        const overlap = touchDist - dist;
                        const angle = Math.atan2(dy, dx);

                        // Move eater away
                        eater.x -= Math.cos(angle) * overlap;
                        eater.y -= Math.sin(angle) * overlap;

                        // Friction/Dampening
                        if (eater.vx) eater.vx *= 0.9;
                        if (eater.vy) eater.vy *= 0.9;
                    }
                }
            }
        }
    }
}
