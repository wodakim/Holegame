export default class InputHandler {
    constructor(canvas) {
        this.canvas = canvas;
        this.joystickZone = document.getElementById('joystick-zone');

        // State
        this.active = false; // Is input active?
        this.inputVector = { x: 0, y: 0 };
        this.pointerPosition = { x: 0, y: 0 };
        this.origin = { x: 0, y: 0 }; // For virtual joystick

        // Configuration
        this.maxJoystickRadius = 50; // Max distance for full speed
        this.isTouch = false;

        this.init();
    }

    init() {
        // Touch Events
        this.joystickZone.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        this.joystickZone.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        this.joystickZone.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });
        this.joystickZone.addEventListener('touchcancel', (e) => this.handleTouchEnd(e), { passive: false });

        // Mouse Events
        this.joystickZone.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e)); // Global move to prevent getting stuck
        document.addEventListener('mouseup', (e) => this.handleMouseUp(e));
    }

    // --- Touch Logic (Virtual Joystick) ---
    handleTouchStart(e) {
        e.preventDefault();
        this.isTouch = true;
        this.active = true;
        const touch = e.changedTouches[0];
        this.origin = { x: touch.clientX, y: touch.clientY };
        this.pointerPosition = { x: touch.clientX, y: touch.clientY };
        this.updateVector();
    }

    handleTouchMove(e) {
        if (!this.active || !this.isTouch) return;
        e.preventDefault();
        const touch = e.changedTouches[0];
        this.pointerPosition = { x: touch.clientX, y: touch.clientY };
        this.updateVector();
    }

    handleTouchEnd(e) {
        if (!this.active || !this.isTouch) return;
        e.preventDefault();
        this.active = false;
        this.inputVector = { x: 0, y: 0 };
    }

    // --- Mouse Logic (Follow Mouse) ---
    handleMouseDown(e) {
        if (this.isTouch) return; // Ignore mouse if touch is active
        this.active = true;
        this.pointerPosition = { x: e.clientX, y: e.clientY };
        // For mouse follow, origin is center of screen
        this.origin = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        this.updateVector();
    }

    handleMouseMove(e) {
        if (this.isTouch) return;
        this.pointerPosition = { x: e.clientX, y: e.clientY };

        if (this.active) {
             // Re-center origin on resize or movement?
             // Actually for "Follow Mouse", we usually want the vector from center of screen to mouse.
             this.origin = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
             this.updateVector();
        }
    }

    handleMouseUp(e) {
        if (this.isTouch) return;
        this.active = false;
        this.inputVector = { x: 0, y: 0 };
    }

    // --- Common Logic ---
    updateVector() {
        const dx = this.pointerPosition.x - this.origin.x;
        const dy = this.pointerPosition.y - this.origin.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance === 0) {
            this.inputVector = { x: 0, y: 0 };
            return;
        }

        // Normalize
        const nx = dx / distance;
        const ny = dy / distance;

        // Clamp magnitude (0 to 1) based on maxJoystickRadius
        // For mouse, we might want it always 1 if distance > deadzone?
        // Let's treat mouse like a giant joystick for now, or just clamp to 1.

        let magnitude = distance / this.maxJoystickRadius;
        if (magnitude > 1) magnitude = 1;

        this.inputVector = { x: nx * magnitude, y: ny * magnitude };
    }

    getVector() {
        return this.inputVector;
    }
}
