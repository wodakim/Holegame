import Hole from './hole.js';

export default class Player extends Hole {
    constructor(x, y, radius, color, name, saveManager) {
        super(x, y, radius, color, name); // Starting radius 25
        this.saveManager = saveManager;
        this.type = 'hole';
        this.isPlayer = true;
    }

    update(dt, input) {
        // Move based on Input Vector (normalized) * Speed * dt
        const moveSpeed = this.currentSpeed || 200; // Use calculated speed

        if (input.x !== 0 || input.y !== 0) {
            this.x += input.x * moveSpeed * dt;
            this.y += input.y * moveSpeed * dt;
        }

        super.update(dt);
    }
}
