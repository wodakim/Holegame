export default class AssetManager {
    constructor() {
        this.images = {};
        this.loadedCount = 0;
        this.totalAssets = 0;
        this.onProgress = null;
        this.onComplete = null;
    }

    loadAll(onProgress, onComplete) {
        this.onProgress = onProgress;
        this.onComplete = onComplete;

        const assets = this.getAssetDefinitions();
        this.totalAssets = Object.keys(assets).length;

        if (this.totalAssets === 0) {
            if (this.onComplete) this.onComplete();
            return;
        }

        for (const [key, svgString] of Object.entries(assets)) {
            const img = new Image();
            img.onload = () => {
                this.loadedCount++;
                if (this.onProgress) this.onProgress(this.loadedCount / this.totalAssets);
                if (this.loadedCount === this.totalAssets) {
                    if (this.onComplete) this.onComplete();
                }
            };
            img.onerror = () => {
                console.error(`Failed to load asset: ${key}`);
                this.loadedCount++; // Still count to avoid hanging
                if (this.loadedCount === this.totalAssets && this.onComplete) this.onComplete();
            };

            // Encode SVG string to Base64
            const base64 = btoa(svgString);
            img.src = `data:image/svg+xml;base64,${base64}`;
            this.images[key] = img;
        }
    }

    get(key) {
        return this.images[key];
    }

    // --- SVG DEFINITIONS (Geek/Cartoon Style) ---
    getAssetDefinitions() {
        // Common styles
        const stroke = 'stroke="black" stroke-width="2" stroke-linejoin="round"';
        const shadow = '<ellipse cx="50" cy="90" rx="40" ry="10" fill="rgba(0,0,0,0.3)" />'; // Generic shadow

        return {
            // PROPS
            'hydrant': `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                    ${shadow}
                    <rect x="35" y="20" width="30" height="70" fill="#ff4444" ${stroke} rx="5" />
                    <rect x="30" y="10" width="40" height="15" fill="#cc0000" ${stroke} rx="2" />
                    <circle cx="50" cy="10" r="5" fill="#999" ${stroke} />
                    <!-- Eyes (Geek/Funny) -->
                    <circle cx="42" cy="40" r="5" fill="white" ${stroke} />
                    <circle cx="42" cy="40" r="2" fill="black" />
                    <circle cx="58" cy="40" r="5" fill="white" ${stroke} />
                    <circle cx="58" cy="40" r="2" fill="black" />
                    <!-- Spout -->
                    <rect x="20" y="55" width="15" height="15" fill="#999" ${stroke} />
                    <rect x="65" y="55" width="15" height="15" fill="#999" ${stroke} />
                </svg>`,

            'vending': `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                    ${shadow}
                    <rect x="20" y="10" width="60" height="85" fill="#aa0000" ${stroke} rx="2" />
                    <!-- Window -->
                    <rect x="25" y="20" width="50" height="40" fill="#ccffff" ${stroke} />
                    <!-- Bottles -->
                    <circle cx="35" cy="30" r="3" fill="orange" />
                    <circle cx="50" cy="30" r="3" fill="lime" />
                    <circle cx="65" cy="30" r="3" fill="blue" />
                    <circle cx="35" cy="45" r="3" fill="purple" />
                    <circle cx="50" cy="45" r="3" fill="red" />
                    <circle cx="65" cy="45" r="3" fill="yellow" />
                    <!-- Dispenser -->
                    <rect x="25" y="70" width="50" height="15" fill="#333" />
                </svg>`,

            'cone': `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                    ${shadow}
                    <path d="M20,90 L80,90 L50,10 Z" fill="#ff8800" ${stroke} />
                    <rect x="15" y="90" width="70" height="10" fill="#ff8800" ${stroke} rx="2" />
                    <path d="M38,60 L62,60 L58,45 L42,45 Z" fill="white" opacity="0.9" />
                    <path d="M45,30 L55,30 L53,20 L47,20 Z" fill="white" opacity="0.9" />
                    <!-- Glitch Effect -->
                    <path d="M48,50 L52,50" stroke="#00f3ff" stroke-width="2" />
                </svg>`,

            'mailbox': `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                    ${shadow}
                    <path d="M25,30 Q50,0 75,30 L75,90 L25,90 Z" fill="#0066cc" ${stroke} />
                    <rect x="30" y="40" width="40" height="10" fill="#004488" rx="2" />
                    <!-- Letters overflow -->
                    <rect x="35" y="38" width="15" height="8" fill="white" ${stroke} transform="rotate(-10 42 42)" />
                    <rect x="50" y="38" width="15" height="8" fill="white" ${stroke} transform="rotate(5 57 42)" />
                    <!-- Feet -->
                    <rect x="30" y="90" width="10" height="5" fill="#333" />
                    <rect x="60" y="90" width="10" height="5" fill="#333" />
                </svg>`,

            'trash': `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                    ${shadow}
                    <path d="M25,25 L30,90 L70,90 L75,25 Z" fill="#44aa44" ${stroke} />
                    <!-- Lid -->
                    <path d="M20,25 Q50,10 80,25" fill="#338833" ${stroke} />
                    <rect x="45" y="15" width="10" height="5" fill="#333" />
                    <!-- Fish Bone -->
                    <path d="M30,25 L20,10 M20,10 L15,15 M20,10 L25,5" stroke="#fff" stroke-width="2" />
                    <!-- Lines -->
                    <line x1="35" y1="35" x2="38" y2="80" stroke="#226622" stroke-width="2" />
                    <line x1="50" y1="35" x2="50" y2="80" stroke="#226622" stroke-width="2" />
                    <line x1="65" y1="35" x2="62" y2="80" stroke="#226622" stroke-width="2" />
                </svg>`,

            'human': `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                    <circle cx="50" cy="85" r="10" fill="rgba(0,0,0,0.2)" />
                    <!-- Body -->
                    <rect x="35" y="40" width="30" height="40" fill="#3366cc" ${stroke} rx="5" />
                    <!-- Head -->
                    <circle cx="50" cy="25" r="15" fill="#ffccaa" ${stroke} />
                    <!-- Face -->
                    <circle cx="45" cy="22" r="2" fill="black" />
                    <circle cx="55" cy="22" r="2" fill="black" />
                    <path d="M45,32 Q50,38 55,32" fill="none" stroke="black" stroke-width="2" />
                    <!-- Legs -->
                    <line x1="40" y1="80" x2="40" y2="95" stroke="black" stroke-width="4" stroke-linecap="round" />
                    <line x1="60" y1="80" x2="60" y2="95" stroke="black" stroke-width="4" stroke-linecap="round" />
                </svg>`,

            'car': `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                    ${shadow}
                    <!-- Body -->
                    <path d="M10,60 Q10,40 30,40 L70,40 Q90,40 90,60 L90,80 L10,80 Z" fill="#ffcc00" ${stroke} />
                    <!-- Roof -->
                    <path d="M25,40 L35,20 L65,20 L75,40 Z" fill="#ffcc00" ${stroke} />
                    <!-- Windows -->
                    <path d="M37,25 L63,25 L70,40 L30,40 Z" fill="#ccf9ff" ${stroke} />
                    <!-- Wheels -->
                    <circle cx="25" cy="80" r="12" fill="#333" stroke="#fff" stroke-width="2" />
                    <circle cx="75" cy="80" r="12" fill="#333" stroke="#fff" stroke-width="2" />
                    <!-- Headlight -->
                    <circle cx="85" cy="65" r="5" fill="#ffffcc" stroke="#aa0" stroke-width="1" />
                </svg>`,

             'van': `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                    ${shadow}
                    <!-- Body -->
                    <rect x="10" y="30" width="80" height="50" fill="#cc66cc" ${stroke} rx="5" />
                    <!-- Windows -->
                    <rect x="15" y="35" width="20" height="15" fill="#ccf9ff" ${stroke} />
                    <rect x="40" y="35" width="20" height="15" fill="#ccf9ff" ${stroke} />
                    <rect x="65" y="35" width="20" height="15" fill="#ccf9ff" ${stroke} />
                    <!-- Wheels -->
                    <circle cx="25" cy="80" r="12" fill="#333" stroke="#fff" stroke-width="2" />
                    <circle cx="75" cy="80" r="12" fill="#333" stroke="#fff" stroke-width="2" />
                    <!-- Flower Power -->
                    <circle cx="50" cy="60" r="8" fill="#ff00ff" opacity="0.8" />
                    <circle cx="50" cy="60" r="3" fill="#ffff00" />
                </svg>`,

            'police': `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                    ${shadow}
                    <!-- Body -->
                    <path d="M10,60 Q10,40 30,40 L70,40 Q90,40 90,60 L90,80 L10,80 Z" fill="#111" ${stroke} />
                    <rect x="10" y="55" width="80" height="10" fill="#fff" />
                    <!-- Roof -->
                    <path d="M25,40 L35,20 L65,20 L75,40 Z" fill="#111" ${stroke} />
                    <!-- Siren -->
                    <rect x="40" y="15" width="10" height="5" fill="#ff0000" />
                    <rect x="50" y="15" width="10" height="5" fill="#0000ff" />
                    <!-- Wheels -->
                    <circle cx="25" cy="80" r="12" fill="#333" stroke="#fff" stroke-width="2" />
                    <circle cx="75" cy="80" r="12" fill="#333" stroke="#fff" stroke-width="2" />
                </svg>`,

            'tree': `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                    <ellipse cx="50" cy="90" rx="30" ry="10" fill="rgba(0,0,0,0.3)" />
                    <!-- Trunk -->
                    <rect x="40" y="60" width="20" height="35" fill="#8B4513" ${stroke} />
                    <!-- Foliage (Simple Cloud) -->
                    <circle cx="30" cy="50" r="20" fill="#228B22" ${stroke} />
                    <circle cx="70" cy="50" r="20" fill="#228B22" ${stroke} />
                    <circle cx="50" cy="30" r="25" fill="#32CD32" ${stroke} />
                    <circle cx="50" cy="50" r="20" fill="#228B22" />
                </svg>`,

            'building': `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                    <!-- Isometric-ish Block -->
                    <path d="M10,20 L90,20 L90,95 L10,95 Z" fill="#556677" ${stroke} />
                    <!-- Roof (Fake 3D) -->
                    <path d="M10,20 L20,10 L100,10 L90,20" fill="#334455" stroke="black" stroke-width="2" />
                    <path d="M90,20 L100,10 L100,85 L90,95" fill="#223344" stroke="black" stroke-width="2" />
                    <!-- Windows -->
                    <rect x="20" y="30" width="15" height="15" fill="#ffff99" stroke="black" />
                    <rect x="20" y="55" width="15" height="15" fill="#ffff99" stroke="black" />
                    <rect x="45" y="30" width="15" height="15" fill="#ffff99" stroke="black" />
                    <rect x="45" y="55" width="15" height="15" fill="#ffff99" stroke="black" />
                    <rect x="70" y="30" width="15" height="15" fill="#ccffff" stroke="black" /> <!-- Lights off -->
                    <rect x="70" y="55" width="15" height="15" fill="#ffff99" stroke="black" />
                </svg>`,

            'coin': `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="#ffd700" stroke="#b8860b" stroke-width="4" />
                    <circle cx="50" cy="50" r="30" fill="none" stroke="#fff" stroke-width="2" opacity="0.5" />
                    <text x="50" y="70" font-family="Arial" font-weight="bold" font-size="60" text-anchor="middle" fill="#b8860b">C</text>
                </svg>`,
        };
    }
}
