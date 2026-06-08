/* ============================================================================
   ENHANCED MAIN.JS - DUAL TEXTURE SYSTEM
   Supports both canvas-generated (default) and PNG file loading
   ============================================================================ */

// ============================================================================
// TEXTURE LOADING CONFIGURATION
// ============================================================================

const TextureConfig = {
    // Set to true to load PNG files from assets/textures/
    // Set to false to use procedurally-generated canvas textures (DEFAULT)
    usePNGTextures: false,
    
    texturesPath: 'assets/textures/',
    
    // Texture file mappings
    files: {
        planetDiffuse: 'planet_diffuse.png',
        planetNormal: 'planet_normal.png',
        planetSpecular: 'planet_specular.png',
        
        moonDiffuse: 'moon_diffuse.png',
        moonNormal: 'moon_normal.png',
        moonSpecular: 'moon_specular.png',
        
        satelliteDiffuse: 'satellite_diffuse.png',
        satelliteNormal: 'satellite_normal.png',
        satelliteSpecular: 'satellite_specular.png',
        
        solarpanelDiffuse: 'solarpanel_diffuse.png',
        solarpanelNormal: 'solarpanel_normal.png',
        solarpanelSpecular: 'solarpanel_specular.png',
    }
};

// ============================================================================
// TEXTURE LOADER WITH FALLBACK
// ============================================================================

const TextureLoader = {
    cache: {},
    loadedCount: 0,
    failedCount: 0,
    
    /**
     * Load texture from PNG file with canvas fallback
     */
    loadTexture(filename, fallbackGenerator) {
        if (this.cache[filename]) {
            return this.cache[filename];
        }
        
        if (TextureConfig.usePNGTextures) {
            return this.loadPNGWithFallback(filename, fallbackGenerator);
        } else {
            return fallbackGenerator();
        }
    },
    
    /**
     * Load PNG texture with canvas fallback if file not found
     */
    loadPNGWithFallback(filename, fallbackGenerator) {
        const fileLoader = new THREE.FileLoader();
        const texturePath = TextureConfig.texturesPath + filename;
        
        return new Promise((resolve) => {
            fileLoader.load(
                texturePath,
                (data) => {
                    // Successfully loaded PNG
                    const image = new Image();
                    image.onload = () => {
                        const texture = new THREE.CanvasTexture(image);
                        this.cache[filename] = texture;
                        this.loadedCount++;
                        console.log(`✓ Loaded PNG: ${filename}`);
                        resolve(texture);
                    };
                    image.src = texturePath;
                },
                undefined,
                (error) => {
                    // Failed to load PNG, use canvas fallback
                    console.warn(`⚠ PNG not found: ${filename}, using canvas fallback`);
                    const texture = fallbackGenerator();
                    this.cache[filename] = texture;
                    this.failedCount++;
                    resolve(texture);
                }
            );
        });
    },
}

// ============================================================================
// ENHANCED MATERIAL CREATION WITH DUAL TEXTURE SUPPORT
// ============================================================================

function createPlanetMaterial(baseColor) {
    const material = createMaterial({
        color: baseColor,
        metalness: 0.1,
        roughness: 0.8,
        emissive: 0x000000,
    });
    
    // Try to load PNG, fallback to canvas
    if (TextureConfig.usePNGTextures) {
        loadPNGMaterial(
            'planet',
            baseColor,
            { metalness: 0.1, roughness: 0.8 },
            material
        );
    } else {
        // Use canvas-generated textures (default)
        material.map = createGradientTexture(256, 256, baseColor, baseColor);
        material.normalMap = createNormalMap(256, 256);
        material.specularMap = createSpecularMap(256, 256, 0.3);
    }
    
    return material;
}

function createSatelliteMaterial(baseColor) {
    const material = createMaterial({
        color: baseColor,
        metalness: 0.7,
        roughness: 0.3,
        emissive: 0x0a1a2a,
    });
    
    if (TextureConfig.usePNGTextures) {
        loadPNGMaterial(
            'satellite',
            baseColor,
            { metalness: 0.7, roughness: 0.3 },
            material
        );
    } else {
        material.map = createGradientTexture(256, 256, baseColor, 0x555555);
        material.normalMap = createNormalMap(256, 256);
        material.specularMap = createSpecularMap(256, 256, 0.6);
    }
    
    return material;
}

function createSolarPanelMaterial(baseColor) {
    const material = createMaterial({
        color: baseColor,
        metalness: 0.9,
        roughness: 0.1,
        emissive: 0x0a1a2a,
    });
    
    if (TextureConfig.usePNGTextures) {
        loadPNGMaterial(
            'solarpanel',
            baseColor,
            { metalness: 0.9, roughness: 0.1 },
            material
        );
    } else {
        material.map = createGradientTexture(256, 256, baseColor, 0x0a3a5a);
        material.normalMap = createNormalMap(256, 256);
        material.specularMap = createSpecularMap(256, 256, 0.8);
    }
    
    return material;
}

/**
 * Load PNG textures for a material
 */
function loadPNGMaterial(type, baseColor, properties, material) {
    const diffuseKey = type + 'Diffuse';
    const normalKey = type + 'Normal';
    const specularKey = type + 'Specular';
    
    const textureLoader = new THREE.TextureLoader();
    const path = TextureConfig.texturesPath;
    
    // Load diffuse map
    textureLoader.load(
        path + TextureConfig.files[diffuseKey],
        (texture) => {
            material.map = texture;
            console.log(`✓ Loaded diffuse: ${type}`);
        },
        undefined,
        () => {
            console.warn(`⚠ Could not load ${type} diffuse, using canvas`);
            material.map = createGradientTexture(256, 256, baseColor, baseColor);
        }
    );
    
    // Load normal map
    textureLoader.load(
        path + TextureConfig.files[normalKey],
        (texture) => {
            material.normalMap = texture;
            console.log(`✓ Loaded normal: ${type}`);
        },
        undefined,
        () => {
            console.warn(`⚠ Could not load ${type} normal, using canvas`);
            material.normalMap = createNormalMap(256, 256);
        }
    );
    
    // Load specular map
    textureLoader.load(
        path + TextureConfig.files[specularKey],
        (texture) => {
            material.roughnessMap = texture;
            console.log(`✓ Loaded specular: ${type}`);
        },
        undefined,
        () => {
            console.warn(`⚠ Could not load ${type} specular, using canvas`);
            const intensity = (type === 'solarpanel') ? 0.8 : (type === 'satellite' ? 0.6 : 0.3);
            material.roughnessMap = createSpecularMap(256, 256, intensity);
        }
    );
}

// ============================================================================
// CANVAS TEXTURE GENERATION (FALLBACK & DEFAULT)
// ============================================================================

function createMaterial(config = {}) {
    const defaultConfig = {
        color: 0xffffff,
        metalness: 0.4,
        roughness: 0.7,
        emissive: 0x000000,
    };
    
    const finalConfig = { ...defaultConfig, ...config };
    const material = new THREE.MeshStandardMaterial(finalConfig);
    return material;
}

function createGradientTexture(width, height, color1, color2) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    
    gradient.addColorStop(0, '#' + color1.toString(16).padStart(6, '0'));
    gradient.addColorStop(1, '#' + color2.toString(16).padStart(6, '0'));
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.encoding = THREE.sRGBEncoding;
    return texture;
}

function createNormalMap(width, height) {
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
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

function createSpecularMap(width, height, intensity = 0.5) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    const specValue = Math.floor(intensity * 255);
    ctx.fillStyle = `rgb(${specValue}, ${specValue}, ${specValue})`;
    ctx.fillRect(0, 0, width, height);
    
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

console.log('✓ Dual texture system loaded (canvas + PNG support)');
