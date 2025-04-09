// Simple game to test Three.js functionality
console.log("Simple game script loaded");

// Game variables
let scene, camera, renderer, cube;

// Initialize the game
function init() {
    try {
        console.log("Initializing simple game...");
        
        // Create scene
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x87CEEB); // Sky blue background

        // Create camera
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 5;

        // Create renderer
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);

        // Create a simple cube
        const geometry = new THREE.BoxGeometry();
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        cube = new THREE.Mesh(geometry, material);
        scene.add(cube);

        // Add lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(0, 10, 0);
        scene.add(directionalLight);

        // Handle window resize
        window.addEventListener('resize', onWindowResize, false);

        // Start game loop
        animate();
        
        console.log("Simple game initialized successfully!");
    } catch (error) {
        console.error("Error initializing simple game:", error);
        if (document.getElementById('loading')) {
            document.getElementById('loading').innerHTML = 'Error initializing game: ' + error.message;
        }
    }
}

// Handle window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Animation loop
function animate() {
    try {
        requestAnimationFrame(animate);
        
        // Rotate the cube
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        
        renderer.render(scene, camera);
    } catch (error) {
        console.error("Error in animation loop:", error);
    }
}

// Start the game when the page loads
console.log("Simple game script loaded, waiting for window load event...");
window.addEventListener('load', function() {
    console.log("Window loaded, initializing simple game...");
    init();
}); 