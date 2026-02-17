import GameManager from './managers/game-manager.js';
import SaveManager from './managers/save-manager.js';
import AdManager from './managers/ad-manager.js';
import ShopManager from './managers/shop-manager.js';
import SoundManager from './managers/sound-manager.js';
import UIManager from './ui/ui-manager.js';
import Renderer from './core/renderer.js';
import InputHandler from './core/input-handler.js';
import GameLoop from './core/game-loop.js';
import AssetManager from './core/asset-manager.js';

class App {
    constructor() {
        console.log("URBAN VOID: Initializing...");
        this.init();
    }

    async init() {
        // 0. Asset Manager (Preload)
        this.assetManager = new AssetManager();
        await this.loadAssets();

        // 1. Initialize UI & Data Managers
        this.uiManager = new UIManager(this);
        this.saveManager = new SaveManager((data) => this.uiManager.updateMenuCoins(data.coins));
        this.adManager = new AdManager();
        this.soundManager = new SoundManager();
        this.shopManager = new ShopManager(this);

        // 2. Initialize Core Systems
        this.canvas = document.getElementById('game-canvas');
        this.renderer = new Renderer(this.canvas, this.assetManager); // Pass AssetManager
        this.inputHandler = new InputHandler(this.canvas);

        // 3. Initialize Game Logic
        this.gameManager = new GameManager(this); // Pass app reference

        // 4. Start Game Loop
        this.gameLoop = new GameLoop(this.gameManager, this.renderer);
        this.gameLoop.start();

        // 5. Handle Resize
        this.handleResize();
        window.addEventListener('resize', () => this.handleResize());

        // 6. Initial UI Update
        this.saveManager.updateUI();

        // Hide loader if any (we might add one later)
        console.log("URBAN VOID: Ready.");
    }

    async loadAssets() {
        // Queue assets here
        // Props
        this.assetManager.queueImage('prop-hydrant', './assets/img/prop-hydrant.svg');
        this.assetManager.queueImage('prop-cone', './assets/img/prop-cone.svg');
        this.assetManager.queueImage('prop-mailbox', './assets/img/prop-mailbox.svg');
        this.assetManager.queueImage('prop-trash', './assets/img/prop-trash.svg');
        this.assetManager.queueImage('prop-vending', './assets/img/prop-vending.svg');
        this.assetManager.queueImage('prop-car', './assets/img/prop-car.svg');
        this.assetManager.queueImage('prop-van', './assets/img/prop-van.svg');
        this.assetManager.queueImage('prop-tree', './assets/img/prop-tree.svg');
        this.assetManager.queueImage('prop-building', './assets/img/prop-building.svg');

        // Skins
        this.assetManager.queueImage('skin-default', './assets/img/skin-default.svg');
        this.assetManager.queueImage('skin-ufo', './assets/img/skin-ufo.svg');

        // UI
        this.assetManager.queueImage('ui-coin', './assets/img/ui-coin.svg');

        await this.assetManager.loadAll();
    }

    handleResize() {
        const adHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--ad-height')) || 0;
        if (this.canvas) {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight - adHeight;
            if (this.renderer) {
                this.renderer.resize(this.canvas.width, this.canvas.height);
            }
        }
    }
}

// Start the app when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
