# Interactive Space Exploration & Satellite Deployment Lab

A production-ready WebGL 3D visualization application built with **Three.js** for an Interactive Graphics final project at Sapienza University of Rome.

## Overview

This project presents an interactive space environment featuring:
- **Hierarchical Orbital System**: Sun with orbiting planet and moon(s) with realistic orbital mechanics
- **Deployable Satellite**: A complex, hierarchically-structured satellite with articulated robotic arms and solar panel arrays
- **Advanced Lighting**: Multiple light sources including a sun point light with shadows and ambient environmental lighting
- **Physically-Based Materials**: Diffuse, normal, and specular texture mapping for realistic surface rendering
- **Full User Interactivity**: Real-time control over cameras, lights, satellite deployment, and object colors via an intuitive GUI

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
  - Shadow maps for depth perception
  - Configurable light intensity and color
- **Physically-Based Materials**: MeshStandardMaterial with:
  - Color/Diffuse maps
  - Normal maps (surface detail)
  - Specular/Roughness maps (reflectivity control)

### ⚙️ Animation System
- **Programmatic Animations**: All animations written in JavaScript—no imported animation files
- **Delta-Time Aware**: Smooth, frame-rate independent motion
- **Hierarchical Animation Exploitation**: Joint rotations relative to parent transforms create realistic kinematics
- **Deployable Satellite Array**: Animated panel deployment with easing

### 🎮 User Interaction
- **Interactive GUI** (lil-gui):
  - Toggle sun light on/off
  - Toggle ambient light on/off
  - Adjust light intensity and color
  - Switch between camera perspectives (orbital, satellite, free)
  - Deploy/retract satellite solar panels
  - Change object colors (planet, satellite, panels)
  - Real-time satellite joint rotation control
- **Mouse & Keyboard Controls**: Intuitive orbit controls for scene exploration

### 📱 Code Organization
- **Modular Architecture**:
  - Scene setup and renderer initialization
  - Lighting rig configuration
  - Texture and material loading system
  - Hierarchical geometry builder
  - Animation engine with delta-time tracking
  - Event handling and GUI binding
- **Production-Ready**: Fully optimized, clean code suitable for GitHub Pages hosting
- **Responsive Design**: Fullscreen canvas with dynamic resize handling

## Project Structure

```
interactive-space-exploration/
├── index.html          # Main HTML entry point with UI overlay
├── styles.css          # Minimalist CSS for canvas and GUI styling
├── main.js             # Core application engine (all Three.js logic)
├── README.md           # This file
└── assets/             # (Optional) Texture and model assets folder
    ├── textures/
    │   ├── earth_diffuse.jpg
    │   ├── earth_normal.png
    │   ├── earth_specular.png
    │   ├── satellite_diffuse.jpg
    │   └── ...
    └── models/
        └── (optional GLTF/OBJ files)
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

## Usage Guide

### Main Viewport
- **Left Mouse Button**: Orbit around scene
- **Scroll Wheel**: Zoom in/out
- **Right Mouse Button**: Pan view

### Control Panel (Left Side)
- **Lights Section**:
  - Toggle Sun Light / Ambient Light
  - Adjust Sun Intensity (0-2)
  - Adjust Ambient Intensity (0-1)
  - Change Sun Color

- **Camera Section**:
  - Switch between Orbital View, Satellite View, and Free Orbit

- **Satellite Control Section**:
  - Deploy/Retract Solar Panels (0-180°)
  - Control Robotic Arm Joint 1 (rotate along X-axis)
  - Control Robotic Arm Joint 2 (rotate along Z-axis)
  - Change Satellite Color

- **Environment Section**:
  - Change Planet Color
  - Change Moon Color
  - Toggle object visibility

## Technical Architecture

### Scene Hierarchy
```
Scene
├── Camera (multiple instances)
├── Sun (PointLight + SphereGeometry)
├── Orbital System
│   ├── Planet (SphereGeometry + Materials)
│   │   └── Moon (SphereGeometry + Materials)
├── Satellite (Group - root)
│   ├── Body (BoxGeometry)
│   ├── Arm Joint 1 (Group)
│   │   ├── Segment 1 (CylinderGeometry)
│   │   └── Arm Joint 2 (Group)
│   │       ├── Segment 2 (CylinderGeometry)
│   │       └── Solar Array (Group)
│   │           ├── Panel 1 (PlaneGeometry + Texture)
│   │           ├── Panel 2 (PlaneGeometry + Texture)
│   │           └── Panel 3 (PlaneGeometry + Texture)
│   └── Antenna (CylinderGeometry)
└── Lighting Rig
    ├── Sun Light (PointLight)
    ├── Ambient Light
    └── Directional Light (for shadows)
```

### Animation Loop
- **60 FPS Target**: Delta-time based calculations ensure smooth motion regardless of frame rate
- **Orbital Mechanics**: Planet and moon rotations/orbits use hierarchical transforms
- **Mechanical Kinematics**: Satellite arm segments rotate relative to their parent joints
- **Smooth Deployment**: Solar panel opening animation with easing functions

### Material System
- **Color Maps**: RGB diffuse texture for base surface color
- **Normal Maps**: RGB normal maps encode surface micro-geometry for lighting detail
- **Specular/Roughness Maps**: Grayscale maps control material reflectivity and surface finish
- **Environment**: Ambient light and point light sources for realistic 3D illumination

## Textures & Assets

The project uses procedurally-generated textures and materials. For enhanced realism, you can add:
- **Planet Textures**: Earth diffuse, normal, and specular maps (e.g., from NASA NOAA or Textures Haven)
- **Satellite Materials**: Metallic, solar panel, and antenna textures
- **Space Skybox**: Optional cubemap for space environment (not required for core functionality)

*Note: All textures must be copyright-free or properly licensed for educational use.*

## Browser Compatibility

| Browser | Support |
|---------|---------|
| Chrome  | ✅ Full support |
| Firefox | ✅ Full support |
| Safari  | ✅ Full support (14+) |
| Edge    | ✅ Full support |
| IE 11   | ❌ Not supported |

## Performance Optimization

- **Geometry**: Reusing buffered geometries and materials across similar meshes
- **Rendering**: Single pass WebGL renderer with efficient draw calls
- **Lighting**: Optimized shadow mapping resolution
- **Textures**: Compressed texture formats where applicable
- **Frame Rate**: Consistent 60 FPS on modern hardware

## Learning Outcomes

This project demonstrates:
- ✅ Advanced 3D graphics programming with Three.js
- ✅ Hierarchical transform trees and kinematics
- ✅ Physically-based material rendering
- ✅ Real-time animation systems
- ✅ User interaction and GUI design
- ✅ WebGL shader fundamentals
- ✅ Performance optimization for web graphics

## Credits

**Project**: Interactive Space Exploration & Satellite Deployment Lab  
**Course**: Interactive Graphics (Sapienza University of Rome)  
**Framework**: Three.js  
**UI Library**: lil-gui  
**Developer**: ZJoker10

## License

This project is provided as-is for educational purposes. Feel free to fork, modify, and extend for your own learning.

---

**Live Demo**: [Coming Soon - GitHub Pages](https://ZJoker10.github.io/interactive-space-exploration)

For questions or issues, please open a GitHub issue in this repository.
