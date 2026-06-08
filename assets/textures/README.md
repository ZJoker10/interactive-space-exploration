# PNG Texture Files Storage

This folder contains optional PNG texture files for the Interactive Space Exploration project.

## Status

**Current Mode**: Canvas textures (procedurally generated)
- ✅ Application works without these files
- ✅ Textures generated at runtime
- ✅ No additional setup needed

## To Use PNG Textures

### Option 1: Quick Setup (Recommended)

1. Open the application in your browser
2. Press F12 to open Developer Console
3. Run this command:
   ```javascript
   TextureExporter.exportAllTextures();
   ```
4. Wait for all 12 PNG files to download
5. Move them to this folder (`assets/textures/`)
6. Edit `main.js` line 12: change `usePNGTextures: false` to `usePNGTextures: true`
7. Reload the application

### Option 2: Use Canvas Textures (Current)

Keep the default canvas-generated textures:
- ✅ No files needed
- ✅ Instant loading
- ✅ Works offline
- ✅ Recommended for GitHub Pages

## File List

If you decide to use PNG textures, this folder should contain:

```
assets/textures/
├── planet_diffuse.png        (256×256, ~20 KB)
├── planet_normal.png         (256×256, ~25 KB)
├── planet_specular.png       (256×256, ~8 KB)
├── moon_diffuse.png          (256×256, ~15 KB)
├── moon_normal.png           (256×256, ~25 KB)
├── moon_specular.png         (256×256, ~8 KB)
├── satellite_diffuse.png     (256×256, ~18 KB)
├── satellite_normal.png      (256×256, ~25 KB)
├── satellite_specular.png    (256×256, ~12 KB)
├── solarpanel_diffuse.png    (256×256, ~20 KB)
├── solarpanel_normal.png     (256×256, ~25 KB)
└── solarpanel_specular.png   (256×256, ~15 KB)

Total: ~217 KB
```

## How to Export Textures

### From Browser Console

```javascript
// Export all textures at once
TextureExporter.exportAllTextures();

// Or export individual textures
TextureExporter.exportGradientTexture('planet_diffuse.png', 256, 256, 0x4488ff, 0x2a4466);
TextureExporter.exportNormalMap('planet_normal.png', 256, 256);
TextureExporter.exportSpecularMap('planet_specular.png', 256, 256, 0.3);
```

## Automatic Fallback

If PNG mode is enabled but files are missing:
```
⚠ PNG not found: planet_diffuse.png, using canvas fallback
```

The application automatically switches to canvas-generated textures. No errors!

## Recommended Workflow

1. **Development**: Use canvas textures (current default)
2. **Final Submission**: Keep canvas textures OR add PNG files
3. **Either way**: The application works perfectly!

## More Information

See **DUAL_TEXTURE_SYSTEM.md** in the root folder for complete documentation.
