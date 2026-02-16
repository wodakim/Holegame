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
        const lerpFactor = 3 * dt;
        this.x += (target.x - this.x) * lerpFactor;
        this.y += (target.y - this.y) * lerpFactor;

        // Cinematic Zoom smoothing
        const zoomLerp = 1 * dt;
        this.zoom += (this.targetZoom - this.zoom) * zoomLerp;

        // Apply shake decay
        if (this.shakeStrength > 0) {
            this.x += (Math.random() - 0.5) * this.shakeStrength;
            this.y += (Math.random() - 0.5) * this.shakeStrength;
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
