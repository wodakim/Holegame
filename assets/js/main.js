import GameManager from './managers/game-manager.js';
import SaveManager from './managers/save-manager.js';
import AdManager from './managers/ad-manager.js';
import ShopManager from './managers/shop-manager.js';
import SoundManager from './managers/sound-manager.js';
import UIManager from './ui/ui-manager.js';
import Renderer from './core/renderer.js';
import InputHandler from './core/input-handler.js';
import GameLoop from './core/game-loop.js';
import ChunkManager from './managers/chunk-manager.js';

class App {
    constructor() {
        console.log("URBAN VOID: Initializing...");

        // 1. Initialize UI & Data Managers
        this.uiManager = new UIManager(this);
        this.saveManager = new SaveManager((data) => this.uiManager.updateMenuCoins(data.coins));
        this.adManager = new AdManager();
        this.soundManager = new SoundManager();
        this.shopManager = new ShopManager(this);

        // 2. Initialize Core Systems
        this.canvas = document.getElementById('game-canvas');
        this.renderer = new Renderer(this.canvas);
        this.inputHandler = new InputHandler(this.canvas);

        // 3. Initialize Game Logic
        this.gameManager = new GameManager(this);
        this.chunkManager = new ChunkManager(this.gameManager);

        // Override GameManager.update to include ChunkManager logic
        // This is safer than modifying GameManager extensively just for this wiring
        const originalUpdate = this.gameManager.update.bind(this.gameManager);
        this.gameManager.update = (dt) => {
            originalUpdate(dt);
            if (this.gameManager.state === 'PLAYING' && this.gameManager.player) {
                this.chunkManager.update(this.gameManager.player.x, this.gameManager.player.y);
            }
        };

        // Remove initial spawn call from GameManager.startGame because ChunkManager handles it now?
        // GameManager.startGame calls spawnInitialProps().
        // We should override that to do nothing, or rely on ChunkManager.
        this.gameManager.spawnInitialProps = () => {
             // Force initial chunk load at 0,0
             this.chunkManager.updateChunks(0, 0);
        };

        // 4. Start Game Loop
        this.gameLoop = new GameLoop(this.gameManager, this.renderer);
        this.gameLoop.start();

        // 5. Handle Resize
        this.handleResize();
        window.addEventListener('resize', () => this.handleResize());

        // 6. Initial UI Update
        this.saveManager.updateUI();

        console.log("URBAN VOID: Ready.");
    }

    handleResize() {
        const adHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--ad-height')) || 0;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight - adHeight;

        if (this.renderer) {
            this.renderer.resize(this.canvas.width, this.canvas.height);
        }
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
