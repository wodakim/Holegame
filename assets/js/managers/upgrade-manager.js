export default class UpgradeManager {
    constructor(gameManager) {
        this.gameManager = gameManager;
        // Scalable difficulty: Start at 1000, then +2000, +3000...
        this.baseThreshold = 1000;
        this.nextThreshold = this.baseThreshold;
        this.level = 1;

        this.isChoosing = false;

        // Define Upgrade Options
        this.upgrades = [
            { id: 'speed', name: 'TURBO BOOST', desc: '+10% Speed', icon: '⚡' },
            { id: 'size', name: 'MASS EXPANSION', desc: '+5% Size Instantly', icon: '🟣' },
            { id: 'satellite', name: 'ORBITAL VOID', desc: 'Adds a small satellite hole', icon: '🪐' },
            { id: 'suction', name: 'GRAVITY WELL', desc: '+20% Suction Range', icon: '🧲' },
            { id: 'digest', name: 'METABOLISM', desc: '+20% Growth per item', icon: '🧬' },
            { id: 'cooldown', name: 'AGILITY', desc: '+10 Base Speed', icon: '🏃' }
        ];
    }

    checkLevelUp(playerScore) {
        if (playerScore >= this.nextThreshold) {
            this.triggerLevelUp();
            // Increase threshold progressively (Linear scaling but harder)
            // Level 1: 1000
            // Level 2: 1000 + (1 * 1500) = 2500
            // Level 3: 2500 + (2 * 1500) = 5500
            // This makes it scalable and harder as you go.
            const increment = this.level * 1500;
            this.nextThreshold += increment;
            this.level++;
        }
    }

    triggerLevelUp() {
        if (this.isChoosing) return;

        this.gameManager.paused = true; // Pause Game
        this.isChoosing = true;

        // Select 3 random upgrades from pool
        const choices = [];
        const pool = [...this.upgrades];

        for(let i=0; i<3; i++) {
            if (pool.length === 0) break;
            const idx = Math.floor(Math.random() * pool.length);
            choices.push(pool.splice(idx, 1)[0]);
        }

        // Show UI via UIManager
        this.gameManager.app.uiManager.showLevelUp(choices, (selectedId) => {
            this.applyUpgrade(selectedId);
        });
    }

    applyUpgrade(id) {
        const player = this.gameManager.player;
        if (!player) return;

        // Apply to Player using Hole's method
        player.addUpgrade(id);

        // REMOVED: Unfair bot buffing logic.
        // Bots now level up independently in their update loop.

        // Resume Game
        this.isChoosing = false;
        this.gameManager.paused = false;
        this.gameManager.app.uiManager.switchScreen('hud');
    }
}
