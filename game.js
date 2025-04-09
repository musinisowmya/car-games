// Game variables
let scene, camera, renderer;
let car, road;
let obstacles = [];
let coins = [];
let score = 0;
let coinsCollected = 0;
let gameOver = false;
let roadSpeed = 0.3;
let carSpeed = 0.3;
let obstacleSpeed = 0.3;
let cameraOffset = new THREE.Vector3(0, 5, 10);
let roadSegments = [];
let difficulty = 1;
let maxDifficulty = 5;
let obstacleSpawnRate = 0.005;
let coinSpawnRate = 0.02;
let obstacleColors = [0x0000ff, 0xff0000, 0x00ff00, 0xff00ff, 0xff8800, 0x00ffff];
let distanceTraveled = 0;
let obstacleStartDistance = 50;
let keys = { forward: false, backward: false, left: false, right: false };

// Initialize the game
function init() {
    console.log("Initializing game...");
    
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); // Sky blue background
    
    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 10);
    camera.lookAt(0, 0, 0);
    
    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);
    
    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 10, 0);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    // Create game elements
    createRoad();
    createCar();
    addRoadMarkings();
    createCoins();
    
    // Add event listeners
    window.addEventListener('resize', onWindowResize, false);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    // Start animation
    animate();
    
    // Show welcome message
    showWelcomeMessage();
    
    // Hide loading message
    document.getElementById('loading').style.display = 'none';
}

// Create road segments
function createRoad() {
    const roadGeometry = new THREE.PlaneGeometry(10, 100);
    const roadMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x000000,  // Pure black color
        side: THREE.DoubleSide,
        shininess: 10,    // Reduced shininess for more matte look
        specular: 0x222222  // Subtle specular highlight
    });

    for (let i = 0; i < 20; i++) {
        const roadSegment = new THREE.Mesh(roadGeometry, roadMaterial);
        roadSegment.rotation.x = -Math.PI / 2;
        roadSegment.position.y = -0.1;
        roadSegment.position.z = -i * 100;
        roadSegment.receiveShadow = true;
        scene.add(roadSegment);
        roadSegments.push(roadSegment);
        
        // Add barriers with darker color
        const barrierGeometry = new THREE.BoxGeometry(0.5, 1, 100);
        const barrierMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x999999,  // Darker gray for barriers
            shininess: 30
        });
        
        const leftBarrier = new THREE.Mesh(barrierGeometry, barrierMaterial);
        leftBarrier.position.set(-5.25, 0.5, -i * 100);
        leftBarrier.castShadow = true;
        leftBarrier.receiveShadow = true;
        scene.add(leftBarrier);
        
        const rightBarrier = new THREE.Mesh(barrierGeometry, barrierMaterial);
        rightBarrier.position.set(5.25, 0.5, -i * 100);
        rightBarrier.castShadow = true;
        rightBarrier.receiveShadow = true;
        scene.add(rightBarrier);
    }
}

// Create the player's car
function createCar() {
    car = new THREE.Group();
    
    // Main body - flatter and more 2D-like
    const bodyGeometry = new THREE.BoxGeometry(2, 0.4, 3.5);
    const bodyMaterial = new THREE.MeshPhongMaterial({
        color: 0xFFD700,  // Yellow color
        shininess: 90,
        specular: 0x777700
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.4;
    car.add(body);

    // Top part of the car (cabin)
    const cabinGeometry = new THREE.BoxGeometry(1.7, 0.4, 1.8);
    const cabin = new THREE.Mesh(cabinGeometry, bodyMaterial);
    cabin.position.set(0, 0.8, 0);
    car.add(cabin);

    // Windows
    const windowMaterial = new THREE.MeshPhongMaterial({
        color: 0x111111,
        shininess: 100,
        transparent: true,
        opacity: 0.7
    });

    // Front window
    const frontWindowGeometry = new THREE.PlaneGeometry(1.5, 0.4);
    const frontWindow = new THREE.Mesh(frontWindowGeometry, windowMaterial);
    frontWindow.position.set(0, 0.8, -0.7);
    frontWindow.rotation.x = Math.PI * 0.1;
    car.add(frontWindow);

    // Back window
    const backWindow = new THREE.Mesh(frontWindowGeometry, windowMaterial);
    backWindow.position.set(0, 0.8, 0.7);
    backWindow.rotation.x = -Math.PI * 0.1;
    car.add(backWindow);

    // Wheels - simpler, more 2D-like
    const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16);
    const wheelMaterial = new THREE.MeshPhongMaterial({
        color: 0x111111,
        shininess: 30
    });

    // Wheel positions
    const wheelPositions = [
        { x: -1.1, z: -1.2 },  // Front left
        { x: 1.1, z: -1.2 },   // Front right
        { x: -1.1, z: 1.2 },   // Rear left
        { x: 1.1, z: 1.2 }     // Rear right
    ];

    wheelPositions.forEach(pos => {
        const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(pos.x, 0.4, pos.z);
        car.add(wheel);

        // Add simple hubcaps
        const hubcapGeometry = new THREE.CircleGeometry(0.25, 16);
        const hubcapMaterial = new THREE.MeshPhongMaterial({
            color: 0xCCCCCC,
            shininess: 100
        });
        const hubcap = new THREE.Mesh(hubcapGeometry, hubcapMaterial);
        hubcap.position.set(pos.x + 0.16, 0.4, pos.z);
        hubcap.rotation.y = Math.PI / 2;
        car.add(hubcap);

        const hubcap2 = hubcap.clone();
        hubcap2.position.set(pos.x - 0.16, 0.4, pos.z);
        hubcap2.rotation.y = -Math.PI / 2;
        car.add(hubcap2);
    });

    // Simple headlights
    const headlightGeometry = new THREE.CircleGeometry(0.2, 16);
    const headlightMaterial = new THREE.MeshPhongMaterial({
        color: 0xffffee,
        emissive: 0xffffee,
        emissiveIntensity: 0.5
    });

    const leftHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
    leftHeadlight.position.set(-0.7, 0.5, -1.7);
    leftHeadlight.rotation.y = Math.PI / 2;
    car.add(leftHeadlight);

    const rightHeadlight = leftHeadlight.clone();
    rightHeadlight.position.set(0.7, 0.5, -1.7);
    car.add(rightHeadlight);

    // Simple taillights
    const taillightGeometry = new THREE.CircleGeometry(0.15, 16);
    const taillightMaterial = new THREE.MeshPhongMaterial({
        color: 0xff0000,
        emissive: 0xff0000,
        emissiveIntensity: 0.5
    });

    const leftTaillight = new THREE.Mesh(taillightGeometry, taillightMaterial);
    leftTaillight.position.set(-0.7, 0.5, 1.7);
    leftTaillight.rotation.y = Math.PI / 2;
    car.add(leftTaillight);

    const rightTaillight = leftTaillight.clone();
    rightTaillight.position.set(0.7, 0.5, 1.7);
    car.add(rightTaillight);

    // Simple racing stripes
    const stripeGeometry = new THREE.PlaneGeometry(0.3, 2.5);
    const stripeMaterial = new THREE.MeshPhongMaterial({
        color: 0x000000,
        side: THREE.DoubleSide
    });

    const leftStripe = new THREE.Mesh(stripeGeometry, stripeMaterial);
    leftStripe.position.set(-0.4, 0.81, 0);
    leftStripe.rotation.x = -Math.PI / 2;
    car.add(leftStripe);

    const rightStripe = new THREE.Mesh(stripeGeometry, stripeMaterial);
    rightStripe.position.set(0.4, 0.81, 0);
    rightStripe.rotation.x = -Math.PI / 2;
    car.add(rightStripe);

    // Add the complete car to the scene
    car.position.set(0, 0, 0);
    car.castShadow = true;
    car.receiveShadow = true;
    scene.add(car);
}

// Add road markings
function addRoadMarkings() {
    // Center line (dashed)
    const centerMarkingGeometry = new THREE.PlaneGeometry(0.3, 3);
    const markingMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xffffff,  // Bright white
        shininess: 30,
        side: THREE.DoubleSide,
        emissive: 0xffffff,
        emissiveIntensity: 0.2  // Slight glow for better visibility
    });

    // Side lines (solid)
    const sideMarkingGeometry = new THREE.PlaneGeometry(0.15, 100);
    
    roadSegments.forEach(segment => {
        // Add center dashed lines
        for (let j = 0; j < 10; j++) {
            const centerMarking = new THREE.Mesh(centerMarkingGeometry, markingMaterial);
            centerMarking.rotation.x = -Math.PI / 2;
            centerMarking.position.set(0, 0.01, -j * 10 - 5);  // Slightly above road
            segment.add(centerMarking);

            // Add lane divider lines (left and right of center)
            const leftLaneMarking = new THREE.Mesh(centerMarkingGeometry, markingMaterial);
            leftLaneMarking.rotation.x = -Math.PI / 2;
            leftLaneMarking.position.set(-2.5, 0.01, -j * 10 - 5);
            segment.add(leftLaneMarking);

            const rightLaneMarking = new THREE.Mesh(centerMarkingGeometry, markingMaterial);
            rightLaneMarking.rotation.x = -Math.PI / 2;
            rightLaneMarking.position.set(2.5, 0.01, -j * 10 - 5);
            segment.add(rightLaneMarking);
        }

        // Add solid side lines
        const leftSideLine = new THREE.Mesh(sideMarkingGeometry, markingMaterial);
        leftSideLine.rotation.x = -Math.PI / 2;
        leftSideLine.position.set(-4.8, 0.01, -50);  // Left edge
        segment.add(leftSideLine);

        const rightSideLine = new THREE.Mesh(sideMarkingGeometry, markingMaterial);
        rightSideLine.rotation.x = -Math.PI / 2;
        rightSideLine.position.set(4.8, 0.01, -50);  // Right edge
        segment.add(rightSideLine);
    });
}

// Create coins
function createCoins() {
    const coinGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.2, 32);
    const coinMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xFFD700,
        metalness: 0.7,
        roughness: 0.3,
        emissive: 0xFFD700,
        emissiveIntensity: 0.2
    });

    for (let i = 0; i < 5; i++) {
        const coin = new THREE.Mesh(coinGeometry, coinMaterial);
        coin.rotation.x = Math.PI / 2;
        const x = Math.random() * 8 - 4;
        const z = -(Math.random() * 50 + 20);
        coin.position.set(x, 1, z);
        coin.castShadow = true;
        coin.receiveShadow = true;
        scene.add(coin);
        coins.push(coin);
    }
}

// Create obstacle
function createObstacle() {
    const obstacle = new THREE.Group();
    
    // Main body
    const bodyGeometry = new THREE.BoxGeometry(2, 0.5, 3.5);
    const randomColor = obstacleColors[Math.floor(Math.random() * obstacleColors.length)];
    const bodyMaterial = new THREE.MeshPhongMaterial({
        color: randomColor,
        shininess: 90,
        specular: 0x666666
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.5;
    obstacle.add(body);

    // Top part (cabin)
    const cabinGeometry = new THREE.BoxGeometry(1.8, 0.5, 1.8);
    const cabin = new THREE.Mesh(cabinGeometry, bodyMaterial);
    cabin.position.set(0, 1, 0);
    obstacle.add(cabin);

    // Windows
    const windowMaterial = new THREE.MeshPhongMaterial({
        color: 0x111111,
        shininess: 100,
        transparent: true,
        opacity: 0.7
    });

    // Front window
    const frontWindowGeometry = new THREE.PlaneGeometry(1.6, 0.5);
    const frontWindow = new THREE.Mesh(frontWindowGeometry, windowMaterial);
    frontWindow.position.set(0, 1, -0.8);
    frontWindow.rotation.x = Math.PI * 0.1;
    obstacle.add(frontWindow);

    // Back window
    const backWindow = new THREE.Mesh(frontWindowGeometry, windowMaterial);
    backWindow.position.set(0, 1, 0.8);
    backWindow.rotation.x = -Math.PI * 0.1;
    obstacle.add(backWindow);

    // Wheels
    const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16);
    const wheelMaterial = new THREE.MeshPhongMaterial({
        color: 0x111111,
        shininess: 30
    });

    // Wheel positions
    const wheelPositions = [
        { x: -1.1, z: -1 },  // Front left
        { x: 1.1, z: -1 },   // Front right
        { x: -1.1, z: 1 },   // Rear left
        { x: 1.1, z: 1 }     // Rear right
    ];

    wheelPositions.forEach(pos => {
        const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(pos.x, 0.4, pos.z);
        obstacle.add(wheel);
    });

    // Headlights
    const headlightGeometry = new THREE.CircleGeometry(0.2, 16);
    const headlightMaterial = new THREE.MeshPhongMaterial({
        color: 0xffffee,
        emissive: 0xffffee,
        emissiveIntensity: 0.5
    });

    const leftHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
    leftHeadlight.position.set(-0.7, 0.6, -1.7);
    obstacle.add(leftHeadlight);

    const rightHeadlight = leftHeadlight.clone();
    rightHeadlight.position.set(0.7, 0.6, -1.7);
    obstacle.add(rightHeadlight);

    // Taillights
    const taillightGeometry = new THREE.CircleGeometry(0.15, 16);
    const taillightMaterial = new THREE.MeshPhongMaterial({
        color: 0xff0000,
        emissive: 0xff0000,
        emissiveIntensity: 0.5
    });

    const leftTaillight = new THREE.Mesh(taillightGeometry, taillightMaterial);
    leftTaillight.position.set(-0.7, 0.6, 1.7);
    obstacle.add(leftTaillight);

    const rightTaillight = leftTaillight.clone();
    rightTaillight.position.set(0.7, 0.6, 1.7);
    obstacle.add(rightTaillight);

    // Position and add the obstacle
    const x = Math.random() * 8 - 4;
    obstacle.position.set(x, 0, -100);
    obstacle.rotation.y = Math.PI; // Face the player's car
    obstacle.castShadow = true;
    obstacle.receiveShadow = true;
    obstacle.userData = { speed: obstacleSpeed * (1 + Math.random() * 0.5) };
    
    scene.add(obstacle);
    obstacles.push(obstacle);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    if (!gameOver) {
        // Update road
        roadSegments.forEach(segment => {
            segment.position.z += roadSpeed;
            if (segment.position.z > 100) {
                segment.position.z = -1900;
            }
        });
        
        // Update game elements
        updatePlayerCar();
        updateObstacles();
        updateCoins();
        updateCamera();
        updateDistance();
        
        // Render scene
        renderer.render(scene, camera);
    }
}

// Update player car position
function updatePlayerCar() {
    if (!car) return;

    if (keys.forward) {
        car.position.z -= carSpeed;
    }
    if (keys.backward) {
        car.position.z += carSpeed;
    }
    if (keys.left) {
        car.position.x = Math.max(-4, car.position.x - carSpeed);
        car.rotation.y = 0.2;
    } else if (keys.right) {
        car.position.x = Math.min(4, car.position.x + carSpeed);
        car.rotation.y = -0.2;
    } else {
        car.rotation.y = 0;
    }
}

// Update camera position
function updateCamera() {
    if (!car) return;
    camera.position.x = car.position.x;
    camera.position.y = car.position.y + cameraOffset.y;
    camera.position.z = car.position.z + cameraOffset.z;
    camera.lookAt(car.position);
}

// Update obstacles
function updateObstacles() {
    if (distanceTraveled > obstacleStartDistance) {
        if (Math.random() < obstacleSpawnRate) {
            createObstacle();
        }
    }
    
    obstacles.forEach((obstacle, index) => {
        const speed = obstacle.userData ? obstacle.userData.speed : obstacleSpeed;
        obstacle.position.z += speed;
        
        if (checkCollision(obstacle)) {
            endGame();
        }
        
        if (obstacle.position.z > 10) {
            scene.remove(obstacle);
            obstacles.splice(index, 1);
            score++;
            document.getElementById('score').textContent = `Score: ${score} | Coins: ${coinsCollected} | Level: ${difficulty}`;
            updateDifficulty();
        }
    });
}

// Update coins
function updateCoins() {
    coins.forEach((coin, index) => {
        coin.rotation.y += 0.02;
        
        if (checkCoinCollision(coin)) {
            scene.remove(coin);
            coins.splice(index, 1);
            coinsCollected++;
            document.getElementById('score').textContent = `Score: ${score} | Coins: ${coinsCollected} | Level: ${difficulty}`;
            
            if (Math.random() < coinSpawnRate) {
                createCoins();
            }
        }
    });
}

// Check coin collision
function checkCoinCollision(coin) {
    if (!car) return false;
    const carBoundingBox = new THREE.Box3().setFromObject(car);
    const coinBoundingBox = new THREE.Box3().setFromObject(coin);
    return carBoundingBox.intersectsBox(coinBoundingBox);
}

// Check collision with obstacles
function checkCollision(obstacle) {
    if (!car) return false;
    const carBoundingBox = new THREE.Box3().setFromObject(car);
    const obstacleBoundingBox = new THREE.Box3().setFromObject(obstacle);
    return carBoundingBox.intersectsBox(obstacleBoundingBox);
}

// Update difficulty
function updateDifficulty() {
    if (score > 0 && score % 10 === 0) {
        difficulty = Math.min(maxDifficulty, Math.floor(score / 10) + 1);
        roadSpeed *= 1.1;
        carSpeed *= 1.1;
        obstacleSpeed *= 1.1;
        obstacleSpawnRate *= 1.2;
    }
}

// Update distance traveled
function updateDistance() {
    distanceTraveled += roadSpeed;
}

// Handle keyboard input
function handleKeyDown(event) {
    switch(event.key) {
        case 'ArrowUp':
            keys.forward = true;
            break;
        case 'ArrowDown':
            keys.backward = true;
            break;
        case 'ArrowLeft':
            keys.left = true;
            break;
        case 'ArrowRight':
            keys.right = true;
            break;
    }
}

function handleKeyUp(event) {
    switch(event.key) {
        case 'ArrowUp':
            keys.forward = false;
            break;
        case 'ArrowDown':
            keys.backward = false;
            break;
        case 'ArrowLeft':
            keys.left = false;
            break;
        case 'ArrowRight':
            keys.right = false;
            break;
    }
}

// Window resize handler
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Show welcome message
function showWelcomeMessage() {
    const message = document.createElement('div');
    message.style.position = 'fixed';
    message.style.top = '50%';
    message.style.left = '50%';
    message.style.transform = 'translate(-50%, -50%)';
    message.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    message.style.color = 'white';
    message.style.padding = '20px';
    message.style.borderRadius = '10px';
    message.style.textAlign = 'center';
    message.innerHTML = `
        <h2>Welcome to 3D Car Racing!</h2>
        <p>Use arrow keys to control the car:</p>
        <p>↑ Forward</p>
        <p>↓ Backward</p>
        <p>← Left</p>
        <p>→ Right</p>
        <p>Collect coins and avoid obstacles!</p>
        <button onclick="this.parentElement.remove()" style="padding: 10px 20px; margin-top: 10px;">Start Game</button>
    `;
    document.body.appendChild(message);
}

// End game
function endGame() {
    gameOver = true;
    document.getElementById('gameOver').style.display = 'block';
    document.getElementById('restartButton').onclick = restartGame;
}

// Restart game
function restartGame() {
    location.reload();
}

// Start the game when the window loads
window.onload = init;