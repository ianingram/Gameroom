// render.js

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { getBoardState, getPossibleMoves, attemptMove } from './logic.js';

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

const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
        const isLightSquare = (row + col) % 2 === 0;
        const tileColor = isLightSquare ? colorLight : colorDark;

        const geometry = new THREE.BoxGeometry(tileSize, 0.2, tileSize);
        const material = new THREE.MeshStandardMaterial({ color: tileColor });
        const tile = new THREE.Mesh(geometry, material);

        const squareName = files[col] + ranks[row];
        tile.userData = { id: squareName, isTile: true };

        tile.position.set(col - 3.5, 0, row - 3.5);
        boardGroup.add(tile);
    }
}
scene.add(boardGroup);

// --- 4. SPAWNING THE PIECES ---
const pieceGroup = new THREE.Group();
scene.add(pieceGroup);

const materialWhite = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
const materialBlack = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.5 });

const pieceGeometries = {
    'p': new THREE.CylinderGeometry(0.3, 0.3, 0.5, 16),
    'r': new THREE.CylinderGeometry(0.35, 0.4, 0.6, 16),
    'n': new THREE.CylinderGeometry(0.35, 0.4, 0.7, 16),
    'b': new THREE.CylinderGeometry(0.3, 0.4, 0.8, 16),
    'q': new THREE.CylinderGeometry(0.4, 0.45, 1.0, 16),
    'k': new THREE.CylinderGeometry(0.4, 0.45, 1.2, 16)
};

function renderPieces() {
    while(pieceGroup.children.length > 0){ 
        pieceGroup.remove(pieceGroup.children[0]); 
    }

    const boardState = getBoardState(); 

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = boardState[row][col];
            
            if (square) {
                const geometry = pieceGeometries[square.type];
                const material = square.color === 'w' ? materialWhite : materialBlack;
                const mesh = new THREE.Mesh(geometry, material);
                
                const squareName = files[col] + ranks[row];
                mesh.userData = { id: squareName, type: square.type, color: square.color, isTile: false };

                mesh.position.set(col - 3.5, mesh.geometry.parameters.height / 2 + 0.1, row - 3.5);
                pieceGroup.add(mesh);
            }
        }
    }
}
renderPieces();

// --- 5. RESPONSIVENESS ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- 6. INTERACTIVITY (Moving pieces) ---
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

let selectedPiece = null;
let originalMaterial = null;

window.addEventListener('click', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    
    // Check for clicks on pieces AND tiles
    const objectsToTest = [...pieceGroup.children, ...boardGroup.children];
    const intersects = raycaster.intersectObjects(objectsToTest);
    
    if (intersects.length > 0) {
        const clickedObject = intersects[0].object;
        const clickedId = clickedObject.userData.id;

        // SCENARIO A: Clicked a Tile
        if (clickedObject.userData.isTile) {
            if (selectedPiece) {
                const source = selectedPiece.userData.id;
                const target = clickedId;
                
                const moveSuccessful = attemptMove(source, target);
                
                if (moveSuccessful) {
                    renderPieces(); // Redraw board if legal!
                }
                
                selectedPiece.material = originalMaterial;
                selectedPiece = null;
            }
            return; 
        }

        // SCENARIO B: Clicked a Piece
        if (!clickedObject.userData.isTile) {
            if (selectedPiece) {
                selectedPiece.material = originalMaterial;
            }

            selectedPiece = clickedObject;
            originalMaterial = selectedPiece.material; 
            
            selectedPiece.material = selectedPiece.material.clone(); 
            selectedPiece.material.color.setHex(0xff0000); 
        }
    } else {
        // SCENARIO C: Clicked empty space
        if (selectedPiece) {
            selectedPiece.material = originalMaterial;
            selectedPiece = null;
        }
    }
});

// --- 7. THE ANIMATION LOOP ---
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();
