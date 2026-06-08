/* ============================================================================
   INTERACTIVE SPACE EXPLORATION & SATELLITE DEPLOYMENT LAB
   Main Application Engine - Three.js WebGL Renderer (ENHANCED WITH TWEEN.JS)
   ============================================================================
   
   ARCHITECTURE:
   1. Scene Setup & Renderer Configuration
   2. Lighting Rig (Sun, Ambient, Directional with Shadows)
   3. Material & Texture System (Diffuse, Normal, Specular Maps)
   4. Hierarchical Geometry Builder (Sun->Planet->Moon, Satellite->Joints->Arrays)
   5. Animation Engine (Delta-time aware + Tween.js)
   6. User Interaction & GUI Binding (lil-gui + Tween buttons)
   7. Orbital Mechanics & Kinematics
   ============================================================================ */

// ============================================================================
// 1. GLOBAL SCENE STATE & CONFIGURATION
// ============================================================================

const Config = {
    // Rendering
    targetFPS: 60,
    antiAlias: true,
    shadowMapSize: 2048,
    
    // Orbital System
    sunDistance: 100,
    planetOrbitRadius: 80,
    planetOrbitSpeed: 0.02,
    planetRotationSpeed: 0.005,
    moonOrbitRadius: 15,
    moonOrbitSpeed: 0.1,
    moonRotationSpeed: 0.01,
    
    // Satellite
    satelliteDistance: 50,
    satelliteOrbitSpeed: 0.015,
    
    // Lighting
    sunLightIntensity: 1.5,
    ambientLightIntensity: 0.6,
    sunLightColor: 0xffffff,
    ambientLightColor: 0x87ceeb,
};

const SceneState = {
    // Timing
    clock: new THREE.Clock(),
    deltaTime: 0,
    elapsedTime: 0,
    
    // Cameras
    cameras: {},
    activeCamera: 'orbital',
    
    // Scene Objects
    scene: null,
    renderer: null,
    
    // Orbital Objects
    sun: null,
    planet: null,
    moon: null,
    planetGroup: null,
    moonGroup: null,
    
    // Satellite System
    satelliteGroup: null,
    satelliteBody: null,
    armJoint1: null,
    armJoint2: null,
    solarArray: null,
    solarPanels: [],
    
    // Lights
    sunLight: null,
    ambientLight: null,
    directionalLight: null,
    
    // Controls
    controls: null,
    
    // Active Tweens
    activeTweens: [],
    
    // UI State
    ui: {
        sunLightEnabled: true,
        ambientLightEnabled: true,
        sunIntensity: Config.sunLightIntensity,
        ambientIntensity: Config.ambientLightIntensity,
        sunColor: Config.sunLightColor,
        panelDeployment: 0, // 0-180 degrees
        armJoint1Angle: 0,
        armJoint2Angle: 0,
        planetColor: '#4488ff',
        moonColor: '#cccccc',
        satelliteColor: '#aaaaaa',
        solarPanelColor: '#1a5f7a',
        planetVisible: true,
        moonVisible: true,
        satelliteVisible: true,
    },
};

// ============================================================================
// 2. INITIALIZATION
// ============================================================================

function init() {
    console.log('🚀 Initializing Space Exploration Lab...');
    
    // Setup scene and renderer
    setupScene();
    
    // Setup cameras
    setupCameras();
    
    // Setup lighting
    setupLighting();
    
    // Build hierarchical geometry
    buildOrbitalSystem();
    buildSatellite();
    
    // Setup controls
    setupControls();
    
    // Setup GUI
    setupGUI();
    
    // Setup event listeners
    window.addEventListener('resize', onWindowResize);
    
    // Start animation loop
    animate();
    
    console.log('✅ Initialization complete!');
}

// ============================================================================
// 3. SCENE SETUP & RENDERER
// ============================================================================

function setupScene() {
    // Create scene
    SceneState.scene = new THREE.Scene();
    SceneState.scene.background = new THREE.Color(0x000510);
    SceneState.scene.fog = new THREE.Fog(0x000510, 500, 1000);
    
    // Get container dimensions
    const container = document.getElementById('canvas-container');
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // Create WebGL renderer
    SceneState.renderer = new THREE.WebGLRenderer({
        antialias: Config.antiAlias,
        alpha: false,
        precision: 'highp',
        powerPreference: 'high-performance',
    });
    
    SceneState.renderer.setSize(width, height);
    SceneState.renderer.setPixelRatio(window.devicePixelRatio);
    SceneState.renderer.shadowMap.enabled = true;
    SceneState.renderer.shadowMap.type = THREE.PCFShadowMap;
    SceneState.renderer.shadowMap.resolution = Config.shadowMapSize;
    
    if (THREE.sRGBEncoding !== undefined) {
        SceneState.renderer.outputEncoding = THREE.sRGBEncoding;
    }
    
    container.appendChild(SceneState.renderer.domElement);
    
    console.log('✓ Scene and renderer initialized');
}

// ============================================================================
// 4. CAMERA SETUP
// ============================================================================

function setupCameras() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const aspect = width / height;
    
    // Orbital view camera (default)
    SceneState.cameras.orbital = new THREE.PerspectiveCamera(
        45,
        aspect,
        0.1,
        2000
    );
    SceneState.cameras.orbital.position.set(100, 80, 120);
    SceneState.cameras.orbital.lookAt(0, 0, 0);
    
    // Satellite-mounted camera
    SceneState.cameras.satellite = new THREE.PerspectiveCamera(
        60,
        aspect,
        0.1,
        1000
    );
    SceneState.cameras.satellite.position.set(0, 2, 8);
    
    // Free orbit camera
    SceneState.cameras.freeOrbit = new THREE.PerspectiveCamera(
        50,
        aspect,
        0.1,
        2000
    );
    SceneState.cameras.freeOrbit.position.set(150, 100, 150);
    SceneState.cameras.freeOrbit.lookAt(0, 0, 0);
    
    SceneState.activeCamera = 'orbital';
    
    console.log('✓ Cameras initialized');
}

// ============================================================================
// 5. LIGHTING RIG
// ============================================================================

function setupLighting() {
    // Sun Point Light (primary light source)
    SceneState.sunLight = new THREE.PointLight(
        Config.sunLightColor,
        Config.sunLightIntensity,
        1000
    );
    SceneState.sunLight.position.set(200, 150, 200);
    SceneState.sunLight.castShadow = true;
    SceneState.sunLight.shadow.mapSize.width = Config.shadowMapSize;
    SceneState.sunLight.shadow.mapSize.height = Config.shadowMapSize;
    SceneState.sunLight.shadow.camera.near = 0.5;
    SceneState.sunLight.shadow.camera.far = 1000;
    SceneState.scene.add(SceneState.sunLight);
    
    // Ambient Light (environmental illumination)
    SceneState.ambientLight = new THREE.AmbientLight(
        Config.ambientLightColor,
        Config.ambientLightIntensity
    );
    SceneState.scene.add(SceneState.ambientLight);
    
    // Directional Light (for shadow maps)
    SceneState.directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    SceneState.directionalLight.position.set(100, 100, 100);
    SceneState.directionalLight.castShadow = true;
    SceneState.directionalLight.shadow.mapSize.width = Config.shadowMapSize;
    SceneState.directionalLight.shadow.mapSize.height = Config.shadowMapSize;
    SceneState.directionalLight.shadow.camera.left = -200;
    SceneState.directionalLight.shadow.camera.right = 200;
    SceneState.directionalLight.shadow.camera.top = 200;
    SceneState.directionalLight.shadow.camera.bottom = -200;
    SceneState.directionalLight.shadow.camera.far = 500;
    SceneState.scene.add(SceneState.directionalLight);
    
    console.log('✓ Lighting rig initialized');
}

// ============================================================================
// 6. MATERIAL & TEXTURE SYSTEM
// ============================================================================

function createMaterial(config = {}) {
    const defaultConfig = {
        color: 0xffffff,
        metalness: 0.4,
        roughness: 0.7,
        emissive: 0x000000,
    };
    
    const finalConfig = { ...defaultConfig, ...config };
    return new THREE.MeshStandardMaterial(finalConfig);
}

function createGradientTexture(width, height, color1, color2) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    
    const c1 = typeof color1 === 'string' ? color1 : '#' + color1.toString(16).padStart(6, '0');
    const c2 = typeof color2 === 'string' ? color2 : '#' + color2.toString(16).padStart(6, '0');
    
    gradient.addColorStop(0, c1);
    gradient.addColorStop(1, c2);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    const texture = new THREE.CanvasTexture(canvas);
    if (THREE.sRGBEncoding !== undefined) {
        texture.encoding = THREE.sRGBEncoding;
    }
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
    return new THREE.CanvasTexture(canvas);
}

function createSpecularMap(width, height, intensity = 0.5) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    const specValue = Math.floor(intensity * 255);
    ctx.fillStyle = `rgb(${specValue}, ${specValue}, ${specValue})`;
    ctx.fillRect(0, 0, width, height);
    
    return new THREE.CanvasTexture(canvas);
}

function createPlanetMaterial(baseColor) {
    const material = createMaterial({
        color: new THREE.Color(baseColor),
        metalness: 0.1,
        roughness: 0.8,
        emissive: 0x000000,
    });
    
    material.map = createGradientTexture(256, 256, baseColor, baseColor);
    material.normalMap = createNormalMap(256, 256);
    material.roughnessMap = createSpecularMap(256, 256, 0.7); 
    
    return material;
}

function createSatelliteMaterial(baseColor) {
    const material = createMaterial({
        color: new THREE.Color(baseColor),
        metalness: 0.7,
        roughness: 0.3,
        emissive: 0x0a1a2a,
    });
    
    material.map = createGradientTexture(256, 256, baseColor, '#555555');
    material.normalMap = createNormalMap(256, 256);
    material.roughnessMap = createSpecularMap(256, 256, 0.4);
    
    return material;
}

function createSolarPanelMaterial(baseColor) {
    const material = createMaterial({
        color: new THREE.Color(baseColor),
        metalness: 0.9,
        roughness: 0.1,
        emissive: 0x0a1a2a,
    });
    
    material.map = createGradientTexture(256, 256, baseColor, '#0a3a5a');
    material.normalMap = createNormalMap(256, 256);
    material.roughnessMap = createSpecularMap(256, 256, 0.2);
    
    return material;
}

console.log('✓ Material system initialized');

// ============================================================================
// 7. HIERARCHICAL GEOMETRY BUILDER - ORBITAL SYSTEM
// ============================================================================

function buildOrbitalSystem() {
    const sunGeometry = new THREE.SphereGeometry(8, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({
        color: 0xfdb813,
    });
    
    SceneState.sun = new THREE.Mesh(sunGeometry, sunMaterial);
    SceneState.sun.position.set(0, 0, 0);
    SceneState.scene.add(SceneState.sun);
    
    SceneState.planetGroup = new THREE.Group();
    SceneState.scene.add(SceneState.planetGroup);
    
    const planetGeometry = new THREE.SphereGeometry(6, 32, 32);
    const planetMaterial = createPlanetMaterial(SceneState.ui.planetColor);
    
    SceneState.planet = new THREE.Mesh(planetGeometry, planetMaterial);
    SceneState.planet.position.x = Config.planetOrbitRadius;
    SceneState.planet.castShadow = true;
    SceneState.planet.receiveShadow = true;
    SceneState.planetGroup.add(SceneState.planet);
    
    SceneState.moonGroup = new THREE.Group();
    SceneState.moonGroup.position.set(Config.planetOrbitRadius, 0, 0);
    SceneState.planetGroup.add(SceneState.moonGroup);
    
    const moonGeometry = new THREE.SphereGeometry(2, 16, 16);
    const moonMaterial = createPlanetMaterial(SceneState.ui.moonColor);
    
    SceneState.moon = new THREE.Mesh(moonGeometry, moonMaterial);
    SceneState.moon.position.x = Config.moonOrbitRadius;
    SceneState.moon.castShadow = true;
    SceneState.moon.receiveShadow = true;
    SceneState.moonGroup.add(SceneState.moon);
    
    console.log('✓ Orbital system built (Sun->Planet->Moon hierarchy)');
}

// ============================================================================
// 8. HIERARCHICAL GEOMETRY BUILDER - SATELLITE SYSTEM
// ============================================================================

function buildSatellite() {
    SceneState.satelliteGroup = new THREE.Group();
    SceneState.satelliteGroup.position.set(0, 50, 0);
    SceneState.scene.add(SceneState.satelliteGroup);
    
    const bodyGeometry = new THREE.BoxGeometry(4, 6, 3);
    const bodyMaterial = createSatelliteMaterial(SceneState.ui.satelliteColor);
    
    SceneState.satelliteBody = new THREE.Mesh(bodyGeometry, bodyMaterial);
    SceneState.satelliteBody.castShadow = true;
    SceneState.satelliteBody.receiveShadow = true;
    SceneState.satelliteGroup.add(SceneState.satelliteBody);
    
    const antennaGeometry = new THREE.CylinderGeometry(0.3, 0.3, 5, 16);
    const antennaMaterial = new THREE.MeshStandardMaterial({
        color: 0xcccccc,
        metalness: 0.8,
        roughness: 0.2,
    });
    
    const antenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
    antenna.position.set(0, 5, 0);
    antenna.castShadow = true;
    antenna.receiveShadow = true;
    SceneState.satelliteBody.add(antenna);
    
    SceneState.armJoint1 = new THREE.Group();
    SceneState.armJoint1.position.set(2.5, -2, 0);
    SceneState.satelliteBody.add(SceneState.armJoint1);
    
    const armSeg1Geometry = new THREE.CylinderGeometry(0.2, 0.2, 5, 8);
    const armMaterial = createSatelliteMaterial('#888888');
    
    const armSegment1 = new THREE.Mesh(armSeg1Geometry, armMaterial);
    armSegment1.position.set(0, -2.5, 0);
    armSegment1.castShadow = true;
    armSegment1.receiveShadow = true;
    SceneState.armJoint1.add(armSegment1);
    
    SceneState.armJoint2 = new THREE.Group();
    SceneState.armJoint2.position.set(0, -5, 0);
    SceneState.armJoint1.add(SceneState.armJoint2);
    
    const armSeg2Geometry = new THREE.CylinderGeometry(0.15, 0.15, 4, 8);
    
    const armSegment2 = new THREE.Mesh(armSeg2Geometry, armMaterial);
    armSegment2.position.set(0, -2, 0);
    armSegment2.castShadow = true;
    armSegment2.receiveShadow = true;
    SceneState.armJoint2.add(armSegment2);
    
    SceneState.solarArray = new THREE.Group();
    SceneState.solarArray.position.set(0, -4, 0);
    SceneState.armJoint2.add(SceneState.solarArray);
    
    const frameGeometry = new THREE.BoxGeometry(0.2, 0.3, 6);
    const frameMaterial = createSatelliteMaterial('#555555');
    
    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    frame.castShadow = true;
    frame.receiveShadow = true;
    SceneState.solarArray.add(frame);
    
    const panelGeometry = new THREE.PlaneGeometry(2, 5);
    
    // Panel 1
    const panelMat1 = createSolarPanelMaterial(SceneState.ui.solarPanelColor);
    const panel1 = new THREE.Mesh(panelGeometry, panelMat1);
    panel1.position.set(-2.5, 0, 0);
    panel1.castShadow = true;
    panel1.receiveShadow = true;
    SceneState.solarArray.add(panel1);
    SceneState.solarPanels.push({ mesh: panel1, initialRotation: new THREE.Euler() });
    
    // Panel 2
    const panelMat2 = createSolarPanelMaterial(SceneState.ui.solarPanelColor);
    const panel2 = new THREE.Mesh(panelGeometry, panelMat2);
    panel2.position.set(0, 0, 0);
    panel2.castShadow = true;
    panel2.receiveShadow = true;
    SceneState.solarArray.add(panel2);
    SceneState.solarPanels.push({ mesh: panel2, initialRotation: new THREE.Euler() });
    
    // Panel 3
    const panelMat3 = createSolarPanelMaterial(SceneState.ui.solarPanelColor);
    const panel3 = new THREE.Mesh(panelGeometry, panelMat3);
    panel3.position.set(2.5, 0, 0);
    panel3.castShadow = true;
    panel3.receiveShadow = true;
    SceneState.solarArray.add(panel3);
    SceneState.solarPanels.push({ mesh: panel3, initialRotation: new THREE.Euler() });
    
    console.log('✓ Satellite system built (Body->Arm1->Arm2->SolarArray hierarchy)');
}

// ============================================================================
// 9. ORBIT CONTROLS (DYNAMIC ZOOM TARGETING FIXED)
// ============================================================================

function setupControls() {
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    
    document.addEventListener('mousedown', (e) => {
        if (e.button === 0) { 
            isDragging = true;
        }
    });
    
    document.addEventListener('mousemove', (e) => {
        if (isDragging && SceneState.activeCamera === 'freeOrbit') {
            const deltaX = e.clientX - previousMousePosition.x;
            const deltaY = e.clientY - previousMousePosition.y;
            
            const camera = SceneState.cameras[SceneState.activeCamera];
            const rotationSpeed = 0.005;
            
            const distance = camera.position.length();
            const theta = Math.atan2(camera.position.x, camera.position.z) + deltaX * rotationSpeed;
            const phi = Math.acos(camera.position.y / distance) + deltaY * rotationSpeed;
            
            camera.position.x = distance * Math.sin(phi) * Math.sin(theta);
            camera.position.y = distance * Math.cos(phi);
            camera.position.z = distance * Math.sin(phi) * Math.cos(theta);
            camera.lookAt(0, 0, 0);
        }
        
        previousMousePosition = { x: e.clientX, y: e.clientY };
    });
    
    document.addEventListener('mouseup', () => {
        isDragging = false;
    });
    
    // Responsive dynamic zooming handler
    document.addEventListener('wheel', (e) => {
        const camera = SceneState.cameras[SceneState.activeCamera];
        if (!camera) return;
        
        // Find out what the active camera is focusing on
        let targetPosition = new THREE.Vector3(0, 0, 0); // Default Sun view
        
        if (SceneState.activeCamera === 'satellite' && SceneState.satelliteBody) {
            SceneState.satelliteBody.getWorldPosition(targetPosition);
        } else if (SceneState.activeCamera === 'orbital' && SceneState.planet) {
            SceneState.planet.getWorldPosition(targetPosition);
        }
        
        // Zoom relative to that targeted vector space rather than scene zero root
        const vectorToTarget = camera.position.clone().sub(targetPosition);
        const distance = vectorToTarget.length();
        
        const zoomStep = e.deltaY * 0.1; 
        const newDistance = Math.max(5, Math.min(600, distance + zoomStep));
        
        vectorToTarget.normalize().multiplyScalar(newDistance);
        camera.position.copy(targetPosition).add(vectorToTarget);
    }, { passive: true });
    
    console.log('✓ Orbit controls initialized');
}

// ============================================================================
// 10. TWEEN.JS ANIMATION FUNCTIONS
// ============================================================================

function deployPanelsSmooth() {
    SceneState.activeTweens.forEach(tween => tween.stop());
    SceneState.activeTweens = [];
    
    const panelTween = new TWEEN.Tween(SceneState.ui)
        .to({ panelDeployment: 180 }, 3000)  
        .easing(TWEEN.Easing.Elastic.Out)    
        .onUpdate(() => {
            updateSolarPanelDeployment(SceneState.ui.panelDeployment);
        })
        .start();
    
    SceneState.activeTweens.push(panelTween);
}

function retractPanelsSmooth() {
    SceneState.activeTweens.forEach(tween => tween.stop());
    SceneState.activeTweens = [];
    
    const panelTween = new TWEEN.Tween(SceneState.ui)
        .to({ panelDeployment: 0 }, 2500)    
        .easing(TWEEN.Easing.Quadratic.Out)
        .onUpdate(() => {
            updateSolarPanelDeployment(SceneState.ui.panelDeployment);
        })
        .start();
    
    SceneState.activeTweens.push(panelTween);
}

function rotateArmJoint1Smooth(targetAngle = Math.PI / 4) {
    const tween = new TWEEN.Tween(SceneState.ui)
        .to({ armJoint1Angle: targetAngle }, 2000)
        .easing(TWEEN.Easing.Cubic.InOut)
        .onUpdate(() => {
            if(SceneState.armJoint1) SceneState.armJoint1.rotation.x = SceneState.ui.armJoint1Angle;
        })
        .start();
    
    SceneState.activeTweens.push(tween);
}

function rotateArmJoint2Smooth(targetAngle = Math.PI / 6) {
    const tween = new TWEEN.Tween(SceneState.ui)
        .to({ armJoint2Angle: targetAngle }, 2000)
        .easing(TWEEN.Easing.Cubic.InOut)
        .onUpdate(() => {
            if(SceneState.armJoint2) SceneState.armJoint2.rotation.z = SceneState.ui.armJoint2Angle;
        })
        .start();
    
    SceneState.activeTweens.push(tween);
}

// ============================================================================
// 11. GUI SETUP (lil-gui)
// ============================================================================

function setupGUI() {
    const gui = new lil.GUI({ title: 'Scene Controls' });
    gui.open();
    
    // ============ LIGHTS FOLDER ============
    const lightsFolder = gui.addFolder('Lights');
    
    lightsFolder.add(SceneState.ui, 'sunLightEnabled').name('Sun Light').onChange((value) => {
        SceneState.sunLight.visible = value;
    });
    
    lightsFolder.add(SceneState.ui, 'ambientLightEnabled').name('Ambient Light').onChange((value) => {
        SceneState.ambientLight.visible = value;
    });
    
    lightsFolder.add(SceneState.ui, 'sunIntensity', 0, 2, 0.1).name('Sun Intensity').onChange((value) => {
        SceneState.sunLight.intensity = value;
    });
    
    lightsFolder.add(SceneState.ui, 'ambientIntensity', 0, 1, 0.05).name('Ambient Intensity').onChange((value) => {
        SceneState.ambientLight.intensity = value;
    });
    
    lightsFolder.addColor(SceneState.ui, 'sunColor').name('Sun Color').onChange((value) => {
        SceneState.sunLight.color.set(value);
    });
    
    lightsFolder.open();
    
    // ============ CAMERA FOLDER ============
    const cameraFolder = gui.addFolder('Camera');
    
    const cameraOptions = {
        'Orbital (Planet Tracking)': 'orbital',
        'Satellite View': 'satellite',
        'Free Space Orbit': 'freeOrbit',
    };
    
    cameraFolder.add(SceneState, 'activeCamera', cameraOptions).name('View').onChange((value) => {
        SceneState.activeCamera = value;
    });
    
    cameraFolder.open();
    
    // ============ SATELLITE CONTROL FOLDER ============
    const satelliteFolder = gui.addFolder('Satellite Control');
    
    satelliteFolder.add({ deployPanels: deployPanelsSmooth }, 'deployPanels').name('Deploy Panels (Smooth)');
    satelliteFolder.add({ retractPanels: retractPanelsSmooth }, 'retractPanels').name('Retract Panels (Smooth)');
    
    satelliteFolder.add({ rotateArm1: () => rotateArmJoint1Smooth(Math.PI / 4) }, 'rotateArm1').name('Rotate Arm Joint 1');
    satelliteFolder.add({ rotateArm2: () => rotateArmJoint2Smooth(Math.PI / 6) }, 'rotateArm2').name('Rotate Arm Joint 2');
    
    satelliteFolder.add(SceneState.ui, 'panelDeployment', 0, 180, 1).name('Manual Panel Deploy').listen().onChange((value) => {
        updateSolarPanelDeployment(value);
    });
    
    satelliteFolder.add(SceneState.ui, 'armJoint1Angle', -Math.PI, Math.PI, 0.05).name('Arm Joint 1 Manual').listen().onChange((value) => {
        if(SceneState.armJoint1) SceneState.armJoint1.rotation.x = value;
    });
    
    satelliteFolder.add(SceneState.ui, 'armJoint2Angle', -Math.PI, Math.PI, 0.05).name('Arm Joint 2 Manual').listen().onChange((value) => {
        if(SceneState.armJoint2) SceneState.armJoint2.rotation.z = value;
    });
    
    satelliteFolder.open();
    
    // ============ COLORS FOLDER ============
    const colorsFolder = gui.addFolder('Colors');
    
    colorsFolder.addColor(SceneState.ui, 'planetColor').name('Planet Color').onChange((value) => {
        SceneState.planet.material.color.set(value);
    });
    
    colorsFolder.addColor(SceneState.ui, 'moonColor').name('Moon Color').onChange((value) => {
        SceneState.moon.material.color.set(value);
    });
    
    colorsFolder.addColor(SceneState.ui, 'satelliteColor').name('Satellite Color').onChange((value) => {
        SceneState.satelliteBody.material.color.set(value);
    });
    
    colorsFolder.addColor(SceneState.ui, 'solarPanelColor').name('Solar Panel Color').onChange((value) => {
        SceneState.solarPanels.forEach(panel => {
            panel.mesh.material.color.set(value);
        });
    });
    
    colorsFolder.open();
    
    // ============ VISIBILITY FOLDER ============
    const visibilityFolder = gui.addFolder('Visibility');
    
    visibilityFolder.add(SceneState.ui, 'planetVisible').name('Show Planet').onChange((value) => {
        SceneState.planet.visible = value;
    });
    
    visibilityFolder.add(SceneState.ui, 'moonVisible').name('Show Moon').onChange((value) => {
        SceneState.moon.visible = value;
    });
    
    visibilityFolder.add(SceneState.ui, 'satelliteVisible').name('Show Satellite').onChange((value) => {
        SceneState.satelliteGroup.visible = value;
    });
    
    visibilityFolder.open();
    
    console.log('✓ GUI initialized with Tween.js smooth animations');
}

// ============================================================================
// 12. ANIMATION & UPDATE FUNCTIONS
// ============================================================================

function updateOrbitalMechanics(deltaTime) {
    if (SceneState.planetGroup) SceneState.planetGroup.rotation.y += Config.planetOrbitSpeed * deltaTime;
    if (SceneState.planet) SceneState.planet.rotation.y += Config.planetRotationSpeed * deltaTime;
    if (SceneState.moonGroup) SceneState.moonGroup.rotation.y += Config.moonOrbitSpeed * deltaTime;
    if (SceneState.moon) SceneState.moon.rotation.y += Config.moonRotationSpeed * deltaTime;
}

function updateSolarPanelDeployment(angle) {
    const radians = (angle * Math.PI) / 180;
    const deploymentFactor = radians / Math.PI;
    
    SceneState.solarPanels.forEach((panel, index) => {
        const offset = (index - 1) * 0.2;
        if(panel.mesh) panel.mesh.rotation.y = deploymentFactor * (Math.PI * 0.5) + offset;
    });
}

function updateSatelliteOrbitalPosition(deltaTime) {
    if (!SceneState.satelliteGroup) return;
    const angle = SceneState.elapsedTime * Config.satelliteOrbitSpeed;
    SceneState.satelliteGroup.position.x = Math.cos(angle) * Config.satelliteDistance;
    SceneState.satelliteGroup.position.z = Math.sin(angle) * Config.satelliteDistance;
}

function updateCameraPosition() {
    const camera = SceneState.cameras[SceneState.activeCamera];
    if (!camera) return;
    
    if (SceneState.activeCamera === 'satellite' && SceneState.satelliteBody) {
        const worldPos = new THREE.Vector3();
        SceneState.satelliteBody.getWorldPosition(worldPos);
        
        // Grab length to preserve the scroll-modified distance
        const currentDist = camera.position.clone().sub(worldPos).length();
        const direction = camera.position.clone().sub(worldPos).normalize();
        
        camera.position.copy(worldPos).add(direction.multiplyScalar(currentDist || 8.24));
        camera.lookAt(worldPos);
    } else if (SceneState.activeCamera === 'orbital' && SceneState.planet) {
        const planetPos = new THREE.Vector3();
        SceneState.planet.getWorldPosition(planetPos);
        camera.lookAt(planetPos);
    }
}

function animate() {
    requestAnimationFrame(animate);
    
    SceneState.deltaTime = Math.min(SceneState.clock.getDelta(), 1 / 30);
    SceneState.elapsedTime += SceneState.deltaTime;
    
    updateOrbitalMechanics(SceneState.deltaTime);
    updateSatelliteOrbitalPosition(SceneState.deltaTime);
    updateCameraPosition();
    
    TWEEN.update();
    
    const camera = SceneState.cameras[SceneState.activeCamera];
    if (SceneState.renderer && SceneState.scene && camera) {
        SceneState.renderer.render(SceneState.scene, camera);
    }
}

// ============================================================================
// 13. EVENT HANDLERS
// ============================================================================

function onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const aspect = width / height;
    
    Object.values(SceneState.cameras).forEach(camera => {
        if (camera instanceof THREE.PerspectiveCamera) {
            camera.aspect = aspect;
            camera.updateProjectionMatrix();
        }
    });
    
    if (SceneState.renderer) SceneState.renderer.setSize(width, height);
}

// ============================================================================
// 14. INITIALIZATION ENTRY POINT
// ============================================================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}