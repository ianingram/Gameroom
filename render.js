// render.js

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// --- NEW: Import the Brain ---
import { getBoardState } from './logic.js';

// --- 1. CORE SETUP ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a1a);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 10, 12);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// --- 2. LIGHTING ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(10, 20, 10);
scene.add(directionalLight);

// --- 3. BUILDING THE BOARD ---
const boardGroup = new THREE.Group();
const tileSize = 1;
const colorLight = 0xeeeed2;
const colorDark = 0x769656;

for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
        const isLightSquare = (row + col) % 2 === 0;
        const tileColor = isLightSquare ? colorLight : colorDark;

        const geometry = new THREE.BoxGeometry(tileSize, 0.2, tileSize);
        const material = new THREE.MeshStandardMaterial({ color: tileColor });
        const tile = new THREE.Mesh(geometry, material);

        tile.position.set(col - 3.5, 0, row - 3.5);
        boardGroup.add(tile);
    }
}
scene.add(boardGroup);

// --- 4. NEW: SPAWNING THE PIECES ---
const pieceGroup = new THREE.Group();
scene.add(pieceGroup);

// Create basic materials for White and Black pieces
const materialWhite = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
const materialBlack = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.5 });

// Define different cylinder sizes for different piece types (RadiusTop, RadiusBottom, Height, Segments)
const pieceGeometries = {
    'p': new THREE.CylinderGeometry(0.3, 0.3, 0.5, 16), // Pawn
    'r': new THREE.CylinderGeometry(0.35, 0.4, 0.6, 16), // Rook
    'n': new THREE.CylinderGeometry(0.35, 0.4, 0.7, 16), // Knight
    'b': new THREE.CylinderGeometry(0.3, 0.4, 0.8, 16), // Bishop
    'q': new THREE.CylinderGeometry(0.4, 0.45, 1.0, 16), // Queen
    'k': new THREE.CylinderGeometry(0.4, 0.45, 1.2, 16)  // King
};

function renderPieces() {
    // Clear out any old pieces from the board first
    while(pieceGroup.children.length > 0){ 
        pieceGroup.remove(pieceGroup.children[0]); 
    }

    // Ask logic.js for the current 8x8 board array
    const boardState = getBoardState(); 

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = boardState[row][col];
            
            // If the square is not empty, draw a piece!
            if (square) {
                const geometry = pieceGeometries[square.type];
                const material = square.color === 'w' ? materialWhite : materialBlack;
                const mesh = new THREE.Mesh(geometry, material);
                
                // Position it on the grid. We add half the piece's height so it sits ON the board, not inside it.
                mesh.position.set(col - 3.5, mesh.geometry.parameters.height / 2 + 0.1, row - 3.5);
                pieceGroup.add(mesh);
            }
        }
    }
}

// Call this function once to set up the starting positions
renderPieces();

// --- 5. RESPONSIVENESS ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- 6. THE ANIMATION LOOP ---
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();
