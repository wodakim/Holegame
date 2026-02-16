export default class Camera {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.zoom = 1;
        this.targetZoom = 1;
        this.shakeStrength = 0;
    }

    follow(target, dt) {
        if (!target) return;

        // Lerp towards target position
        // The camera should center the target
        // target.x, target.y are world coordinates
        // We want camera.x, camera.y to be the top-left of the viewport in world coords?
        // Or just the center point? Let's treat camera.x/y as the center point of the view.

        // Heavier camera feel (Juicy Lag)
        // Increased lerp factor for responsiveness while keeping weight
        const lerpFactor = 5 * dt;
        this.x += (target.x - this.x) * lerpFactor;
        this.y += (target.y - this.y) * lerpFactor;

        // Cinematic Zoom smoothing
        // Increased speed significantly to avoid "unresponsive" feel
        const zoomLerp = 3 * dt;
        this.zoom += (this.targetZoom - this.zoom) * zoomLerp;

        // Clamp Zoom to sane values just in case
        this.zoom = Math.max(0.1, Math.min(2.0, this.zoom));

        // Apply shake decay
        if (this.shakeStrength > 0) {
            // Apply shake offset without permanently changing camera position
            // But here we modify x/y directly.
            // Better to have a separate shakeOffset but this works for simple shake.
            const shakeX = (Math.random() - 0.5) * this.shakeStrength;
            const shakeY = (Math.random() - 0.5) * this.shakeStrength;

            this.x += shakeX;
            this.y += shakeY;

            this.shakeStrength -= this.shakeStrength * 5 * dt;
            if (this.shakeStrength < 0.1) this.shakeStrength = 0;
        }
    }

    setTargetZoom(z) {
        this.targetZoom = z;
    }

    shake(strength) {
        this.shakeStrength = strength;
    }

    // Convert world coordinates to screen coordinates
    worldToScreen(wx, wy, canvasWidth, canvasHeight) {
        return {
            x: (wx - this.x) * this.zoom + canvasWidth / 2,
            y: (wy - this.y) * this.zoom + canvasHeight / 2
        };
    }

    // Convert screen coordinates to world coordinates
    screenToWorld(sx, sy, canvasWidth, canvasHeight) {
        return {
            x: (sx - canvasWidth / 2) / this.zoom + this.x,
            y: (sy - canvasHeight / 2) / this.zoom + this.y
        };
    }
}
