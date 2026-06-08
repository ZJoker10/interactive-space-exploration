# Sample Texture: Procedurally Generated Diffuse Map
# This file documents how textures are created in the application

## Texture Generation Methods

### 1. Gradient Textures (Diffuse/Color Maps)
Created using HTML Canvas with linear gradients:
```javascript
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
const gradient = ctx.createLinearGradient(0, 0, width, height);
gradient.addColorStop(0, '#4488ff');  // Light blue
gradient.addColorStop(1, '#1a4455');  // Dark blue
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, width, height);
const texture = new THREE.CanvasTexture(canvas);
```

**Used For:**
- Planet surfaces (blue gradients)
- Moon surfaces (gray gradients)
- Satellite metallic bodies
- Solar panel arrays

### 2. Normal Maps (Surface Detail)
Generated with Perlin noise simulation:
```javascript
const imageData = ctx.getImageData(0, 0, width, height);
const data = imageData.data;
for (let i = 0; i < data.length; i += 4) {
    const noise = Math.random() * 20;
    data[i] = Math.max(0, Math.min(255, 127 + noise));     // R
    data[i + 1] = Math.max(0, Math.min(255, 127 + noise)); // G
    data[i + 2] = 255;  // B (always 255 for normals)
    data[i + 3] = 255;  // A
}
```

**Purpose:**
- Simulate micro-geometry on surfaces
- Perturb surface normals for lighting detail
- No performance penalty (procedurally generated)

### 3. Specular/Roughness Maps (Reflectivity)
Grayscale intensity controls material properties:
```javascript
const specValue = Math.floor(intensity * 255);
ctx.fillStyle = `rgb(${specValue}, ${specValue}, ${specValue})`;
ctx.fillRect(0, 0, width, height);
```

**Intensity Levels:**
- Planet: 0.3 (low specularity, matte surface)
- Satellite: 0.6 (moderate, industrial metal)
- Solar Panels: 0.8 (high reflectivity, shiny)

## Texture Resolution

All textures: **256x256 pixels**
- Balances visual quality with performance
- Sufficient detail for distant viewing
- Minimal VRAM usage (~512 KB per texture)

## Material Properties

### Planet Material
```javascript
{
    color: 0x4488ff,      // Earth blue
    metalness: 0.1,       // Mostly non-metal
    roughness: 0.8,       // Matte finish
    map: gradientTexture,
    normalMap: proceduralNoise,
    roughnessMap: lowSpecular
}
```

### Satellite Material
```javascript
{
    color: 0xaaaaaa,      // Industrial gray
    metalness: 0.7,       // Metallic
    roughness: 0.3,       // Polished
    emissive: 0x0a1a2a,  // Subtle self-illumination
    map: gradientTexture,
    normalMap: proceduralNoise,
    roughnessMap: moderateSpecular
}
```

### Solar Panel Material
```javascript
{
    color: 0x1a5f7a,      // Deep space blue
    metalness: 0.9,       // Highly metallic
    roughness: 0.1,       // Mirror-like
    emissive: 0x0a1a2a,  // Subtle glow
    map: gradientTexture,
    normalMap: proceduralNoise,
    roughnessMap: highSpecular
}
```

## Canvas Texture Advantages

✅ **No File I/O**: Generated in-memory at runtime  
✅ **Performance**: Minimal load time, instant availability  
✅ **Procedural**: Fully customizable via code  
✅ **Lightweight**: No external file dependencies  
✅ **Dynamic**: Can be regenerated on-demand  

## Color Palette

| Component | Hex Color | RGB | Use |
|-----------|-----------|-----|-----|
| Sun | #fdb813 | (253, 184, 19) | Solar yellow |
| Planet | #4488ff | (68, 136, 255) | Earth blue |
| Moon | #cccccc | (204, 204, 204) | Lunar gray |
| Satellite | #aaaaaa | (170, 170, 170) | Industrial gray |
| Solar Panels | #1a5f7a | (26, 95, 122) | Deep space blue |
| Antenna | #cccccc | (204, 204, 204) | Metallic gray |
