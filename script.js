/**
 * Flight Sim 2025 - 3D Flight Simulator Game with Cessna 172
 * Main JavaScript file handling menu interactions and 3D rendering
 */

// Execute immediately since we're loading this after the DOM is ready
(function() {
    // Check for Three.js
    if (typeof THREE === 'undefined') {
        console.error('Three.js is not loaded!');
        alert('Three.js library is required for this game.');
        return;
    }

    console.log('Script loaded. Three.js version:', THREE.REVISION);
    
    // Get references to screens
    const menuScreen = document.getElementById('menu-screen');
    const instructionsScreen = document.getElementById('instructions-screen');
    const gameScreen = document.getElementById('game-screen');
    const quitScreen = document.getElementById('quit-screen');
    const gameCanvas = document.getElementById('game-canvas');
    const loadingMessage = document.getElementById('loading-message');
    
    // Get references to buttons
    const startButton = document.getElementById('start-button');
    const instructionsButton = document.getElementById('instructions-button');
    const quitButton = document.getElementById('quit-button');
    const backButton = document.getElementById('back-button');
    const restartButton = document.getElementById('restart-button');
    
    // 3D scene variables
    let scene, camera, renderer, airplane, controls;
    let isGameRunning = false;
    let isInitialized = false;
    let animationFrameId = null;
    
    // Aircraft physics variables
    const aircraft = {
        position: { x: 0, y: 100, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        speed: 0,
        maxSpeed: 5,
        acceleration: 0.05,
        deceleration: 0.02,
        turnSpeed: 0.02,
        pitchSpeed: 0.02,
        rollSpeed: 0.03,
        gravity: 0.01,
        liftFactor: 0.005
    };
    
    // Control state
    const keys = {
        ArrowUp: false,
        ArrowDown: false,
        ArrowLeft: false,
        ArrowRight: false,
        KeyW: false,
        KeyS: false,
        KeyA: false,
        KeyD: false,
        Space: false
    };
    
    // Function to show a specific screen and hide all others
    function showScreen(screenToShow) {
        console.log('Showing screen:', screenToShow.id);
        
        // Hide all screens
        menuScreen.classList.add('hidden');
        instructionsScreen.classList.add('hidden');
        gameScreen.classList.add('hidden');
        quitScreen.classList.add('hidden');
        
        // Show the desired screen
        screenToShow.classList.remove('hidden');
        
        // If showing game screen, setup 3D scene and initialize game
        if (screenToShow === gameScreen) {
            console.log('Game screen activated');
            
            // Show loading message
            loadingMessage.style.display = 'block';
            
            // Use requestAnimationFrame to make sure the screen is rendered before we continue
            requestAnimationFrame(function() {
                if (!isInitialized) {
                    console.log('First time running game, setting up Three.js...');
                    // Initialize everything for the first time
                    initializeThreeJS();
                } else {
                    console.log('Game already initialized, resuming');
                    // Just resume animation if already initialized
                    if (!animationFrameId) {
                        animate();
                    }
                    // Hide loading message immediately if already initialized
                    loadingMessage.style.display = 'none';
                }
            });
        } else {
            // If leaving game screen, pause animation
            if (animationFrameId) {
                console.log('Stopping animation loop');
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }
        }
    }
    
    // Initialize Three.js environment
    function initializeThreeJS() {
        console.log('Initializing Three.js...');
        
        // First make sure the canvas has correct dimensions
        gameCanvas.style.width = '100%';
        gameCanvas.style.height = '100%';
        
        // Get actual computed dimensions of the game screen
        const rect = gameScreen.getBoundingClientRect();
        gameCanvas.width = rect.width;
        gameCanvas.height = rect.height;
        console.log('Canvas dimensions set to:', gameCanvas.width, 'x', gameCanvas.height);
        
        try {
            // Create scene
            scene = new THREE.Scene();
            scene.background = new THREE.Color(0x87CEEB); // Sky blue background
            console.log('Scene created');
            
            // Create camera with proper aspect ratio
            const aspect = gameCanvas.width / gameCanvas.height;
            camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 20000);
            camera.position.set(0, 100, 300);
            camera.lookAt(0, 0, 0);
            console.log('Camera created');
            
            // Create renderer
            renderer = new THREE.WebGLRenderer({ 
                canvas: gameCanvas, 
                antialias: true,
                alpha: true
            });
            renderer.setSize(gameCanvas.width, gameCanvas.height);
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.shadowMap.enabled = true;
            console.log('Renderer created');
            
            // Add lights
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
            scene.add(ambientLight);
            
            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
            directionalLight.position.set(100, 300, 200);
            directionalLight.castShadow = true;
            directionalLight.shadow.mapSize.width = 2048;
            directionalLight.shadow.mapSize.height = 2048;
            scene.add(directionalLight);
            console.log('Lights added');
            
            // Create skybox
            createSkybox();
            console.log('Skybox created');
            
            // Create terrain
            createTerrain();
            console.log('Terrain created');
            
            // Verify createCessna172 function is available and create airplane
            if (typeof createCessna172 === 'function') {
                airplane = createCessna172();
                airplane.scale.set(5, 5, 5); // Scale up the airplane for better visibility
                scene.add(airplane);
                console.log('Airplane model created and added to scene');
            } else {
                console.error('createCessna172 function not found!');
                alert('Error: Could not create airplane model');
                return;
            }
            
            // Add orbit controls
            if (typeof THREE.OrbitControls === 'function') {
                controls = new THREE.OrbitControls(camera, renderer.domElement);
                controls.enableDamping = true;
                controls.dampingFactor = 0.05;
                controls.screenSpacePanning = false;
                controls.minDistance = 10;
                controls.maxDistance = 1000;
                controls.maxPolarAngle = Math.PI / 1.5;
                console.log('Orbit controls initialized');
            } else {
                console.warn('OrbitControls not available');
            }
            
            // Initialize the game state
            initGame();
            
            // Start animation loop
            animate();
            
            // Hide loading message
            loadingMessage.style.display = 'none';
            
            // Mark as initialized and running
            isInitialized = true;
            isGameRunning = true;
            
            console.log('Three.js initialization complete');
        } catch (error) {
            console.error('Error initializing Three.js:', error);
            alert('There was an error setting up the 3D environment: ' + error.message);
            // Go back to menu
            showScreen(menuScreen);
        }
    }
    
    // Create skybox function
    function createSkybox() {
        // Create a large sphere for the sky
        const skyGeometry = new THREE.SphereGeometry(10000, 32, 32);
        
        // Create gradient texture for sky
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 128;
        const context = canvas.getContext('2d');
        
        // Create gradient
        const gradient = context.createLinearGradient(0, 0, 0, 128);
        gradient.addColorStop(0, '#1e5799');
        gradient.addColorStop(0.5, '#7db9e8');
        gradient.addColorStop(1, '#d3f4ff');
        
        context.fillStyle = gradient;
        context.fillRect(0, 0, 1, 128);
        
        const skyTexture = new THREE.CanvasTexture(canvas);
        const skyMaterial = new THREE.MeshBasicMaterial({ 
            map: skyTexture,
            side: THREE.BackSide
        });
        
        const sky = new THREE.Mesh(skyGeometry, skyMaterial);
        scene.add(sky);
        
        // Add some clouds (simple spheres for now)
        for (let i = 0; i < 30; i++) {
            const cloudGeometry = new THREE.SphereGeometry(Math.random() * 100 + 50, 8, 8);
            const cloudMaterial = new THREE.MeshPhongMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.8
            });
            
            const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
            
            // Position clouds randomly in the sky
            const radius = 2000 + Math.random() * 2000;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI / 2;
            
            cloud.position.x = radius * Math.sin(phi) * Math.cos(theta);
            cloud.position.y = 100 + Math.random() * 800; // Varied heights
            cloud.position.z = radius * Math.sin(phi) * Math.sin(theta);
            
            scene.add(cloud);
        }
    }
    
    // Create terrain function
    function createTerrain() {
        // Create a simple flat terrain for now
        const terrainGeometry = new THREE.PlaneGeometry(10000, 10000, 128, 128);
        
        // Apply some height variation for hills
        const vertices = terrainGeometry.attributes.position.array;
        for (let i = 0; i < vertices.length; i += 3) {
            // Skip the edges to keep them flat for a cleaner boundary
            const x = vertices[i];
            const z = vertices[i + 2];
            const distance = Math.sqrt(x * x + z * z);
            
            if (distance < 4800) {
                // Simplex noise would be better, but we'll use a simple function for now
                const height = Math.sin(x * 0.01) * Math.cos(z * 0.01) * 100;
                vertices[i + 1] = height;
            }
        }
        
        // Update the vertices
        terrainGeometry.computeVertexNormals();
        
        // Create texture
        const textureCanvas = document.createElement('canvas');
        textureCanvas.width = 512;
        textureCanvas.height = 512;
        const ctx = textureCanvas.getContext('2d');
        
        // Draw terrain texture (grass with some variation)
        ctx.fillStyle = '#2d572c';
        ctx.fillRect(0, 0, 512, 512);
        
        // Add some texture variety
        for (let i = 0; i < 5000; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const size = Math.random() * 3 + 1;
            const brightness = 0.8 + Math.random() * 0.4;
            
            ctx.fillStyle = `rgba(${Math.floor(45 * brightness)}, ${Math.floor(87 * brightness)}, ${Math.floor(44 * brightness)}, 1)`;
            ctx.fillRect(x, y, size, size);
        }
        
        const terrainTexture = new THREE.CanvasTexture(textureCanvas);
        terrainTexture.wrapS = THREE.RepeatWrapping;
        terrainTexture.wrapT = THREE.RepeatWrapping;
        terrainTexture.repeat.set(16, 16);
        
        const terrainMaterial = new THREE.MeshPhongMaterial({
            map: terrainTexture,
            side: THREE.DoubleSide
        });
        
        const terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
        terrain.rotation.x = -Math.PI / 2;
        terrain.receiveShadow = true;
        scene.add(terrain);
    }
    
    // Initialize the game variables and setup
    function initGame() {
        console.log('3D Game initialized');
        
        // Reset aircraft position and physics
        aircraft.position = { x: 0, y: 100, z: 0 };
        aircraft.rotation = { x: 0, y: 0, z: 0 };
        aircraft.speed = 0;
        
        // Position the camera behind the airplane
        updateCameraPosition();
        
        // Start with some forward speed
        aircraft.speed = 1;
    }
    
    // Update camera position relative to the airplane
    function updateCameraPosition() {
        // Position camera behind and slightly above the airplane
        const distance = 50;
        const height = 15;
        
        // Calculate camera position based on airplane orientation
        const angleY = airplane.rotation.y;
        
        // Camera position calculation using trig
        const cameraX = airplane.position.x - Math.sin(angleY) * distance;
        const cameraZ = airplane.position.z - Math.cos(angleY) * distance;
        const cameraY = airplane.position.y + height;
        
        camera.position.set(cameraX, cameraY, cameraZ);
        camera.lookAt(airplane.position);
    }
    
    // Main animation loop
    function animate() {
        animationFrameId = requestAnimationFrame(animate);
        
        // Update airplane physics and controls
        updateAirplane();
        
        // Update the propeller animation
        if (airplane) {
            const propeller = airplane.getObjectByName('propellerBlades');
            if (propeller) {
                propeller.rotation.y += 0.3 * (aircraft.speed / aircraft.maxSpeed);
            }
        }
        
        // Update camera to follow the airplane
        updateCameraPosition();
        
        // Update controls if they exist (development mode)
        if (controls) controls.update();
        
        // Render the scene
        renderer.render(scene, camera);
    }
    
    // Update airplane physics and handle controls
    function updateAirplane() {
        if (!airplane) return;
        
        // Handle acceleration/deceleration
        if (keys.ArrowUp || keys.KeyW) {
            aircraft.speed = Math.min(aircraft.speed + aircraft.acceleration, aircraft.maxSpeed);
        } else {
            aircraft.speed = Math.max(aircraft.speed - aircraft.deceleration, 0);
        }
        
        // Apply gravity and lift
        const lift = aircraft.speed * aircraft.liftFactor;
        const gravityEffect = aircraft.gravity * (1 - lift * 2);
        aircraft.position.y = Math.max(aircraft.position.y - gravityEffect, 0);
        
        // Handle turning (yaw)
        if (keys.ArrowLeft || keys.KeyA) {
            aircraft.rotation.y += aircraft.turnSpeed;
        }
        if (keys.ArrowRight || keys.KeyD) {
            aircraft.rotation.y -= aircraft.turnSpeed;
        }
        
        // Handle pitch (up/down)
        if (keys.ArrowDown || keys.KeyS) {
            aircraft.rotation.x = Math.min(aircraft.rotation.x + aircraft.pitchSpeed, Math.PI / 4);
        } else if (keys.ArrowUp || keys.KeyW) {
            aircraft.rotation.x = Math.max(aircraft.rotation.x - aircraft.pitchSpeed, -Math.PI / 4);
        } else {
            // Return to level flight gradually
            if (aircraft.rotation.x > 0.01) {
                aircraft.rotation.x -= aircraft.pitchSpeed / 2;
            } else if (aircraft.rotation.x < -0.01) {
                aircraft.rotation.x += aircraft.pitchSpeed / 2;
            } else {
                aircraft.rotation.x = 0;
            }
        }
        
        // Apply rotation effect on altitude
        aircraft.position.y += -Math.sin(aircraft.rotation.x) * aircraft.speed;
        
        // Update position based on speed and direction
        aircraft.position.x += Math.sin(aircraft.rotation.y) * aircraft.speed;
        aircraft.position.z += Math.cos(aircraft.rotation.y) * aircraft.speed;
        
        // Apply rotations to the 3D model
        airplane.position.set(aircraft.position.x, aircraft.position.y, aircraft.position.z);
        airplane.rotation.set(aircraft.rotation.x, aircraft.rotation.y, aircraft.rotation.z);
    }
    
    // Handle window resize to make the game responsive
    function onWindowResize() {
        if (!gameScreen.classList.contains('hidden') && renderer) {
            const width = gameScreen.clientWidth;
            const height = gameScreen.clientHeight;
            
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            
            renderer.setSize(width, height);
        }
    }
    
    // Event Listeners for buttons
    startButton.addEventListener('click', function() {
        showScreen(gameScreen);
    });
    
    instructionsButton.addEventListener('click', function() {
        showScreen(instructionsScreen);
    });
    
    quitButton.addEventListener('click', function() {
        showScreen(quitScreen);
    });
    
    backButton.addEventListener('click', function() {
        showScreen(menuScreen);
    });
    
    restartButton.addEventListener('click', function() {
        showScreen(menuScreen);
    });
    
    // Handle keyboard controls for the game
    document.addEventListener('keydown', function(event) {
        // Only process key events if game screen is active
        if (!gameScreen.classList.contains('hidden')) {
            if (event.code in keys) {
                keys[event.code] = true;
                event.preventDefault();
            }
            
            // Exit to menu on Escape
            if (event.code === 'Escape') {
                showScreen(menuScreen);
            }
        }
    });
    
    document.addEventListener('keyup', function(event) {
        if (event.code in keys) {
            keys[event.code] = false;
            event.preventDefault();
        }
    });
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize);
    
    // Initialize the application with the menu screen
    showScreen(menuScreen);
});
