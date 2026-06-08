# Interactive Space Exploration & Satellite Deployment Lab

A production-ready WebGL 3D visualization application built with **Three.js** for an Interactive Graphics final project at Sapienza University of Rome.

## Overview

This project presents an interactive space environment featuring:
- **Hierarchical Orbital System**: Sun with orbiting planet and moon(s) with realistic orbital mechanics
- **Deployable Satellite**: A complex, hierarchically-structured satellite with articulated robotic arms and solar panel arrays
- **Advanced Lighting**: Multiple light sources including a sun point light with shadows and ambient environmental lighting
- **Physically-Based Materials**: Diffuse, normal, and specular texture mapping for realistic surface rendering
- **Full User Interactivity**: Real-time control over cameras, lights, satellite deployment, and object colors via an intuitive GUI
- **Smooth Animations**: Tween.js-powered cinematic animations with easing functions
- **Dual Texture System**: Canvas-generated (default) + optional PNG file support with automatic fallback

## Features

### 🎨 Graphics & Rendering
- **Three.js WebGL Renderer** with fullscreen responsive canvas
- **Multiple Cameras**: Orbital view, satellite-mounted perspective camera, and free orbit control
- **Hierarchical Modeling**: Complex nested transforms exploiting Three.js `Group` system
  - Orbital mechanics: Sun → Planet → Moon hierarchy
  - Mechanical kinematics: Satellite Body → Arm Joints → Solar Array panels
- **Advanced Lighting Rig**:
  - Point light acting as the Sun
  - Ambient environmental light
  - Directional light for shadows
  - Shadow maps for depth perception
  - Configurable light intensity and color
- **Physically-Based Materials**: MeshStandardMaterial with:
  - Color/Diffuse maps
  - Normal maps (surface detail)
  - Specular/Roughness maps (reflectivity control)
- **Dual Texture System**:
  - Canvas-generated textures (default, no files needed)
  - Optional PNG file loading with automatic fallback
  - Seamless switching between modes

### ⚙️ Animation System
- **Programmatic Animations**: All animations written in JavaScript—no imported animation files
- **Delta-Time Aware**: Smooth, frame-rate independent motion
- **Tween.js Integration**: Cinematic easing functions for smooth transitions
  - Elastic easing for panel deployment
  - Cubic easing for arm joint rotations
  - Quadratic easing for panel retraction
- **Hierarchical Animation Exploitation**: Joint rotations relative to parent transforms create realistic kinematics
- **Deployable Satellite Array**: Animated panel deployment with multiple easing options

### 🎮 User Interaction
- **Interactive GUI** (lil-gui):
  - Toggle sun light on/off
  - Toggle ambient light on/off
  - Adjust light intensity and color
  - Switch between camera perspectives (orbital, satellite, free)
  - **Deploy/retract satellite solar panels with smooth animations**
  - **Rotate robotic arm joints with cinematic easing**
  - Change object colors (planet, satellite, panels)
  - Toggle object visibility
- **Mouse & Keyboard Controls**: Intuitive orbit controls for scene exploration
  - Left-click drag: Orbit around scene
  - Scroll wheel: Zoom in/out
  - Right-click: Pan view

### 📱 Code Organization
- **Modular Architecture**:
  - Scene setup and renderer initialization
  - Lighting rig configuration
  - Texture and material loading system (dual mode support)
  - Hierarchical geometry builder
  - Animation engine with delta-time tracking and Tween.js
  - Event handling and GUI binding
- **Production-Ready**: Fully optimized, clean code suitable for GitHub Pages hosting
- **Responsive Design**: Fullscreen canvas with dynamic resize handling

## Project Structure

```
interactive-space-exploration/
├── index.html                        # Main HTML entry point
├── styles.css                        # Responsive CSS styling
├── main.js                           # Core 3D engine (1100+ lines)
├── texture-exporter.js               # PNG texture export utility
├── texture-system-enhanced.js        # Dual texture system reference
├── README.md                         # This file
├── TECHNICAL_DOCUMENTATION.md        # 8-page technical report
├── TEXTURE_DOCUMENTATION.md          # Texture system guide
├── TEXTURE_MATERIALS_GUIDE.md        # PBR material properties
├── DUAL_TEXTURE_SYSTEM.md            # Dual texture system guide
└── assets/
    └── textures/                     # Optional PNG texture files
        ├── planet_diffuse.png
        ├── planet_normal.png
        ├── planet_specular.png
        ├── moon_diffuse.png
        ├── moon_normal.png
        ├── moon_specular.png
        ├── satellite_diffuse.png
        ├── satellite_normal.png
        ├── satellite_specular.png
        ├── solarpanel_diffuse.png
        ├── solarpanel_normal.png
        └── solarpanel_specular.png
```

## Installation & Setup

### Prerequisites
- Modern web browser with WebGL 2.0 support (Chrome, Firefox, Safari, Edge)
- Node.js and npm (optional, for local server)

### Quick Start

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ZJoker10/interactive-space-exploration.git
   cd interactive-space-exploration
   ```

2. **Run a local server** (required for texture loading):
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Or using Node.js http-server
   npx http-server
   ```

3. **Open in browser**:
   ```
   http://localhost:8000
   ```

4. **Deploy to GitHub Pages**:
   - Push to the `main` branch
   - Go to repository Settings → Pages
   - Select `main` branch as source
   - Access at: `https://ZJoker10.github.io/interactive-space-exploration`

## Texture System

### Default Mode: Canvas Textures ✅

**Current Setting:** All textures are **procedurally generated at runtime** using HTML5 Canvas.

✅ **Advantages:**
- No external files needed
- Instant loading (<1ms)
- Works offline
- Perfect for GitHub Pages
- Zero dependencies

The project works perfectly out-of-the-box without any texture files!

### Optional Mode: PNG Textures

If you want to use actual PNG image files instead of canvas-generated textures, follow these steps:

#### Step 1: Export Texture PNG Files

Open the application in your browser and open the **Developer Console** (F12).

Run this command:
```javascript
TextureExporter.exportAllTextures();
```

This will download **12 PNG texture files** (one at a time):
- 4 Diffuse maps (planet, moon, satellite, solar panels)
- 4 Normal maps (surface detail)
- 4 Specular maps (reflectivity)

#### Step 2: Create Assets Folder

```bash
# Create the assets/textures folder
mkdir -p assets/textures

# Move all 12 downloaded PNG files into assets/textures/
# (Drag and drop into the folder, or use file explorer)
```

**Expected folder structure:**
```
assets/
└── textures/
    ├── planet_diffuse.png
    ├── planet_normal.png
    ├── planet_specular.png
    ├── moon_diffuse.png
    ├── moon_normal.png
    ├── moon_specular.png
    ├── satellite_diffuse.png
    ├── satellite_normal.png
    ├── satellite_specular.png
    ├── solarpanel_diffuse.png
    ├── solarpanel_normal.png
    └── solarpanel_specular.png
```

#### Step 3: Enable PNG Loading

Edit `main.js` and change line 12 from:
```javascript
usePNGTextures: false,  // Canvas mode (default)
```

To:
```javascript
usePNGTextures: true,   // PNG file mode
```

#### Step 4: Reload the Application

Refresh your browser. You should see console messages:
```
✓ Loaded PNG: planet_diffuse.png
✓ Loaded PNG: planet_normal.png
✓ Loaded PNG: planet_specular.png
...
```

### Automatic Fallback System

If PNG loading is enabled but texture files are missing, the system **automatically falls back** to canvas-generated textures:

```
⚠ PNG not found: planet_diffuse.png, using canvas fallback
```

**No crashes, no errors!** The application works seamlessly with either system.

### Export Individual Textures (Optional)

You can export specific textures from the browser console:

```javascript
// Export just diffuse maps
TextureExporter.exportGradientTexture('planet_diffuse.png', 256, 256, 0x4488ff, 0x2a4466);
TextureExporter.exportGradientTexture('moon_diffuse.png', 256, 256, 0xcccccc, 0x666666);

// Export just normal maps
TextureExporter.exportNormalMap('planet_normal.png', 256, 256);

// Export just specular maps
TextureExporter.exportSpecularMap('planet_specular.png', 256, 256, 0.3);
```

See **DUAL_TEXTURE_SYSTEM.md** for more details.

## Usage Guide

### Main Viewport
- **Left Mouse Button**: Orbit around scene
- **Scroll Wheel**: Zoom in/out
- **Right Mouse Button**: Pan view

### Control Panel (Left Side)

#### **Lights Section**
- **Sun Light**: Toggle sun point light on/off
- **Ambient Light**: Toggle ambient light on/off
- **Sun Intensity**: Adjust sun light brightness (0-2)
- **Ambient Intensity**: Adjust ambient light (0-1)
- **Sun Color**: Change sun light color (color picker)

#### **Camera Section**
- **View**: Switch between camera perspectives
  - Orbital View: Wide scene overview
  - Satellite View: First-person satellite perspective
  - Free Orbit: User-controlled rotation

#### **Satellite Control Section**
- **Deploy Panels (Smooth)**: Smoothly deploy solar panels with Elastic easing (3 seconds)
- **Retract Panels (Smooth)**: Smoothly retract panels with Quadratic easing (2.5 seconds)
- **Rotate Arm Joint 1**: Smoothly rotate first arm segment with Cubic easing (2 seconds)
- **Rotate Arm Joint 2**: Smoothly rotate second arm segment with Cubic easing (2 seconds)
- **Manual Panel Deploy**: Slider for manual panel deployment (0-180°)
- **Arm Joint 1 Manual**: Slider for manual joint 1 rotation (-π to π)
- **Arm Joint 2 Manual**: Slider for manual joint 2 rotation (-π to π)

#### **Colors Section**
- **Planet Color**: Customize planet color (color picker)
- **Moon Color**: Customize moon color (color picker)
- **Satellite Color**: Customize satellite body color (color picker)
- **Solar Panel Color**: Customize panel color (color picker)

#### **Visibility Section**
- **Show Planet**: Toggle planet visibility
- **Show Moon**: Toggle moon visibility
- **Show Satellite**: Toggle satellite visibility

### Interactive Workflow Example

**Scenario: Observing Satellite Panel Deployment**

1. Open application in web browser
2. Switch to "Satellite View" camera
3. Click "Deploy Panels (Smooth)" button
4. Observe smooth panel opening with cinematic Tween.js easing
5. Rotate arm joints using dedicated buttons
6. Switch to "Free Orbit" camera and use mouse to explore
7. Toggle lights to observe shadow effects
8. Adjust colors to customize appearance

## Technical Architecture

### Scene Hierarchy
```
THREE.Scene
├── Cameras (multiple instances)
├── Sun (PointLight + Visual Sphere)
├── Orbital System
│   ├── Planet (orbits sun)
│   │   └── Moon (orbits planet)
├── Satellite (orbits scene center)
│   ├── Body (BoxGeometry)
│   ├── Antenna (CylinderGeometry)
│   ├── Arm Joint 1 (rotates on X-axis)
│   │   ├── Segment 1 (CylinderGeometry)
│   │   └── Arm Joint 2 (rotates on Z-axis)
│   │       ├── Segment 2 (CylinderGeometry)
│   │       └── Solar Array
│   │           ├── Frame (BoxGeometry)
│   │           └── 3 Solar Panels (PlaneGeometry)
└── Lighting Rig
    ├── Point Light (shadows)
    ├── Ambient Light
    └── Directional Light
```

### Material System (PBR)

All materials use `THREE.MeshStandardMaterial` with:

```javascript
{
    color: baseColor,           // Diffuse/Albedo
    metalness: 0.0-1.0,         // Metal vs. dielectric
    roughness: 0.0-1.0,         // Smooth vs. matte
    map: diffuseTexture,        // Color map
    normalMap: normalTexture,   // Surface detail
    roughnessMap: specularMap,  // Reflectivity
    emissive: color             // Self-illumination
}
```

### Animation System

- **Delta-time based** for frame-rate independence
- **Tween.js integration** for cinematic easing functions
- **Hierarchical exploitation** for realistic kinematics
- **Orbital mechanics** with proper transform composition

## Performance Optimization

- **Geometry Reuse**: Shared geometries across similar meshes
- **Material Pooling**: Efficient material reuse
- **Shadow Maps**: 2048x2048 with PCF filtering
- **Canvas Textures**: Procedurally generated (no file I/O)
- **Efficient Animation**: Delta-time updates + Tween.js
- **Target**: 60 FPS on modern hardware

## Browser Compatibility

| Browser | WebGL 2.0 | Support |
|---------|-----------|----------|
| Chrome  | ✅ | Full ✅ |
| Firefox | ✅ | Full ✅ |
| Safari  | ✅ | Full (14+) ✅ |
| Edge    | ✅ | Full ✅ |
| Opera   | ✅ | Full ✅ |
| IE 11   | ❌ | Not supported ❌ |

## Learning Outcomes

This project demonstrates:
- ✅ Advanced 3D graphics programming with Three.js
- ✅ Hierarchical transform trees and forward kinematics
- ✅ Physically-based material rendering
- ✅ Real-time animation systems (delta-time + Tween.js)
- ✅ User interaction and GUI design patterns
- ✅ WebGL shader fundamentals (normal/specular mapping)
- ✅ Performance optimization for web graphics
- ✅ Modular, maintainable code architecture
- ✅ Dual texture loading systems with fallback

## Documentation

- **TECHNICAL_DOCUMENTATION.md** - 8+ page technical report
- **TEXTURE_DOCUMENTATION.md** - Texture system implementation guide
- **TEXTURE_MATERIALS_GUIDE.md** - PBR material properties reference
- **DUAL_TEXTURE_SYSTEM.md** - Dual texture system complete guide

## Credits

**Project**: Interactive Space Exploration & Satellite Deployment Lab  
**Course**: Interactive Graphics (Sapienza University of Rome)  
**Framework**: Three.js r128  
**UI Library**: lil-gui 0.19.1  
**Animation**: Tween.js 21.0.0  
**Developer**: ZJoker10  
**Date**: 2026

## License

This project is provided as-is for educational purposes. Feel free to fork, modify, and extend for your own learning.

---

**Repository**: https://github.com/ZJoker10/interactive-space-exploration  
**Live Demo**: https://ZJoker10.github.io/interactive-space-exploration  

For questions or issues, please open a GitHub issue in this repository.
