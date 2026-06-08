# Sample Textures & Materials Reference

## Overview

This directory documents the texture and material system used in the Interactive Space Exploration project.

## Texture Files (Procedurally Generated)

All textures are created at runtime using HTML5 Canvas:

### 1. Diffuse Maps (Color/Albedo)
- **Planet Diffuse**: Blue gradient (0x4488ff → 0x2a4466)
- **Moon Diffuse**: Gray gradient (0xcccccc → 0x666666)
- **Satellite Diffuse**: Gray gradient (0xaaaaaa → 0x555555)
- **Solar Panel Diffuse**: Blue gradient (0x1a5f7a → 0x0a3a5a)

**Generation Code:**
```javascript
function createGradientTexture(width, height, color1, color2) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#' + color1.toString(16).padStart(6, '0'));
    gradient.addColorStop(1, '#' + color2.toString(16).padStart(6, '0'));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    return new THREE.CanvasTexture(canvas);
}
```

### 2. Normal Maps (Surface Detail)
- **Resolution**: 256x256 pixels
- **Type**: RGB normal map (perturbed normals)
- **Base Color**: Neutral blue (127, 127, 255)
- **Noise**: Procedural random perturbations

**Generation Code:**
```javascript
function createNormalMap(width, height) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#7f7fff';  // Neutral normal
    ctx.fillRect(0, 0, width, height);
    
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    // Add subtle noise
    for (let i = 0; i < data.length; i += 4) {
        const noise = Math.random() * 20;
        data[i] = Math.max(0, Math.min(255, 127 + noise));
        data[i + 1] = Math.max(0, Math.min(255, 127 + noise));
        data[i + 2] = 255;  // Blue channel always 255
        data[i + 3] = 255;  // Alpha
    }
    
    ctx.putImageData(imageData, 0, 0);
    return new THREE.CanvasTexture(canvas);
}
```

### 3. Specular/Roughness Maps
- **Resolution**: 256x256 pixels
- **Type**: Grayscale intensity map
- **Planet Intensity**: 0.3 (low specularity)
- **Satellite Intensity**: 0.6 (moderate)
- **Solar Panel Intensity**: 0.8 (high reflectivity)

**Generation Code:**
```javascript
function createSpecularMap(width, height, intensity = 0.5) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const specValue = Math.floor(intensity * 255);
    ctx.fillStyle = `rgb(${specValue}, ${specValue}, ${specValue})`;
    ctx.fillRect(0, 0, width, height);
    return new THREE.CanvasTexture(canvas);
}
```

## Material Properties

### MeshStandardMaterial Configuration

All objects use `THREE.MeshStandardMaterial` for physically-based rendering:

```javascript
const material = new THREE.MeshStandardMaterial({
    color: baseColor,           // Diffuse/Albedo color
    metalness: value,          // 0 = dielectric, 1 = metal
    roughness: value,          // 0 = mirror, 1 = matte
    map: diffuseTexture,       // Color map
    normalMap: normalTexture,  // Normal perturbation
    roughnessMap: specularMap, // Reflectivity variation
    emissive: emissiveColor,   // Self-illumination
});
```

### Per-Object Material Settings

#### Planet
```javascript
{
    color: 0x4488ff,
    metalness: 0.1,    // Non-metallic (dielectric)
    roughness: 0.8,    // Matte, diffuse surface
    emissive: 0x000000,
}
```

#### Moon
```javascript
{
    color: 0xcccccc,
    metalness: 0.1,
    roughness: 0.8,
    emissive: 0x000000,
}
```

#### Satellite Body
```javascript
{
    color: 0xaaaaaa,
    metalness: 0.7,    // Metallic
    roughness: 0.3,    // Polished metal
    emissive: 0x0a1a2a,  // Subtle dark glow
}
```

#### Solar Panels
```javascript
{
    color: 0x1a5f7a,
    metalness: 0.9,    // Highly reflective metal
    roughness: 0.1,    // Mirror-like surface
    emissive: 0x0a1a2a,  // Slight self-illumination
}
```

#### Antenna
```javascript
{
    color: 0xcccccc,
    metalness: 0.8,    // Metallic
    roughness: 0.2,    // Polished
    emissive: 0x000000,
}
```

## Texture Memory Usage

- **Diffuse Map**: 256×256 RGBA = 256 KB
- **Normal Map**: 256×256 RGBA = 256 KB
- **Specular Map**: 256×256 RGBA = 256 KB
- **Per Material**: ~768 KB
- **Total (5 materials)**: ~3.8 MB (negligible with modern GPUs)

## Rendering Performance

**Canvas Texture Generation:**
- Time: <1ms per texture
- Called once at initialization
- Negligible performance impact

**Runtime Material Updates:**
- Color picker changes: Real-time GPU updates
- No texture regeneration needed
- Uses efficient material.color.setHex()

## PBR (Physically-Based Rendering) Principles

1. **Metalness Map**: Distinguishes metals vs. dielectrics
   - 0.0 = Non-metal (plastic, fabric, stone)
   - 1.0 = Pure metal (aluminum, steel)
   - 0.5 = Metallic paint or alloy

2. **Roughness Map**: Controls surface smoothness
   - 0.0 = Mirror-like, highly reflective
   - 0.5 = Moderate reflection and diffusion
   - 1.0 = Completely matte, diffuse only

3. **Normal Maps**: Simulate micro-geometry
   - Perturbs surface normals
   - Creates illusion of detail without extra geometry
   - Improves visual quality at low polygon counts

## Lighting Interaction

### Point Light (Sun)
- Creates primary illumination
- Generates shadows via shadow maps
- Specular highlights on metallic surfaces

### Ambient Light
- Provides fill light
- Reduces harsh shadows
- Illuminates shadow-facing sides

### Normal Maps Impact
- Point light creates fine shadow details
- Metallic surfaces show more specularity
- Low-roughness materials have sharp highlights

## Future Enhancements

1. **Real Texture Files**: Import NASA satellite imagery
2. **Height Maps**: Add displacement mapping
3. **Parallax Mapping**: Enhanced depth perception
4. **PBR Workflow**: Complete metallic/roughness decoupling
5. **Ambient Occlusion**: Shadow detail in crevices

---

**All textures are procedurally generated at runtime with no external file dependencies.**
