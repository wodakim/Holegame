export default class AssetManager {
    constructor() {
        this.images = new Map();
        this.audio = new Map();
        this.toLoad = {
            images: [],
            audio: []
        };
    }

    queueImage(key, src) {
        this.toLoad.images.push({ key, src });
    }

    queueAudio(key, src) {
        this.toLoad.audio.push({ key, src });
    }

    async loadAll() {
        const imagePromises = this.toLoad.images.map(img => this.loadImage(img.key, img.src));
        // Audio loading would go here if using files, for now we just resolve
        // const audioPromises = this.toLoad.audio.map(aud => this.loadAudio(aud.key, aud.src));

        await Promise.all([...imagePromises]);
        console.log('All assets loaded.');
    }

    loadImage(key, src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.images.set(key, img);
                resolve(img);
            };
            img.onerror = (e) => {
                console.error(`Failed to load image: ${src}`, e);
                // Create a placeholder
                this.createPlaceholder(key);
                resolve(this.images.get(key)); // Resolve anyway to not block game
            };
            img.src = src;
        });
    }

    createPlaceholder(key) {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ff00ff';
        ctx.fillRect(0, 0, 64, 64);
        ctx.fillStyle = '#000';
        ctx.font = '10px sans-serif';
        ctx.fillText(key, 5, 32);

        const img = new Image();
        img.src = canvas.toDataURL();
        this.images.set(key, img);
    }

    getImage(key) {
        return this.images.get(key);
    }

    // Audio placeholders for now
    getAudio(key) {
        return this.audio.get(key);
    }
}
