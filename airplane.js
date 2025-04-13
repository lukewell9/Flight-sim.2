/**
 * Cessna 172 3D Model
 * This file contains the 3D model of a Cessna 172 built with Three.js
 */

class Airplane {
    constructor() {
        // Create a group to hold all airplane parts
        this.mesh = new THREE.Group();
        
        // Create the airplane parts
        this.createFuselage();
        this.createWings();
        this.createTail();
        this.createPropeller();
        this.createWindshield();
        this.createWheels();
        this.createDetails();
    }
    
    createFuselage() {
        // Main body (fuselage) of the Cessna 172
        const fuselageGeometry = new THREE.CylinderGeometry(1, 0.8, 6, 12);
        const fusalageMaterial = new THREE.MeshPhongMaterial({
            color: 0xFFFFFF,  // White base color for the Cessna
            shininess: 60,    // Slightly shiny appearance
            flatShading: true // Gives it a more stylized look
        });
        
        const fuselage = new THREE.Mesh(fuselageGeometry, fusalageMaterial);
        fuselage.position.z = 0;
        fuselage.rotation.x = Math.PI / 2; // Rotate to align with forward direction
        this.mesh.add(fuselage);
        
        // Front nose section
        const noseGeometry = new THREE.SphereGeometry(0.8, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2);
        const nose = new THREE.Mesh(noseGeometry, fusalageMaterial);
        nose.position.z = 3;
        nose.rotation.x = Math.PI;
        this.mesh.add(nose);
        
        // Create a color stripe (common on Cessna aircraft)
        const stripeGeometry = new THREE.CylinderGeometry(1.01, 0.81, 6, 12);
        const stripeMaterial = new THREE.MeshPhongMaterial({
            color: 0x3366FF,  // Blue stripe
            shininess: 30,
            flatShading: true
        });
        const stripe = new THREE.Mesh(stripeGeometry, stripeMaterial);
        stripe.position.z = 0;
        stripe.rotation.x = Math.PI / 2;
        stripe.scale.set(1, 1, 0.05); // Make it a thin stripe
        this.mesh.add(stripe);
    }
    
    createWings() {
        // Main wing material
        const wingMaterial = new THREE.MeshPhongMaterial({
            color: 0xFFFFFF,
            shininess: 40,
            flatShading: true
        });
        
        // Main wing
        const wingGeometry = new THREE.BoxGeometry(10, 0.3, 2);
        const wing = new THREE.Mesh(wingGeometry, wingMaterial);
        wing.position.y = -0.2;
        this.mesh.add(wing);
        
        // Wing struts (supporting beams)
        const strutMaterial = new THREE.MeshPhongMaterial({
            color: 0xCCCCCC,
            shininess: 20
        });
        
        // Left strut
        const leftStrutGeometry = new THREE.BoxGeometry(0.1, 1.5, 0.1);
        const leftStrut = new THREE.Mesh(leftStrutGeometry, strutMaterial);
        leftStrut.position.set(-2, 0.5, 0);
        this.mesh.add(leftStrut);
        
        // Right strut
        const rightStrutGeometry = new THREE.BoxGeometry(0.1, 1.5, 0.1);
        const rightStrut = new THREE.Mesh(rightStrutGeometry, strutMaterial);
        rightStrut.position.set(2, 0.5, 0);
        this.mesh.add(rightStrut);
        
        // Wing tips with red/green navigation lights
        const leftWingTipGeometry = new THREE.BoxGeometry(0.4, 0.4, 0.3);
        const leftWingTipMaterial = new THREE.MeshPhongMaterial({
            color: 0xFF0000, // Red navigation light
            emissive: 0x330000,
            shininess: 100
        });
        const leftWingTip = new THREE.Mesh(leftWingTipGeometry, leftWingTipMaterial);
        leftWingTip.position.set(-5, -0.2, 1);
        this.mesh.add(leftWingTip);
        
        const rightWingTipGeometry = new THREE.BoxGeometry(0.4, 0.4, 0.3);
        const rightWingTipMaterial = new THREE.MeshPhongMaterial({
            color: 0x00FF00, // Green navigation light
            emissive: 0x003300,
            shininess: 100
        });
        const rightWingTip = new THREE.Mesh(rightWingTipGeometry, rightWingTipMaterial);
        rightWingTip.position.set(5, -0.2, 1);
        this.mesh.add(rightWingTip);
    }
    
    createTail() {
        const tailMaterial = new THREE.MeshPhongMaterial({
            color: 0xFFFFFF,
            shininess: 40,
            flatShading: true
        });
        
        // Horizontal stabilizer (tail wing)
        const horizontalStabilizerGeometry = new THREE.BoxGeometry(4, 0.2, 1);
        const horizontalStabilizer = new THREE.Mesh(horizontalStabilizerGeometry, tailMaterial);
        horizontalStabilizer.position.set(0, 0.5, -3);
        this.mesh.add(horizontalStabilizer);
        
        // Vertical stabilizer (tail fin)
        const verticalStabilizerGeometry = new THREE.BoxGeometry(0.2, 1.5, 1.5);
        const verticalStabilizer = new THREE.Mesh(verticalStabilizerGeometry, tailMaterial);
        verticalStabilizer.position.set(0, 1.2, -3);
        this.mesh.add(verticalStabilizer);
        
        // Tail beacon (red blinking light)
        const beaconGeometry = new THREE.SphereGeometry(0.15, 8, 8);
        const beaconMaterial = new THREE.MeshPhongMaterial({
            color: 0xFF0000,
            emissive: 0x330000,
            shininess: 100
        });
        const beacon = new THREE.Mesh(beaconGeometry, beaconMaterial);
        beacon.position.set(0, 2, -3);
        this.mesh.add(beacon);
    }
    
    createPropeller() {
        // Propeller hub
        const hubGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.3, 12);
        const hubMaterial = new THREE.MeshPhongMaterial({
            color: 0x333333,
            shininess: 30
        });
        this.propellerHub = new THREE.Mesh(hubGeometry, hubMaterial);
        this.propellerHub.position.z = 3.2;
        this.propellerHub.rotation.x = Math.PI / 2;
        this.mesh.add(this.propellerHub);
        
        // Propeller blades
        this.propellerBlades = new THREE.Group();
        this.propellerBlades.name = 'propellerBlades'; // Set a name to find it later
        const bladeMaterial = new THREE.MeshPhongMaterial({
            color: 0x333333,
            shininess: 60,
            side: THREE.DoubleSide
        });
        
        for (let i = 0; i < 2; i++) {
            const bladeGeometry = new THREE.BoxGeometry(0.1, 1.5, 0.2);
            const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
            blade.position.y = 0.8;
            blade.rotation.z = i * Math.PI;
            this.propellerBlades.add(blade);
        }
        
        this.propellerBlades.position.z = 3.2;
        this.mesh.add(this.propellerBlades);
    }
    
    createWindshield() {
        // Windshield of the Cessna (transparent blue)
        const windshieldGeometry = new THREE.SphereGeometry(1, 12, 12, 0, Math.PI, 0, Math.PI / 2);
        const windshieldMaterial = new THREE.MeshPhongMaterial({
            color: 0x88CCFF,
            transparent: true,
            opacity: 0.5,
            shininess: 100
        });
        const windshield = new THREE.Mesh(windshieldGeometry, windshieldMaterial);
        windshield.position.set(0, 0.7, 1.5);
        windshield.rotation.x = Math.PI / 2;
        windshield.scale.set(0.7, 1, 0.7);
        this.mesh.add(windshield);
        
        // Windshield frame
        const frameGeometry = new THREE.TorusGeometry(0.7, 0.05, 8, 16, Math.PI);
        const frameMaterial = new THREE.MeshPhongMaterial({
            color: 0x333333,
            shininess: 30
        });
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.position.set(0, 0.7, 1.5);
        frame.rotation.x = Math.PI / 2;
        this.mesh.add(frame);
    }
    
    createWheels() {
        // Create main landing gear
        const wheelMaterial = new THREE.MeshPhongMaterial({
            color: 0x333333,
            shininess: 30
        });
        
        const strutMaterial = new THREE.MeshPhongMaterial({
            color: 0x888888,
            shininess: 20
        });
        
        // Left main wheel
        const leftWheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.2, 12);
        const leftWheel = new THREE.Mesh(leftWheelGeometry, wheelMaterial);
        leftWheel.position.set(-1.5, -1.2, 0);
        leftWheel.rotation.z = Math.PI / 2;
        this.mesh.add(leftWheel);
        
        // Left landing gear strut
        const leftStrutGeometry = new THREE.BoxGeometry(0.1, 1, 0.1);
        const leftStrut = new THREE.Mesh(leftStrutGeometry, strutMaterial);
        leftStrut.position.set(-1.5, -0.7, 0);
        this.mesh.add(leftStrut);
        
        // Right main wheel
        const rightWheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.2, 12);
        const rightWheel = new THREE.Mesh(rightWheelGeometry, wheelMaterial);
        rightWheel.position.set(1.5, -1.2, 0);
        rightWheel.rotation.z = Math.PI / 2;
        this.mesh.add(rightWheel);
        
        // Right landing gear strut
        const rightStrutGeometry = new THREE.BoxGeometry(0.1, 1, 0.1);
        const rightStrut = new THREE.Mesh(rightStrutGeometry, strutMaterial);
        rightStrut.position.set(1.5, -0.7, 0);
        this.mesh.add(rightStrut);
        
        // Nose wheel
        const noseWheelGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 12);
        const noseWheel = new THREE.Mesh(noseWheelGeometry, wheelMaterial);
        noseWheel.position.set(0, -1.0, 2.5);
        noseWheel.rotation.z = Math.PI / 2;
        this.mesh.add(noseWheel);
        
        // Nose wheel strut
        const noseStrutGeometry = new THREE.BoxGeometry(0.1, 0.7, 0.1);
        const noseStrut = new THREE.Mesh(noseStrutGeometry, strutMaterial);
        noseStrut.position.set(0, -0.7, 2.5);
        this.mesh.add(noseStrut);
    }
    
    createDetails() {
        // Door outlines
        const doorOutlineMaterial = new THREE.MeshPhongMaterial({
            color: 0x333333,
            shininess: 20
        });
        
        // Left door outline
        const leftDoorGeometry = new THREE.BoxGeometry(0.1, 0.8, 1.2);
        const leftDoor = new THREE.Mesh(leftDoorGeometry, doorOutlineMaterial);
        leftDoor.position.set(-0.95, 0.2, 0.5);
        this.mesh.add(leftDoor);
        
        // Right door outline
        const rightDoorGeometry = new THREE.BoxGeometry(0.1, 0.8, 1.2);
        const rightDoor = new THREE.Mesh(rightDoorGeometry, doorOutlineMaterial);
        rightDoor.position.set(0.95, 0.2, 0.5);
        this.mesh.add(rightDoor);
        
        // Antenna
        const antennaMaterial = new THREE.MeshPhongMaterial({
            color: 0xFFFFFF,
            shininess: 30
        });
        
        const antennaGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.4, 4);
        const antenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
        antenna.position.set(0, 1, -1);
        this.mesh.add(antenna);
    }
    
    // Animate the propeller rotation
    updatePropeller() {
        if (this.propellerBlades) {
            this.propellerBlades.rotation.y += 0.3; // Propeller rotation speed
        }
    }
}

// Function to create and return a Cessna 172 model
function createCessna172() {
    const airplane = new Airplane();
    return airplane.mesh;
}
