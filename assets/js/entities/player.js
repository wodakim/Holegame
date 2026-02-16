import Hole from './hole.js';

export default class Player extends Hole {
    constructor(x, y, radius, color, name, saveManager) {
        super(x, y, radius, color, name);
        this.saveManager = saveManager; // To save stats if needed
        this.inputVector = { x: 0, y: 0 };
    }

    update(dt, inputVector) {
        this.inputVector = inputVector;

        // Move based on input
        // Normalize input vector if length > 1 (handled by InputHandler usually)

        // Velocity = Input * Speed
        this.velocity.x = this.inputVector.x * this.speed;
        this.velocity.y = this.inputVector.y * this.speed;

        // Apply velocity (physics.js handles position update, but we set velocity here)
        // Wait, physics.js iterates entities and does:
        // entity.x += entity.velocity.x * dt;
        // So we just set velocity.
    }
}
