export default class SaveManager {
    constructor(onUpdate) {
        this.onUpdate = onUpdate;
        this.data = {
            coins: 0,
            highScore: 0,
            currentSkin: 'default',
            unlockedSkins: ['default'],
            noAds: false,
            skinAdProgress: {} // { 'skin_id': count }
        };
        this.load();
    }

    load() {
        const stored = localStorage.getItem('urban_void_save');
        if (stored) {
            try {
                this.data = { ...this.data, ...JSON.parse(stored) };
            } catch (e) {
                console.error("Save data corrupted, resetting.", e);
            }
        }

        // Apply persistent settings
        if (this.data.noAds) {
            this.applyNoAds();
        }
    }

    save() {
        localStorage.setItem('urban_void_save', JSON.stringify(this.data));
        if (this.onUpdate) this.onUpdate(this.data);
    }

    addCoins(amount) {
        this.data.coins += amount;
        this.save();
    }

    spendCoins(amount) {
        if (this.data.coins >= amount) {
            this.data.coins -= amount;
            this.save();
            return true;
        }
        return false;
    }

    getHighScore() {
        return this.data.highScore;
    }

    setHighScore(score) {
        this.data.highScore = score;
        this.save();
    }

    unlockSkin(skinId) {
        if (!this.data.unlockedSkins.includes(skinId)) {
            this.data.unlockedSkins.push(skinId);
            this.save();
        }
    }

    setSkin(skinId) {
        if (this.data.unlockedSkins.includes(skinId)) {
            this.data.currentSkin = skinId;
            this.save();
        }
    }

    getCurrentSkinColor() {
        // Map skin ID to color
        const colors = {
            'default': '#00f3ff', // Cyan
            'neon_ring': '#ff00ff', // Magenta
            'glitch': '#39ff14', // Lime
            'dark_mode': '#ff3333' // Red
        };
        return colors[this.data.currentSkin] || '#00f3ff';
    }

    buyNoAds() {
        this.data.noAds = true;
        this.save();
        this.applyNoAds();
    }

    applyNoAds() {
        // Trigger ad removal
        const banner = document.getElementById('ad-banner');
        if (banner) banner.style.display = 'none';

        // Update CSS variable so canvas resizes correctly
        document.documentElement.style.setProperty('--ad-height', '0px');

        // Trigger resize
        window.dispatchEvent(new Event('resize'));
    }

    updateUI() {
        if (this.onUpdate) this.onUpdate(this.data);
    }
}
