export default class UpgradeManager {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.nextThreshold = 500; // First upgrade at 500 points
        this.thresholdStep = 1000; // Subsequent upgrades every 1000 points
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
        // Simple logic: if score crosses threshold
        if (playerScore >= this.nextThreshold) {
            this.triggerLevelUp();
            this.nextThreshold += this.thresholdStep;
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

        // Buff some bots to keep challenge up
        this.gameManager.entities.forEach(e => {
            if (e.type === 'hole' && e !== player && Math.random() < 0.3) {
                 const randomUp = this.upgrades[Math.floor(Math.random() * this.upgrades.length)];
                 e.addUpgrade(randomUp.id);
            }
        });

        // Resume Game
        this.isChoosing = false;
        this.gameManager.paused = false;
        this.gameManager.app.uiManager.switchScreen('hud');
    }
}
