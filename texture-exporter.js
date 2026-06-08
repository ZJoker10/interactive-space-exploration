/* ============================================================================
   TEXTURE EXPORT UTILITY
   Generate and export canvas textures as PNG files
   ============================================================================ */

// This utility generates texture PNG files from canvas
// Run this in browser console to export textures

const TextureExporter = {
    /**
     * Create and download a gradient texture as PNG
     * @param {string} filename - Output filename
     * @param {number} width - Texture width
     * @param {number} height - Texture height
     * @param {number} color1 - Start color (hex)
     * @param {number} color2 - End color (hex)
     */
    exportGradientTexture(filename, width, height, color1, color2) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        
        gradient.addColorStop(0, '#' + color1.toString(16).padStart(6, '0'));
        gradient.addColorStop(1, '#' + color2.toString(16).padStart(6, '0'));
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        this.downloadCanvas(canvas, filename);
    },
    
    /**
     * Create and download a normal map as PNG
     * @param {string} filename - Output filename
     * @param {number} width - Texture width
     * @param {number} height - Texture height
     */
    exportNormalMap(filename, width, height) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#7f7fff';
        ctx.fillRect(0, 0, width, height);
        
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            const noise = Math.random() * 20;
            data[i] = Math.max(0, Math.min(255, 127 + noise));
            data[i + 1] = Math.max(0, Math.min(255, 127 + noise));
            data[i + 2] = 255;
            data[i + 3] = 255;
        }
        
        ctx.putImageData(imageData, 0, 0);
        this.downloadCanvas(canvas, filename);
    },
    
    /**
     * Create and download a specular map as PNG
     * @param {string} filename - Output filename
     * @param {number} width - Texture width
     * @param {number} height - Texture height
     * @param {number} intensity - Specularity intensity (0-1)
     */
    exportSpecularMap(filename, width, height, intensity = 0.5) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        const specValue = Math.floor(intensity * 255);
        ctx.fillStyle = `rgb(${specValue}, ${specValue}, ${specValue})`;
        ctx.fillRect(0, 0, width, height);
        
        this.downloadCanvas(canvas, filename);
    },
    
    /**
     * Download canvas as PNG file
     * @param {HTMLCanvasElement} canvas - Canvas to export
     * @param {string} filename - Output filename
     */
    downloadCanvas(canvas, filename) {
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            console.log(`✓ Downloaded: ${filename}`);
        }, 'image/png');
    },
    
    /**
     * Export all textures at once
     */
    exportAllTextures() {
        console.log('🎨 Exporting all textures as PNG...');
        
        // Diffuse maps
        this.exportGradientTexture('planet_diffuse.png', 256, 256, 0x4488ff, 0x2a4466);
        setTimeout(() => this.exportGradientTexture('moon_diffuse.png', 256, 256, 0xcccccc, 0x666666), 100);
        setTimeout(() => this.exportGradientTexture('satellite_diffuse.png', 256, 256, 0xaaaaaa, 0x555555), 200);
        setTimeout(() => this.exportGradientTexture('solarpanel_diffuse.png', 256, 256, 0x1a5f7a, 0x0a3a5a), 300);
        
        // Normal maps
        setTimeout(() => this.exportNormalMap('planet_normal.png', 256, 256), 400);
        setTimeout(() => this.exportNormalMap('moon_normal.png', 256, 256), 500);
        setTimeout(() => this.exportNormalMap('satellite_normal.png', 256, 256), 600);
        setTimeout(() => this.exportNormalMap('solarpanel_normal.png', 256, 256), 700);
        
        // Specular maps
        setTimeout(() => this.exportSpecularMap('planet_specular.png', 256, 256, 0.3), 800);
        setTimeout(() => this.exportSpecularMap('moon_specular.png', 256, 256, 0.3), 900);
        setTimeout(() => this.exportSpecularMap('satellite_specular.png', 256, 256, 0.6), 1000);
        setTimeout(() => this.exportSpecularMap('solarpanel_specular.png', 256, 256, 0.8), 1100);
        
        console.log('✓ All textures will download in sequence');
    }
};

// Export for global access
window.TextureExporter = TextureExporter;
