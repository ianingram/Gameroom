// render.js

import * as THREE from 'three';
// Import OrbitControls to let us move the camera with the mouse
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// --- 1. CORE SETUP (Scene, Camera, Renderer) ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a1a); // Dark charcoal background

// The Camera: Field of View, Aspect Ratio, Near clipping, Far clipping
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 10, 12); // Positioned above and pulled back

// The Renderer: Draws the 3D pixels to your screen
const renderer = new THREE.WebGLRenderer({ antialias: true }); // Antialias smooths jagged edges
renderer.setSize(window.innerWidth, window.innerHeight);
// Inject the 3D canvas into the HTML body
document.body.appendChild(renderer.domElement); 

// Camera Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Adds a smooth, heavy feel to camera movement

// --- 2. LIGHTING (Crucial for 3D depth) ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); // Soft, global base light
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8); // Acts like the sun
directionalLight.position.set(10, 20, 10);
scene.add(directionalLight);

// --- 3. BUILDING THE BOARD ---
const boardGroup = new THREE.Group(); // Groups all 64 tiles together
const tileSize = 1;

// Classic chess colors (we can change these to stone/marble later)
const colorLight = 0xeeeed2; 
const colorDark = 0x769656;  

for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
        // Math to alternate tile colors
        const isLightSquare = (row + col) % 2 === 0;
        const tileColor = isLightSquare ? colorLight : colorDark;

        // Create the 3D tile (a flat box)
        const geometry = new THREE.BoxGeometry(tileSize, 0.2, tileSize);
        // StandardMaterial reacts to our lights
        const material = new THREE.MeshStandardMaterial({ color: tileColor }); 
        const tile = new THREE.Mesh(geometry, material);

        // Position the tile. Subtracting 3.5 centers the 8x8 grid perfectly at (0,0,0)
        tile.position.set(col - 3.5, 0, row - 3.5);
        boardGroup.add(tile);
    }
}

scene.add(boardGroup);

// --- 4. RESPONSIVENESS ---
// Keeps the game looking right if the user resizes their browser window
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- 5. THE ANIMATION LOOP ---
// This runs 60 times a second to constantly draw the screen
function animate() {
    requestAnimationFrame(animate);
    controls.update(); // Required because we turned on damping
    renderer.render(scene, camera);
}

// Start the engine
animate();
