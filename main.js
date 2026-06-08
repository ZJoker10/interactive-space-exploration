/* ============================================================================
   INTERACTIVE SPACE EXPLORATION & SATELLITE DEPLOYMENT LAB
   Main Application Engine - Three.js WebGL Renderer
   ============================================================================
   
   ARCHITECTURE:
   1. Scene Setup & Renderer Configuration
   2. Lighting Rig (Sun, Ambient, Directional with Shadows)
   3. Material & Texture System (Diffuse, Normal, Specular Maps)
   4. Hierarchical Geometry Builder (Sun->Planet->Moon, Satellite->Joints->Arrays)
   5. Animation Engine (Delta-time aware)
   6. User Interaction & GUI Binding (lil-gui)
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
        planetColor: 0x4488ff,
        moonColor: 0xcccccc,
        satelliteColor: 0xaaaaaa,
        solarPanelColor: 0x1a5f7a,
        planetVisible: true,
        moonVisible: true,
        satelliteVisible: true,
    },
};

// ============================================================================
// 2. INITIALIZATION
// ============================================================================

function init() {
    console.log('Initializing Space Exploration Lab...');
    
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
    
    console.log('Initialization complete!');
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
    SceneState.renderer.shadowMap.type = THREE.PCFShadowShadowMap;
    SceneState.renderer.shadowMap.resolution = Config.shadowMapSize;
    SceneState.renderer.outputEncoding = THREE.sRGBEncoding;
    
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
    ctx.fillStyle = '#7f7fff'; // Normal map neutral blue
    ctx.fillRect(0, 0, width, height);
    
    // Add subtle noise for detail
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
        const noise = Math.random() * 20;
        data[i] = Math.max(0, Math.min(255, 127 + noise)); // R
        data[i + 1] = Math.max(0, Math.min(255, 127 + noise)); // G
        data[i + 2] = 255; // B (always 255)
        data[i + 3] = 255; // A
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

function createPlanetMaterial(baseColor) {
    const material = createMaterial({
        color: baseColor,
        metalness: 0.1,
        roughness: 0.8,
        emissive: 0x000000,
    });
    
    // Optional: Add texture maps if canvas textures
    material.map = createGradientTexture(256, 256, baseColor, baseColor);
    material.normalMap = createNormalMap(256, 256);
    material.specularMap = createSpecularMap(256, 256, 0.3);
    
    return material;
}

function createSatelliteMaterial(baseColor) {
    const material = createMaterial({
        color: baseColor,
        metalness: 0.7,
        roughness: 0.3,
        emissive: 0x0a1a2a,
    });
    
    material.map = createGradientTexture(256, 256, baseColor, 0x555555);
    material.normalMap = createNormalMap(256, 256);
    material.specularMap = createSpecularMap(256, 256, 0.6);
    
    return material;
}

function createSolarPanelMaterial(baseColor) {
    const material = createMaterial({
        color: baseColor,
        metalness: 0.9,
        roughness: 0.1,
        emissive: 0x0a1a2a,
    });
    
    material.map = createGradientTexture(256, 256, baseColor, 0x0a3a5a);
    material.normalMap = createNormalMap(256, 256);
    material.specularMap = createSpecularMap(256, 256, 0.8);
    
    return material;
}

console.log('✓ Material system initialized');

// ============================================================================
// 7. HIERARCHICAL GEOMETRY BUILDER - ORBITAL SYSTEM
// ============================================================================

function buildOrbitalSystem() {
    // Create Sun (visual representation + light)
    const sunGeometry = new THREE.SphereGeometry(8, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({
        color: 0xfdb813,
        emissive: 0xfdb813,
        emissiveIntensity: 0.8,
    });
    
    SceneState.sun = new THREE.Mesh(sunGeometry, sunMaterial);
    SceneState.sun.position.set(0, 0, 0);
    SceneState.scene.add(SceneState.sun);
    
    // Create Planet Orbit Group (for orbital motion)
    SceneState.planetGroup = new THREE.Group();
    SceneState.scene.add(SceneState.planetGroup);
    
    // Create Planet
    const planetGeometry = new THREE.SphereGeometry(6, 32, 32);
    const planetMaterial = createPlanetMaterial(SceneState.ui.planetColor);
    
    SceneState.planet = new THREE.Mesh(planetGeometry, planetMaterial);
    SceneState.planet.position.x = Config.planetOrbitRadius;
    SceneState.planet.castShadow = true;
    SceneState.planet.receiveShadow = true;
    SceneState.planetGroup.add(SceneState.planet);
    
    // Create Moon Orbit Group (child of planet, for hierarchical motion)
    SceneState.moonGroup = new THREE.Group();
    SceneState.moonGroup.position.set(Config.planetOrbitRadius, 0, 0);
    SceneState.planetGroup.add(SceneState.moonGroup);
    
    // Create Moon
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
    // Root satellite group
    SceneState.satelliteGroup = new THREE.Group();
    SceneState.satelliteGroup.position.set(0, 50, 0);
    SceneState.scene.add(SceneState.satelliteGroup);
    
    // ============ SATELLITE BODY ============
    const bodyGeometry = new THREE.BoxGeometry(4, 6, 3);
    const bodyMaterial = createSatelliteMaterial(SceneState.ui.satelliteColor);
    
    SceneState.satelliteBody = new THREE.Mesh(bodyGeometry, bodyMaterial);
    SceneState.satelliteBody.castShadow = true;
    SceneState.satelliteBody.receiveShadow = true;
    SceneState.satelliteGroup.add(SceneState.satelliteBody);
    
    // ============ ANTENNA ============
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
    
    // ============ ARM JOINT 1 (Rotates around X-axis) ============
    SceneState.armJoint1 = new THREE.Group();
    SceneState.armJoint1.position.set(2.5, -2, 0);
    SceneState.satelliteBody.add(SceneState.armJoint1);
    
    // Arm Segment 1
    const armSeg1Geometry = new THREE.CylinderGeometry(0.2, 0.2, 5, 8);
    const armMaterial = createSatelliteMaterial(0x888888);
    
    const armSegment1 = new THREE.Mesh(armSeg1Geometry, armMaterial);
    armSegment1.position.set(0, -2.5, 0);
    armSegment1.castShadow = true;
    armSegment1.receiveShadow = true;
    SceneState.armJoint1.add(armSegment1);
    
    // ============ ARM JOINT 2 (Rotates around Z-axis, child of Joint 1) ============
    SceneState.armJoint2 = new THREE.Group();
    SceneState.armJoint2.position.set(0, -5, 0);
    SceneState.armJoint1.add(SceneState.armJoint2);
    
    // Arm Segment 2
    const armSeg2Geometry = new THREE.CylinderGeometry(0.15, 0.15, 4, 8);
    
    const armSegment2 = new THREE.Mesh(armSeg2Geometry, armMaterial);
    armSegment2.position.set(0, -2, 0);
    armSegment2.castShadow = true;
    armSegment2.receiveShadow = true;
    SceneState.armJoint2.add(armSegment2);
    
    // ============ SOLAR ARRAY (child of Joint 2) ============
    SceneState.solarArray = new THREE.Group();
    SceneState.solarArray.position.set(0, -4, 0);
    SceneState.armJoint2.add(SceneState.solarArray);
    
    // Solar Array Frame
    const frameGeometry = new THREE.BoxGeometry(0.2, 0.3, 6);
    const frameMaterial = createSatelliteMaterial(0x555555);
    
    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    frame.castShadow = true;
    frame.receiveShadow = true;
    SceneState.solarArray.add(frame);
    
    // ============ SOLAR PANELS (3 panels) ============
    const panelGeometry = new THREE.PlaneGeometry(2, 5);
    
    // Panel 1 (left)
    const panelMat1 = createSolarPanelMaterial(SceneState.ui.solarPanelColor);
    const panel1 = new THREE.Mesh(panelGeometry, panelMat1);
    panel1.position.set(-2.5, 0, 0);
    panel1.castShadow = true;
    panel1.receiveShadow = true;
    SceneState.solarArray.add(panel1);
    SceneState.solarPanels.push({ mesh: panel1, initialRotation: new THREE.Euler() });
    
    // Panel 2 (center)
    const panelMat2 = createSolarPanelMaterial(SceneState.ui.solarPanelColor);
    const panel2 = new THREE.Mesh(panelGeometry, panelMat2);
    panel2.position.set(0, 0, 0);
    panel2.castShadow = true;
    panel2.receiveShadow = true;
    SceneState.solarArray.add(panel2);
    SceneState.solarPanels.push({ mesh: panel2, initialRotation: new THREE.Euler() });
    
    // Panel 3 (right)
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
// 9. ORBIT CONTROLS
// ============================================================================

function setupControls() {
    // Create a minimal orbit control simulation
    // Note: Using basic mouse events for smooth, performant camera control
    
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    
    document.addEventListener('mousedown', (e) => {
        if (e.button === 0) { // Left click
            isDragging = true;
        }
    });
    
    document.addEventListener('mousemove', (e) => {
        if (isDragging && SceneState.activeCamera === 'freeOrbit') {
            const deltaX = e.clientX - previousMousePosition.x;
            const deltaY = e.clientY - previousMousePosition.y;
            
            const camera = SceneState.cameras[SceneState.activeCamera];
            const rotationSpeed = 0.005;
            
            // Rotate around scene origin
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
    
    // Zoom with scroll wheel
    document.addEventListener('wheel', (e) => {
        e.preventDefault();
        
        const camera = SceneState.cameras[SceneState.activeCamera];
        const direction = camera.position.clone().normalize();
        const distance = camera.position.length();
        const zoomSpeed = 5;
        
        const newDistance = Math.max(20, Math.min(500, distance + e.deltaY * 0.5));
        camera.position.copy(direction.multiplyScalar(newDistance));
    }, { passive: false });
    
    console.log('✓ Orbit controls initialized');
}

// ============================================================================
// 10. GUI SETUP (lil-gui)
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
        SceneState.sunLight.color.setHex(value);
    });
    
    lightsFolder.open();
    
    // ============ CAMERA FOLDER ============
    const cameraFolder = gui.addFolder('Camera');
    
    const cameraOptions = {
        'Orbital View': 'orbital',
        'Satellite View': 'satellite',
        'Free Orbit': 'freeOrbit',
    };
    
    cameraFolder.add(SceneState, 'activeCamera', cameraOptions).name('View').onChange((value) => {
        SceneState.activeCamera = value;
    });
    
    cameraFolder.open();
    
    // ============ SATELLITE CONTROL FOLDER ============
    const satelliteFolder = gui.addFolder('Satellite Control');
    
    satelliteFolder.add(SceneState.ui, 'panelDeployment', 0, 180, 1).name('Panel Deployment').onChange((value) => {
        updateSolarPanelDeployment(value);
    });
    
    satelliteFolder.add(SceneState.ui, 'armJoint1Angle', -Math.PI, Math.PI, 0.05).name('Arm Joint 1').onChange((value) => {
        SceneState.armJoint1.rotation.x = value;
    });
    
    satelliteFolder.add(SceneState.ui, 'armJoint2Angle', -Math.PI, Math.PI, 0.05).name('Arm Joint 2').onChange((value) => {
        SceneState.armJoint2.rotation.z = value;
    });
    
    satelliteFolder.open();
    
    // ============ COLORS FOLDER ============
    const colorsFolder = gui.addFolder('Colors');
    
    colorsFolder.addColor(SceneState.ui, 'planetColor').name('Planet Color').onChange((value) => {
        SceneState.planet.material.color.setHex(value);
    });
    
    colorsFolder.addColor(SceneState.ui, 'moonColor').name('Moon Color').onChange((value) => {
        SceneState.moon.material.color.setHex(value);
    });
    
    colorsFolder.addColor(SceneState.ui, 'satelliteColor').name('Satellite Color').onChange((value) => {
        SceneState.satelliteBody.material.color.setHex(value);
    });
    
    colorsFolder.addColor(SceneState.ui, 'solarPanelColor').name('Solar Panel Color').onChange((value) => {
        SceneState.solarPanels.forEach(panel => {
            panel.mesh.material.color.setHex(value);
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
    
    console.log('✓ GUI initialized');
}

// ============================================================================
// 11. ANIMATION & UPDATE FUNCTIONS
// ============================================================================

function updateOrbitalMechanics(deltaTime) {
    // Planet orbit around sun
    SceneState.planetGroup.rotation.y += Config.planetOrbitSpeed * deltaTime;
    
    // Planet self-rotation
    SceneState.planet.rotation.y += Config.planetRotationSpeed * deltaTime;
    
    // Moon orbit around planet
    SceneState.moonGroup.rotation.y += Config.moonOrbitSpeed * deltaTime;
    
    // Moon self-rotation
    SceneState.moon.rotation.y += Config.moonRotationSpeed * deltaTime;
}

function updateSolarPanelDeployment(angle) {
    // Convert angle (0-180 degrees) to radians and map deployment
    const radians = (angle * Math.PI) / 180;
    const deploymentFactor = radians / Math.PI; // 0 to 1
    
    SceneState.solarPanels.forEach((panel, index) => {
        // Rotate around Y-axis to deploy/retract
        const offset = (index - 1) * 0.2; // Slight stagger
        panel.mesh.rotation.y = deploymentFactor * (Math.PI * 0.5) + offset;
    });
}

function updateSatelliteOrbitalPosition(deltaTime) {
    // Optional: Make satellite orbit around planet
    const angle = SceneState.elapsedTime * Config.satelliteOrbitSpeed;
    SceneState.satelliteGroup.position.x = Math.cos(angle) * Config.satelliteDistance;
    SceneState.satelliteGroup.position.z = Math.sin(angle) * Config.satelliteDistance;
}

function updateCameraPosition() {
    const camera = SceneState.cameras[SceneState.activeCamera];
    
    // Update satellite-mounted camera if active
    if (SceneState.activeCamera === 'satellite' && SceneState.satelliteBody) {
        const worldPos = new THREE.Vector3();
        SceneState.satelliteBody.getWorldPosition(worldPos);
        camera.position.lerp(worldPos.clone().add(new THREE.Vector3(0, 2, 8)), 0.05);
        camera.lookAt(worldPos);
    }
}

function animate() {
    requestAnimationFrame(animate);
    
    // Update delta time
    SceneState.deltaTime = Math.min(SceneState.clock.getDelta(), 1 / 30); // Cap at 30 FPS minimum
    SceneState.elapsedTime += SceneState.deltaTime;
    
    // Update orbital mechanics
    updateOrbitalMechanics(SceneState.deltaTime);
    
    // Update satellite orbital position
    updateSatelliteOrbitalPosition(SceneState.deltaTime);
    
    // Update camera
    updateCameraPosition();
    
    // Update Tween.js animations
    TWEEN.update();
    
    // Render scene
    const camera = SceneState.cameras[SceneState.activeCamera];
    SceneState.renderer.render(SceneState.scene, camera);
}

// ============================================================================
// 12. EVENT HANDLERS
// ============================================================================

function onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const aspect = width / height;
    
    // Update all cameras
    Object.values(SceneState.cameras).forEach(camera => {
        if (camera instanceof THREE.PerspectiveCamera) {
            camera.aspect = aspect;
            camera.updateProjectionMatrix();
        }
    });
    
    // Update renderer
    SceneState.renderer.setSize(width, height);
}

window.addEventListener('resize', onWindowResize);

// ============================================================================
// 13. INITIALIZATION ENTRY POINT
// ============================================================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
